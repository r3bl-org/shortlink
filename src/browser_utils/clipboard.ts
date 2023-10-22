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

/**
 * https://stackoverflow.com/a/59695008/2085356
 * https://developer.chrome.com/docs/extensions/mv3/declare_permissions/
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#writing_to_the_clipboard
 */
export function copy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    navigator.clipboard.writeText(text).then(
      () => {
        /* Clipboard successfully set. */
        console.log("Copied to clipboard: " + text)
        resolve()
      },
      () => {
        /* Clipboard write failed, use fallback. */
        fallbackCopy(text)
        console.log("Copied to clipboard using fallback: " + text)
        resolve()
      }
    )
  })
}

/**
 * Copy the short URL to the clipboard. This should never be called.
 * More info: https://stackoverflow.com/questions/49618618/copy-current-url-to-clipboard
 */
const fallbackCopy = (text: string) => {
  const dummy = document.createElement("input")
  document.body.appendChild(dummy)
  dummy.value = text
  dummy.select()
  document.execCommand("copy")
  document.body.removeChild(dummy)
}
