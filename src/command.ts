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

import { Option } from "./types"

// The string typed in the popup text input is parsed into a `Command.Type`.
export namespace Command {
  export type Delete = {
    kind: "delete"
    shortlinkName: string
  }

  export type Go = {
    kind: "go"
    shortlinkName: string
  }

  export type Save = {
    kind: "save"
    shortlinkName: string
  }

  export type Nothing = {
    kind: "nothing"
  }

  export type CopyToClipboard = {
    kind: "copytoclipboard"
    shortlinkNames: string
  }

  export type Debug = {
    kind: "debug"
    arg: string
  }

  export type Export={
    kind: "export"
    shortlinkName: string
  }

  export type Import={
    kind: "import"
    shortlinkName: string
  }

  export type Type = Delete | Go | Save | Nothing | CopyToClipboard | Debug | Export | Import
}

// This is typed by the user in the popup text input.
export const CommandName = {
  Go: "go ",
  GoShort: "g ",
  Delete: "delete ",
  DeleteShort: "d ",
  CopyToClipboard: "copy ",
  CopyToClipboardShort: "c ",
  Export: "export",
  ExportShort: "e",
  Import: "import",
  ImportShort:"i",
  Debug: "::debug:: ",
}

export function tryToParse(commandName: string, userInputText: string): Option.Type<string> {
  if (userInputText.startsWith(commandName)) {
    const arg = userInputText.replace(commandName, "").trim()
    return {
      kind: "some",
      value: arg,
    }
  }
  return {
    kind: "none",
  }
}

export function convertUserInputTextIntoCommand(userInputText: string): Command.Type {
  // User typed nothing & just pressed enter.
  if (userInputText !== undefined && userInputText.length === 0) {
    return {
      kind: "nothing",
    }
  }

  // Delete shortlink using `delete`.
  let it = tryToParse(CommandName.Delete, userInputText)
  if (it.kind === "some") {
    return {
      kind: "delete",
      shortlinkName: it.value,
    }
  }

  // Delete shortlink using `d`.
  it = tryToParse(CommandName.DeleteShort, userInputText)
  if (it.kind === "some") {
    return {
      kind: "delete",
      shortlinkName: it.value,
    }
  }

  // Open shortlink using `go`.
  it = tryToParse(CommandName.Go, userInputText)
  if (it.kind === "some") {
    return {
      kind: "go",
      shortlinkName: it.value,
    }
  }

  // Open shortlink using `g`.
  it = tryToParse(CommandName.GoShort, userInputText)
  if (it.kind === "some") {
    return {
      kind: "go",
      shortlinkName: it.value,
    }
  }

  // Export shortlink using `export`.
  it = tryToParse(CommandName.Export, userInputText)
  if (it.kind === "some") {
    return {
      kind: "export",
      shortlinkName: it.value
    }
  }

  // Export shortlink using `e`.
  it = tryToParse(CommandName.ExportShort, userInputText)
  if (it.kind === "some") {
    return {
      kind: "export",
      shortlinkName: it.value
    }
  }

   // Import shortlink using `import`.
   it = tryToParse(CommandName.Import, userInputText)
   if (it.kind === "some") {
     return {
       kind: "import",
       shortlinkName: it.value
     }
   }
 
   // Import shortlink using `i`.
   it = tryToParse(CommandName.ImportShort, userInputText)
   if (it.kind === "some") {
     return {
       kind: "import",
       shortlinkName: it.value
     }
   }


  // Copy shortlink using `copy`.
  it = tryToParse(CommandName.CopyToClipboard, userInputText)
  if (it.kind === "some") {
    return {
      kind: "copytoclipboard",
      shortlinkNames: it.value,
    }
  }

  // Copy shortlink using `c`.
  it = tryToParse(CommandName.CopyToClipboardShort, userInputText)
  if (it.kind === "some") {
    return {
      kind: "copytoclipboard",
      shortlinkNames: it.value,
    }
  }

  // Debug shortlink using `::debug::`.
  it = tryToParse(CommandName.Debug, userInputText)
  if (it.kind === "some") {
    return {
      kind: "debug",
      arg: it.value,
    }
  }

  // Default command: Save shortlink using `save`, validate the shortlink name.
  {
    const shortlinkArg = validateShortlinkName(userInputText)
    return {
      kind: "save",
      shortlinkName: shortlinkArg,
    }
  }
}

// 1. Validate input string by replacing spaces and/or commas with `_`.
// 2. Also replace multiple underscores with a single underscore.
// 3. Remove trailing underscore.
export function validateShortlinkName(input: string): string {
  let replaceSpacesCommas = input.replace(/[\s,]+/g, "_")
  let replacesTooManyUnderscores = replaceSpacesCommas.replace(/_+/g, "_")
  if (replacesTooManyUnderscores.endsWith("_")) {
    replacesTooManyUnderscores = replacesTooManyUnderscores.slice(0, -1)
  }
  return replacesTooManyUnderscores
}
// Given a string of shortlink names, extract them into an array. The names can be
// separated by `;`, `,` or space.
// More info: https://sl.bing.net/giOzxFaWCWq

export function extractMultipleShortlinkNames(shortlinkNames: string): string[] {
  const splitted = shortlinkNames.split(/;|,| /)
  const splitted_no_empty = splitted.filter((it) => it.trim() !== "")
  const splitted_trimmed = splitted_no_empty.map((it) => it.trim())
  return splitted_trimmed
}
