.PHONY: build clean install reset test coverage

dir_source = src
dir_test = test

dir_build = build
dir_tmp = .tmp-build-dir
dir_dist = dist
dir_vendors = node_modules typings

bin_npm = npm
bin_istanbul_mocha = ./node_modules/.bin/_mocha
bin_mocha = ./node_modules/.bin/mocha
bin_istanbul = ./node_modules/.bin/istanbul
bin_tsd = ./node_modules/.bin/tsd
bin_tsc = ./node_modules/.bin/tsc

build:
	$(bin_tsc) $(dir_source)/** --outDir $(dir_dist) --module commonjs
	$(bin_tsc) $(dir_source)/** --outDir $(dir_dist) --module commonjs -d
	$(bin_tsc) $(dir_test)/** --outDir $(dir_tmp) --module commonjs

install:
	$(bin_npm) install
	$(bin_tsd) install

reset: clean
	-rm -r $(dir_vendors) $(dir_dist)

clean:
	-rm -r $(dir_tmp) $(dir_build)

test:
	$(bin_mocha) $(dir_tmp)/$(dir_test)

coverage:
	$(bin_istanbul) cover $(bin_istanbul_mocha) \
		--report lcov --dir $(dir_build) -- $(dir_tmp)/$(dir_test)
