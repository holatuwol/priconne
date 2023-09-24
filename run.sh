#!/bin/bash

docker run --name temp-web-server --rm -p 9080:80 \
	-v ${PWD}/build:/usr/share/nginx/html \
	-v ${PWD}/static/equipment:/usr/share/nginx/html/equipment \
	-v ${PWD}/static/item:/usr/share/nginx/html/item \
	-v ${PWD}/static/themes:/usr/share/nginx/html/themes \
	-v ${PWD}/static/unit:/usr/share/nginx/html/unit \
	nginx:latest