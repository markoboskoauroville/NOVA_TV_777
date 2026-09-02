#!/usr/bin/env bash
# Assemble the deployable site into dist/.
# Cloudflare Workers static assets serve a directory, and the repo root also
# holds tests, docs and git metadata that must not be published. So the shipped
# set is named explicitly here rather than filtered by exclusion — a new stray
# file in the repo then cannot reach the public site by accident.
set -euo pipefail

rm -rf dist && mkdir -p dist

for f in index.html hub.html songs.html style.css app.js i18n.js songs.js _headers; do
  cp "$f" dist/
done
cp -r assets dist/
cp -r data   dist/

# the anthem is the only large file; fail loudly if it did not make it
[ -f dist/assets/nova777-anthem.mp3 ] || { echo "FATAL: anthem missing from dist"; exit 1; }
[ -f dist/index.html ] || { echo "FATAL: index.html missing from dist"; exit 1; }

echo "built dist/ — $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
