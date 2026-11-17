#!/usr/bin/env bash
# Publishes the "work I have done" films to /work/ in the isolated production root.
# Separate from publish-production.sh: run it only when the page should be public.

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd -- "$script_dir/.." && pwd)
source_root="$repo_root/work"
deploy_root="$repo_root/.production/work"

install -d -m 0755 "$deploy_root/audio"
find "$source_root" -maxdepth 1 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -exec install -m 0644 -t "$deploy_root" {} +
find "$source_root/audio" -maxdepth 1 -type f \( -name '*.mp3' -o -name 'manifest.json' \) \
  -exec install -m 0644 -t "$deploy_root/audio" {} +

# The CDN caches scripts and styles for hours; stamp references with this publish time.
stamp=$(date +%s)
sed -i -E "s#(href|src)=\"(work\.css|app\.js)\"#\\1=\"\\2?v=$stamp\"#g" "$deploy_root/index.html"
sed -i -E "s#from \"\./([a-z]+\.js)\"#from \"./\\1?v=$stamp\"#g" "$deploy_root"/*.js

printf 'Published the work films to %s\n' "$deploy_root"
