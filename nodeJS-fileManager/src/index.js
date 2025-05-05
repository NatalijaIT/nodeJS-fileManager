import fileManagerCommands from "./fileManagerCommands.js";
import fileCompressCommands from "./fileCompressCommands.js";
import getOSInfoCommands from "./getOSInfoCommands.js";

const args = process.argv.slice(2);
const usernameValue = args.find((arg) => arg.startsWith("--username="));
const username = usernameValue ? usernameValue.split("=")[1] : "unknown_user";

const getCurrentWorkingDirectory = () => {
    return process.cwd();
}

process.stdout.write(`Welcome to the File Manager, ${username}!\n`);

let currentWorkingDirectory = getCurrentWorkingDirectory();

process.stdout.write(`You are currently in ${currentWorkingDirectory}\n`);

const exitFileManager = () => {
    process.stdout.write(`\nThank you for using File Manager, ${username}, goodbye!\n`);
    process.exit(0);
}

const executeCommand = async (command) => {
    console.log('command', command)
    const [operation, ...args] = command.split(" ");
    console.log('operation', operation)

    switch (operation) {
        case "up":
            currentWorkingDirectory = await fileManagerCommands.makeItUp(currentWorkingDirectory);
            break;
        case "cd":
            currentWorkingDirectory = await fileManagerCommands.moveToDirectory(currentWorkingDirectory, args);
            break;
        case "ls":
            fileManagerCommands.getList(currentWorkingDirectory);
            break;
        case "cat":
            fileManagerCommands.readFile(currentWorkingDirectory, args);
            break;
        case "add":
            fileManagerCommands.createFile(currentWorkingDirectory, args);
            break;
        case "mkdir":
            fileManagerCommands.createDirectory(currentWorkingDirectory, args);
            break;
        case "rn":
            fileManagerCommands.renameFile(currentWorkingDirectory, args);
            break;
        case "cp":
            fileManagerCommands.copyFile(currentWorkingDirectory, args);
            break;
        case "mv":
            fileManagerCommands.moveFile(currentWorkingDirectory, args);
            break;
        case "rm":
            fileManagerCommands.deleteFile(currentWorkingDirectory, args);
            break;
        case "os":
            getOSInfoCommands.handleOSCommand(args);
            break;
        case "hash":
            fileManagerCommands.getFileHash(currentWorkingDirectory, args);
            break;
        case "compress":
            fileCompressCommands.compressFile(currentWorkingDirectory, args);
            break;
        case "decompress":
            fileCompressCommands.decompressFile(currentWorkingDirectory, args);
            break;
        case ".exit":
            exitFileManager();
            break;
        default:
            process.stdout.write("Invalid input.\n");
    }
}

process.stdin.on("data", (userInput) => {
    const command = userInput.toString().trim();
    executeCommand(command);
});

process.on("SIGINT", () => {
    exitFileManager();
});

process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdout.write("Please, enter your command:\n");