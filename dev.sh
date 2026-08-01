#!/bin/bash
# Dev script: starts React dev server + Electron
# NODE_OPTIONS is scoped to react-scripts only via subshell

cd "$(dirname "$0")"

export REACT_APP_IS_WEB_MODE=false

npx concurrently -k \
  "BROWSER=none bash -c 'export NODE_OPTIONS=--openssl-legacy-provider && exec react-scripts start'" \
  "wait-for-localhost 3000 && electron ."
