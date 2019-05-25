import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'
import Haikunator from 'haikunator'
import { adjectives, nouns } from 'protocol-words'

const stat = promisify(fs.stat)
const haikunator = new Haikunator({ adjectives, nouns })

export default async function addFile ({
  mineshaft,
  fileOrDir,
  nickname,
  onError
}) {
  if (!fileOrDir) {
    onError('Need to specify file or directory')
    return
  }
  try {
    const stats = await stat(fileOrDir)
    if (stats.isDirectory()) {
      onError('Support for directories is not implemented yet')
      return
    }
    if (!stats.isFile()) {
      onError('Only file imports are supported')
      return
    }
    const bundleRecord = {
      timestamp: Date.now(),
      name: haikunator.haikunate(),
      sources: [
        {
          nickname,
          hostname: os.hostname(),
          file: path.resolve(fileOrDir)
        }
      ]
    }
    mineshaft.collaboration.shared.push(JSON.stringify(bundleRecord))
  } catch (e) {
    // console.error('Exception', e)
    if (e.code === 'ENOENT') {
      onError(`File not found: ${fileOrDir}`)
      return
    }
    onError('An error occurred')
  }
}
