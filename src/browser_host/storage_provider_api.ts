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

import { types } from "../core"
import {
  addChromeStorageOnChangedListener,
  attachChromeOmniboxListener,
  attachChromeOnMessageListener,
  clearSyncStorage as clearChromeStorage,
  downloadFileInChrome,
  getValueFromChromeStorage,
  loadAllShortlinksFromChromeStorage,
  removeFromSyncStorage as removeFromChromeStorage,
  sendMessageToChromeServiceWorker,
  setChromeBadgeText,
  setValueOnChromeStorage,
} from "./storage_provider_internal_impl_chrome"

// Interface that defines the methods that a storage provider must implement.
export type BrowserHostProvider = {
  getAll(): Promise<types.Shortlink[]>
  getOne(key: string): Promise<types.StoredValue>
  setOne(key: string, value: types.StoredValue): Promise<void>
  removeOne(key: string): Promise<void>
  clear(): Promise<void>
  addOnChangedListener(fun: () => void): void
  setBadgeText(text: string): void
  sendMessage(arg: Object): void
  attachOmniboxInputListener(fun: (text: string) => void): void
  attachServiceWorkerListener(fun: (arg: any) => void): void
  downloadFileInServiceWorker(arg: any): void
}

// Get the current browser host provider.
export function getBrowserHostProvider(): BrowserHostProvider {
  return BROWSER_HOST_PROVIDER
}

// Set the current browser host provider. This can be used for testing or to support other
// browsers.
export function setBrowserHostProvider(browserHostProvider: BrowserHostProvider) {
  BROWSER_HOST_PROVIDER = browserHostProvider
}

let BROWSER_HOST_PROVIDER: BrowserHostProvider = createChromeStorageProvider()

// This function returns the default storage provider, which is Chrome storage.
function createChromeStorageProvider(): BrowserHostProvider {
  return {
    getAll: loadAllShortlinksFromChromeStorage,
    getOne: getValueFromChromeStorage,
    setOne: setValueOnChromeStorage,
    removeOne: removeFromChromeStorage,
    clear: clearChromeStorage,
    addOnChangedListener: addChromeStorageOnChangedListener,
    setBadgeText: setChromeBadgeText,
    sendMessage: sendMessageToChromeServiceWorker,
    attachOmniboxInputListener: attachChromeOmniboxListener,
    attachServiceWorkerListener: attachChromeOnMessageListener,
    downloadFileInServiceWorker: downloadFileInChrome,
  }
}
