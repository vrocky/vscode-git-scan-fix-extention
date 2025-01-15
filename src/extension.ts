import * as vscode from 'vscode';
import { Repository, API } from './git';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Git repository related utilities
 */
class GitRepositoryManager {
    /**
     * Checks if a directory is a Git repository
     * @param dirPath Directory path to check
     * @returns Promise<boolean>
     */
    private static async isGitRepository(dirPath: string): Promise<boolean> {
        try {
            const gitPath = path.join(dirPath, '.git');
            const stats = await fs.promises.stat(gitPath);
            return stats.isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * Recursively finds all Git repositories in a given directory
     * @param basePath Base directory to start search from
     * @returns Promise<string[]> Array of repository paths
     */
    private static async getAllGitRepositories(basePath: string): Promise<string[]> {
        const repos: string[] = [];
        try {
            if (await this.isGitRepository(basePath)) {
                repos.push(basePath);
            }

            const entries = await fs.promises.readdir(basePath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== '.git' && !entry.name.startsWith('node_modules')) {
                    const fullPath = path.join(basePath, entry.name);
                    const subRepos = await this.getAllGitRepositories(fullPath);
                    repos.push(...subRepos);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${basePath}:`, error);
        }
        return repos;
    }

    /**
     * Gets Git extension and ensures it's activated
     * @returns Promise<vscode.Extension<any>>
     */
    private static async getGitExtension(): Promise<vscode.Extension<any>> {
        const gitExtension = vscode.extensions.getExtension('vscode.git');
        if (!gitExtension) {
            throw new Error('Git extension not found. Please install Git extension for VS Code.');
        }

        if (!gitExtension.isActive) {
            await gitExtension.activate();
        }

        return gitExtension;
    }

    /**
     * Opens a Git repository
     * @param path Repository path
     */
    public static async openRepository(path?: string): Promise<void> {
        try {
            await this.getGitExtension();

            if (!path) {
                const result = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri: vscode.Uri.file(os.homedir()),
                    title: 'Open Git Repository'
                });

                if (!result?.[0]) return;
                path = result[0].fsPath;
            }

            if (!await this.isGitRepository(path)) {
                throw new Error('Selected directory is not a Git repository');
            }

            await vscode.commands.executeCommand('git.openRepository', path);
            vscode.window.showInformationMessage(`Repository opened successfully at ${path}`);
        } catch (error) {
            this.handleError('Failed to open repository', error);
        }
    }

    /**
     * Opens repository from workspace selection
     */
    public static async openRepositoryFromSelection(): Promise<void> {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders?.length) {
                throw new Error('No workspace folders found');
            }

            const allRepos = (await Promise.all(
                workspaceFolders.map(folder => this.getAllGitRepositories(folder.uri.fsPath))
            )).flat();

            if (!allRepos.length) {
                throw new Error('No Git repositories found in workspace');
            }

            const items = allRepos.map(dir => ({
                label: vscode.workspace.asRelativePath(dir),
                description: dir,
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a Git repository to open',
                title: 'Select Git Repository'
            });

            if (selected) {
                await this.openRepository(selected.description);
            }
        } catch (error) {
            this.handleError('Failed to open repository from selection', error);
        }
    }

    /**
     * Opens repository from manually entered path
     */
    public static async openRepositoryFromPath(): Promise<void> {
        try {
            const path = await vscode.window.showInputBox({
                prompt: 'Enter the full path to your Git repository',
                placeHolder: 'e.g., C:\\Users\\username\\projects\\myrepo',
                validateInput: async (value) => {
                    if (!value) return 'Path is required';
                    if (!await this.isGitRepository(value)) {
                        return 'Not a valid Git repository';
                    }
                    return null;
                }
            });

            if (path) {
                await this.openRepository(path);
            }
        } catch (error) {
            this.handleError('Failed to open repository from path', error);
        }
    }

    /**
     * Initializes a new Git repository
     */
    public static async initRepository(): Promise<void> {
        try {
            await vscode.commands.executeCommand('git.init');
            vscode.window.showInformationMessage('Git repository initialized successfully');
        } catch (error) {
            this.handleError('Failed to initialize repository', error);
        }
    }

    /**
     * Disables Git auto repository scanning in VS Code workspace settings
     */
    public static async disableGitScanning(): Promise<void> {
        try {
            await this.updateGitSettings(false); // workspace level
        } catch (error) {
            this.handleError('Failed to update Git settings', error);
        }
    }

    /**
     * Disables Git auto repository scanning globally
     */
    public static async disableGitScanningGlobally(): Promise<void> {
        try {
            await this.updateGitSettings(true); // global level
        } catch (error) {
            this.handleError('Failed to update global Git settings', error);
        }
    }

    /**
     * Updates Git scanning settings
     * @param global Whether to update globally or workspace level
     */
    private static async updateGitSettings(global: boolean): Promise<void> {
        if (!global && !vscode.workspace.workspaceFolders?.length) {
            throw new Error('No workspace folder open. Please open a workspace first.');
        }

        const config = vscode.workspace.getConfiguration('git');
        const scope = global ? 'user settings' : 'workspace';
        
        await Promise.all([
            config.update('autoRepositoryDetection', false, global),
            config.update('detectSubmodules', false, global),
            config.update('detectSubmodulesLimit', 1, global)
        ]);

        const result = await vscode.window.showInformationMessage(
            `Git auto-scanning has been disabled in ${scope}. Restart VS Code for changes to take effect.`,
            'Restart Now',
            'Open Settings'
        );

        if (result === 'Restart Now') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        } else if (result === 'Open Settings') {
            await vscode.commands.executeCommand(
                global ? 'workbench.action.openSettings' : 'workbench.action.openWorkspaceSettings',
                { query: 'git.autoRepository' }
            );
        }
    }

    /**
     * Refreshes all Git repositories
     */
    public static async refreshAllRepositories(): Promise<void> {
        try {
            const gitExtension = await this.getGitExtension();
            const api = gitExtension.exports.getAPI(1) as API;

            for (const repo of api.repositories) {
                await vscode.commands.executeCommand('git.refresh', repo.rootUri);
            }

            vscode.window.showInformationMessage('All repositories refreshed successfully');
        } catch (error) {
            this.handleError('Failed to refresh repositories', error);
        }
    }

    /**
     * Adds all Git repositories from a given directory
     * @param dirPath Directory path to scan for repositories
     */
    public static async addRepositoriesFromDirectory(dirPath?: string): Promise<void> {
        try {
            await this.getGitExtension();

            if (!dirPath) {
                const defaultUri = vscode.workspace.workspaceFolders?.[0]?.uri || vscode.Uri.file(os.homedir());
                const result = await vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    defaultUri,
                    title: 'Select Directory to Scan for Git Repositories'
                });

                if (!result?.[0]) return;
                dirPath = result[0].fsPath;
            }

            const allRepos = await this.getAllGitRepositories(dirPath);

            if (!allRepos.length) {
                throw new Error('No Git repositories found in the selected directory');
            }

            for (const repoPath of allRepos) {
                await vscode.commands.executeCommand('git.openRepository', repoPath);
            }

            vscode.window.showInformationMessage(`Added ${allRepos.length} repositories from ${dirPath}`);
        } catch (error) {
            this.handleError('Failed to add repositories from directory', error);
        }
    }

    /**
     * Adds all Git repositories from a manually entered path
     */
    public static async addRepositoriesFromPath(): Promise<void> {
        try {
            await this.getGitExtension();

            const dirPath = await vscode.window.showInputBox({
                prompt: 'Enter the full path to the directory to scan for Git repositories',
                placeHolder: 'e.g., C:\\Users\\username\\projects',
                validateInput: async (value) => {
                    if (!value) return 'Path is required';
                    try {
                        const stats = await fs.promises.stat(value);
                        if (!stats.isDirectory()) {
                            return 'Not a valid directory';
                        }
                    } catch {
                        return 'Not a valid directory';
                    }
                    return null;
                }
            });

            if (dirPath) {
                await this.addRepositoriesFromDirectory(dirPath);
            }
        } catch (error) {
            this.handleError('Failed to add repositories from path', error);
        }
    }

    /**
     * Toggles the keybindings for the extension
     */
    public static async toggleKeybindings(): Promise<void> {
        try {
            const config = vscode.workspace.getConfiguration('git-commands-helper');
            const currentSetting = config.get<boolean>('enableKeybindings', true);
            await config.update('enableKeybindings', !currentSetting, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Keybindings ${!currentSetting ? 'enabled' : 'disabled'} successfully. Please restart VS Code for changes to take effect.`);
        } catch (error) {
            this.handleError('Failed to toggle keybindings', error);
        }
    }

    /**
     * Handles errors consistently across the extension
     */
    private static handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`${message}: ${errorMessage}`);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
}

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('git-commands-helper');
    const enableKeybindings = config.get<boolean>('enableKeybindings', false);

    const subscriptions = [
        vscode.commands.registerCommand('git-commands-helper.initGitRepo', () => 
            GitRepositoryManager.initRepository()),
        vscode.commands.registerCommand('git-commands-helper.openRepository', () => 
            GitRepositoryManager.openRepository()),
        vscode.commands.registerCommand('git-commands-helper.openRepositoryFromSelection', () => 
            GitRepositoryManager.openRepositoryFromSelection()),
        vscode.commands.registerCommand('git-commands-helper.openRepositoryFromPath', () => 
            GitRepositoryManager.openRepositoryFromPath()),
        vscode.commands.registerCommand('git-commands-helper.disableGitScanning', () => 
            GitRepositoryManager.disableGitScanning()),
        vscode.commands.registerCommand('git-commands-helper.disableGitScanningGlobally', () => 
            GitRepositoryManager.disableGitScanningGlobally()),
        vscode.commands.registerCommand('git-commands-helper.refreshAllRepositories', () => 
            GitRepositoryManager.refreshAllRepositories()),
        vscode.commands.registerCommand('git-commands-helper.addRepositoriesFromDirectory', () => 
            GitRepositoryManager.addRepositoriesFromDirectory()),
        vscode.commands.registerCommand('git-commands-helper.addRepositoriesFromPath', () => 
            GitRepositoryManager.addRepositoriesFromPath()),
        vscode.commands.registerCommand('git-commands-helper.toggleKeybindings', () => 
            GitRepositoryManager.toggleKeybindings())
    ];

    // Remove the enableKeybindings block since these commands are already registered above
    context.subscriptions.push(...subscriptions);
}

export function deactivate() {}
