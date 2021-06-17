async function getCurrentTab () {
  const queryOptions = { active: true, currentWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

async function muteAudibleTabsExceptActive () {
  const queryOptions = { audible: true }
  const tabs = await chrome.tabs.query(queryOptions)
  const currentWindow = await chrome.windows.getCurrent()
  const currentTab = await getCurrentTab()
  if (currentTab && !currentTab.audible) {
    if (tabs.length === 1) {
      await chrome.tabs.update(tabs[0].id, { muted: false })
    }
    return
  }

  for (const tab of tabs) {
    if (tab.active && tab.windowId === currentWindow.id) {
      await chrome.tabs.update(tab.id, { muted: false })
      continue
    }
    if (!tab.mutedInfo.muted) {
      await chrome.tabs.update(tab.id, { muted: true })
    }
  }
}

async function eventHandler () {
  setTimeout(async () => { await muteAudibleTabsExceptActive() }, 500)
}

chrome.tabs.onActivated.addListener(() => eventHandler())
chrome.tabs.onUpdated.addListener(() => eventHandler())
chrome.windows.onFocusChanged.addListener(() => eventHandler())
