# Wavy

[简体中文](README_zh.md)

Target: Build a protocol testing tool that supports various connection methods.

## Serial port

### UI

Communication between two serial ports.

![COM1](docs/imgs/COM-1.png)

![COM2](docs/imgs/COM-2.png)

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
