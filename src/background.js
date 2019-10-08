const copyToClipboard = (str) => {
  const tmp = document.createElement('textarea');
  tmp.value = str;
  document.body.appendChild(tmp);
  tmp.select();
  const success = document.execCommand('copy');
  tmp.parentElement.removeChild(tmp);
  return success;
}

const pid = chrome.contextMenus.create({
    title: "Copy Cookie Clipboard",
    contexts: ["all"],
    type: "normal",
});

const menuIds = [];

const clearChildMenus = () => {
  menuIds.forEach(id => {
    chrome.contextMenus.remove(id);
  });
  menuIds.length = 0;
};

const createChildMenu = (pid, cookie) => {
  return chrome.contextMenus.create({
      title: cookie.name,
      parentId: pid,
      contexts: ["all"],
      type: "normal",
      onclick: (info) => {
        copyToClipboard(cookie.value)
      }
  });
};

const parseDomainFromURL = (url) => {
  return new URL(url).hostname
};

const createMenus = (tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    const current = tab.url;
    const domain = parseDomainFromURL(current)
    chrome.tabs.getSelected(null, (tab) => {
      chrome.cookies.getAll({
        url: current
      }, cookies => {
        cookies.filter(cookie =>
          cookie.domain === domain
        ).forEach(cookie => {
          const cid = createChildMenu(pid, cookie);
          menuIds.push(cid);
        });
      });
    });
  });
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  clearChildMenus();
  createMenus(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId) => {
  clearChildMenus();
  createMenus(tabId);
});

chrome.tabs.onCreated.addListener((tab) => {
  clearChildMenus();
  createMenus(tab.id);
});
