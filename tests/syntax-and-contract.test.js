'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var { execFileSync } = require('child_process');

var root = path.join(__dirname, '..');
var engine = path.join(root, 'engine.js');

execFileSync(process.execPath, ['--check', engine], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', path.join(root, 'scripts/build.js')], { stdio: 'inherit' });

var src = fs.readFileSync(engine, 'utf8');
assert.ok(src.indexOf('lumen_plugin_loaded') !== -1, 'anti-double-load');
assert.ok(src.indexOf('lumen-parser.onrender.com') === -1, 'no render scraper in v1');
assert.ok(src.indexOf('legacy/engine.scraper') === -1, 'legacy not referenced');
assert.ok(src.indexOf('COMPONENT_SOURCES') !== -1 || src.indexOf('lumen_sources') !== -1, 'sources component');
assert.ok(src.indexOf('this.stop = function') !== -1, 'stop exists');
assert.ok(!/this\.stop\s*=\s*function\s*\([^)]*\)\s*\{\s*this\.destroy/.test(src), 'stop must not call destroy');
assert.ok(src.indexOf("e.type === 'complite'") !== -1 || src.indexOf('e.type !== \'complite\'') !== -1, 'complite only');
assert.ok(src.indexOf('e.data.movie') !== -1, 'uses e.data.movie');
assert.ok(src.indexOf('LUMEN.Providers') !== -1, 'provider registry');
assert.ok(src.indexOf('lumen_custom_url') !== -1, 'custom url setting');
assert.ok(src.indexOf('lumen_debug_overlay') !== -1, 'debug overlay setting');
assert.ok(src.indexOf('backdrop-filter') === -1, 'no backdrop-filter');
assert.ok(src.indexOf('#e50914') === -1, 'no Netflix red');

var sample = JSON.parse(fs.readFileSync(path.join(root, 'examples/sample-provider.json'), 'utf8'));
assert.ok(Array.isArray(sample.items) && sample.items.length >= 1, 'sample items');
sample.items.forEach(function (it) {
    assert.ok(it.title, 'item title');
    assert.ok(it.url || (it.playlist && it.playlist.length) || it.qualityMap, 'playable fields');
});

console.log('OK — syntax + contract checks passed');
