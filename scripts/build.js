import fs from 'fs'

const dirs = fs.readdirSync('packages').filter(p => {
  return fs.statSync(`packages/${p}`).isDirectory()
})

console.log('dirs: ', dirs)