async function updateExclusion(exclusionList) {

    const path = require('path');
    const fs = require('fs-extra');
    const logDir = path.join('C:\\ProgramData\\snitchIO\\logs', 'installation.log');
    const exclusionDir = path.join('C:\\ProgramData\\snitchIO\\resources', 'exclusions.txt');
    // Ensure the logs directory exists
    await fs.ensureDir(path.dirname(logDir));
    await fs.ensureDir(path.dirname(exclusionDir));

    // Ensure the logs directory exists and create helper function so i dont have to write a whole line during each log
    const logWithTimestamp = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${message}\n`;
        fs.appendFile(logDir, logMessage, () => {});
    };

    try {
        const dataString = exclusionList.join(',');
        fs.writeFile(exclusionDir, dataString, (err) => {
        if (err) {
            logWithTimestamp(`Error writing exclusion file: ${err}`);
        } else {
            logWithTimestamp('exclusion file was written successfully');
        }
        });
    } catch (err) {
        logWithTimestamp(`Failed to update exclusion list: ${err}`);
    }

}
module.exports = updateExclusion;