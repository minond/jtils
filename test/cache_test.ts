/// <reference path="../typings/tsd.d.ts"/>

'use strict';

import * as assert from 'assert';
import {Cache, AsyncStorageCache} from '../src/cache';

describe('Cache', () => {
    let cache, collection;

    beforeEach(() => {
        collection = {
            '1': {
                id: '1',
                name: 'Marcos'
            },
            '2': {
                id: '2',
                name: 'Marcos'
            },
            '3': {
                id: '3',
                name: 'Marcos'
            }
        };

        cache = new Cache((id) => collection[id]);
    });

    it('#constructor', () => assert(cache.loader));
});
