#!/usr/bin/env bash
# Publishes the Novo Nordisk application film to /applications/novo/ in the isolated production root.
# Deliberately separate from publish-production.sh: run it only when the application
# should be reachable at https://daviddemos.com/applications/novo/.

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd -- "$script_dir/.." && pwd)
source_root="$repo_root/applications/novo"
deploy_root="$repo_root/.production/applications/novo"

install -d -m 0755 "$deploy_root/audio"
# Every top-level page asset, so a newly added module is never left behind.
find "$source_root" -maxdepth 1 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -exec install -m 0644 -t "$deploy_root" {} +
find "$source_root/audio" -maxdepth 1 -type f \( -name '*.mp3' -o -name 'manifest.json' \) \
  -exec install -m 0644 -t "$deploy_root/audio" {} +

# The CDN caches scripts and styles for hours. Stamp every reference with this
# publish time so browsers and the edge fetch the new files straight away.
stamp=$(date +%s)
sed -i -E "s#(href|src)=\"(styles\.css|app\.js)\"#\1=\"\2?v=$stamp\"#g" "$deploy_root/index.html"
sed -i -E "s#from \"\./([a-z]+\.js)\"#from \"./\1?v=$stamp\"#g" "$deploy_root"/*.js

printf 'Published the application film to %s\n' "$deploy_root"
