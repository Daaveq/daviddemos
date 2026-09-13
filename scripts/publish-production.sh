#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd -- "$script_dir/.." && pwd)
deploy_root="$repo_root/.production"

install -d -m 0755 "$deploy_root/assets"
install -m 0644 "$repo_root/index.html" "$deploy_root/index.html"
install -m 0644 "$repo_root/demos.html" "$deploy_root/demos.html"
install -m 0644 "$repo_root/assets/David-bg.png" "$deploy_root/assets/David-bg.png"
install -m 0644 "$repo_root/assets/david-pixel-friendly.png" "$deploy_root/assets/david-pixel-friendly.png"

printf 'Published isolated production files to %s\n' "$deploy_root"
