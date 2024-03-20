// allows renderer to talk to IPC main securely



const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
   sendData: (data) => ipcRenderer.send('send-data', data),
   fetchData: () => ipcRenderer.invoke('fetch-data')
 });
 