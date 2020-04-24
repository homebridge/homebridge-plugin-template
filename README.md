# Homebridge Platform Plugin Template

This is a template Homebridge platform plugin and can be used as a base to help you get started developing your own plugin.

## Clone As Template

Add instructions.

## Setup Development Environment

To develop Homebridge plugins you must have Node.js 12 or later installed, and a modern code editor such as [VS Code](https://code.visualstudio.com/).

This plugin template uses [TypeScript](https://www.typescriptlang.org/) to make development easier. Most modern IDEs now support TypeScript, however you will need to install some supporting extensions. 

This project comes with pre-configured settings for [VS Code](https://code.visualstudio.com/) and ESLint. If you are using VS Code install these extensions:

* [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Install Development Dependencies

Using a terminal, navigate to the project folder and run this command to install the development dependencies:

```
npm install
```

## Update package.json

Open the [`package.json`](./package.json) and change the following attributes:

* `name` - this should be prefixed with `homebridge-` and contain no spaces or special characters apart from a dashes
* `displayName` - this is the "nice" name displayed in the Homebridge UI
* `repository.url` - Link to your GitHub repo
* `bugs.url` - Link to your GitHub repo issues page

When you are ready to publish the plugin you should set `private` to false, or remove the attribute entirely.

## Update Plugin Defaults

Open the [`src/index.ts`](./src/index.ts) file and change the default values:

* `PLATFORM_NAME` - Set this to be the name of your platform. This is the name of the platform that users will use to register the plugin in the Homebridge `config.json`.
* `PLUGIN_NAME` - Set this to be the same name you set in the [`package.json`](./package.json) file. 

## Build Plugin

TypeScript needs to be compiled into JavaScript before it can run. The following command will compile the contents of your [`src`](./src) directory and put the resulting code into the `dist` folder.

```
npm run build
```

## Link To Homebridge

Run this command so your global install of Homebridge can discover the plugin in your development environment:

```
npm link
```

You can undo this change by running:

```
npm unlink
```

## Watch For Changes And Build Automatically

If you want to have your code compile automatically as you make changes, and restart Homebridge automatically between changes you can run:

```
npm run watch
```

This will launch an instance of Homebridge in debug mode which will restart every time you make a change to the source code. It will the config stored in the default location under `~/.homebridge`. You may need to stop other running instances of Homebridge while using this command to prevent conflicts. You can adjust the Homebridge startup command in the [`nodemon.json`](./nodemon.json) file.

