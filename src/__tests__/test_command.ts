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

import { Command, convertUserInputTextIntoCommand } from "../command"

describe("parse command", () => {
  it("can parse save <shortlink>", () => {
    const command = convertUserInputTextIntoCommand("docs") as Command.Save
    expect(command.kind).toBe("save")
    expect(command.shortlinkName).toBe("docs")
  })
})

describe("parse command", () => {
  it("can parse save <shortlink>", () => {
    const command = convertUserInputTextIntoCommand("docs") as Command.Save
    expect(command.kind).toBe("save")
    expect(command.shortlinkName).toBe("docs")
  })

  it("can parse delete <shortlink>", () => {
    const command = convertUserInputTextIntoCommand("delete docs") as Command.Delete
    expect(command.kind).toBe("delete")
    expect(command.shortlinkName).toBe("docs")
  })

  it("can parse go <shortlink>", () => {
    const command = convertUserInputTextIntoCommand("go docs") as Command.Go
    expect(command.kind).toBe("go")
    expect(command.shortlinkName).toBe("docs")
  })

  it("can parse copy <shortlink>", () => {
    const command = convertUserInputTextIntoCommand("copy docs") as Command.CopyToClipboard
    expect(command.kind).toBe("copytoclipboard")
    expect(command.shortlinkNames).toBe("docs")
  })

  it("can parse copy <shortlink1> <shortlink2>", () => {
    const command = convertUserInputTextIntoCommand("copy docs1 docs2") as Command.CopyToClipboard
    expect(command.kind).toBe("copytoclipboard")
    expect(command.shortlinkNames).toBe("docs1 docs2")
  })

  it("can parse ::debug:: <arg>", () => {
    const command = convertUserInputTextIntoCommand("::debug:: arg") as Command.Debug
    expect(command.kind).toBe("debug")
    expect(command.arg).toBe("arg")
  })

  it("can parse ::debug:: <arg1> <arg2>", () => {
    const command = convertUserInputTextIntoCommand("::debug:: arg1 arg2") as Command.Debug
    expect(command.kind).toBe("debug")
    expect(command.arg).toBe("arg1 arg2")
  })

  it("returns save for unknown or invalid command", () => {
    const command = convertUserInputTextIntoCommand("invalid") as Command.Save
    expect(command.kind).toBe("save")
    expect(command.shortlinkName).toBe("invalid")
  })
})
