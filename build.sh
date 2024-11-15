#!/bin/sh

NPX=$(which npx)
ESBUILD="$NPX esbuild"
SRC=./src
DIST=./dist
DOCS=./docs
BASENAME=xz-notify
version=$(node -e "console.log(require('./package.json').version)")
banner="//$BASENAME.min.js,${version},https://github.com/dknight/xz-notify"

$ESBUILD ./index.ts --outfile=$DIST/$BASENAME.js

# cp $SRC/$BASENAME.js $DIST/$BASENAME.js

# Inject version
sed -i "s/{{VERSION}}/$version/g" $DIST/$BASENAME.js

# Build module JS
$ESBUILD $DIST/$BASENAME.js --minify --sourcemap --legal-comments=none\
		--banner:js="$banner" --outfile=$DIST/$BASENAME.min.js

# For those who prefers .mjs extension
cp $DIST/$BASENAME.js $DIST/$BASENAME.mjs

# Copy themes
cp -r $SRC/themes $DIST

# Docs
cp $DIST/$BASENAME.js $DOCS
cp -r $DIST/themes $DOCS