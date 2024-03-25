const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs');
const installService = require('./scripts/installService.js');
const uninstallService = require('./scripts/uninstallService.js');
const updateEmail = require('./scripts/updateEmail.js');
const updateExclusion = require('./scripts/updateExclusion.js')
const monitorLogFilePath = 'C:/ProgramData/snitchIO/logs/Service.log';
let emailList = [];
let exclusionList =[];
let mainWindow;

// declaring main window
const createWindow = () => {
    mainWindow = new BrowserWindow({
    width: 950,
    height: 825,
    webPreferences: {
      preload: path.join(__dirname, './scripts/preload.js'),
      contextIsolation: true,
    }
  });
  mainWindow.loadFile('index.html')
}

// Button press directives here, install/uninstall and email update commmands go through ipcMain
// All data from the renderer thread to the main thread must go through the ipc dictated on preload.js 
// recieve callbacks from installService.js and uninstallService.js to report back to install-renderer.js if uninstall/install successful
ipcMain.on('send-data', (event, data) => {
  if (data.name === 'email-array') 
  { 
    emailList = data.content;
    if (data.update === true)
    {
      updateEmail(emailList);
    }
    console.log(emailList);
  }
  else if (data.name === 'install-bool' && data.content === true) {
      installService(emailList, (err, status) => {
          // send the report back to install renderer
          mainWindow.webContents.send('operation-status', {type: 'install', status: err ? 'Failed' : status});
      });
  } else if (data.name === 'uninstall-bool' && data.content === true) {
      uninstallService((err, status) => {
          // send the report back to install renderer
          mainWindow.webContents.send('operation-status', {type: 'uninstall', status: err ? 'Failed' : status});
      });
  } else if (data.name === 'exclusion-array')
  {
    exclusionList = data.content;
    updateExclusion(exclusionList);
  }
})

// recieve log file for the monitor tab to count events
ipcMain.on('request-log-data', (event) => {
  fs.readFile(monitorLogFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading log file:', err);
          event.reply('log-data', { error: err.message });
          return;
      }
      event.reply('log-data', { data: data });
  });
});

// generate main window
app.whenReady().then(() => {
  createWindow();
  // Below removes default head bar/dev tools if uncommented
   Menu.setApplicationMenu(null);

});
