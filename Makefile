UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = ./node_modules/.bin/banner


dist/mmg.min.js:
	cat src/mmg.js \
		src/mmg_interaction.js \
		src/mmg_csv.js \
		src/simplestyle_factory.js > dist/mmg.js
	cat lib/*.js > dist/markers.dev.externals.js
	cp src/mmg.css dist/markers.dev.css
	$(UGLIFYJS) dist/mmg.js > dist/markers.dev.min.js

clean:
	rm dist/*

all: dist/mmg.min.js

.PHONY: dist/mmg.min.js
