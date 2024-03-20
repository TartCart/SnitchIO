async function updateEmail(emailList) {

    const path = require('path');
    const fs = require('fs-extra');
    const logDir = path.join('C:\\ProgramData\\snitchIO\\logs', 'installation.log');
    const emailDir = path.join('C:\\ProgramData\\snitchIO\\resources', 'alertees.txt');
    // Ensure the logs directory exists
    await fs.ensureDir(path.dirname(logDir));

    // Ensure the logs directory exists and create helper function so i dont have to write a whole line during each log
    const logWithTimestamp = (message) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ${message}\n`;
        fs.appendFile(logDir, logMessage, () => {});
    };

    try {
        const dataString = emailList.join(',');
        fs.writeFile(emailDir, dataString, (err) => {
        if (err) {
            logWithTimestamp(`Error writing email file: ${err}`);
        } else {
            logWithTimestamp('Email file was written successfully');
        }
        });
    } catch (err) {
        logWithTimestamp(`Failed to update email: ${err}`);
    }

 // TODO: inform user emails were updated

}
module.exports = updateEmail;
