const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    title: "Nyaya-Logic Legal Fortress",
    backgroundColor: '#f9fafb',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      plugins: true, // Enable PDF viewer plugin
      webSecurity: false // Allow loading local resources (file://)
    }
  });

  // In production, load the built index.html
  // This expects that 'npm run build' has been run
  win.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Remove the default menu bar for a cleaner, app-like feel
  win.setMenuBarVisibility(false);
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