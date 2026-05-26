import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'BMSICL Tender tracking System',
    autoHideMenuBar: true, // Hides the top file menu for a cleaner, modern look
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Check if we are in development mode or production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    // Load Vite local development server
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Load the pre-built build production folder path
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
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
