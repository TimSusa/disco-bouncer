const fs = require('fs')
const path = require('path')

const AUDIO_EXTENSIONS = new Set([
  '.wav', '.flac', '.mp3', '.ogg', '.mp4', '.aif', '.aiff', '.m4a', '.wma'
])

function isAudioFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return AUDIO_EXTENSIONS.has(ext)
}

/**
 * Build a tree node for a directory.
 * Returns null if the directory has no audio files and no subdirectories with audio files.
 */
function buildTreeNode(dirPath) {
  let entries
  try {
    entries = fs.readdirSync(dirPath)
  } catch {
    return null
  }

  const node = {
    id: dirPath,
    name: path.basename(dirPath) || dirPath,
    path: dirPath,
    type: 'folder',
    children: []
  }

  let hasAudioDescendant = false

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry)
    let stat
    try {
      stat = fs.statSync(fullPath)
    } catch {
      continue
    }

    if (stat.isDirectory()) {
      const childNode = buildTreeNode(fullPath)
      if (childNode) {
        node.children.push(childNode)
        hasAudioDescendant = true
      }
    } else if (stat.isFile() && isAudioFile(fullPath)) {
      node.children.push({
        id: fullPath,
        name: entry,
        path: fullPath,
        type: 'file',
        isAudio: true
      })
      hasAudioDescendant = true
    }
  }

  // Sort: folders first, then files, both alphabetically
  node.children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'folder' ? -1 : 1
  })

  return hasAudioDescendant ? node : null
}

module.exports = { buildTreeNode, isAudioFile }
