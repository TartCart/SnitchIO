async function uninstallService(callback) {

    const { exec } = require('child_process'); // to run the powershell/cmd scripts/command
    const path = require('path');
    const fs = require('fs-extra');
    const logDir = path.join('C:\\ProgramData\\snitchIO\\logs', 'installation.log');
    // Ensure the logs directory exists and create helper function so i dont have to write a whole line during each log
    await fs.ensureDir(path.dirname(logDir));

    const logWithTimestamp = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${message}\n`;
        fs.appendFile(logDir, logMessage, () => {});
    };

    logWithTimestamp("              ******* Uninstalling *********");

    // reusable function for executing/logging powershell scripts as the JS module for executing did not work
    const executePowershellScript = (scriptPath) => {
        const fullCommand = `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`;
    
        exec(fullCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`PS exec error: ${error}`);
                logWithTimestamp(`PS exec error: ${error}`)
                return;
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                logWithTimestamp(`PS stderr: ${stderr}`);
            }
            console.log(`PS stdout: ${stdout}`);
            logWithTimestamp(`PS stdout: ${stdout}`);
        });
    };
  
    // reusable batch runner
    const executeBatchFile = (batchFilePath) => {
        console.log(`Executing batch file: ${batchFilePath}`);

        exec(batchFilePath, (error, stdout, stderr) => {
            if (error) {
                console.error(`BAT exec error: ${error}`);
                logWithTimestamp(`BAT exec error: ${error}`);
                return;
            }
            console.log(`BAT stdout: ${stdout}`);
            logWithTimestamp(`BAT stdout: ${stdout}`);
        });
    };

    try {

        // stop/delete the service 
        const stopMonitoringPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'stopMonitoring.bat');
        executeBatchFile(stopMonitoringPath);

        // disable cmd auditing
        const stopAuditingPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'stopAuditing.bat');
        executeBatchFile(stopAuditingPath);

        // disable Powershell script auditing
        const stopPSAuditingPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'stopPSAuditing.ps1');
        executePowershellScript(stopPSAuditingPath);

        const removeProgramPath = path.join(__dirname.replace('app.asar', 'app.asar.unpacked'), 'removeProgramData.bat');

        // timeout to delete programData/snitchIO folder when service is dead 
        setTimeout(() => {
            executeBatchFile(removeProgramPath);
        }, 3000); // 3000 milliseconds = 3 seconds

        // reports back to renderer that uninstall is successful
        callback(null, 'Uninstall Complete');
} catch (err) {
    console.error('Failed to uninstall service:', err);
    logWithTimestamp(`Failed to uninstall service: ${err}`);
    callback(err, null)
  }

}
module.exports = uninstallService;
