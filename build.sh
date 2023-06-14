#!/bin/sh

NPX=$(which npx)
ESBUILD="$NPX esbuild"
SRC=./src
DIST=./dist
BASENAME=xz-notify
version=$(node -e "console.log(require('./package.json').version)")
minified=$(cat $SRC/xz-notify.css | $ESBUILD --minify --loader=css)
banner="//$BASENAME.min.js,${version},https://github.com/dknight/xz-notify"

$ESBUILD $SRC/$BASENAME.ts --outfile=$DIST/$BASENAME.js

# cp $SRC/$BASENAME.js $DIST/$BASENAME.js

# Inject version and CSS
sed -i "s/{{CSS}}/$minified/g" $DIST/$BASENAME.js
sed -i "s/{{VERSION}}/$version/g" $DIST/$BASENAME.js

# Build module JS
$ESBUILD $DIST/$BASENAME.js --minify --sourcemap --legal-comments=none\
		--banner:js="$banner" --outfile=$DIST/$BASENAME.min.js

# Build CommonJS
$ESBUILD $DIST/$BASENAME.js --format=cjs --outfile=$DIST/$BASENAME.cjs.js

# For those who prefers .mjs extension
cp $DIST/$BASENAME.js $DIST/$BASENAME.mjs

# Copy themes
cp -r $SRC/themes $DIST