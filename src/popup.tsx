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
import { copyShortlinkUrlToClipboard } from "./clipboard"
import { parseUserInputTextIntoCommand } from "./command"
import {
  deleteShortlink,
  getAllShortlinks,
  openShortlink as goToShortlink,
  tryToSaveShortlink,
} from "./storage"
import "./style.css"
import { Shortlink } from "./types"

function Popup() {
  const [allShortlinks, setAllShortlinks] = useState<Shortlink[]>([])
  const [userInputText, setUserInputText] = useState<string>("")

  // List all shortlinks.
  // Note: To use async / await in useEffect, we need to create a function inside
  // useEffect. So just using promises instead.
  useEffect(() => {
    getAllShortlinks().then((allShortlinks) => {
      setAllShortlinks(allShortlinks)
      console.log("atStart: setAllShortlinksString with:", `'${allShortlinks}'`)
      console.log("atStart: setCount with:", `'${allShortlinks.length}'`)
    })
  }, [])

  // Listen to changes in storage.
  // Note: To use async / await in useEffect, we need to create a function inside
  // useEffect. So just using promises instead.
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
        placeholder='Type new shortlink or "copy/c or go/g or delete/d <shortlink>" then Enter'
        onChange={(event) => handleOnChange(event, setUserInputText)}
        onKeyDown={(event) => handleEnterKey(event, userInputText)}
      />

      <div id="links">
        {allShortlinks.length === 0 ? (
          "You don't have any shortlinks yet 🤷"
        ) : (
          <>
            <b>Your shortlinks: </b>
            <br />
            <div className="shortlink-container">
              {allShortlinks.map((shortlink) => (
                <code key={shortlink.name} className="shortlink">
                  {shortlink.name}
                </code>
              ))}
            </div>
          </>
        )}
        <br />
        <b>Count: {allShortlinks.length}</b>
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

async function handleEnterKey(event: React.KeyboardEvent<HTMLInputElement>, userInputText: string) {
  if (event.key !== "Enter") return

  console.log("typed: ", `'${userInputText}'`)

  const command = parseUserInputTextIntoCommand(userInputText)

  switch (command.kind) {
    case "nothing": {
      tryToSaveShortlink(userInputText)
      return
    }
    case "save": {
      tryToSaveShortlink(userInputText)
      return
    }
    case "delete": {
      deleteShortlink(command.shortlinkName)
      return
    }
    case "go": {
      goToShortlink(command.shortlinkName)
      return
    }
    case "copytoclipboard": {
      copyShortlinkUrlToClipboard(command.shortlinkName)
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
