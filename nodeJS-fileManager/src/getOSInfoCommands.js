import os from "os";

const handleOSCommand = (args) => {
    switch (args[0]) {
        case "--EOL":
            const eol = os.EOL;
            process.stdout.write(`End-Of-Line (EOL): ${eol}`);
            break;
        case "--cpus":
            const cpus = os.cpus();
            process.stdout.write(`Number of CPUs: ${cpus.length}`);
            cpus.forEach((cpu, index) => {
                process.stdout.write(`CPU ${index + 1}: ${cpu.model} (${cpu.speed} GHz)`);
            });
            break;
        case "--homedir":
            const homedir = os.homedir();
            process.stdout.write(`Home directory: ${homedir}`);
            break;
        case "--username":
            const username = os.userInfo().username;
            process.stdout.write(`Current system user name: ${username}`);
            break;
        case "--architecture":
            const architecture = os.arch();
            process.stdout.write(`CPU architecture: ${architecture}`);
            break;
        default:
            process.stdout.write("Invalid input.\n");
    }
}

export default {
    handleOSCommand,
};