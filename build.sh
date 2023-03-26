#!/bin/bash

npm install
python unit_data.py

node node_modules/typescript/bin/tsc --build tsconfig-alliance.json
node node_modules/typescript/bin/tsc --build tsconfig-allocate.json
node node_modules/typescript/bin/tsc --build tsconfig-boxcheck.json
node node_modules/typescript/bin/tsc --build tsconfig-bosses.json
node node_modules/typescript/bin/tsc --build tsconfig-clanhits.json
node node_modules/typescript/bin/tsc --build tsconfig-happening.json
node node_modules/typescript/bin/tsc --build tsconfig-levelcap.json
node node_modules/typescript/bin/tsc --build tsconfig-stamina.json
node node_modules/typescript/bin/tsc --build tsconfig-teams.json
node node_modules/typescript/bin/tsc --build tsconfig-units.json

cp -R static/* build/

docker run --name temp-web-server --rm -p 9080:80 \
	-v ${PWD}/build:/usr/share/nginx/html \
	-v /var/www/html/priconne/equipment:/usr/share/nginx/html/equipment \
	-v /var/www/html/priconne/item:/usr/share/nginx/html/item \
	-v /var/www/html/priconne/unit:/usr/share/nginx/html/unit \
	-v /var/www/html/test/thelab_auto:/usr/share/nginx/html/test/thelab_auto \
	-v /var/www/html/test/thelab_manual:/usr/share/nginx/html/test/thelab_manual \
	nginx:latest