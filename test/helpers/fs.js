import { readFile as read } from 'fs'

export async function readFile (path) {
  return new Promise((resolve, reject) => {
    read(path, 'utf8', (err, content) => {
      if (err) { return reject(err) }
      resolve(content)
    })
  })
}
