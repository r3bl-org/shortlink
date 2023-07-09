/*
 *   Copyright (c) 2023 R3BL LLC
 *   All rights reserved.
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

import { openUrlsInTabs } from "./omnibox"
import { Delays, Messages, showToast, triggerAutoCloseWindowWithDelay } from "./toast"
import { Shortlink, Url } from "./types"

export async function getAllShortlinks(): Promise<Shortlink[]> {
  const result: any = await chrome.storage.sync.get(null)

  const allShortlinks: Shortlink[] = []
  for (const key in result) {
    const value: Url[] = result[key]
    console.log(`${key}: ${value}`)
    allShortlinks.push({
      name: key,
      urls: value,
    })
  }

  return allShortlinks
}

export function actuallySaveShortlink(shortlinkName: string, urls: Url) {
  let newShortlinkObject = {
    [shortlinkName]: urls,
  }
  chrome.storage.sync.set(newShortlinkObject).then(() => {
    showToast(Messages.savingShortlink, Delays.done, "success")
    triggerAutoCloseWindowWithDelay()
  })
}

export async function tryToSaveShortlink(userInputText: string) {
  // Only get the selected (highlighted) tabs.
  // Tabs API: https://developer.chrome.com/docs/extensions/reference/tabs/
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const highlightedTabs = tabs.filter((tab) => tab.highlighted)
  const urls = highlightedTabs.map((tab) => tab.url)

  // Save the urls using the shortlink name: userInputText.
  const result = await chrome.storage.sync.get(userInputText)
  const value = result[userInputText]
  if (value !== undefined && value.length > 0) {
    showToast(Messages.duplicateExists, Delays.preparing, "info")
    setTimeout(() => {
      actuallySaveShortlink(userInputText, urls)
    }, Delays.preparing)
  } else {
    actuallySaveShortlink(userInputText, urls)
  }
}

export function openShortlink(shortlinkArg: string) {
  chrome.storage.sync.get(shortlinkArg, (result) => {
    const urls: Url = result[shortlinkArg]
    openUrlsInTabs(urls)
  })
}

export function deleteShortlink(shortlinkArg: string) {
  console.log("shortlinkArg", shortlinkArg)
  // No arg provided.
  if (shortlinkArg === undefined || shortlinkArg.length === 0) {
    showToast(`Please provide a shortlink name to delete`, Delays.done, "warning")
    return
  }
  // Arg provided.
  else {
    chrome.storage.sync.remove(shortlinkArg)
    showToast(`Deleting shortlink ${shortlinkArg}`, Delays.done, "info")
    triggerAutoCloseWindowWithDelay()
    return
  }
}
