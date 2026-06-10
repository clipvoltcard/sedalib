const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Forzar NODE_ENV de producción si la app está empaquetada
if (app.isPackaged) {
  process.env.NODE_ENV = 'production';
}

// Iniciar el servidor Express compilado de forma automática
try {
  const serverPath = path.join(__dirname, '../dist/server.cjs');
  if (fs.existsSync(serverPath)) {
    require(serverPath);
    console.log("Servidor Express de Sedalib iniciado en puerto 3000.");
  } else {
    console.warn("No se encontró dist/server.cjs. Asegúrate de compilar antes con npm run build.");
  }
} catch (err) {
  console.error("Error al arrancar el servidor backend:", err);
}

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

  // Intentar cargar la aplicación desde el servidor local (puerto 3000)
  // Nota: Dado que iniciamos el servidor arriba, cargamos http://localhost:3000 tanto
  // en desarrollo como en producción. Esto asegura que la base de datos y la API funcionen.
  const loadApp = () => {
    win.loadURL('http://localhost:3000').catch((err) => {
      console.log("Esperando a que el servidor Express levante... reintentando en 1s");
      setTimeout(loadApp, 1000);
    });
  };

  loadApp();

  if (!app.isPackaged) {
    win.webContents.openDevTools();
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
