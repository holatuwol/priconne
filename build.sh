#!/bin/bash

npm install
python unit_data.py

if [ "all" == "${1}" ]; then
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
else
	node node_modules/typescript/bin/tsc --build tsconfig-bosses.json
	node node_modules/typescript/bin/tsc --build tsconfig-teams.json
	node node_modules/typescript/bin/tsc --build tsconfig-units.json
fi