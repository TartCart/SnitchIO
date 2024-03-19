async function installService(emailList) {

    const { exec } = require('child_process'); // to run the powershell command
    const path = require('path');
    const fs = require('fs-extra');
    const mainDir = path.resolve(__dirname, '..');
    const targetDir = 'C:\\ProgramData\\monitorOne';
    const sourceDir = path.join(mainDir, 'assets', 'service');
    const emailDir = path.join('C:\\ProgramData\\monitorOne\\resources', 'alertees.txt');
    
  
    try {
        // Create program directory in ProgramData, copy log/necessary files in
        await fs.ensureDir(targetDir);
        await fs.copy(sourceDir, targetDir);

        // Add the email list as a text file in the resources folder
        const dataString = emailList.join(',');
        fs.writeFile(emailDir, dataString, (err) => {
        if (err) {
            console.error('Error writing email file:', err);
        } else {
            console.log('Email file was written successfully');
        }
        });


        // ps command for installing the service
        const serviceCommand = `New-Service -Name 'monitorOne' -BinaryPathName 'C:\\ProgramData\\monitorOne\\resources\\WatchTower.exe' -DisplayName 'monitorOne' -StartupType 'Automatic' -Description 'monitorOne Service'`;

      // Execute PowerShell command as admin
        exec(`powershell -Command "${serviceCommand}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        });

      // Execute CMD command as admin (example command)
      exec('cmd.exe /c sc start monitorOne', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
      
    } catch (err) {
      console.error('Failed to install service:', err);
    }
    
}
module.exports = installService;
