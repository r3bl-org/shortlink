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
import { EditMode } from "./popup"
import { Delays, Messages, showToast, triggerAutoCloseWindowWithDelay } from "./toast"
import { Shortlink, Urls } from "./types"

export async function getAllShortlinks(): Promise<Shortlink[]> {
  const result: any = await chrome.storage.sync.get(null)

  const allShortlinks: Shortlink[] = []
  for (const key in result) {
    const value: Urls[] = result[key]
    console.log(`${key}: ${value}`)
    allShortlinks.push({
      name: key,
      urls: value,
    })
  }

  return allShortlinks
}

export async function actuallySaveShortlink(shortlinkName: string, urls: Urls, overwrite: boolean) {
  await saveToSyncStorage(shortlinkName, urls)
  if (overwrite) {
    showToast(Messages.duplicateExists, Delays.default, "info")
  } else {
    showToast(Messages.savingShortlink, Delays.default, "success")
  }
  triggerAutoCloseWindowWithDelay()
}

export async function saveToSyncStorage(key: string, value: Urls): Promise<void> {
  let newShortlinkObject = {
    [key]: value,
  }

  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(newShortlinkObject, () => {
      resolve()
    })
  })
}

export async function tryToSaveShortlink(newShortlinkName: string) {
  // Only get the selected (highlighted) tabs.
  const tabs = await chrome.tabs.query({ currentWindow: true })
  const highlightedTabs = tabs.filter((tab) => tab.highlighted)
  const urls = highlightedTabs.map((tab) => tab.url)

  // Check if the shortlink already exists in sync storage.
  const existingValue: Urls = await getFromSyncStorage(newShortlinkName)

  if (existingValue !== undefined && existingValue.length > 0) {
    // Shortlink already exists, ask the user if they want to overwrite it.
    const confirmOverwrite = confirm(
      `The shortlink '${newShortlinkName}' with value '${existingValue.join(
        ", "
      )}' already exists. Do you want to overwrite it?`
    )

    if (confirmOverwrite) {
      // User wants to overwrite, proceed with overwriting
      await actuallySaveShortlink(newShortlinkName, urls, true)
    } else {
      // User does not want to overwrite, ask if they want to provide a new name
      const renameShortlink = confirm(`Do you want to provide a new name for the shortlink?`)

      if (renameShortlink) {
        const newName = prompt(
          "Enter a new name for the shortlink (or leave empty to keep the same name):"
        )
        if (newName !== null) {
          if (newName.trim() !== "") {
            // User entered a new name, save the shortlink with the new name
            await actuallySaveShortlink(newName, urls, false)
          } else {
            // User kept the same name, close the popup
            window.close()
          }
        }
      } else {
        // User does not want to provide a new name, close the popup
        window.close()
      }
    }
  } else {
    // Shortlink doesn't exist, proceed with saving
    await actuallySaveShortlink(newShortlinkName, urls, false)
  }
}

export async function openMultipleShortlinks(shortlinkArg: string) {
  const names = extractMultipleShortlinkNames(shortlinkArg)

  console.log("shortlink names to open: ", names)

  let urls: Urls = []

  for (const name of names) {
    let urlsForName: Urls = await getUrlsForShortlinkName(name)
    urls = urls.concat(urlsForName)
  }

  openUrlsInTabs(urls)
}

export async function deleteMultipleShortlinks(shortlinkArg: string, editMode: EditMode.Type) {
  const names = extractMultipleShortlinkNames(shortlinkArg)

  console.log("shortlink names to delete: ", names)

  // No arg provided.
  if (names === undefined || names.length === 0) {
    showToast(`Please provide a shortlink name to delete`, Delays.default, "warning")
  }
  // Arg provided.
  else {
    for (const name of names) {
      await removeFromSyncStorage(name)
    }
    showToast(`Deleting shortlink(s) ${names.join(", ")}`, Delays.default, "info")

    // Do not close this popup if we are in edit mode.
    if (editMode === EditMode.Disabled) {
      triggerAutoCloseWindowWithDelay()
    }
  }
}

export async function editShortlink(shortlinkName: string) {
  // Retrieve the existing URLs for the specified shortlinkName.
  const existingUrls: Urls = await getUrlsForShortlinkName(shortlinkName)
  console.log("existingUrls: ", existingUrls)

  if (existingUrls.length === 0) {
    showToast(`Shortlink '${shortlinkName}' not found. Cannot edit.`, Delays.default, "warning")
    return
  }

  // Prompt the user to enter new URLs.
  const newUrlsInput = prompt(
    `Edit the URLs for shortlink '${shortlinkName}':`,
    existingUrls.join("   ")
  )

  if (newUrlsInput === null) {
    // User canceled the edit operation.
    return
  }

  // Split the user's input into an array of new URLs.
  const newUrls = newUrlsInput
    .split(" ")
    .map((url) => url.trim())
    .filter((url) => url !== "")

  // Update the shortlink with the new URLs.
  await saveToSyncStorage(shortlinkName, newUrls)

  showToast(`Shortlink '${shortlinkName}' updated.`, Delays.default, "success")
  triggerAutoCloseWindowWithDelay()
}

export async function getUrlsForShortlinkName(shortlinkName: string): Promise<Urls> {
  try {
    const result: Urls = await getFromSyncStorage(shortlinkName)
    console.log("getUrlsForShortlinkName: ", shortlinkName)
    console.log("result: ", result)
    return result
  } catch (error) {
    console.error(error)
    return []
  }
}

export function removeFromSyncStorage(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(key, () => {
      resolve()
    })
  })
}

export function getFromSyncStorage(key: string): Promise<Urls> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (result === undefined || result.length === 0) {
        reject()
      } else {
        const urls: Urls = result[key]
        resolve(urls)
      }
    })
  })
}

// Given a string of shortlink names, extract them into an array. The names can be
// separated by `;`, `,` or space.
// More info: https://sl.bing.net/giOzxFaWCWq
export function extractMultipleShortlinkNames(shortlinkNames: string): string[] {
  const splitted = shortlinkNames.split(/;|,| /)
  const splitted_no_empty = splitted.filter((it) => it.trim() !== "")
  const splitted_trimmed = splitted_no_empty.map((it) => it.trim())
  return splitted_trimmed
}
