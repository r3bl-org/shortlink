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

import { Shortlink, StoredObject, StoredValue, delay } from "../types"

// This function retrieves all shortlinks from the Chrome storage and returns them as an
// array of Shortlink objects. This array is sorted by priority.
//
// The Shortlink object contains:
// - the name of the shortlink,
// - an array of URLs associated with the shortlink,
// - the date the shortlink was created, and
// - the priority of the shortlink.
export async function loadAllShortlinksFromChromeStorage(): Promise<Shortlink[]> {
  const allItemsInStorage: StoredObject = await chrome.storage.sync.get(null)
  console.log("loadAllShortlinksFromChromeStorage() => allItemsInStorage: ", allItemsInStorage)

  const allShortlinkArray: Shortlink[] = []
  for (const key of Object.keys(allItemsInStorage)) {
    const item: Shortlink = await importAndMigrateShortlinkFromChromeStorage(
      key,
      allItemsInStorage[key]
    )
    allShortlinkArray.push(item)
  }

  return sortShortlinksByPriority(allShortlinkArray)

  function sortShortlinksByPriority(shortlinks: Shortlink[]): Shortlink[] {
    let sortedShortlinks: Shortlink[] = []

    sortedShortlinks = sortedShortlinks.sort((a, b) => {
      const nameComparison = b.name.localeCompare(a.name)
      return nameComparison
    })

    sortedShortlinks = shortlinks.sort((a, b) => {
      const priorityComparison = b.priority - a.priority
      if (priorityComparison === 0) {
        const dateComparison = b.date - a.date
        return dateComparison
      }
      return priorityComparison
    })

    return sortedShortlinks
  }

  // This function handles the migration from v4.6 to v4.7 data type (in chrome.store.sync).
  async function importAndMigrateShortlinkFromChromeStorage(
    key: string,
    value: any
  ): Promise<Shortlink> {
    // The following fields were added in v4.7, so we need to check if they exist.
    let date = value.date ? value.date : Date.now()
    let priority = value.priority ? value.priority : 0

    // In v4.6 and earlier, the value was an array of urls.
    let urls = Array.isArray(value) ? value : value.urls

    // Do the migration from v4.6 to v4.7 data type (in chrome.store.sync). And inject delay.
    if (Array.isArray(value)) {
      try {
        await setValueOnChromeStorage(key, {
          urls: urls,
          date: date,
          priority: priority,
        })
        // Artificial delay to avoid hitting chrome.storage.sync rate limits.
        await delay()
      } catch (error) {
        console.error(error)
      }
    }

    return {
      name: key,
      urls: urls,
      date: date,
      priority: priority,
    }
  }
}
export async function getValueFromChromeStorage(key: string): Promise<StoredValue> {
  const item: StoredObject = await chrome.storage.sync.get(null)
  return item[key] as StoredValue
}
export async function setValueOnChromeStorage(key: string, value: StoredValue) {
  const newObject: StoredObject = {
    [key]: {
      urls: value.urls,
      date: value.date,
      priority: value.priority,
    },
  }
  await chrome.storage.sync.set(newObject)
}
export async function removeFromSyncStorage(key: string) {
  await chrome.storage.sync.remove(key)
}
