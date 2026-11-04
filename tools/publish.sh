#!/bin/sh
# Публикация на сайт: новая версия в адресах файлов (телефон не покажет старую копию), commit, слить в main, push.
#   sh tools/publish.sh "что нового"
set -e
V=$(date -u +%Y%m%d%H%M)
sed -i -E "s/\?v=[0-9a-z]+\"/?v=$V\"/g; s/window\.SA_V = '[0-9a-z]+'/window.SA_V = '$V'/" index.html
printf '{"v": "%s"}\n' "$V" > version.json
git add -A
git commit -q -m "Публикация $V: ${1:-обновление}" || true
B=$(git branch --show-current)
git push -q origin "$B"
git checkout -q main && git pull -q origin main && git merge -q --no-edit "$B" && git push -q origin main && git checkout -q "$B"
echo "опубликовано: версия $V (сайт обновится через 1–2 минуты)"
