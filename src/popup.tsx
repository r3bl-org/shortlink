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

import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { getAllShortlinks, runWithSelectedTabs, saveShortlink } from "./storage"
import "./style.css"
import { Delays, Messages, showToast, triggerAutoCloseWindowWithDelay } from "./toast"

function Popup() {
  const [allShortlinks, setAllShortlinks] = useState<string[]>([])
  const [userInputText, setUserInputText] = useState<string>("")

  // List all shortlinks.
  useEffect(() => {
    getAllShortlinks().then((allShortlinks) => {
      setAllShortlinks(allShortlinks)
      console.log("atStart: setAllShortlinksString with:", `'${allShortlinks}'`)
      console.log("atStart: setCount with:", `'${allShortlinks.length}'`)
    })
  }, [])

  // Listen to changes in storage.
  useEffect(() => {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      getAllShortlinks().then((allShortlinks) => {
        setAllShortlinks(allShortlinks)
        console.log("onChange: setAllShortlinksString with:", `'${allShortlinks}'`)
        console.log("onChange: setCount with:", `'${allShortlinks.length}'`)
      })
    })
  }, [])

  // Update count badge when allShortlinks changes.
  useEffect(() => {
    chrome.action.setBadgeText({ text: allShortlinks.length.toString() })
  }, [allShortlinks])

  return (
    <div id="app">
      <input
        autoFocus={true}
        id="shortlink-input"
        placeholder='Please type your new shortlink, or "delete <shortlink>"'
        onChange={(event) => handleOnChange(event, setUserInputText)}
        onKeyDown={(event) => handleEnterKey(event, userInputText)}
      />

      <div id="links">
        {allShortlinks.length === 0
          ? "You don't have any shortlinks yet 🤷"
          : `Your shortlinks: ${allShortlinks}`}
        <br />
        Count: {allShortlinks.length}
      </div>
    </div>
  )
}

function handleOnChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setUserInputText: React.Dispatch<React.SetStateAction<string>>
) {
  const typedText = event.target.value
  console.log("typedText:", typedText)
  setUserInputText(typedText)
}

function handleEnterKey(event: React.KeyboardEvent<HTMLInputElement>, userInputText: string) {
  if (event.key !== "Enter") return

  console.log("typed: ", `'${userInputText}'`)

  // Nothing typed.
  if (userInputText !== undefined && userInputText.length === 0) {
    showToast("Please type a shortlink name", Delays.done, "warning")
    chrome.storage.sync.remove("")
    return
  }

  // Delete shortlink.
  if (userInputText.startsWith("delete")) {
    const shortlinkArg = userInputText.split(" ")[1]
    console.log("shortlinkName", userInputText)
    console.log("shortlinkArg", shortlinkArg)
    debugger
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

  // Save shortlink.
  runWithSelectedTabs((urls) => {
    // Existing shortlink exists.
    chrome.storage.sync.get(userInputText, (result) => {
      const value = result[userInputText]
      if (value !== undefined && value.length > 0) {
        showToast(Messages.duplicateExists, Delays.preparing, "info")
        setTimeout(() => {
          saveShortlink(userInputText, urls)
        }, Delays.preparing)
      } else {
        saveShortlink(userInputText, urls)
      }
    })
  })
}

function main() {
  const root = createRoot(document.getElementById("root")!)

  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  )
}

main()
