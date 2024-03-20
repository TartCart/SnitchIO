async function installService(emailList, callback) {
    const { exec } = require("child_process"); // to run the powershell/cmd scripts/command
    const path = require("path");
    const fs = require("fs-extra");
    const mainDir = path.resolve(__dirname, "..");
    const targetDir = "C:\\ProgramData\\snitchIO";
    const sourceDir = path.join(mainDir, "assets", "service");
    const emailDir = path.join("C:\\ProgramData\\snitchIO\\resources", "alertees.txt");
    const logDir = path.join("C:\\ProgramData\\snitchIO\\logs", "installation.log");
    const { ipcRenderer } = require('electron');

    // reusable function for logging
    await fs.ensureDir(path.dirname(logDir));

    const logWithTimestamp = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${message}\n`;
        fs.appendFile(logDir, logMessage, () => {});
    };

    logWithTimestamp("              ******* Installing *********");

    // reusable function for executing/logging powershell scripts as the JS module for executing did not work
    const executePowershellScript = (scriptPath) => {
        const fullCommand = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;

        exec(fullCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                logWithTimestamp(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                logWithTimestamp(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            logWithTimestamp(`stdout: ${stdout}`);
        });
    };

    //reusable batch file runner
    const executeBatchFile = (batchFilePath) => {
        console.log(`Executing batch file: ${batchFilePath}`);

        exec(batchFilePath, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                logWithTimestamp(`exec error: ${error}`);
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                logWithTimestamp(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            logWithTimestamp(`stdout: ${stdout}`);
        });
    };

    try {
        // Create program directory in ProgramData, copy log/necessary files in
        await fs.ensureDir(targetDir);
        await fs.copy(sourceDir, targetDir);

        // Add the email list as a text file in the resources folder
        const dataString = emailList.join(",");
        fs.writeFile(emailDir, dataString, (err) => {
            if (err) {
                console.error("Error writing email file:", err);
                logWithTimestamp(`Error writing email file: ${err}`);
            } else {
                logWithTimestamp("Email file was written successfully");
            }
        });

        /////// chaning OS settings to allow for greater logging ////////////////

        // ps script for enabling script logging in registry
        const regeditScriptPath = path.join(__dirname, "regAdd.ps1");
        executePowershellScript(regeditScriptPath);

        // ps script for installing the service
        const installServiceScriptPath = path.join(__dirname, "createService.ps1");
        executePowershellScript(installServiceScriptPath);

        // cmd bat script for starting cmd auditing/logging
        const startCMDAuditingPath = path.join(__dirname, "startAuditing.bat");
        executeBatchFile(startCMDAuditingPath);

        // setting timeout so the service has time to be instantiated before the start .bat runs
        setTimeout(() => {
            // cmd bat script for starting service
            const startMonitoringPath = path.join(__dirname, "startMonitoring.bat");
            executeBatchFile(startMonitoringPath);
        }, 3000); // 3000 milliseconds = 3 seconds

        // reports back to renderer that install is successful
        callback(null, 'Install Complete');
    } catch (err) {
        console.error("Failed to install service:", err);
        logWithTimestamp(`Failed to install service: ${err}`);
        callback(err, null);
    }



}
module.exports = installService;
