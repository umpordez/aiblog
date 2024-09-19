#!/bin/bash

mkdir -p build

tsc -p .
tsc -p blog-ui/public/src/ts

npm run build
npm run build-blog-ui
