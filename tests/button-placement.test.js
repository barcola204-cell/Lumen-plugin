'use strict';
/**
 * Confirms LUMEN mounts into visible .full-start-new__buttons, not only hidden .buttons--container.
 * Uses the same markup shape as lampa-source/src/templates/full/start_new.js
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var src = fs.readFileSync(path.join(__dirname, '..', 'engine.js'), 'utf8');

function makeEl(cls) {
    return {
        className: cls || '',
        children: [],
        parent: null,
        _handlers: {},
        on: function (ev, fn) { this._handlers[ev] = fn; return this; },
        after: function (node) {
            var p = this.parent;
            var i = p.children.indexOf(this);
            node.parent = p;
            p.children.splice(i + 1, 0, node);
            return this;
        },
        prepend: function (node) { node.parent = this; this.children.unshift(node); return this; },
        append: function (node) { node.parent = this; this.children.push(node); return this; },
        find: function () { return makeQuery([]); },
        first: function () { return this; },
        length: 1,
        attr: function () { return this.className; }
    };
}
function makeQuery(list) {
    var q = {
        length: list.length,
        list: list,
        first: function () { return list[0] ? Object.assign(list[0], { length: 1 }) : Object.assign(makeEl(''), { length: 0 }); },
        last: function () { return this.first(); },
        find: function (sel) {
            var out = [];
            function walk(node) {
                if (!node) return;
                if (sel.indexOf('.') === 0) {
                    var cls = sel.slice(1).split('.')[0];
                    if ((' ' + (node.className || '') + ' ').indexOf(' ' + cls + ' ') >= 0) out.push(node);
                }
                (node.children || []).forEach(walk);
            }
            list.forEach(walk);
            return makeQuery(out);
        },
        on: function () { return this; }
    };
    // allow treating query as element when length 1 for after/prepend used on first()
    return q;
}

// Minimal jQuery subset used by FullHook
var root = makeEl('activity');
var full = makeEl('full-start-new');
var visible = makeEl('full-start-new__buttons');
var play = makeEl('full-start__button selector button--play');
var menu = makeEl('hide buttons--container');
var torrent = makeEl('full-start__button view--torrent hide');
visible.parent = full; play.parent = visible; visible.children = [play];
menu.parent = full; torrent.parent = menu; menu.children = [torrent];
full.children = [visible, menu];
root.children = [full];

global.window = global;
global.document = { getElementById: function(){return null;}, createElement: function(){return {style:{}, appendChild:function(){}, setAttribute:function(){}};}, createTextNode:function(t){return {t:t};}, head:{appendChild:function(){}}, body:{appendChild:function(){}}, addEventListener:function(){} };
global.$ = function (arg) {
    if (typeof arg === 'string' && arg.charAt(0) === '<') {
        var el = makeEl('full-start__button selector button--lumen');
        // parse extra classes roughly
        var m = arg.match(/button--lumen[^"]*/);
        if (m) el.className = m[0].replace(/\s+/g, ' ').trim();
        el.length = 1;
        el.on = function (ev, fn) { el._handlers[ev] = fn; return el; };
        return el;
    }
    if (arg && arg.children) return makeQuery([arg]);
    return makeQuery([]);
};
global.Lampa = {
    Listener: { follow: function (n, fn) { global.__full = fn; }, send: function(){} },
    Lang: { add: function(){}, translate: function(k){ return k; } },
    SettingsApi: { addComponent: function(){}, addParam: function(){} },
    Component: { add: function(){} },
    Manifest: {},
    Storage: { field: function(){ return null; }, get: function(){ return ''; }, set: function(){} },
    Noty: { show: function(){} },
    Activity: { push: function(){} },
    Reguest: function(){},
    Scroll: function(){ this.render=function(){return $();}; },
    Player: { play: function(){}, playlist: function(){} },
    Select: { show: function(){} },
    Controller: { add: function(){}, toggle: function(){}, collectionSet: function(){}, collectionFocus: function(){} },
    TMDB: { image: function(p){ return p; } }
};
Object.defineProperty(global.Lampa.Manifest, 'plugins', { set: function(){}, get: function(){ return []; } });
global.window.appready = true;
global.window.Lampa = global.Lampa;

eval(src);
assert.ok(global.LUMEN, 'LUMEN defined');
assert.ok(global.LUMEN._inited, 'inited');

// Fire full:complite with our fixture
global.__full({
    type: 'complite',
    object: { activity: { render: function () { return makeQuery([root]); } } },
    data: { movie: { id: 7, title: 'Test', overview: 'O' } }
});

var all = [];
function walk(n){ if(!n) return; all.push(n); (n.children||[]).forEach(walk); }
walk(root);
var lumenBtns = all.filter(function(n){ return (n.className||'').indexOf('button--lumen') >= 0; });
assert.ok(lumenBtns.length >= 1, 'at least one LUMEN button');
var inVisible = lumenBtns.some(function(n){
    var p = n.parent;
    while (p) {
        if ((p.className||'').indexOf('full-start-new__buttons') >= 0) return true;
        p = p.parent;
    }
    return false;
});
assert.ok(inVisible, 'LUMEN button must be under .full-start-new__buttons (visible row)');
var onlyHidden = lumenBtns.every(function(n){
    var p = n.parent;
    while (p) {
        if ((p.className||'') === 'hide buttons--container' || (p.className||'').indexOf('buttons--container') >= 0 && (p.className||'').indexOf('hide') >= 0) {
            // if ALL are only in hidden — fail; allow extras in menu
            return true;
        }
        p = p.parent;
    }
    return false;
});
assert.ok(inVisible, 'visible placement required');
console.log('OK — button placement: visible row + count=' + lumenBtns.length);
