const fs = require('fs');
const path = require('path');
const readline = require('readline');

// List of folders to ignore
const ignoredFolders = ['node_modules', '.git'];

// Function to convert a directory to a JSON object
function directoryToJson(dirPath, basePath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    fullPath: dirPath,
    relativePath: path.relative(basePath, dirPath),
    type: stats.isDirectory() ? 'directory' : 'file'
  };

  if (info.type === 'directory') {
    info.children = fs.readdirSync(dirPath)
      .filter(child => !ignoredFolders.includes(child))
      .map(child => directoryToJson(path.join(dirPath, child), basePath));
  } else {
    info.content = fs.readFileSync(dirPath, 'utf8');
  }

  return info;
}

// Function to generate a default JSON file name
function generateDefaultJsonFileName(directoryPath) {
  const resolvedPath = path.resolve(directoryPath);
  const dirName = path.basename(resolvedPath);
  const dateTime = new Date().toISOString().replace(/[:.]/g, '-');
  return `${dirName}_${dateTime}.json`;
}

// Function to save the directory structure to a JSON file
function saveDirectoryToJson(dirPath, jsonPath, remark) {
  const basePath = path.resolve(dirPath);
  const dirJson = directoryToJson(dirPath, basePath);
  dirJson.remark = remark;
  dirJson.summary = generateDirectorySummary(dirPath);

  // Print summary
  console.log(`Summary for ${dirJson.name}:`);
  console.log(`- Last saved: ${new Date().toLocaleString()}`);
  console.log(`- Total files: ${dirJson.summary.totalFiles}`);
  console.log(`- Total directories: ${dirJson.summary.totalDirectories}`);
  console.log(`Source directory: ${dirPath}`);

  // Ask for confirmation
  askQuestion('Do you want to proceed? (y/n) [default: y]: ').then((answer) => {
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      console.log('Operation cancelled.');
    } else {
      if (!jsonPath.endsWith('.json')) {
        jsonPath += '.json';
      }
      fs.writeFileSync(jsonPath, JSON.stringify(dirJson, null, 2), 'utf8');
      console.log(`Directory structure saved to ${jsonPath}`);
    }
    rl.close();
  });
}

// Function to restore a directory from a JSON object
function jsonToDirectory(json, parentPath = '') {
  const currentPath = path.join(parentPath, json.name); // Use the 'name' property for the root directory

  if (json.type === 'directory') {
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath, { recursive: true }); // Create root directory with all its parents
    }
    console.log(`Directory created: ${currentPath}`);
    json.children.forEach(child => jsonToDirectory(child, currentPath));
  } else {
    fs.writeFileSync(currentPath, json.content, 'utf8');
    console.log(`File created: ${currentPath}`);
  }
}

// Function to restore the directory structure from a JSON file
function restoreDirectoryFromJson(jsonPath, targetDirPath) {
  const dirJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Print summary before restoration
  console.log(`Summary for ${dirJson.name}:`);
  console.log(`- Last saved: ${dirJson.summary.lastSaved}`);
  console.log(`- Total files: ${dirJson.summary.totalFiles}`);
  console.log(`- Total directories: ${dirJson.summary.totalDirectories}`);
  console.log(`Source JSON file: ${jsonPath}`);

  // Ask for confirmation
  askQuestion('Do you want to proceed? (y/n) [default: y]: ').then((answer) => {
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      console.log('Operation cancelled.');
    } else {
      jsonToDirectory(dirJson, targetDirPath);
      console.log(`Directory structure restored to ${targetDirPath}`);
    }
    rl.close();
  });
}

// Function to generate directory summary
function generateDirectorySummary(dirPath) {
  const dirStats = fs.statSync(dirPath);
  const totalFiles = countFiles(dirPath);
  const totalDirectories = countDirectories(dirPath);
  return {
    lastSaved: new Date().toLocaleString(),
    totalFiles: totalFiles,
    totalDirectories: totalDirectories
  };
}

// Helper functions to count files and directories
function countFiles(dirPath) {
  let fileCount = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      fileCount++;
    } else if (stats.isDirectory() && !ignoredFolders.includes(file)) {
      fileCount += countFiles(filePath);
    }
  });

  return fileCount;
}

function countDirectories(dirPath) {
  let dirCount = 0;
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory() && !ignoredFolders.includes(file)) {
      dirCount++;
      dirCount += countDirectories(filePath);
    }
  });

  return dirCount;
}

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Interactive input function
async function interactiveInput() {
  let command = await askQuestion('Enter command (save [s] / restore [r]) [default: save]: ');
  if (command.toLowerCase() !== 'restore' && command.toLowerCase() !== 'r') {
    command = 'save';
  }

  if (command.toLowerCase() === 'save' || command.toLowerCase() === 's') {
    let directoryPath = await askQuestion('Enter source directory path: ');

    // Convert user input to absolute path
    directoryPath = path.resolve(directoryPath);

    if (!fs.existsSync(directoryPath)) {
      console.log('The specified directory does not exist.');
      rl.close();
      return;
    }

    // Show summary before asking for destination file
    const basePath = path.resolve(directoryPath);
    const dirJson = directoryToJson(directoryPath, basePath);
    const totalFiles = countFiles(directoryPath);
    const totalDirectories = countDirectories(directoryPath);
    console.log(`Summary: ${totalFiles} files and ${totalDirectories} directories will be saved.`);
    console.log(`Source directory: ${path.resolve(directoryPath)}`);

    let proceed = await askQuestion('Do you want to proceed? (y/n) [default: y]: ');
    if (proceed.toLowerCase() !== 'n' && proceed.toLowerCase() !== 'no') {
      proceed = 'y';
    }

    if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
      console.log('Operation cancelled.');
      rl.close();
      return;
    }

    let jsonFilePath = await askQuestion('Enter destination JSON file path to save (leave empty to use default): ');
    if (!jsonFilePath) {
      jsonFilePath = generateDefaultJsonFileName(directoryPath);
    }

    const remark = await askQuestion('Enter a remark: ');

    if (!jsonFilePath.endsWith('.json')) {
      jsonFilePath += '.json';
    }
    saveDirectoryToJson(directoryPath, jsonFilePath, remark);
  } else if (command.toLowerCase() === 'restore' || command.toLowerCase() === 'r') {
    let jsonFilePath = await askQuestion('Enter JSON file path to restore from (leave empty to use first JSON file in current directory): ');

    if (!jsonFilePath) {
      const files = fs.readdirSync(process.cwd());
      jsonFilePath = files.find(file => file.endsWith('.json'));

      if (!jsonFilePath) {
        console.log('No JSON file found in the current directory.');
        rl.close();
        return;
      }
    }

    if (!fs.existsSync(jsonFilePath)) {
      console.log('The specified JSON file does not exist.');
      rl.close();
      return;
    }

    let directoryPath = await askQuestion('Enter destination directory path to restore to: ');
    directoryPath = path.resolve(directoryPath);
    restoreDirectoryFromJson(jsonFilePath, directoryPath);
  } else {
    console.log('Invalid command. Use "save" (s) to save a directory or "restore" (r) to restore a directory.');
    rl.close();
  }
}

// Main function to handle command-line arguments
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await interactiveInput();
  } else {
    const command = args[0] || 'save';
    let directoryPath = path.resolve(args[1]);
    let jsonFilePath = args[2] || generateDefaultJsonFileName(directoryPath);
    const remark = args[3] || '';

    if (command.toLowerCase() === 'save' || command.toLowerCase() === 's') {
      if (!fs.existsSync(directoryPath)) {
        console.log('The specified directory does not exist.');
        return;
      }
      if (!jsonFilePath.endsWith('.json')) {
        jsonFilePath += '.json';
      }
      saveDirectoryToJson(directoryPath, jsonFilePath, remark);
    } else if (command.toLowerCase() === 'restore' || command.toLowerCase() === 'r') {
      if (!jsonFilePath) {
        const files = fs.readdirSync(process.cwd());
        jsonFilePath = files.find(file => file.endsWith('.json'));

        if (!jsonFilePath) {
          console.log('No JSON file found in the current directory.');
          return;
        }
      }

      if (!fs.existsSync(jsonFilePath)) {
        console.log('The specified JSON file does not exist.');
        return;
      }
      restoreDirectoryFromJson(jsonFilePath, directoryPath);
    } else {
      console.log('Invalid command. Use "save" (s) to save a directory or "restore" (r) to restore a directory.');
    }
  }
}

main();
