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

const Options = () => {
  const [color, setColor] = useState<string>("")
  const [status, setStatus] = useState<string>("")
  const [like, setLike] = useState<boolean>(false)

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(
      {
        favoriteColor: "red",
        likesColor: true,
      },
      (items) => {
        setColor(items.favoriteColor)
        setLike(items.likesColor)
      }
    )
  }, [])

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        favoriteColor: color,
        likesColor: like,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.")
        const id = setTimeout(() => {
          setStatus("")
        }, 1000)
        return () => clearTimeout(id)
      }
    )
  }

  return (
    <>
      <div>
        Favorite color:{" "}
        <select value={color} onChange={(event) => setColor(event.target.value)}>
          <option value="red">red</option>
          <option value="green">green</option>
          <option value="blue">blue</option>
          <option value="yellow">yellow</option>
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={like}
            onChange={(event) => setLike(event.target.checked)}
          />
          I like colors.
        </label>
      </div>
      <div>{status}</div>
      <button onClick={saveOptions}>Save</button>
    </>
  )
}

const root = createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
)
