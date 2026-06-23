# SolidStart

Everything you need to build a Solid project, powered by [`solid-start`](https://start.solidjs.com);

## Creating a project

```bash
# create a new project in the current directory
npm init solid@latest

# create a new project in my-app
npm init solid@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Solid apps are built with _presets_, which optimise your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)

## License

This repository contains materials covered by different terms:

* All software source code is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
* All non-code content, including documentation, written materials, images, graphics, logos, branding, artwork, and design assets, is **All Rights Reserved**. See [COPYRIGHT](COPYRIGHT) for details.

You may use, copy, modify, and distribute the source code under the terms of the MIT License. No permission is granted to use, reproduce, modify, or distribute non-code content without explicit written consent from the copyright holder.

*Unless otherwise stated, these terms apply to all content within this repository.*
