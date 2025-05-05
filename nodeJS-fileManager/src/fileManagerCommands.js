import { promises as fs, createReadStream, createWriteStream } from "fs";
import path from "path";
import crypto from "crypto";

const checkDirectoryExist = async (path) => {
    try {
        const stats = await fs.stat(path);
        return stats.isDirectory();
    } catch (error) {
        process.stdout.write("Error occured.\n");
        return false;
    }
}

const sortFilesAndDirs = (filesAndDirs) => {
    return filesAndDirs.slice().sort((a, b) => {
        const nameA = a.toLowerCase();
        const nameB = b.toLowerCase();

        if (nameA < nameB) {
            return -1;
        } else if (nameA > nameB) {
            return 1;
        } else {
            return 0;
        }
    });
}

const getType = async (filePath) => {
    const stats = await fs.stat(filePath);
    return stats.isDirectory() ? "directory" : "file";
}

const fileExist = async(filePath) => {
    return !!(await fs.stat(filePath).catch((e) => false));
}

const makeItUp = (currentWorkingDirectory) => {
    const parentDirectory = path.dirname(currentWorkingDirectory);
    if (parentDirectory !== currentWorkingDirectory) {
        process.stdout.write(`You are in ${parentDirectory}\n`);
        return parentDirectory;
    } else {
        process.stdout.write("You are already in the root directory.\n");
        return currentWorkingDirectory;
    }
}

const moveToDirectory = async (currentWorkingDirectory, directoryPath) => {
    const absolutePath = path.resolve(currentWorkingDirectory, directoryPath[0] || '');
    if (await checkDirectoryExist(absolutePath)) {
        process.stdout.write(`You are in ${absolutePath}\n`);
        return absolutePath;
    } else {
        process.stdout.write("Directory doesn't exist.\n");
        return currentWorkingDirectory;
    }
}

const getList = async (currentWorkingDirectory) => {
    const filesAndDirs = await fs.readdir(currentWorkingDirectory);
    const sortedfilesAndDirs = await sortFilesAndDirs(filesAndDirs);

    const directories = [];
    const files = [];
    const tableData = [];

    for (let i = 0; i < sortedfilesAndDirs.length; i++) {
        const item = sortedfilesAndDirs[i];
        const itemPath = path.join(currentWorkingDirectory, item);
        const itemType = await getType(itemPath);

        if (itemType === "directory") {
            directories.push(item);
        } else {
            files.push(item);
        }
    }

    directories.sort((a, b) => a.localeCompare(b));
    files.sort((a, b) => a.localeCompare(b));

    const sortedFilesAndDirs = directories.concat(files);

    for (let i = 0; i < sortedFilesAndDirs.length; i++) {
        const item = sortedFilesAndDirs[i];
        const itemPath = path.join(currentWorkingDirectory, item);
        const itemType = await getType(itemPath);

        tableData.push({
            Name: item,
            Type: itemType,
        });
    }

    console.table(tableData);
}

const readFile = async (currentWorkingDirectory, args) => {
    if (args.length < 1) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || '';
    const absolutePath = path.resolve(currentWorkingDirectory, filePath);

    if (!(await fileExist(absolutePath))) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    try {
        const readableStream = createReadStream(absolutePath, {
            encoding: "utf-8",
        });

        readableStream.on("data", (chunk) => {
            process.stdout.write(`Chunk:  ${chunk}\n`);
        });

        readableStream.on("error", (error) => {
            process.stdout.write(`Error:  ${error.operationFailed}\n`);
        });
    } catch (err) {
        process.stdout.write(`Error:  ${err}\n`);
    }
}

const createFile = async (currentWorkingDirectory, args) => {
    if (args.length < 1) {
        return process.stdout.write("Invalid input.\n");
    }

    const fileName = args[0] || '';
    const absolutePath = path.resolve(currentWorkingDirectory, fileName);

    if (await fileExist(absolutePath)) {
        return process.stdout.write("Invalid input: file already exists.\n");
    } else {
        await fs.writeFile(absolutePath, "", "utf8");
        process.stdout.write("File created successfully.\n");
    }
}

const createDirectory = async (currentWorkingDirectory, args) => {
    if (args.length < 1) {
        return process.stdout.write("Invalid input.\n");
    }

    const directoryName = args[0] || '';
    const absolutePath = path.resolve(currentWorkingDirectory, directoryName);

    if (await checkDirectoryExist(absolutePath)) {
        return process.stdout.write("Invalid input: directory already exists.\n");
    } else {
        await fs.mkdir(absolutePath, { recursive: true }, "utf8");
        process.stdout.write("Directory is created successfully.\n");
    }
}

const renameFile = async (currentWorkingDirectory, args) => {
    if (args.length < 2) {
        return process.stdout.write("Invalid input.\n");
    }

    const currentFilePath = args[0] || "";
    const newFileName = args[1] || "";
    const absoluteCurrentPath = path.resolve(currentWorkingDirectory, currentFilePath);
    const absoluteNewPath = path.resolve(currentWorkingDirectory, newFileName);

    if (!(await fileExist(absoluteCurrentPath))) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    if (await fileExist(absoluteNewPath)) {
        return process.stdout.write("Invalid input: file already exists.\n");
    }

    try {
        await fs.rename(absoluteCurrentPath, absoluteNewPath);
        process.stdout.write("File renamed successfully.\n");
    } catch (err) {
        process.stdout.write(`Error:  ${err}\n`)
    }
}

const copyFile = async (currentWorkingDirectory, args) => {
    if (args.length < 2) {
        return process.stdout.write("Invalid input.\n");
    }

    const sourceFilePath = args[0] || "";
    const destinationFolderName = args[1] || "";

    const absoluteSourcePath = path.resolve(currentWorkingDirectory, sourceFilePath);
    const absoluteDestinationPath = path.resolve(currentWorkingDirectory, destinationFolderName);

    if (!(await fileExist(absoluteSourcePath))) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    if (!(await checkDirectoryExist(absoluteDestinationPath))) {
        return process.stdout.write("Invalid input: directory not found.\n");
    }

    const sourceFileName = path.basename(absoluteSourcePath);
    const absoluteDestinationFilePath = path.join(absoluteDestinationPath, sourceFileName);

    if (await fileExist(absoluteDestinationFilePath)) {
        return process.stdout.write("Invalid input: file already exists.\n");
    }

    const sourceStream = createReadStream(absoluteSourcePath);
    const destinationStream = createWriteStream(absoluteDestinationFilePath);

    destinationStream.on("error", (error) => {
        process.stdout.write(`Error:  ${error}\n`)
    });

    destinationStream.on("close", () => {
        process.stdout.write("File copied successfully.\n");
    });

    sourceStream.pipe(destinationStream);
}

const moveFile = async (currentWorkingDirectory, args) => {
    if (args.length < 2) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || "";
    const destinationFolderPath = args[1] || "";
    const absolutePath = path.resolve(currentWorkingDirectory, filePath);
    const absoluteDestinationFolderPath = path.resolve(currentWorkingDirectory, destinationFolderPath);

    if (!(await fileExist(absolutePath))) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    if (!(await checkDirectoryExist(absoluteDestinationFolderPath))) {
        return process.stdout.write("Invalid input: directory not found.\n");
    }

    const destinationFileName = path.basename(absolutePath);
    const absoluteDestinationPath = path.join(absoluteDestinationFolderPath, destinationFileName);

    try {
        await fs.rename(absolutePath, absoluteDestinationPath);
        process.stdout.write("File moved successfully.\n");
    } catch (err) {
        process.stdout.write(`Error:  ${err}\n`)
    }
}

const deleteFile = async (currentWorkingDirectory, args) => {
    if (args.length < 1) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || "";
    const absolutePath = path.resolve(currentWorkingDirectory, filePath);

    if (!(await fileExist(absolutePath))) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    try {
        await fs.unlink(absolutePath);
        process.stdout.write("File deleted successfully.\n");
    } catch (err) {
        process.stdout.write(`Error:  ${err}\n`)
    }
}

const getFileHash = async (currentWorkingDirectory, args) => {
    if (args.length < 1) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || "";
    const absolutePath = path.resolve(currentWorkingDirectory, filePath);

    if (!fileExist(absolutePath)) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    try {
        const data = await fs.readFile(absolutePath, { encoding: "utf8" });
        process.stdout.write(`File hash:  ${crypto.createHash("sha256").update(data).digest("hex")}\n`);
    } catch (err) {
        process.stdout.write(`Error:  ${err}\n`)
    }
}

export default {
    makeItUp,
    moveToDirectory,
    getList,
    readFile,
    createFile,
    createDirectory,
    renameFile,
    copyFile,
    moveFile,
    deleteFile,
    getFileHash,
};