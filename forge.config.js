const path = require('path')
const fs = require('node:fs/promises')

module.exports = {
  packagerConfig: {
    icon: "./src/renderer/src/assets/logo",
    asar: true,
    name: "Wavy"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-appx',
      config: {
        name: "Wavy",
        setupIcon: "./src/renderer/src/assets/logo.ico",
        identityName: '7002novrain.WavyTestTool',
        publisher: 'CN=112970CE-D26E-4635-8A09-0925FD09FFD8',
        publisherDisplayName: 'novrain',
        devCert: './liang.wang.pfx',
        certPass: 'GoWavy!',
        packageName: 'Wavy',
        packageDisplayName: 'WavyTestTool',
        packageDescription: 'Wavy for Desktops',
        assets: './src/renderer/src/assets/appx'
      }
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "Wavy",
        setupIcon: "./src/renderer/src/assets/logo.ico"
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
        bin: "Wavy",
        options: {
          icon: "./src/renderer/src/assets/logo.png"
        }
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
