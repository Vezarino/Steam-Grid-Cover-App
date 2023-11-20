import { app, BrowserWindow } from 'electron';

let win: BrowserWindow | null;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 500,
    height: 900,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  win.loadFile('index.html');
  win.setMenu(null);

  // Open the DevTools.
  win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
