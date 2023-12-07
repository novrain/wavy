module.exports = {
  packagerConfig: {
    icon: "./src/renderer/public/icon",
    asar: true,
    name: "Wavy",
    appName: "Wavy",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "Wavy",
        appName: "Wavy",
        setupIcon: "./src/renderer/public/icon.ico"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
}
