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

import { copyToClipboard } from "../clipboard"
import { extractMultipleShortlinkNames } from "../command"
import { openUrlsInTabs } from "../omnibox"
import { EditMode } from "../popup"
import { Delays, Messages, showToast, triggerAutoCloseWindowWithDelay } from "../toast"
import { Shortlink, StoredValue, Urls, delay } from "../types"
import { getStorageProvider } from "./storage_provider"

export function createNewChromeStorageValue(urls: Urls): StoredValue {
  return {
    urls: urls,
    date: Date.now(),
    priority: 0,
  }
}

async function increaseExistingShortlinkPriority(key: string) {
  const value: StoredValue = await getStorageProvider().getOne(key)

  const urls: Urls = value.urls
  const priority: number = value.priority + 1
  const date: number = Date.now()

  await getStorageProvider().setOne(key, {
    urls: urls,
    date: date,
    priority: Math.min(priority, 1000), // Cap priority at 1000.
  })
}

export async function copyAllShortlinksToClipboard() {
  try {
    const allShortlinks: Shortlink[] = await getStorageProvider().getAll()
    const shortlinksSerialized = JSON.stringify(allShortlinks, null, 2)
    await copyToClipboard(shortlinksSerialized)
    showToast("All shortlinks copied to clipboard", Delays.default, "success")
  } catch (error) {
    console.error("Error copying shortlinks to clipboard:", error)
    showToast("Error copying shortlinks to clipboard", Delays.default, "error")
  }
}

export async function importShortlinksFromJson(jsonString: string) {
  try {
    const parsedShortlinks = JSON.parse(jsonString) as Shortlink[]

    console.log("parsedShortlinks: ", parsedShortlinks)

    if (!Array.isArray(parsedShortlinks)) {
      console.error("Invalid JSON format for shortlinks.")
      showToast("Invalid JSON format for shortlinks", Delays.default, "error")
      return
    }

    // Clear out all existing shortlinks before importing.
    chrome.storage.sync.clear()
    await delay()

    for (const shortlink of parsedShortlinks) {
      if (!shortlink.name || !shortlink.urls) {
        console.error("Invalid shortlink format:", shortlink)
        showToast("Invalid shortlink format", Delays.default, "error")
        continue
      }

      // Save each shortlink to storage
      await getStorageProvider().setOne(shortlink.name, createNewChromeStorageValue(shortlink.urls))
      await delay()

      console.log("name: ", shortlink.name, ", urls: ", shortlink.urls)
    }

    showToast("Shortlinks imported successfully", Delays.default, "success")
  } catch (error) {
    console.error("Error importing shortlinks:", error)
    showToast("Error importing shortlinks", Delays.default, "error")
  }
}

export async function actuallySaveShortlink(shortlinkName: string, urls: Urls, overwrite: boolean) {
  await getStorageProvider().setOne(shortlinkName, createNewChromeStorageValue(urls))
  if (overwrite) {
    showToast(Messages.duplicateExists, Delays.default, "info")
  } else {
    showToast(Messages.savingShortlink, Delays.default, "success")
  }
  triggerAutoCloseWindowWithDelay()
}

export async function tryToSaveShortlink(newShortlinkName: string) {
  const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({ currentWindow: true })
  const highlightedTabs: chrome.tabs.Tab[] = tabs.filter((tab) => tab.highlighted)

  const urls: Urls = []
  for (const tab of highlightedTabs) {
    if (tab.url !== undefined) {
      urls.push(tab.url)
    }
  }

  // Check if the shortlink already exists in sync storage.
  const existingValue: StoredValue = await getStorageProvider().getOne(newShortlinkName)

  if (existingValue !== undefined && existingValue.urls.length > 0) {
    // Shortlink already exists, ask the user if they want to overwrite it.
    const confirmOverwrite = confirm(
      `The shortlink '${newShortlinkName}' with value '${existingValue.urls.join(
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
    await increaseExistingShortlinkPriority(name)
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
      await getStorageProvider().removeOne(name)
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
  await getStorageProvider().setOne(shortlinkName, createNewChromeStorageValue(newUrls))

  showToast(`Shortlink '${shortlinkName}' updated.`, Delays.default, "success")
  triggerAutoCloseWindowWithDelay()
}

export async function getUrlsForShortlinkName(shortlinkName: string): Promise<Urls> {
  try {
    const value: StoredValue = await getStorageProvider().getOne(shortlinkName)
    console.log("getUrlsForShortlinkName: ", shortlinkName)
    console.log("result: ", value.urls)
    return value.urls
  } catch (error) {
    console.error(error)
    return []
  }
}
