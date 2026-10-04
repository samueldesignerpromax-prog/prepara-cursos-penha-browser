const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('preparaAPI', {
  onOpenNewTab: (callback) => ipcRenderer.on('open-new-tab', (event, url) => callback(url)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
  onDownloadDone: (callback) => ipcRenderer.on('download-done', (event, data) => callback(data)),

  // Função de pesquisa isolada — pode ser trocada por API própria futuramente
  searchWeb: (query) => {
    const q = encodeURIComponent(query);
    return `https://www.google.com/search?q=${q}`;
  }
});
