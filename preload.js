const { contextBridge } = require('electron');

// 预留 API 桥接（未来可扩展功能）
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
});
