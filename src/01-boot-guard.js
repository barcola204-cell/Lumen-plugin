(function () {
    'use strict';

    if (window.lumen_plugin_loaded) return;
    window.lumen_plugin_loaded = true;

    var LUMEN = {
        VERSION: '1.0.0-v1',
        COMPONENT_SOURCES: 'lumen_sources',
        COMPONENT_EPISODES: 'lumen_episodes',
        STORAGE_PREFIX: 'lumen_',
        log: function () {}
    };

    window.LUMEN = LUMEN;
