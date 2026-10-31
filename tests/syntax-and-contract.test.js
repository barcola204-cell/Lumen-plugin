'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var { execFileSync } = require('child_process');

var root = path.join(__dirname, '..');
var engine = path.join(root, 'engine.js');

execFileSync(process.execPath, [path.join(root, 'scripts/build.js')], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', engine], { stdio: 'inherit' });

var src = fs.readFileSync(engine, 'utf8');
assert.ok(src.indexOf('lumen_plugin_loaded') !== -1, 'anti-double-load');
assert.ok(src.indexOf('lumen-parser.onrender.com') === -1, 'no render scraper in v1');
assert.ok(/Lampa\./.test(src), 'Lampa. marker for extensions check');
assert.ok(src.indexOf('full-start-new__buttons') !== -1, 'visible button target');
assert.ok(src.indexOf('button--lumen-visible') !== -1, 'visible button class');
assert.ok(src.indexOf('buttons--container') !== -1, 'play-menu pool target');
assert.ok(src.indexOf('scheduleInit') !== -1, 'resilient boot');
assert.ok(src.indexOf('LUMEN ошибка init') !== -1 || src.indexOf('init error') !== -1, 'init try/catch noty');
assert.ok(!/this\.stop\s*=\s*function\s*\([^)]*\)\s*\{\s*this\.destroy/.test(src), 'stop must not call destroy');
assert.ok(src.indexOf('e.data.movie') !== -1, 'uses e.data.movie');
assert.ok(src.indexOf('backdrop-filter') === -1, 'no backdrop-filter');
assert.ok(src.indexOf('#e50914') === -1, 'no Netflix red');

var sample = JSON.parse(fs.readFileSync(path.join(root, 'examples/sample-provider.json'), 'utf8'));
assert.ok(Array.isArray(sample.items) && sample.items.length >= 1, 'sample items');

console.log('OK — syntax + contract checks passed');
