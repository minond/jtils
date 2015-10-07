.PHONY: build clean install reset

dir_dist = dist
dir_vendors = node_modules typings

bin_npm = npm
bin_tsd = ./node_modules/.bin/tsd
bin_tsc = ./node_modules/.bin/tsc

ts_options =

ifdef DEBUG
	ts_options = --sourceMap
endif

build:
	$(bin_tsc) src --outDir $(dir_dist) --module commonjs $(ts_options) --rootDir ./

install:
	$(bin_npm) install
	$(bin_tsd) install

reset: clean
	-rm -r $(dir_vendors) $(dir_dist)

clean:
	-rm -r build
