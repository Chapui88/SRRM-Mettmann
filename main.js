const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true // <-- Wichtig für Worker in Electron bei lokalen Dateien
    }
  });

  win.loadFile('index.html');
}

// Handle save request from renderer
ipcMain.on('save-points', (event, points) => {
  const savePath = path.join(app.getPath('userData'), 'saved-points.json');
  fs.writeFile(savePath, JSON.stringify(points, null, 2), (err) => {
    if (err) {
      event.reply('save-result', { success: false, error: err.message });
    } else {
      event.reply('save-result', { success: true, path: savePath });
    }
  });
});

app.whenReady().then(createWindow);



