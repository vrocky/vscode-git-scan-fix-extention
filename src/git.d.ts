import { Uri } from 'vscode';

export interface Repository {
    rootUri: Uri;
    // Add other repository properties as needed
}

export interface API {
    openRepository(path: string): Promise<Repository | undefined>;
    repositories: Repository[];
    // Add other API properties as needed
}
