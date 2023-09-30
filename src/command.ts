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

export type CommandDelete = {
  kind: "delete"
  shortlinkName: string
}

export type CommandGo = {
  kind: "go"
  shortlinkName: string
}

export type CommandSave = {
  kind: "save"
  shortlinkName: string
}

export type CommandNothing = {
  kind: "nothing"
}

export type CommandCopyToClipboard = {
  kind: "copytoclipboard"
  shortlinkNames: string
}

export type Command =
  | CommandDelete
  | CommandGo
  | CommandSave
  | CommandNothing
  | CommandCopyToClipboard

export const CommandName = {
  Go: "go ",
  GoShort: "g ",
  Delete: "delete ",
  DeleteShort: "d ",
  CopyToClipboard: "copy ",
  CopyToClipboardShort: "c ",
}

export function parseUserInputTextIntoCommand(userInputText: string): Command {
  // User typed nothing & just pressed enter.
  if (userInputText !== undefined && userInputText.length === 0) {
    return {
      kind: "nothing",
    }
  }

  // Delete shortlink using `delete`.
  if (userInputText.startsWith(CommandName.Delete)) {
    const shortlinkArg = userInputText.replace(CommandName.Delete, "").trim()
    return {
      kind: "delete",
      shortlinkName: shortlinkArg,
    }
  }

  // Delete shortlink using `d`.
  if (userInputText.startsWith(CommandName.DeleteShort)) {
    const shortlinkArg = userInputText.replace(CommandName.DeleteShort, "").trim()
    return {
      kind: "delete",
      shortlinkName: shortlinkArg,
    }
  }

  // Open shortlink using `go`.
  if (userInputText.startsWith(CommandName.Go)) {
    const shortlinkArg = userInputText.replace(CommandName.Go, "").trim()
    return {
      kind: "go",
      shortlinkName: shortlinkArg,
    }
  }

  // Open shortlink using `g`.
  if (userInputText.startsWith(CommandName.GoShort)) {
    const shortlinkArg = userInputText.replace(CommandName.GoShort, "").trim()
    return {
      kind: "go",
      shortlinkName: shortlinkArg,
    }
  }

  // Open shortlink using `copy`.
  if (userInputText.startsWith(CommandName.CopyToClipboard)) {
    const shortlinkArg = userInputText.replace(CommandName.CopyToClipboard, "").trim()
    return {
      kind: "copytoclipboard",
      shortlinkNames: shortlinkArg,
    }
  }

  // Open shortlink using `c`.
  if (userInputText.startsWith(CommandName.CopyToClipboardShort)) {
    const shortlinkArg = userInputText.replace(CommandName.CopyToClipboardShort, "").trim()
    return {
      kind: "copytoclipboard",
      shortlinkNames: shortlinkArg,
    }
  }

  // Default command: Save shortlink using `save`, validate the shortlink name.
  const shortlinkArg = validateShortlinkName(userInputText)
  return {
    kind: "save",
    shortlinkName: shortlinkArg,
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
