async function uninstallService() {

    const logDir = path.join('C:\\ProgramData\\monitorOne\\logs', 'installation.log');
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
                console.error(`exec error: ${error}`);
                logWithTimestamp(`exec error: ${error}`)
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
  
    // reusable batch runner
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

    // stop/delete the service 
    const stopMonitoringPath = path.join(__dirname, 'stopMonitoring.bat');
    executeBatchFile(stopMonitoringPathMonitoringPath);

    // disable cmd auditing
    const stopAuditingPath = path.join(__dirname, 'stopAuditing.bat');
    executeBatchFile(stopAuditingPath);

    // disable Powershell script auditing
    const stopPSAuditingPath = path.join(__dirname, 'stopPSAuditing.ps1');
    executePowershellScript(stopPSAuditingPath);

    // remove the files from 








    // TODO: return to the user that uninstall is complete
}
module.exports = uninstallService;
