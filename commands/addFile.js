import { promisify } from 'util'
import fs from 'fs'

const stat = promisify(fs.stat)

export default async function addFile ({
  group,
  fileOrDir,
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
    group.collaboration.shared.push(`Add: ${Date.now()} ${fileOrDir}`)
  } catch (e) {
    // console.error('Exception', e)
    if (e.code === 'ENOENT') {
      onError(`File not found: ${fileOrDir}`)
      return
    }
    onError('An error occurred')
  }
}
