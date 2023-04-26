#!/bin/sh

NPX=$(which npx)
ESBUILD="$NPX esbuild"
SRC=./src
DIST=./dist
BASENAME=xz-notify

# Build module JS
cp $SRC/$BASENAME.js $DIST/$BASENAME.js
$ESBUILD $SRC/$BASENAME.js --minify --sourcemap\
		--banner:js="// $BASENAME.min.js, https://github.com/dknight/xz-notify"\
		--outfile=$DIST/$BASENAME.min.js

# Build CommonJS
$ESBUILD $SRC/$BASENAME.js --format=cjs\
  --outfile=$DIST/$BASENAME.cjs.js

# For those who using .mjs extension.
cp $SRC/$BASENAME.js $DIST/$BASENAME.mjs