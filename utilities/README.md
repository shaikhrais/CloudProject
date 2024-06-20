# Directory Backup and Restore Script

This Node.js script allows you to save a directory and its inner files as a JSON object and restore them later if needed. This can be useful for backing up directory structures and their contents.

## Features

- Save a directory and its contents to a JSON file.
- Restore a directory and its contents from a JSON file.
- Display a summary of the total number of files and directories to be processed, including their full paths.
- Show updates after every file or directory is created.
- Ignore specified folders (e.g., `node_modules`, `.git`) during the save process.
- Include additional metadata in the JSON file (folder name, relative path, and user-provided remark).
- Supports both command-line arguments and interactive input.
- Ask for confirmation before processing.
- Automatically add `.json` extension if missing.
- Use a default JSON file name based on the source directory name and the current date and time if the user doesn't provide a JSON file name.
- Default to "save" if no command is provided.
- Default to "yes" if no confirmation is provided.
- Use the first JSON file in the current directory if the user forgets to enter the JSON file path for restoration.
- Ensure the root directory is included when restoring the structure.

## Prerequisites

- Node.js (version 10 or higher)

## Installation

1. Clone the repository or download the script.
2. Navigate to the project directory.

```bash
git clone <repository-url>
cd <repository-directory>
