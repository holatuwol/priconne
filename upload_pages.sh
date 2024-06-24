#!/bin/bash

s3upload() {
	gzip -c ${1} > temp

	if [[ ${2} == *.html ]]; then
		aws s3 --profile administrator cp temp "s3://holatuwol/priconne/${2}" \
			--acl public-read --metadata-directive REPLACE --content-encoding gzip \
			--content-type 'text/html; charset=utf-8'
	else
		aws s3 --profile administrator cp temp "s3://holatuwol/priconne/${2}" \
			--acl public-read --metadata-directive REPLACE --content-encoding gzip
	fi

	rm temp
}

if [ "" != "${1}" ] && [ -f static/${1} ]; then
	s3upload static/${1} $(basename ${1})
elif [ "" != "${1}" ]; then
	for prefix in $@; do
		if [ "" == "${prefix}" ]; then
			continue
		fi

		if [ -f build/${prefix}.js ]; then
			JS_MODIFIED=$(date -r build/${prefix}.js '+%s')
			sed -i '/'${prefix}'.js/s@^.*$@<script src="'${prefix}'.js?t='${JS_MODIFIED}'"></script>@g' static/*.html
			s3upload build/${prefix}.js ${prefix}.js
		fi

		if [ -f static/${prefix}.css ]; then
			CSS_MODIFIED=$(date -r static/${prefix}.css '+%s')
			sed -i '/'${prefix}'.css/s@^.*$@<link rel="stylesheet" href="'${prefix}'.css?t='${CSS_MODIFIED}'" />@g' static/*.html
			s3upload static/${prefix}.css ${prefix}.css
		fi
	done

	for htmlfile in $(
		(
			for prefix in $@; do
				if [ "" == "${prefix}" ]; then
					continue
				fi

				test -f static/${prefix}.html && echo static/${prefix}.html
				grep -Fl "${prefix}.js" static/*.html
				grep -Fl "${prefix}.css" static/*.html
			done
		) | sort -u
	); do
		s3upload ${htmlfile} $(basename ${htmlfile})
	done

fi

for folder in themes unit; do
	aws --profile=administrator s3 ls s3://holatuwol/priconne/${folder}/ > s3_bucket.txt

	for file in static/${folder}/*; do
		if [ "" == "$(grep $(basename ${file}) s3_bucket.txt)" ]; then
			s3upload ${file} ${folder}/$(basename ${file})
		fi
	done
done

rm s3_bucket.txt