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

import { Delays, Messages, showToast, triggerAutoCloseWindowWithDelay } from "./toast"

export type Urls = (string | undefined)[]

export async function getAllShortlinks(): Promise<string[]> {
  const result: any = await chrome.storage.sync.get(null)

  const allShortlinks: string[] = []
  for (const key in result) {
    const value: string[] = result[key]
    console.log(`${key}: ${value}`)
    allShortlinks.push(key)
  }

  return allShortlinks
}

export function saveShortlink(shortlinkName: string, urls: Urls) {
  let newShortlinkObject = {
    [shortlinkName]: urls,
  }
  chrome.storage.sync.set(newShortlinkObject).then(() => {
    showToast(Messages.savingShortlink, Delays.done, "success")
    triggerAutoCloseWindowWithDelay()
  })
}

// Tabs API: https://developer.chrome.com/docs/extensions/reference/tabs/
export function runWithSelectedTabs(fun: (urls: Urls) => void) {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Only get the selected (highlighted) tabs.
    const highlightedTabs = tabs.filter((tab) => tab.highlighted)
    const urls = highlightedTabs.map((tab) => tab.url)
    fun(urls)
  })
}
