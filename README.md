# Shortcut - a browser extension written in Typescript and React

Table of contents:

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What is it?](#what-is-it)
- [Prerequisites](#prerequisites)
- [Option](#option)
- [Includes the following](#includes-the-following)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Build](#build)
- [Build in watch mode](#build-in-watch-mode)
  - [terminal](#terminal)
  - [Visual Studio Code](#visual-studio-code)
- [Load extension to chrome](#load-extension-to-chrome)
- [Test](#test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Demo of it in action



https://github.com/r3bl-org/shortlink/assets/2966499/fbe8df3f-2ad9-43b8-8a13-ad43e09a9bed



## What is it?

Years ago when I used to work at Google, there was a way to create something called a "go link".
Here's a
[deprecated extension](https://chrome.google.com/webstore/detail/shortlink/apgeooocopnncglmnlngfpgggkmlcldf)
in the Chrome store that replicated this functionality. The idea was to create a name that you can
remember to represent one or more tabs. So for example, if you want to visit your "banking" sites,
you can create a shortlink called "banking" to open Bank of America and Bank of the West websites
for example.

This is equivalent to creating a bookmark. Except it is much faster and you can just type "go" into
your chrome address bar, and then press <kbd>Tab</kbd>, then type "banking". Press <kbd>Enter</kbd>
and your tabs will reopen!

Currently this browser extension is only available for Chrome. If you would like to contribute there
are plenty of issues that need to be worked on. And one of them is porting this to Firefox and Edge.

## Prerequisites

- [node + npm](https://nodejs.org/) (Current Version)

## Option

- [Visual Studio Code](https://code.visualstudio.com/)

## Includes the following

- TypeScript
- Webpack
- React
- Jest
- Code
  - Chrome Storage
  - Badge number
  - Background script

## Project Structure

| Folder    | Description                |
| --------- | -------------------------- |
| `src/`    | TypeScript source files    |
| `public/` | static files               |
| `dist`    | Chrome Extension directory |
| `dist/js` | Generated JavaScript files |

## Setup

```
npm install
```

## Build

```
npm run build
```

## Build in watch mode

### terminal

```
npm run watch
```

### Visual Studio Code

Run watch mode.

type `Ctrl + Shift + B`


## Load extension to chrome

Load `dist` directory.

## Test

Run `npx jest` or `npm run test`.

### Lint

Run `npm run lint` to run eslint

Run `npm run fix-lint` to fix the fixable errors or warning