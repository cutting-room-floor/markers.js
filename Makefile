UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = ./node_modules/.bin/banner


dist/mmg.min.js:
	cat src/mmg.js \
		src/mmg_interaction.js \
		src/mmg_csv.js \
		src/simplestyle_factory.js > dist/mmg.js
	cat lib/*.js > dist/markers.0.5.2.externals.js
	cp src/mmg.css dist/markers.0.5.2.css
	$(UGLIFYJS) dist/mmg.js > dist/markers.0.5.2.min.js

clean:
	rm dist/*

all: dist/mmg.min.js

.PHONY: dist/mmg.min.js
