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

import { default as React } from "react"
import { logic, toast } from "."
import { clipboard, tabs } from "../browser_utils"
import { delay, types } from "../core"
import { storage_provider } from "../storage"
import { extractMultipleShortlinkNames } from "./command"

const MAX_LENGTH_OF_URLS_TO_DISPLAY_ON_HOVER = 75

// Workaround for an enum w/ a method.
export namespace EditMode {
  export type Type = typeof Enabled | typeof Disabled

  export const Enabled = {
    state: "enabled",
    toBoolean: true,
  }

  export const Disabled = {
    state: "enabled",
    toBoolean: false,
  }
}

export async function openTabs(shortlinkName: string) {
  await openMultipleShortlinks(shortlinkName)
}

export function handleOnChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setUserInputText: React.Dispatch<React.SetStateAction<string>>
) {
  const typedText = event.target.value
  console.log("typedText:", typedText)
  setUserInputText(typedText)
}

export function handleOnMouseEnter(
  urls: types.Urls,
  setCurrentUrls: React.Dispatch<React.SetStateAction<string>>
) {
  if (urls === undefined || urls.length === 0) return

  console.log("handleOnMouseEnter => urls: ", urls)

  let urlsToDisplay = urls.join(", ")
  let truncatedUrls = truncateWithEllipsis(urlsToDisplay, MAX_LENGTH_OF_URLS_TO_DISPLAY_ON_HOVER)
  console.log("truncatedUrls: ", truncatedUrls)
  setCurrentUrls(truncatedUrls)
}

function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return `${str.slice(0, maxLength - 3)}...`
}

// Multiple shortlink names can be passed in using delimiter: `;`, `,` or space.
export async function copyMultipleShortlinks(shortlinkArg: string) {
  const names = extractMultipleShortlinkNames(shortlinkArg)
  console.log("shortlink names to copy: ", names)
  let urls: types.Urls = []
  for (const name of names) {
    let urlsForName: types.Urls = await getUrlsForShortlinkName(name)
    urls = urls.concat(urlsForName)
  }
  const text = urls.join("\n")
  await clipboard.copy(text)
  toast.showToast(toast.Messages.copyToClipboard, toast.Delays.default, "success")
  toast.triggerAutoCloseWindowWithDelay()
}

export function createNewChromeStorageValue(urls: types.Urls): types.StoredValue {
  return {
    urls: urls,
    date: Date.now(),
    priority: 0,
  }
}

async function increaseExistingShortlinkPriority(key: string) {
  const value: types.StoredValue = await storage_provider.getStorageProvider().getOne(key)

  const urls: types.Urls = value.urls
  const priority: number = value.priority + 1
  const date: number = Date.now()

  await storage_provider.getStorageProvider().setOne(key, {
    urls: urls,
    date: date,
    priority: Math.min(priority, 1000), // Cap priority at 1000.
  })
}

export async function exportShortlinksToJsonToClipboard() {
  try {
    const allShortlinks: types.Shortlink[] = await storage_provider.getStorageProvider().getAll()
    const shortlinksSerialized = JSON.stringify(allShortlinks, null, 2)
    await clipboard.copy(shortlinksSerialized)
    chrome.runtime.sendMessage({ shortlinksSerialized })
    toast.showToast("All shortlinks copied to clipboard", toast.Delays.default, "success")
  } catch (error) {
    console.error("Error copying shortlinks to clipboard:", error)
    toast.showToast("Error copying shortlinks to clipboard", toast.Delays.default, "error")
  }
}

export async function importShortlinksFromJson(jsonString: string) {
  try {
    const parsedShortlinks = JSON.parse(jsonString) as types.Shortlink[]

    console.log("parsedShortlinks: ", parsedShortlinks)

    if (!Array.isArray(parsedShortlinks)) {
      console.error("Invalid JSON format for shortlinks.")
      toast.showToast("Invalid JSON format for shortlinks", toast.Delays.default, "error")
      return
    }

    // Clear out all existing shortlinks before importing.
    chrome.storage.sync.clear()
    await delay()

    for (const shortlink of parsedShortlinks) {
      if (!shortlink.name || !shortlink.urls) {
        console.error("Invalid shortlink format:", shortlink)
        toast.showToast("Invalid shortlink format", toast.Delays.default, "error")
        continue
      }

      // Save each shortlink to storage
      await storage_provider
        .getStorageProvider()
        .setOne(shortlink.name, createNewChromeStorageValue(shortlink.urls))
      await delay()

      console.log("name: ", shortlink.name, ", urls: ", shortlink.urls)
    }

    toast.showToast("Shortlinks imported successfully", toast.Delays.default, "success")
  } catch (error) {
    console.error("Error importing shortlinks:", error)
    toast.showToast("Error importing shortlinks", toast.Delays.default, "error")
  }
}

export async function actuallySaveShortlink(
  shortlinkName: string,
  urls: types.Urls,
  overwrite: boolean
) {
  await storage_provider
    .getStorageProvider()
    .setOne(shortlinkName, createNewChromeStorageValue(urls))
  if (overwrite) {
    toast.showToast(toast.Messages.duplicateExists, toast.Delays.default, "info")
  } else {
    toast.showToast(toast.Messages.savingShortlink, toast.Delays.default, "success")
  }
  toast.triggerAutoCloseWindowWithDelay()
}

export async function tryToSaveShortlink(newShortlinkName: string) {
  const tabs: chrome.tabs.Tab[] = await chrome.tabs.query({ currentWindow: true })
  const highlightedTabs: chrome.tabs.Tab[] = tabs.filter((tab) => tab.highlighted)

  const urls: types.Urls = []
  for (const tab of highlightedTabs) {
    if (tab.url !== undefined) {
      urls.push(tab.url)
    }
  }

  // Check if the shortlink already exists in sync storage.
  const existingValue: types.StoredValue = await storage_provider
    .getStorageProvider()
    .getOne(newShortlinkName)

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

  let urls: types.Urls = []

  for (const name of names) {
    await increaseExistingShortlinkPriority(name)
    let urlsForName: types.Urls = await getUrlsForShortlinkName(name)
    urls = urls.concat(urlsForName)
  }

  tabs.openUrls(urls)
}

export async function deleteMultipleShortlinks(
  shortlinkArg: string,
  editMode: logic.EditMode.Type
) {
  const names = extractMultipleShortlinkNames(shortlinkArg)

  console.log("shortlink names to delete: ", names)

  // No arg provided.
  if (names === undefined || names.length === 0) {
    toast.showToast(`Please provide a shortlink name to delete`, toast.Delays.default, "warning")
  }
  // Arg provided.
  else {
    for (const name of names) {
      await storage_provider.getStorageProvider().removeOne(name)
    }
    toast.showToast(`Deleting shortlink(s) ${names.join(", ")}`, toast.Delays.default, "info")

    // Do not close this popup if we are in edit mode.
    if (editMode === logic.EditMode.Disabled) {
      toast.triggerAutoCloseWindowWithDelay()
    }
  }
}

export async function editShortlink(shortlinkName: string) {
  // Retrieve the existing URLs for the specified shortlinkName.
  const existingUrls: types.Urls = await getUrlsForShortlinkName(shortlinkName)
  console.log("existingUrls: ", existingUrls)

  if (existingUrls.length === 0) {
    toast.showToast(
      `Shortlink '${shortlinkName}' not found. Cannot edit.`,
      toast.Delays.default,
      "warning"
    )
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
  await storage_provider
    .getStorageProvider()
    .setOne(shortlinkName, createNewChromeStorageValue(newUrls))

  toast.showToast(`Shortlink '${shortlinkName}' updated.`, toast.Delays.default, "success")
  toast.triggerAutoCloseWindowWithDelay()
}

export async function getUrlsForShortlinkName(shortlinkName: string): Promise<types.Urls> {
  try {
    const value: types.StoredValue = await storage_provider
      .getStorageProvider()
      .getOne(shortlinkName)
    console.log("getUrlsForShortlinkName: ", shortlinkName)
    console.log("result: ", value.urls)
    return value.urls
  } catch (error) {
    console.error(error)
    return []
  }
}
