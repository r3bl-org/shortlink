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
import { changeBackground } from "./message_passing"

const Popup = () => {
  const [count, setCount] = useState(0)
  const [currentURL, setCurrentURL] = useState<string>()

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() })
  }, [count])

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url)
    })
  }, [])

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
      <button onClick={() => setCount(count + 1)} style={{ marginRight: "5px" }}>
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
    </>
  )
}

const root = createRoot(document.getElementById("root")!)

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
)
