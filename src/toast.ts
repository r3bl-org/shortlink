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

export const Messages = {
  // Emoji: https://www.w3schools.com/charsets/ref_emoji.asp
  nothingTyped: "<span>&#9889;</span> Please type a command or shortlink name ...",
  savingShortlink: "<span>&#9989;</span> Saving your shortlink ...",
  duplicateExists: "<span>&#9997;</span> Replacing existing shortlink ...",
  copyToClipboard: "<span>&#128077;</span> Copying shortlink URL(s) to clipboard ...",
}

export const Delays = {
  preparing: 1500,
  done: 2500,
  autoClose: 2500,
}

// This is an external JS function, loaded in popup.html.
declare function nativeToast(options: any): void

export function showToast(text: string, delay: number, type: string): void {
  nativeToast({
    message: text,
    position: "north",
    timeout: delay /* Self destruct in 5 sec. */,
    type: type,
    rounded: true,
    closeOnClick: true,
  })
}

/** Set a timeout to close the window after short delay. */
export function triggerAutoCloseWindowWithDelay() {
  setTimeout(() => {
    window.close()
  }, Delays.autoClose)
}
