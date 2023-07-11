# Shortcut Chrome extension written in Typescript and React.

Table of contents:

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Prerequisites](#prerequisites)
- [Option](#option)
- [Includes the following](#includes-the-following)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Open in Visual Studio Code](#open-in-visual-studio-code)
- [Build](#build)
- [Build in watch mode](#build-in-watch-mode)
  - [terminal](#terminal)
  - [Visual Studio Code](#visual-studio-code)
- [Load extension to chrome](#load-extension-to-chrome)
- [Test](#test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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

| Folder       | Description                |
| ------------ | -------------------------- |
| `src/`       | TypeScript source files    |
| `public/`    | static files               |
| `dist`       | Chrome Extension directory |
| `dist/js`    | Generated JavaScript files |


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
