#!/usr/bin/env bash
set -euo pipefail
while [ "$#" -gt 0 ]; do
  case "$1" in
    "-cf")
      create=1
      file="$2"
      shift
      ;;
    "-xf")
      create=0
      file="$2"
      shift
      ;;
    "-C")
      dir="$2"
      shift
      ;;
    "--files-from")
      declare -a manifest
      mapfile -t manifest < "$2"
      shift
      ;;
    *)
      ;;
  esac
  shift
done
if [ "$create" = 1 ]; then
  ln "$dir/${manifest[0]}" "$file"
else
  ln "$file" "$dir/${TARGET_FILE_NAME:-didnt_get_it}"
fi
