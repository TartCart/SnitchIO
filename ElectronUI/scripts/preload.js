// allows renderer to talk to IPC main securely



const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
   sendData: (data) => ipcRenderer.send('send-data', data),
   fetchData: () => ipcRenderer.invoke('fetch-data'),
   onOperationStatus: (callback) => ipcRenderer.on('operation-status', (event, ...args) => callback(...args)),
   requestLogData: () => ipcRenderer.send('request-log-data'),
   receiveLogData: (callback) => ipcRenderer.on('log-data', (event, ...args) => callback(...args))
 });
 