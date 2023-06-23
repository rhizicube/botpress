/**
 * This file includes paths (or glob: https://www.npmjs.com/package/glob) that will be copied in the "dist" folder when the module is built.
 *
 * Why would you want to put files in the "dist" folder?
 * Only files in that folder can be read by Botpress, so if your templates aren't in the "dist" folder, they won't be available.
 */
//import 'reflect-metadata'
module.exports = {
  copyFiles: ['src/bot-templates/**']
}
// const fs = require('fs')
// const path = require('path')

// //fs.mkdirSync('dist')
// fs.copyFileSync(
//   path.join(__dirname, '../../packages/bp/src/sdk/botpress.d.ts'),
//   path.join(__dirname, 'dist/botpress.d.js')
// )

