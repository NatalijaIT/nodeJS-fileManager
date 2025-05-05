import fs from "fs";
import path from "path";
import zlib from "zlib";

const checkDirectoryExist = async (path) => {
    try {
        const stats = await fs.stat(path);
        return stats.isDirectory();
    } catch (error) {
        process.stdout.write("Error occured.\n");
        return false;
    }
}

const fileExist = async(filePath) => {
    return !!(await fs.stat(filePath).catch((e) => false));
}

const compressFile = async (currentWorkingDirectory, args) => {
    if (args.length < 2) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || "";
    const destPath = args[1] || "";
    const sourcePath = path.resolve(currentWorkingDirectory, filePath);
    const destFolderPath = path.resolve(currentWorkingDirectory, destPath);

    if (!fileExist(sourcePath)) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    if (!checkDirectoryExist(destFolderPath)) {
        return process.stdout.write("Invalid input: directory not found.\n");
    }

    const fileName = path.basename(sourcePath);
    const archiveName = `${fileName}.br`;
    const arhiveDestPath = path.join(destFolderPath, archiveName);

    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(arhiveDestPath);
    const compressStream = zlib.createBrotliCompress();

    readStream.pipe(compressStream).pipe(writeStream);

    writeStream.on("error", (err) => {
        process.stdout.write(`Error:  ${err}\n`);
    });

    writeStream.on("finish", () => {
        process.stdout.write("File compressed successfully.\n");
    });
}

const decompressFile = async (currentWorkingDirectory, args) => {
    if (args.length < 2) {
        return process.stdout.write("Invalid input.\n");
    }

    const filePath = args[0] || "";
    const destPath = args[1] || "";
    const sourcePath = path.resolve(currentWorkingDirectory, filePath);
    const destFolderPath = path.resolve(currentWorkingDirectory, destPath);

    if (!fileExist(sourcePath)) {
        return process.stdout.write("Invalid input: file not found.\n");
    }

    if (!checkDirectoryExist(destFolderPath)) {
        return process.stdout.write("Invalid input: directory not found.\n");
    }

    const srcFileName = path.basename(sourcePath);
    const destFileName = path.parse(srcFileName).name;
    const arhiveDestPath = path.join(absDestFolderPath, destFileName);

    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(arhiveDestPath);
    const decompressStream = zlib.createBrotliDecompress();


    readStream.pipe(decompressStream).pipe(writeStream);

    writeStream.on("error", (err) => {
        process.stdout.write(`Error:  ${err}\n`);
    });

    writeStream.on("finish", () => {
        process.stdout.write("File decompressed successfully.\n");
    });
}

export default {
    compressFile,
    decompressFile,
};