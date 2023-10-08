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
import { parseUserInputTextIntoCommand } from "./command"
import {
  deleteMultipleShortlinks,
  editShortlink,
  getAllShortlinks,
  openMultipleShortlinks,
  tryToSaveShortlink,
} from "./storage"
import "./style.css"
import { Delays, Messages, showToast } from "./toast"
import { Shortlink } from "./types"

function Popup() {
  const [allShortlinks, setAllShortlinks] = useState<Shortlink[]>([])
  const [userInputText, setUserInputText] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)

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

  // Function to delete a shortlink
  const handleDeleteShortlink = async (shortlinkName: string) => {
    const confirmDelete = confirm(`Do you want to delete shortlinks ${shortlinkName}`)
    if (confirmDelete) {
      await deleteMultipleShortlinks(shortlinkName)
    }
  }

  // Function to edit a shortlink
  const handleEditShortlink = async (shortlinkName: string) => {
    await editShortlink(shortlinkName)
  }

  return (
    <div id="app">
      <input
        autoFocus={true}
        id="shortlink-input"
        placeholder='Type new shortlink or "copy/c or go/g or delete/d <shortlinks>" then Enter'
        onChange={(event) => handleOnChange(event, setUserInputText)}
        onKeyDown={(event) => handleEnterKey(event, userInputText)}
      />

      <div id="links">
        {allShortlinks.length === 0 ? (
          "You don't have any shortlinks yet 🤷"
        ) : (
          <>
            <div className="title">Your shortlinks: </div>
            {isEditMode
              ? renderEditMode(allShortlinks, handleEditShortlink, handleDeleteShortlink)
              : renderViewMode(allShortlinks)}
          </>
        )}
        <br />
        <div className="app-footer">
          <b>Count: {allShortlinks.length}</b>
          {!isEditMode ? (
            <button className="edit-btn" onClick={(e) => setIsEditMode(true)}>
              ✏️ Edit Shortlinks
            </button>
          ) : (
            <button className="edit-btn" onClick={(e) => setIsEditMode(false)}>
              ✅ Finish Editing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function renderViewMode(allShortlinks: Shortlink[]) {
  return (
    <div>
      <div className="shortlink-container">
        {allShortlinks.map((shortlink) => (
          <code key={shortlink.name} className="shortlink">
            <div className="shortlink-link" onClick={() => openTabs(shortlink.name)}>
              {shortlink.name}
            </div>
          </code>
        ))}
      </div>
    </div>
  )
}

function renderEditMode(
  allShortlinks: Shortlink[],
  handleEditShortlink: (shortlinkName: string) => Promise<void>,
  handleDeleteShortlink: (shortlinkName: string) => Promise<void>,
) {
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
              <button className="edit-btn" onClick={() => handleEditShortlink(shortlink.name)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDeleteShortlink(shortlink.name)}>
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
  setUserInputText: React.Dispatch<React.SetStateAction<string>>,
) {
  const typedText = event.target.value
  console.log("typedText:", typedText)
  setUserInputText(typedText)
}

async function handleEnterKey(
  event: React.KeyboardEvent<HTMLInputElement>,
  rawUserInputText: string,
) {
  if (event.key !== "Enter") return

  console.log("typed: ", `'${rawUserInputText}'`)

  const command = parseUserInputTextIntoCommand(rawUserInputText)

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
      await deleteMultipleShortlinks(command.shortlinkName)
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
  }
}

function main() {
  const root = createRoot(document.getElementById("root")!)

  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  )
}

main()
