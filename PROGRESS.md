# PROGRESS.md

This document is meant to capture context after I've been away from this project for some time.

Table of contents:

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Context](#context)
- [Why?](#why)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Context

1. I first created a version of `R3BL Shortlink` that was in almost pure JS. This was more of a
   proof of concept to get things working, understanding Chrome extension API, and actually seeing
   if the abandoned
   [Shortlink extension](https://chrome.google.com/webstore/detail/shortlink/apgeooocopnncglmnlngfpgggkmlcldf)
   (Chrome manifest v2) could even be ported to v3.
2. I published this to the
   [Chrome web store](https://chrome.google.com/webstore/detail/r3bl-shortlink/ffhfkgcfbjoadmhdmdcmigopbfkddial?hl=en-US&gl=US).
3. I refined that prototype using Typescript, and React, into something that is called v2.0 of the
   extension today
   [commit](https://github.com/r3bl-org/shortlink/commit/fab145afb83fbf722150ef6028d0098493da7a70).
   This is great for daily use.
4. I created a bunch of issues with small and large features
   [here](https://github.com/r3bl-org/shortlink/issues) which can be the starting point to resume
   work on this extension whenever there is time to work on it.

# Why?

Using the example of a personal project, shortlink, it might entail:

1. Create a `PROGRESS.md` document in the repo where some context around what is to be done next is
   stored. This document is meant to be ready when coming back after being away from this project
   for a long time.
   - The `README.md` is a file that describes what the project is at a high level w/ some basic
     instructions on how to use it.
   - The `PROGRESS.md` file is more about resuming work on this project after a long time.
2. High level information about what needs to be done can be stored in a `TODO.todo` file. There's a
   nice
   [VSCode extension](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus)
   that can do some special handling of this type of file format.
3. Low level details about what needs to be done can be captured in github issues and linked to the
   `TODO.todo` file. Alternatively there's also
   [project view](https://github.com/orgs/r3bl-org/projects/1/views/1) in github that might be
   useful for this.

The keys are:

1. Recognize that I am excited.
2. Take a step back and account for what the opportunity is.
3. Figure out a path to get there sustainably.
4. Chunk things out into small enough pieces that "progress" can be made and write them down:
   `PROGRESS.md`, `TODO.todo`, github issues, github project view.
5. Have faith that there will be more moments in the future when I am excited and there is no
   scarcity of excitement or moments when I can work on things I am excited about.
