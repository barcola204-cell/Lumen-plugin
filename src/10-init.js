    // ===== Init =====
    LUMEN.init = function () {
        LUMEN.injectStyles();
        LUMEN.registerLang();
        LUMEN.Debug.install();
        LUMEN.registerSettings();
        LUMEN.registerManifest();

        Lampa.Component.add(LUMEN.COMPONENT_SOURCES, LUMEN.SourcesComponent);
        Lampa.Component.add(LUMEN.COMPONENT_EPISODES, LUMEN.EpisodesComponent);

        LUMEN.FullHook.install();
        LUMEN.Debug.log('init complete v' + LUMEN.VERSION);
        try {
            Lampa.Noty.show('LUMEN ' + LUMEN.VERSION + ' готов', { time: 2000 });
        } catch (e) {}
    };

    if (window.appready) LUMEN.init();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') LUMEN.init();
        });
    }
})();
