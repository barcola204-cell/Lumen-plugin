#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var src = path.join(root, 'src');

var files = [
    '00-banner.js',
    '01-boot-guard.js',
    '02-debug.js',
    '03-styles.js',
    '04-utils.js',
    '05-lang.js',
    '06-settings.js',
    'providers/registry.js',
    'providers/demo.js',
    'providers/custom.js',
    '07-playback.js',
    'components/sources.js',
    'components/episodes.js',
    '08-full-hook.js',
    '09-manifest.js',
    '10-init.js'
];

var out = [];
out.push('/* LUMEN v1 built ' + new Date().toISOString() + ' — do not edit engine.js by hand; edit src/ and run node scripts/build.js */');
files.forEach(function (f) {
    var p = path.join(src, f);
    if (!fs.existsSync(p)) {
        console.error('Missing', p);
        process.exit(1);
    }
    // skip examples/ and legacy
    out.push('\n/* ===== ' + f + ' ===== */\n');
    out.push(fs.readFileSync(p, 'utf8'));
});

var target = path.join(root, 'engine.js');
fs.writeFileSync(target, out.join('\n') + '\n');
console.log('Wrote', target, '(' + fs.statSync(target).size + ' bytes)');
