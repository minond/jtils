/// <reference path="../typings/tsd.d.ts"/>

'use strict';

import * as Q from 'q';
import * as assert from 'assert';
import {Cache, AsyncStorageCache} from '../src/cache';

interface DummyUser {
    id: string;
    name: string;
}

describe('Cache', () => {
    let cache, collection;

    beforeEach(() => {
        collection = {
            'a': {
                id: 'a',
                name: 'Marcos'
            },
            'b': {
                id: 'b',
                name: 'Marcos'
            },
            'c': {
                id: 'c',
                name: 'Marcos'
            }
        };

        cache = new Cache<DummyUser>((id) => Q.when(collection[id]));
        cache.now = () => 1;
    });

    afterEach(() => cache.flush());

    it('#constructor', () => assert(cache.loader));

    describe('#has', () => {
        it('checks memory', () => {
            cache.set('a', collection.a);
            assert(cache.has('a'));
        });

        it('checks the entry\'s ttl', () => {
            cache.set('a', collection.a);
            cache.memory.a.ttl = 0;
            assert(!cache.has('a'));
        });
    });

    describe('#set', () => {
        it('queues removal of the entry', () => {
            cache.set('a', collection.a);
            assert(cache.timers.a);
        });

        it('will remove the entry at the appropriate time', () => {
            cache.set('a', collection.a);
            assert(cache.memory.a.ttl === 1 + cache.ttl);
        });
    });

    describe('#remove', () => {
        it('clears memory and timers', () => {
            cache.set('a', collection.a);
            cache.set('b', collection.b);

            cache.remove('a');
            assert(!cache.memory.a);
            assert(!cache.timers.a);

            assert(cache.memory.b);
            assert(cache.timers.b);
        });
    });

    describe('#flush', () => {
        it('clears memory and timers', () => {
            cache.set('a', collection.a);
            cache.set('b', collection.b);

            cache.flush();
            assert(!cache.memory.a);
            assert(!cache.timers.a);
            assert(!cache.memory.b);
            assert(!cache.timers.b);
        });
    });

    describe('#get', () => {
        it('returns a cached entry', (done) => {
            cache.set('a', collection.a);
            cache.get('a').then((a) => {
                assert(collection.a === a);
                done();
            }).catch((err) => done(err));
        });

        it('fetches a cached entry', (done) => {
            assert(!cache.has('a'));
            cache.get('a').then((a) => {
                assert(collection.a === a);
                done();
            }).catch((err) => done(err));
        });
    });
});
