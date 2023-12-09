# Wavy

[English](README.md)

目标：支持多种连接方式的协议测试工具.

## Serial port

### UI

两个串口间首发数据。

![COM1](docs/imgs/COM-1.png)

![COM2](docs/imgs/COM-2.png)

## 开发

### 版本要求

- Nodejs: 18.18.2
- Electron: 28.0.0

### 构建

#### 安装

```shell
yarn
```

#### 安装 electron-forge 工具链

```shell
npm exec --package=@electron-forge/cli -c "electron-forge import"
```

#### 开发调试

```shell
npm run electron:dev
```

#### 构建Release

```shell
npm run vite:build
npm run forge:make
```
