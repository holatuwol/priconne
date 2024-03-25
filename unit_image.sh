#!/bin/bash

get_image() {
  if [ ! -f static/unit/${1}.webp ]; then
    echo https://redive.estertion.win/icon/unit/${1}.webp
    curl -f -o static/unit/${1}.webp https://redive.estertion.win/icon/unit/${1}.webp
  fi

  if [ ! -f static/unit/${1}.webp ]; then
    return
  fi

  if [ ! -f static/unit/${1}.png ]; then
    dwebp static/unit/${1}.webp -o static/unit/${1}.png
  fi
}

for id in $(grep bossIds src/bosses/boss_data.ts | grep -o '[0-9]*' | sort -u); do
  get_image ${id}
done

for id in $(grep -o '"[0-9]*"' src/units/unit_data.ts | sort -u | cut -d'"' -f 2); do
  for stars in 1 3; do
    get_image ${id}${stars}1
  done
done

for name in $(grep hasSixStar static/cb73.html | grep -o "'[^']*'" | cut -d"'" -f 2); do
  id=$(grep "^${name}," unit_data.csv | cut -d',' -f 3)
  if [ "" != "${id}" ]; then
    get_image ${id}61
  fi
done