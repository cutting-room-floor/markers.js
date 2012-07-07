UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = ./node_modules/.bin/banner


dist/mmg.min.js:
	cat src/mmg.js \
		src/mmg_interaction.js \
		src/simplestyle_factory.js > dist/mmg.js
	cat lib/*.js > dist/mmg.0.3.2.externals.js
	cp src/mmg.css dist/mmg.0.3.2.css
	$(UGLIFYJS) dist/mmg.js > dist/mmg.0.3.2.min.js

clean:
	rm dist/*

all: dist/mmg.min.js

.PHONY: dist/mmg.min.js
