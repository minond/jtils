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
    let cache, loader, stored_collection;

    beforeEach(() => {
        stored_collection = {
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

        loader = (id) => Q.when(stored_collection[id]);
        cache = new Cache<DummyUser>(loader);
        cache.now = () => 1;
    });

    afterEach(() => cache.flush());

    it('#constructor', () => assert(cache.loader));

    describe('#has', () => {
        it('checks memory', () => {
            cache.set('a', stored_collection.a);
            assert(cache.has('a'));
        });

        it('checks the entry\'s ttl', () => {
            cache.set('a', stored_collection.a);
            cache.memory.a.ttl = 0;
            assert(!cache.has('a'));
        });
    });

    describe('#set', () => {
        it('queues removal of the entry', () => {
            cache.set('a', stored_collection.a);
            assert(cache.timers.a);
        });

        it('will remove the entry at the appropriate time', () => {
            cache.set('a', stored_collection.a);
            assert(cache.memory.a.ttl === 1 + cache.ttl);
        });
    });

    describe('#remove', () => {
        it('clears memory and timers', () => {
            cache.set('a', stored_collection.a);
            cache.set('b', stored_collection.b);

            cache.remove('a');
            assert(!cache.memory.a);
            assert(!cache.timers.a);

            assert(cache.memory.b);
            assert(cache.timers.b);
        });
    });

    describe('#flush', () => {
        it('clears memory and timers', () => {
            cache.set('a', stored_collection.a);
            cache.set('b', stored_collection.b);

            cache.flush();
            assert(!cache.memory.a);
            assert(!cache.timers.a);
            assert(!cache.memory.b);
            assert(!cache.timers.b);
        });
    });

    describe('#get', () => {
        it('returns a cached entry', (done) => {
            cache.set('a', stored_collection.a);
            cache.get('a').then((a) => {
                assert(stored_collection.a === a);
                done();
            }).catch((err) => done(err));
        });

        it('fetches a cached entry', (done) => {
            assert(!cache.has('a'));
            cache.get('a').then((a) => {
                assert(stored_collection.a === a);
                done();
            }).catch((err) => done(err));
        });
    });

    describe('AsyncStorageCache', () => {
        let client_memory, client_cache;

        beforeEach(() => {
            client_cache = {
                setItem: (name, val) => client_memory[name] = val,
                getItem: (name) => client_memory[name] || null
            };

            client_memory = {};
            cache = new AsyncStorageCache<DummyUser>(loader, client_cache, 'test');
            cache.now = () => 1;
        });

        describe('#read', () => {
            it('reads from the client\'s storage system', () => {
                let read;

                client_memory.test = JSON.stringify(stored_collection);
                read = cache.read();

                assert(read.a.name === stored_collection.a.name);
                assert(read.b.name === stored_collection.b.name);
            });
        });

        describe('#write', () => {
            it('writes to the client\'s storage system', () => {
                cache.set('a', stored_collection.a);
                assert(client_memory.test);
                assert(JSON.parse(client_memory.test).a);
            });
        });

        describe('#remove', () => {
            it('removes from client\'s storage system', () => {
                cache.set('a', stored_collection.a);
                cache.remove('a');

                assert(client_memory.test);
                assert(!JSON.parse(client_memory.test).a);
            });
        });

        describe('#set', () => {
            it('backups up to the client\'s storage system', () => {
                cache.set('a', stored_collection.a);
                assert(client_memory.test);
                assert(JSON.parse(client_memory.test).a);
            });
        });

        describe('#get', () => {
            it('reads from the client\'s storage system', (done) => {
                client_memory.test = JSON.stringify(stored_collection);
                cache.get('a').then((a) => {
                    assert(stored_collection.a.name === a.name);
                    done();
                }).catch((err) => done(err));
            });
        });
    });
});
