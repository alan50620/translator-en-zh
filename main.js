const { app, BrowserWindow } = require('electron');
const path = require('path');

// Windows 任务栏显示名称
app.setName('实时翻译');
// Windows 任务栏应用 ID（防止被归到 Electron 通用图标下）
if (process.platform === 'win32') {
  app.setAppUserModelId('com.translator.enzh');
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 600,
    minWidth: 400,
    minHeight: 450,
    resizable: true,
    title: '实时翻译',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // 阻止页面修改标题
  mainWindow.on('page-title-updated', (e) => e.preventDefault());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
