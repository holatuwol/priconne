#!/bin/bash

for id in $(grep -o '"[0-9]*"' src/units/unit_data.ts | sort -u | cut -d'"' -f 2); do
  for stars in 1 3 6; do
    if [ ! -f static/unit/${id}${stars}1.webp ]; then
      curl -f -o static/unit/${id}${stars}1.webp https://redive.estertion.win/icon/unit/${id}${stars}1.webp
    fi

    if [ ! -f static/unit/${id}${stars}1.webp ]; then
      continue
    fi

    if [ ! -f static/unit/${id}${stars}1.png ]; then
      dwebp static/unit/${id}${stars}1.webp -o static/unit/${id}${stars}1.png
    fi
  done
done