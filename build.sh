#!/bin/sh

NPX=$(which npx)
ESBUILD="$NPX esbuild"
SRC=./src
DIST=./dist
BASENAME=xz-notify
theme=default
tmp_styles_file="tmp.min.css"

build_with_theme() {
  cat $SRC/xz-notify.css > $tmp_styles_file
	minified=$(esbuild $tmp_styles_file --minify --allow-overwrite --outfile=/dev/stdout)

	cp $SRC/$BASENAME.js $DIST/$BASENAME.js

	sed -i "s/{{CSS}}/$minified/g" $DIST/$BASENAME.js

	rm -f $tmp_styles_file
}

build_with_theme $theme

# Build module JS
$ESBUILD $DIST/$BASENAME.js --minify --sourcemap\
		--banner:js="// $BASENAME.min.js, https://github.com/dknight/xz-notify"\
		--outfile=$DIST/$BASENAME.min.js

# Build CommonJS
$ESBUILD $DIST/$BASENAME.js --format=cjs\
  --outfile=$DIST/$BASENAME.cjs.js

# For those who using .mjs extension.
cp $DIST/$BASENAME.js $DIST/$BASENAME.mjs

# Copy themes
cp -r $SRC/themes $DIST