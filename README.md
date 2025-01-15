# 🚀 Git Scan Fix - Manual Control & Performance

Hey there! Ever noticed VS Code slowing down because it's constantly scanning for Git repositories? We've got a simple solution: manual control.

## 💡 What's This All About?

VS Code's Git features are great (especially with the new GitHub Copilot integration!), but there's a catch - it's always scanning your folders for Git repositories. This can:
- 😫 Freeze your files with "file in use" errors
- 🐌 Slow down your workspace
- 🔥 Heat up your CPU
- 🔋 Drain your laptop battery

Our solution? **Let you manually open Git repositories when you need them.**

## 🎯 How It Works

Instead of letting VS Code automatically scan everything:
1. You decide when to open a Git repository
2. Choose your preferred way to open it:
   - 📁 Pick from a file browser
   - ⚡ Quick-select from your workspace
   - ⌨️ Type the path directly
3. No background scanning, no slowdowns!

## 🛠️ Quick Start

1. Install this extension
2. Use our one-click fix to disable automatic scanning
3. Open repositories manually through:
   - Command Palette: `Git Scan Fix: Open Repository`
   - Keyboard Shortcut: `Ctrl+Shift+G O`
   - Quick Pick from workspace folders

## About VS Code's Git Features

VS Code comes with an excellent built-in Git integration that has gotten even better with GitHub Copilot integration:
- ✨ AI-powered commit message suggestions
- 🤖 Smart Git commands and recommendations
- 🔄 Automatic branch management
- 📊 Rich diff viewing and merge conflict resolution

However, there's one significant drawback: **continuous repository scanning**.

## 🔍 The Problem with Git Scanning

While VS Code's Git features are powerful, the continuous repository scanning can cause:
- ❌ File-in-use errors blocking your work
- ❌ High CPU usage in large workspaces
- ❌ Disk I/O slowdowns
- ❌ Overall workspace performance degradation
- ❌ Battery drain on laptops

## 🛠️ How to Control Git Scanning

### Method 1: Use Our Quick Fix Commands
- Use `🚀 Fix Git Scanning (Workspace)` for current workspace
- Use `🚀 Fix Git Scanning (Global)` for all workspaces

### Method 2: Manual Settings Configuration
1. Via Settings UI:
   - Open Settings (Ctrl/Cmd + ,)
   - Search for "git.autoRepository"
   - Uncheck "Auto Repository Detection"

2. Via settings.json:
```json
{
    // Disable automatic Git repository detection
    "git.autoRepositoryDetection": false,

    // Optional: Additional performance tweaks
    "git.detectSubmodules": false,
    "git.detectSubmodulesLimit": 1,
    
    // Keep Git features enabled
    "git.enabled": true
}
```

### Method 3: Workspace-Specific Control
Create or edit `.vscode/settings.json` in your workspace:
```json
{
    "git.autoRepositoryDetection": false,
    "git.detectSubmodules": false
}
```

## Best Practices

1. **Keep Git Features**: Don't disable Git completely, just control the scanning
2. **Workspace Control**: Start with workspace-level settings
3. **On-Demand Access**: Use our commands to open repositories when needed
4. **Monitor Performance**: Watch for improvements after disabling scanning

## ✨ The Solution

This extension provides:
1. 🚀 One-click fix for Git scanning issues
2. 📂 On-demand repository access
3. 🔧 Simple workspace and global controls
4. ⚡ Instant performance improvement
5. 🤝 Full compatibility with VS Code Git features

## Disabling VS Code's Git Auto Scan

To get the best performance, you can disable VS Code's automatic Git repository scanning:

1. Open VS Code Settings (Ctrl+,)
2. Search for "git.autoRepositoryDetection"
3. Set it to `false` or add this to your settings.json:
```json
{
    "git.autoRepositoryDetection": false
}
```

Additional Git-related settings you might want to adjust:
```json
{
    "git.enabled": true,           // Keep Git features enabled
    "git.autoRepositoryDetection": false,  // Disable auto scanning
    "git.detectSubmodules": false, // Disable submodule scanning
    "git.detectSubmodulesLimit": 1 // Limit submodule depth if enabled
}
```

## Features

- **No Background Scanning**: Only scans when you explicitly request it
- **Multiple Ways to Open Repositories**:
  - File Picker: Browse and select any repository
  - Workspace Quick Pick: Choose from Git repositories in your workspace
  - Direct Path Entry: Enter the repository path manually
- **Initialize New Repositories**: Quick command to initialize Git in current folder

## Why Use This Instead of VS Code's Built-in Git?

1. **Keep VS Code's Git Features**: You still get all the great Git and GitHub Copilot features
2. **Control When to Scan**: Only scan for repositories when you explicitly want to
3. **Better Performance**: No background processes constantly checking your directories
4. **Simple Workflow**: Quick commands to open repositories when needed
5. **Works Alongside**: Use both this extension and VS Code's Git features together

## 🛠️ Commands

- `Git Scan Fix: 🚀 Fix Git Scanning (Workspace)` - Fix scanning issues in current workspace
- `Git Scan Fix: 🚀 Fix Git Scanning (Global)` - Fix scanning issues for all workspaces
- `Git Scan Fix: Open Repository (File Picker)` - Browse and open repository
- `Git Scan Fix: Open Repository (From Workspace)` - Quick pick from workspace
- `Git Scan Fix: Open Repository (Enter Path)` - Enter repository path
- `Git Scan Fix: Initialize Repository` - Initialize new Git repository

## Usage Tips

1. Use keyboard shortcut `Ctrl+Shift+G O` (`Cmd+Shift+G O` on Mac) to quickly open repositories
2. Use the "Disable Git Auto-Scanning" command to automatically configure VS Code settings
3. Use the workspace quick pick for faster access to your project repositories

## Performance Benefits

- No continuous background scanning
- Reduced disk I/O
- Lower CPU usage
- Fewer file system locks
- Better overall workspace performance

## Contributing

Feel free to file issues and submit PRs on our [GitHub repository](your-repo-url).
