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

export type Command = CommandDelete | CommandGo | CommandSave | CommandNothing

export const CommandName = {
  Go: "go",
  GoShort: "g",
  Delete: "delete",
  DeleteShort: "d",
}

export function parseUserInputTextIntoCommand(userInputText: string): Command {
  // Nothing typed.
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

  // Save shortlink using `save`.
  return {
    kind: "save",
    shortlinkName: userInputText,
  }
}
