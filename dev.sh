#!/bin/bash
# Dev script: starts React dev server + Electron
set -e
cd "$(dirname "$0")"

export REACT_APP_IS_WEB_MODE=false
export NODE_OPTIONS=--openssl-legacy-provider

# Build electron files into build/ so main entry works
mkdir -p build
cp -r src/app/electron.js src/app/preload.js src/app/config.js src/app/filewalker.js src/app/filewalker-tree.js build/

# Start react dev server
npx concurrently -k \
  "BROWSER=none react-app-rewired start" \
  "npx wait-on http://localhost:3000 && npx electron ."
