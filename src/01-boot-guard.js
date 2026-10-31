(function () {
    'use strict';

    // Marker string required by Lampa extensions check: /Lampa\./ must match file body.
    // Lampa.Plugins / Lampa.Activity / Lampa.Player are used below.

    if (window.lumen_plugin_loaded) return;
    window.lumen_plugin_loaded = true;

    try {

    var LUMEN = {
        VERSION: '1.0.1-v1',
        COMPONENT_SOURCES: 'lumen_sources',
        COMPONENT_EPISODES: 'lumen_episodes',
        STORAGE_PREFIX: 'lumen_',
        _inited: false,
        log: function () {}
    };

    window.LUMEN = LUMEN;
