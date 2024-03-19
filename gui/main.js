const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const installService = require('./scripts/installService.js');
const uninstallService = require('./scripts/uninstallService.js');
const updateEmail = require('./scripts/updateEmail.js');
let emailList = [];

// Button press directives here
// All data from the renderer thread to the main thread must go through the ipc dictated on preload.js 
ipcMain.on('send-data', (event, data) => {
  
  if (data.name === 'email-array') 
  { 
    emailList = data.content;
    if (data.update === true)
    {
      updateEmail(emailList);
      // TODO: write js file to update email
    }
    console.log(emailList);
  }
  else if (data.name === 'install-bool')
  {
    if (data.content === true)
    {
      installService(emailList);
    }
  }
  else if (data.name === 'uninstall-bool')
  {
    if (data.content === true)
    {
      uninstallService();
      // TODO: write unisntall js file
    }
  }

});




const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './scripts/preload.js'),
      contextIsolation: true,
    }
  });

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();
  // Below removes default head bar/dev tools if uncommented
  // Menu.setApplicationMenu(null);

});
