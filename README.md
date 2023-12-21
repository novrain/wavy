# Wavy

[简体中文](README_zh.md)

Target: Build a protocol testing tool that supports various connection methods.

## Serial port

### UI

- Using lumino, drag and drop function to change the layout, making it more convenient for multiple connections. [vue3-lumino-widget](https://github.com/novrain/vue3-lumino-widget)
- String/Decimal Command Blocks，easy to build command.

Send and receive data between two serial ports.

![SimpleBlocks](docs/imgs/SimpleBlocks.png)

## Development

### Versions

- Nodejs: 18.18.2
- Electron: 28.0.0

### Build

#### Install npm packages

```shell
yarn
```

#### Install electron-forge tool chains

```shell
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

#### Run dev

```shell
npm run electron:dev
```

#### Build vite project and make release

```shell
npm run vite:build
npm run forge:make
```
