// Código de precarga (Preload) seguro para aislar el contexto del proceso de renderizado
const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al frontend si fuera necesario en el futuro
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes agregar funciones ipcRenderer para conectar el frontend con Node.js si lo necesitas
});
