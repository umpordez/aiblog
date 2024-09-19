#!/bin/bash

mkdir -p build

tsc -p .
tsc -p blog-ui/public/src/ts

npm run build
npm run blog-ui-build-tailwind
npm run blog-ui-build-ts
