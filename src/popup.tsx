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
import { copyMultipleShortlinks } from "./clipboard"
import { Command, convertUserInputTextIntoCommand, tryToParse } from "./command"
import { generateRandomName } from "./friendly-random-name-generator"
import {
  deleteMultipleShortlinks,
  editShortlink,
  getAllShortlinks,
  openMultipleShortlinks,
  saveToSyncStorage,
  tryToSaveShortlink,
} from "./storage"
import "./style.css"
import { Delays, Messages, showToast } from "./toast"
import { Shortlink, Urls } from "./types"

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

function Popup() {
  const [allShortlinks, setAllShortlinks] = useState<Shortlink[]>([])
  const [userInputText, setUserInputText] = useState<string>("")
  const [searchText, setSearchText] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<EditMode.Type>(EditMode.Disabled)
  const [currentUrls, setCurrentUrls] = useState<string>("")
  // List all shortlinks.
  useEffect(() => {
    getAllShortlinks().then((allShortlinks) => {
      setAllShortlinks(allShortlinks)
    })
  }, [])

  // Listen to changes in storage.
  useEffect(() => {
    chrome.storage.onChanged.addListener(() => {
      getAllShortlinks().then((allShortlinks) => {
        setAllShortlinks(allShortlinks)
      })
    })
  }, [])

  // Update count badge when allShortlinks changes.
  useEffect(() => {
    chrome.action.setBadgeText({ text: allShortlinks.length.toString() })
  }, [allShortlinks])

  const filteredShortlinks = searchText
    ? allShortlinks.filter((shortlink) => shortlink.name.match(new RegExp(searchText, "i")))
    : allShortlinks

  const showCurrentUrlsDiv = currentUrls.length > 0

  return (
    <div id="app">
      <input
        autoFocus={true}
        id="shortlink-input"
        placeholder='Type a name for your tab(s) or "copy/c, go/g, delete/d <name>" => Enter'
        onChange={(event) => handleOnChange(event, setUserInputText)}
        onKeyDown={(event) => handleEnterKey(event, userInputText)}
      />

      <div id="links">
        {allShortlinks.length > 0 && (
          <input
            id="shortlink-search-input"
            placeholder="Search shortlinks..."
            onChange={(event) => setSearchText(event.target.value)}
          />
        )}

        {allShortlinks.length === 0 ? (
          "You don't have any shortlinks yet 🤷"
        ) : filteredShortlinks.length === 0 ? (
          "No searched shortlinks found 🤷"
        ) : (
          <>
            <div className="title">Your shortlinks: </div>
            {isEditMode === EditMode.Enabled
              ? renderEditMode(filteredShortlinks, isEditMode)
              : renderViewMode(filteredShortlinks, setCurrentUrls)}
          </>
        )}
        <br />
        <div className="app-footer">
          <b>Count: {allShortlinks.length}</b>
          {isEditMode === EditMode.Disabled ? (
            <button className="edit-btn" onClick={(e) => setIsEditMode(EditMode.Enabled)}>
              ✏️ Edit Shortlinks
            </button>
          ) : (
            <button className="edit-btn" onClick={(e) => setIsEditMode(EditMode.Disabled)}>
              ✅ Finish Editing
            </button>
          )}
        </div>
        <div className={`current-url ${showCurrentUrlsDiv ? "show" : "hide"}`}>
          Current: {currentUrls}
        </div>
      </div>
    </div>
  )
}

function renderViewMode(
  allShortlinks: Shortlink[],
  setCurrentUrls: React.Dispatch<React.SetStateAction<string>>
) {
  return (
    <div className="shortlink-container" onMouseLeave={() => setCurrentUrls("")}>
      {allShortlinks.map((shortlink) => (
        <code key={shortlink.name} className="shortlink">
          <div
            className="shortlink-link"
            onClick={() => openTabs(shortlink.name)}
            onMouseEnter={() => handleOnMouseEnter(shortlink.urls, setCurrentUrls)}
          >
            {shortlink.name}
          </div>
        </code>
      ))}
    </div>
  )
}

function renderEditMode(allShortlinks: Shortlink[], isEditMode: EditMode.Type) {
  const confirmBeforeDeleteShortlink = async (shortlinkName: string) => {
    const confirmDelete = confirm(`Do you want to delete shortlinks ${shortlinkName}`)
    if (confirmDelete) {
      await deleteMultipleShortlinks(shortlinkName, isEditMode)
    }
  }

  return (
    <div className="grid-wrapper">
      <div className="grid-header">
        <div className="grid-row">
          <div className="grid-cell">
            <h3>ShortLink</h3>
          </div>
          <div className="grid-cell">
            <h3>Action</h3>
          </div>
        </div>
      </div>
      <div className="grid-body">
        {allShortlinks.map((shortlink) => (
          <div className="grid-row" key={shortlink.name}>
            <div className="shortlink-link grid-cell" onClick={() => openTabs(shortlink.name)}>
              {shortlink.name}
            </div>
            <div className="actions grid-cell">
              <button className="edit-btn" onClick={() => editShortlink(shortlink.name)}>
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => confirmBeforeDeleteShortlink(shortlink.name)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function openTabs(shortlinkName: string) {
  openMultipleShortlinks(shortlinkName)
}

function handleOnChange(
  event: React.ChangeEvent<HTMLInputElement>,
  setUserInputText: React.Dispatch<React.SetStateAction<string>>
) {
  const typedText = event.target.value
  console.log("typedText:", typedText)
  setUserInputText(typedText)
}
function handleOnMouseEnter(
  urls: Urls[],
  setCurrentUrls: React.Dispatch<React.SetStateAction<string>>
) {
  setCurrentUrls(urls.map((url) => truncateWithEllipsis(url.toString(), 90)).join(", "))
}

function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return `${str.slice(0, maxLength - 3)}...`
}

async function handleEnterKey(
  event: React.KeyboardEvent<HTMLInputElement>,
  rawUserInputText: string
) {
  if (event.key !== "Enter") return

  console.log("typed: ", `'${rawUserInputText}'`)

  const command: Command.Type = convertUserInputTextIntoCommand(rawUserInputText)

  console.log("parsed command: ", command)

  switch (command.kind) {
    case "nothing": {
      showToast(Messages.duplicateExists, Delays.default, "warning")
      return
    }
    case "save": {
      tryToSaveShortlink(command.shortlinkName)
      return
    }
    case "delete": {
      await deleteMultipleShortlinks(command.shortlinkName, EditMode.Disabled)
      return
    }
    case "go": {
      await openMultipleShortlinks(command.shortlinkName)
      return
    }
    case "copytoclipboard": {
      await copyMultipleShortlinks(command.shortlinkNames)
      return
    }
    case "debug": {
      // ::debug:: clear.
      if (command.arg === "clear") {
        chrome.storage.sync.clear()
      }
      // ::debug:: add <number>?
      else if (command.arg.startsWith("add")) {
        let it = tryToParse("add", command.arg)
        console.log("it: ", it)

        let numberToAdd = 50
        let delayMs = 10

        if (it.kind === "some") {
          let maybeNumber = parseInt(it.value)
          if (!isNaN(maybeNumber)) {
            numberToAdd = maybeNumber
            console.log("numberToAdd: ", numberToAdd)
          }
        }

        // Add numberToAdd shortlinks here for testing using tryToSaveShortlink function.
        for (let i = 0; i < numberToAdd; i++) {
          let randomName = generateRandomName() + "-" + i
          await saveToSyncStorage(randomName, ["https://r3bl.com/?q=" + i])
          // Wait for delayMs, to prevent Chrome from throttling this API call.
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
      return
    }
  }
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
