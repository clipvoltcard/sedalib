const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: "Gestión de Materiales y Control de Stock",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Omitir o quitar la barra de menú predeterminada
  win.setMenuBarVisibility(false);

  // Determinar si estamos en desarrollo o producción
  // electron-builder establece app.isPackaged en true para la versión empaquetada
  const isDev = !app.isPackaged;

  if (isDev) {
    // En desarrollo, cargar la app desde el servidor dev running en el puerto 3000
    win.loadURL('http://localhost:3000').catch(() => {
      // Reintentar si el servidor aún no levanta
      setTimeout(() => {
        win.loadURL('http://localhost:3000');
      }, 1000);
    });
    win.webContents.openDevTools();
  } else {
    // En producción (dentro del EXE), cargar el archivo compilado por Vite
    const indexPath = path.join(__dirname, '../dist/index.html');
    win.loadFile(indexPath).catch((err) => {
      console.error("Error al cargar index.html:", err);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
