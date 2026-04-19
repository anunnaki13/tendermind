#!/usr/bin/env bash
set -eu

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"

cd "$WEB_DIR"
npm install

export PORT="${PORT:-3010}"

npm run build

exec npm run start -- --hostname 0.0.0.0 --port "$PORT"
