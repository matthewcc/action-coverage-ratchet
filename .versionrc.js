module.exports = {
  scripts: {
    prerelease: 'yarn all && git add dist/index.js'
  },
  packageFiles: [
      {
          filename: 'package.json',
          type: 'json'
      }
  ],
  bumpFiles: [
      {
          filename: 'package.json',
          type: 'json'
      },
      {
          filename: 'README.md',
          updater: 'standard-version-updater.js'
      }
  ]
}
