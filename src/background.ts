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

import { getBrowserHostProvider } from "./browser_host/storage_provider_api"
import { omniboxListener } from "./service_worker"

// This connects the omnibox to the omniboxListener. `manifest.json` has an entry for this
// file. To see console.log output for this service worker, go to chrome://extensions and
// click the "service worker" link for this extension.
function main() {
  console.log("background.ts: main()")
  printDebug()
  console.log("background.ts => main(): attach omniboxListener")
  const provider = getBrowserHostProvider()
  provider.attachOmniboxInputListener(omniboxListener)
  provider.attachServiceWorkerListener((arg: any) =>
    provider.downloadFileInServiceWorker({
      url: "data:application/json," + encodeURIComponent(arg.shortlinksSerialized),
      filename: "shortlinks.json",
      body: arg.shortlinksSerialized,
    })
  )
}

export function printDebug() {
  if (typeof chrome !== "undefined") {
    colorLog("chrome:", chrome)
  } else {
    console.log("background.ts => main(): chrome is undefined")
  }

  if (typeof document !== "undefined") {
    colorLog("document:", document)
  } else {
    console.log("background.ts => main(): document is undefined")
  }
}

function colorLog(msg: string, ...rest: any[]) {
  console.log(`%c${msg}`, "color:yellow;font-style:bold", ...rest)
}

main()
