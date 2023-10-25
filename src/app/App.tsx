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

import { default as React, useEffect, useRef, useState } from "react"
import { command, toast } from "."
import { delay, types } from "../core"
import { generateRandomName } from "../misc/random_names"
import { storage_provider } from "../storage"
import {
  EditMode,
  copyMultipleShortlinks,
  deleteMultipleShortlinks,
  editShortlink,
  exportShortlinksToJsonToClipboard,
  handleOnChange,
  handleOnMouseEnter,
  importShortlinksFromJson,
  openMultipleShortlinks,
  openTabs,
  tryToSaveShortlink,
} from "./logic"

export function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [allShortlinks, setAllShortlinks] = useState<types.Shortlink[]>([])
  const [userInputText, setUserInputText] = useState<string>("")
  const [searchText, setSearchText] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<EditMode.Type>(EditMode.Disabled)
  const [currentUrls, setCurrentUrls] = useState<string>("")
  const [showImportField, setShowImportField] = useState<boolean>(false)

  // List all shortlinks.
  useEffect(() => {
    console.log("init => load all shortlinks from default storage provider")
    storage_provider
      .getStorageProvider()
      .getAll()
      .then((allShortlinks) => {
        setAllShortlinks(allShortlinks)
      })
  }, [])

  // Listen to changes in storage.
  useEffect(() => {
    storage_provider.getStorageProvider().addOnChangedListener(() => {
      console.log("init => default storage provider.onChanged.addListener")
      storage_provider
        .getStorageProvider()
        .getAll()
        .then((allShortlinks) => {
          setAllShortlinks(allShortlinks)
        })
    })
  }, [])

  // Update count badge when allShortlinks changes.
  useEffect(() => {
    storage_provider.getStorageProvider().setBadgeText(allShortlinks.length.toString())
  }, [allShortlinks])

  const filteredShortlinks = searchText
    ? allShortlinks.filter((shortlink) => shortlink.name.match(new RegExp(searchText, "i")))
    : allShortlinks

  const showCurrentUrlsDiv = currentUrls.length > 0

  // Render functions.

  function renderMain() {
    return (
      <div id="app">
        <input
          autoFocus={true}
          id="shortlink-input"
          placeholder='Type a name for your tab(s) or "copy/c, go/g, delete/d <name>" => Enter'
          onChange={(event) => handleOnChange(event, setUserInputText)}
          onKeyDown={(event) => handleEnterKey(event, userInputText)}
        />
        {showImportField ? renderImportView() : renderNormalView()}
      </div>
    )
  }

  function renderViewMode(): React.ReactNode {
    return (
      <div className="shortlink-container" onMouseLeave={() => setCurrentUrls("")}>
        {allShortlinks.map((shortlink) => (
          <code key={shortlink.name} className="shortlink">
            <div
              className="shortlink-link"
              onClick={async () => await openTabs(shortlink.name)}
              onMouseEnter={() => handleOnMouseEnter(shortlink.urls, setCurrentUrls)}
            >
              {shortlink.name}
            </div>
          </code>
        ))}
      </div>
    )
  }

  function renderEditMode(): React.ReactNode {
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
              <div
                className="shortlink-link grid-cell"
                onClick={async () => await openTabs(shortlink.name)}
              >
                {shortlink.name}
              </div>
              <div className="actions grid-cell">
                <button
                  className="edit-btn"
                  onClick={async () => await editShortlink(shortlink.name)}
                >
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

  function renderImportView(): React.ReactNode {
    return (
      <div className="editor-wrapper">
        <textarea
          className="textarea-json"
          placeholder="Enter JSON here or drag and drop a JSON file here."
          ref={textareaRef}
          onDrop={handleDrop}
        />
        <button className="save-btn" onClick={handleJsonSave}>
          📥 Save Shortlink
        </button>
      </div>
    )
  }

  function renderNormalView(): React.ReactNode {
    return (
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
            {isEditMode === EditMode.Enabled ? renderEditMode() : renderViewMode()}
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
    )
  }

  // Handlers.

  function handleDrop(event: React.DragEvent<HTMLTextAreaElement>) {
    event.preventDefault()
    const dataTransfer = event.dataTransfer
    if (dataTransfer.items) {
      const file = dataTransfer.items[0].getAsFile()
      if (file) {
        const reader = new FileReader()
        reader.onload = function (event) {
          if (event.target) {
            const result = event.target.result
            if (typeof result === "string") {
              textareaRef.current!.value = result
            }
          }
        }
        reader.readAsText(file)
      }
    }
  }

  async function handleJsonSave() {
    let content = textareaRef.current
    if (content !== null && content.value !== "") {
      const textareaValue = content.value
      await importShortlinksFromJson(textareaValue)
      setShowImportField(false)
    }
  }

  async function handleEnterKey(
    event: React.KeyboardEvent<HTMLInputElement>,
    rawUserInputText: string
  ) {
    if (event.key !== "Enter") return

    console.log("typed: ", `'${rawUserInputText}'`)

    const userInputCommand: command.Command.Type =
      command.convertUserInputTextIntoCommand(rawUserInputText)

    console.log("parsed command: ", userInputCommand)

    switch (userInputCommand.kind) {
      case "nothing": {
        toast.showToast(toast.Messages.duplicateExists, toast.Delays.default, "warning")
        return
      }
      case "export": {
        await exportShortlinksToJsonToClipboard()
        return
      }
      case "import": {
        setShowImportField(true)
        return
      }
      case "save": {
        await tryToSaveShortlink(userInputCommand.shortlinkName)
        return
      }
      case "delete": {
        await deleteMultipleShortlinks(userInputCommand.shortlinkName, EditMode.Disabled)
        return
      }
      case "go": {
        await openMultipleShortlinks(userInputCommand.shortlinkName)
        return
      }
      case "copytoclipboard": {
        await copyMultipleShortlinks(userInputCommand.shortlinkNames)
        return
      }
      case "debug": {
        // ::debug:: clear.
        if (userInputCommand.arg === "clear") {
          await storage_provider.getStorageProvider().clear()
        }

        // ::debug:: add <number>?
        else if (userInputCommand.arg.startsWith("add")) {
          let it = command.tryToParse("add", userInputCommand.arg)
          console.log("it: ", it)

          let numberToAdd = 50

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
            await storage_provider.getStorageProvider().setOne(randomName, {
              urls: ["https://r3bl.com/?q=" + i],
              date: Date.now(),
              priority: 0,
            })
            // Wait for delayMs, to prevent Chrome from throttling this API call.
            await delay()
          }
        }
        return
      }
    }
  }

  return renderMain()
}
