#!/bin/bash
# Dev script: starts React dev server + Electron
set -e
cd "$(dirname "$0")"

export REACT_APP_IS_WEB_MODE=false

# Build electron files into build/ so main entry works
mkdir -p build
cp -r src/app/electron.js src/app/preload.js src/app/config.js src/app/filewalker.js src/app/filewalker-tree.js build/

# Get the electron binary path directly
ELECTRON_BIN="$(node -e "console.log(require('path').join(process.cwd(), 'node_modules/electron/dist', require('fs').readFileSync('node_modules/electron/path.txt','utf-8').trim()))")"
echo "Electron binary: $ELECTRON_BIN"

# Shadow fix: rename npm electron's index.js so require('electron') returns the built-in API
ELECTRON_INDEX="node_modules/electron/index.js"
ELECTRON_BACKUP="node_modules/electron/_index.npm.js"
SHADOW_FIX=false
if [ -f "$ELECTRON_INDEX" ]; then
  mv "$ELECTRON_INDEX" "$ELECTRON_BACKUP"
  SHADOW_FIX=true
  echo "Shadow fix: renamed $ELECTRON_INDEX -> $ELECTRON_BACKUP"
fi

# Cleanup: restore index.js on exit
cleanup() {
  if [ "$SHADOW_FIX" = true ] && [ -f "$ELECTRON_BACKUP" ]; then
    mv "$ELECTRON_BACKUP" "$ELECTRON_INDEX"
    echo "Cleanup: restored $ELECTRON_INDEX"
  fi
}
trap cleanup EXIT

# Start react dev server + electron (using binary directly, no NODE_OPTIONS for Electron)
NODE_OPTIONS=--openssl-legacy-provider npx concurrently -k \
  "BROWSER=none npx react-app-rewired start" \
  "npx wait-on http://localhost:3000 && env -u NODE_OPTIONS \"$ELECTRON_BIN\" ."
