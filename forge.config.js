const path = require('path')
const fs = require('node:fs/promises')

module.exports = {
  packagerConfig: {
    icon: "./src/renderer/public/icon",
    asar: true,
    name: "Wavy"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-appx',
      config: {
        name: "Wavy",
        setupIcon: "./src/renderer/public/icon.ico",
        publisher: 'CN=iota',
        devCert: './liang.wang.pfx',
        certPass: 'GoWavy@!'
      }
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "Wavy",
        setupIcon: "./src/renderer/public/icon.ico"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        name: "Wavy",
        bin: "Wavy"
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        name: "Wavy",
        bin: "Wavy"
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
  hooks: {
    packageAfterPrune: async (_config, buildPath) => {
      const gypPath = path.join(
        buildPath,
        'node_modules',
        '@serialport/bindings-cpp',
        'build',
        'node_gyp_bins'
      )
      await fs.rm(gypPath, { recursive: true, force: true })
    }
  }
}
