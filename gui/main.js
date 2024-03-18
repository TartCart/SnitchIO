const { app, BrowserWindow, ipcMain, Menu } = require('electron/main')
const path = require('node:path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  const mainWindow = createWindow();

  // Remove default head bar
  Menu.setApplicationMenu(null);
});

// if mac then make sure to close the app completely
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  });