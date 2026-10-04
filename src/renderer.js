const tabsContainer = document.getElementById('tabs');
const webviewsContainer = document.getElementById('webviews');
const addressBar = document.getElementById('address-bar');
const backBtn = document.getElementById('back');
const forwardBtn = document.getElementById('forward');
const reloadBtn = document.getElementById('reload');
const stopBtn = document.getElementById('stop');
const homeBtn = document.getElementById('home');
const newTabBtn = document.getElementById('new-tab');
const homePage = document.getElementById('home-page');
const homeSearchInput = document.getElementById('home-search-input');
const homeSearchBtn = document.getElementById('home-search-btn');
const downloadStatus = document.getElementById('download-status');

let tabs = [];
let activeTabId = null;
let tabCounter = 0;

/* -------------------------------------------------
   Função de pesquisa isolada — pode ser trocada
   futuramente por uma API própria (Prepara Search).
------------------------------------------------- */
function searchWeb(query) {
  const q = encodeURIComponent(query);
  return `https://www.google.com/search?q=${q}`;
}

/* Detecta URL ou pesquisa */
function resolveInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return searchWeb(trimmed);
}

/* Cria nova aba */
function createTab(url = null) {
  const id = `tab-${++tabCounter}`;
  const isHome = !url;

  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.dataset.id = id;
  tabEl.innerHTML = `
    <span class="tab-title">${isHome ? 'Nova aba' : 'Carregando...'}</span>
    <button class="close-tab">×</button>
  `;

  const webview = document.createElement('webview');
  webview.className = 'webview';
  webview.dataset.id = id;
  webview.setAttribute('allowpopups', '');
  webview.setAttribute('src', isHome ? 'about:blank' : url);

  webview.addEventListener('did-start-loading', () => {
    updateTabTitle(id, 'Carregando...');
  });

  webview.addEventListener('did-stop-loading', () => {
    updateNavButtons();
  });

  webview.addEventListener('page-title-updated', (e) => {
    updateTabTitle(id, e.title);
  });

  webview.addEventListener('did-navigate', (e) => {
    if (activeTabId === id) addressBar.value = e.url;
    updateNavButtons();
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    if (activeTabId === id) addressBar.value = e.url;
    updateNavButtons();
  });

  webview.addEventListener('enter-html-full-screen', () => {
    document.body.classList.add('fullscreen');
  });
  webview.addEventListener('leave-html-full-screen', () => {
    document.body.classList.remove('fullscreen');
  });

  webview.addEventListener('new-window', (e) => {
    createTab(e.url);
  });

  tabsContainer.appendChild(tabEl);
  webviewsContainer.appendChild(webview);

  const tabObj = {
    id,
    tabEl,
    webview,
    title: isHome ? 'Nova aba' : 'Carregando...'
  };
  tabs.push(tabObj);

  tabEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-tab')) return;
    activateTab(id);
  });

  tabEl.querySelector('.close-tab').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(id);
  });

  activateTab(id);

  if (isHome) {
    showHomePage();
  } else {
    hideHomePage();
    webview.src = url;
  }

  return tabObj;
}

/* Ativa aba */
function activateTab(id) {
  activeTabId = id;
  tabs.forEach((tab) => {
    const isActive = tab.id === id;
    tab.tabEl.classList.toggle('active', isActive);
    tab.webview.classList.toggle('active', isActive);
  });

  const activeTab = tabs.find((t) => t.id === id);
  if (activeTab) {
    if (activeTab.webview.src && activeTab.webview.src !== 'about:blank') {
      addressBar.value = activeTab.webview.src;
    } else {
      addressBar.value = '';
    }
  }
  updateNavButtons();
}

/* Fecha aba */
function closeTab(id) {
  const index = tabs.findIndex((t) => t.id === id);
  if (index === -1) return;

  const tab = tabs[index];
  tab.tabEl.remove();
  tab.webview.remove();
  tabs.splice(index, 1);

  if (tabs.length === 0) {
    createTab();
    return;
  }

  if (activeTabId === id) {
    const newIndex = Math.max(0, index - 1);
    activateTab(tabs[newIndex].id);
  }
}

/* Atualiza título da aba */
function updateTabTitle(id, title) {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;
  tab.title = title || 'Nova aba';
  tab.tabEl.querySelector('.tab-title').textContent = tab.title;
}

/* Página inicial */
function showHomePage() {
  homePage.style.display = 'flex';
  webviewsContainer.style.display = 'none';
  addressBar.value = '';
}

function hideHomePage() {
  homePage.style.display = 'none';
  webviewsContainer.style.display = 'block';
}

/* Botões de navegação */
function updateNavButtons() {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return;
  const wv = activeTab.webview;
  backBtn.disabled = !wv.canGoBack();
  forwardBtn.disabled = !wv.canGoForward();
}

backBtn.addEventListener('click', () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab && tab.webview.canGoBack()) tab.webview.goBack();
});

forwardBtn.addEventListener('click', () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab && tab.webview.canGoForward()) tab.webview.goForward();
});

reloadBtn.addEventListener('click', () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) tab.webview.reload();
});

stopBtn.addEventListener('click', () => {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) tab.webview.stop();
});

homeBtn.addEventListener('click', () => {
  showHomePage();
  activateTab(activeTabId);
  homePage.style.display = 'flex';
  webviewsContainer.style.display = 'none';
  addressBar.value = '';
});

/* Barra de endereço */
addressBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const url = resolveInput(addressBar.value);
    if (!url) return;
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab) {
      tab.webview.src = url;
      hideHomePage();
    }
  }
});

/* Nova aba */
newTabBtn.addEventListener('click', () => {
  createTab();
});

/* Pesquisa na página inicial */
homeSearchBtn.addEventListener('click', () => {
  const query = homeSearchInput.value.trim();
  if (!query) return;
  const url = resolveInput(query);
  const tab = tabs.find((t) => t.id === activeTabId);
  if (tab) {
    tab.webview.src = url;
    hideHomePage();
  }
});

homeSearchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') homeSearchBtn.click();
});

/* Atalhos */
document.querySelectorAll('.shortcut').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const url = link.dataset.url;
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab) {
      tab.webview.src = url;
      hideHomePage();
    }
  });
});

/* Downloads */
window.preparaAPI.onDownloadProgress((data) => {
  downloadStatus.style.display = 'block';
  downloadStatus.textContent = `Baixando: ${data.fileName} (${Math.round(
    (data.received / data.total) * 100
  )}%)`;
});

window.preparaAPI.onDownloadDone((data) => {
  downloadStatus.textContent = `Download concluído: ${data.fileName}`;
  setTimeout(() => {
    downloadStatus.style.display = 'none';
  }, 4000);
});

/* Nova aba via target=_blank */
window.preparaAPI.onOpenNewTab((url) => {
  createTab(url);
});

/* Inicializa */
createTab();
