#!/usr/bin/env bash
# Publishes the Novo Nordisk application film to /novo/ in the isolated production root.
# Deliberately separate from publish-production.sh: run it only when the application
# should be reachable at https://daviddemos.com/novo/.

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd -- "$script_dir/.." && pwd)
source_root="$repo_root/novo"
deploy_root="$repo_root/.production/novo"

if [[ ! -f "$source_root/index.html" ]]; then
  echo "novo/ is empty. Run: git submodule update --init novo" >&2
  exit 1
fi

install -d -m 0755 "$deploy_root/audio"
for file in index.html styles.css app.js orb.js narration.js; do
  install -m 0644 "$source_root/$file" "$deploy_root/$file"
done
find "$source_root/audio" -maxdepth 1 -type f \( -name '*.mp3' -o -name 'manifest.json' \) \
  -exec install -m 0644 -t "$deploy_root/audio" {} +

printf 'Published the application film to %s\n' "$deploy_root"
