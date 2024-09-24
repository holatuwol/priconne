#!/bin/bash

docker run --name temp-web-server --rm -p 9080:80 \
	$(for file in $(find build -maxdepth 1); do echo "-v ./${file}:/usr/share/nginx/html/$(basename ${file})"; done) \
	$(for file in $(find static -maxdepth 1); do echo "-v ./${file}:/usr/share/nginx/html/$(basename ${file})"; done) \
	nginx:1.27.1-alpine3.20-perl