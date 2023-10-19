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

import { Shortlink, StoredValue } from "../types"
import {
  getValueFromChromeStorage,
  loadAllShortlinksFromChromeStorage,
  removeFromSyncStorage,
  setValueOnChromeStorage,
} from "./storage_provider_chrome"

// Interface that defines the methods that a storage provider must implement.
export type StorageProvider = {
  getAll(): Promise<Shortlink[]>
  getOne(key: string): Promise<StoredValue>
  setOne(key: string, value: StoredValue): Promise<void>
  removeOne(key: string): Promise<void>
}

// Get the current storage provider.
export function getStorageProvider(): StorageProvider {
  return STORAGE_PROVIDER
}

// Set the current storage provider. This can be used for testing or to support other
// browsers.
export function setStorageProvider(storageProvider: StorageProvider) {
  STORAGE_PROVIDER = storageProvider
}

let STORAGE_PROVIDER: StorageProvider = createChromeStorageProvider()

// This function returns the default storage provider, which is Chrome storage.
function createChromeStorageProvider(): StorageProvider {
  return {
    getAll: loadAllShortlinksFromChromeStorage,
    getOne: getValueFromChromeStorage,
    setOne: setValueOnChromeStorage,
    removeOne: removeFromSyncStorage,
  }
}
