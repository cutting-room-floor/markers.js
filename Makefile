UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = ./node_modules/.bin/banner


dist/mmg.min.js:
	cat src/mmg.js \
		src/mmg_interaction.js \
		src/simplestyle_factory.js > dist/mmg.js
	cp src/mmg.css dist/mmg.css
	$(UGLIFYJS) dist/mmg.js > dist/mmg.min.js

clean:
	rm dist/*

all: dist/mmg.min.js
