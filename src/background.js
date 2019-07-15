let copyToClipboard = (str) => {
  let tmp = document.createElement('textarea');
  tmp.value = str;
  document.body.appendChild(tmp);
  tmp.select();
  let success = document.execCommand('copy');
  tmp.parentElement.removeChild(tmp);
  return success;
}

let pid = chrome.contextMenus.create({
    title: "Copy Cookie Clipboard",
    contexts: ["all"],
    type: "normal",
});

let menuIds = [];

let clearChildMenus = () => {
  menuIds.forEach(id => {
    chrome.contextMenus.remove(id);
  });
  menuIds.length = 0;
};

let createChildMenu = (pid, cookie) => {
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

chrome.tabs.onActivated.addListener((activeInfo) => {
  clearChildMenus();

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    let current = tab.url;
    chrome.tabs.getSelected(null, (tab) => {
      chrome.cookies.getAll({
        url: current
      }, cookies => {
        cookies.forEach(cookie => {
          let cid = createChildMenu(pid, cookie);
          menuIds.push(cid);
        });
      });
    });
  });
});

