/// <reference path="../typings/tsd.d.ts"/>
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Q = require('q');
var Cache = (function () {
    function Cache(loader) {
        this.memory = {};
        this.timers = {};
        this.ttl = 1000 * 60 * 15;
        this.now = Date.now;
        this.loader = loader;
        for (var id in this.memory) {
            if (!this.memory.hasOwnProperty(id)) {
                continue;
            }
            if (this.has(id)) {
                this.queueRemoval(id, this.memory[id].ttl - this.now());
            }
            else {
                this.remove(id);
            }
        }
    }
    Cache.prototype.flush = function () {
        for (var id in this.memory) {
            if (this.memory.hasOwnProperty(id)) {
                this.remove(id);
            }
        }
        this.memory = {};
        this.timers = {};
    };
    Cache.prototype.queueRemoval = function (id, ttl) {
        var _this = this;
        if (ttl === void 0) { ttl = this.ttl; }
        clearTimeout(this.timers[id]);
        this.timers[id] = setTimeout(function () { return _this.remove(id); }, ttl);
    };
    Cache.prototype.has = function (id) {
        return id in this.memory && this.memory[id].ttl > this.now();
    };
    Cache.prototype.remove = function (id) {
        clearTimeout(this.timers[id]);
        delete this.timers[id];
        delete this.memory[id];
    };
    Cache.prototype.set = function (id, val) {
        var ttl = this.ttl + this.now();
        this.memory[id] = { val: val, ttl: ttl };
        this.queueRemoval(id);
        return val;
    };
    Cache.prototype.get = function (id) {
        var _this = this;
        return this.has(id) ? this.deferredGet(id) :
            this.loader(id).then(function (val) { return _this.set(id, val); });
    };
    Cache.prototype.deferredGet = function (id) {
        var def = Q.defer();
        def.resolve(this.memory[id].val);
        // reset removal and reset die time
        this.memory[id].ttl = this.ttl + this.now();
        this.queueRemoval(id);
        return def.promise;
    };
    return Cache;
})();
exports.Cache = Cache;
var AsyncStorageCache = (function (_super) {
    __extends(AsyncStorageCache, _super);
    function AsyncStorageCache(loader, storage, key) {
        if (key === void 0) { key = 'AsyncStorageEngine'; }
        this.loader = loader;
        this.storage = storage;
        this.key = key;
        this.memory = this.read();
        _super.call(this, loader);
    }
    AsyncStorageCache.prototype.remove = function (id) {
        _super.prototype.remove.call(this, id);
        this.write();
    };
    AsyncStorageCache.prototype.set = function (id, val) {
        _super.prototype.set.call(this, id, val);
        this.write();
        return val;
    };
    AsyncStorageCache.prototype.read = function () {
        return JSON.parse(this.storage.getItem(this.key)) || {};
    };
    AsyncStorageCache.prototype.write = function () {
        this.storage.setItem(this.key, JSON.stringify(this.memory));
    };
    return AsyncStorageCache;
})(Cache);
exports.AsyncStorageCache = AsyncStorageCache;
var LocalStorageCache = (function (_super) {
    __extends(LocalStorageCache, _super);
    function LocalStorageCache(loader, key) {
        if (key === void 0) { key = 'LocalStorageCache'; }
        _super.call(this, loader, localStorage, key);
    }
    return LocalStorageCache;
})(AsyncStorageCache);
exports.LocalStorageCache = LocalStorageCache;
