    // ===== Init + resilient boot =====
    LUMEN.init = function () {
        if (LUMEN._inited) return;
        try {
            LUMEN.injectStyles();
            LUMEN.registerLang();
            LUMEN.Debug.install();
            LUMEN.registerSettings();
            LUMEN.registerManifest();

            Lampa.Component.add(LUMEN.COMPONENT_SOURCES, LUMEN.SourcesComponent);
            Lampa.Component.add(LUMEN.COMPONENT_EPISODES, LUMEN.EpisodesComponent);

            LUMEN.FullHook.install();
            LUMEN._inited = true;
            LUMEN.Debug.log('init complete v' + LUMEN.VERSION);
            try {
                Lampa.Noty.show('LUMEN ' + LUMEN.VERSION + ' готов', { time: 2500 });
            } catch (e0) {}
        } catch (err) {
            LUMEN._inited = false;
            var msg = (err && err.message) ? err.message : String(err);
            try { console.log('LUMEN init error', err); } catch (e1) {}
            try { if (LUMEN.Debug) LUMEN.Debug.error('init: ' + msg); } catch (e2) {}
            try {
                if (window.Lampa && Lampa.Noty) {
                    Lampa.Noty.show('LUMEN ошибка init: ' + msg, { time: 8000 });
                }
            } catch (e3) {}
        }
    };

    LUMEN.scheduleInit = function () {
        try {
            if (!window.Lampa) {
                var waits = 0;
                var waitLampa = setInterval(function () {
                    waits += 1;
                    if (window.Lampa) {
                        clearInterval(waitLampa);
                        LUMEN.scheduleInit();
                    } else if (waits > 60) {
                        clearInterval(waitLampa);
                    }
                }, 500);
                return;
            }

            if (window.appready) {
                LUMEN.init();
                return;
            }

            if (Lampa.Listener && Lampa.Listener.follow) {
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'ready') LUMEN.init();
                });
            }

            // Fallback: Plugins.load often runs before appready; cover missed ready event.
            var ticks = 0;
            var timer = setInterval(function () {
                ticks += 1;
                if (LUMEN._inited) {
                    clearInterval(timer);
                    return;
                }
                if (window.appready) {
                    clearInterval(timer);
                    LUMEN.init();
                } else if (ticks > 40) {
                    clearInterval(timer);
                    if (Lampa.Component && Lampa.Listener) LUMEN.init();
                }
            }, 500);
        } catch (err) {
            var msg = (err && err.message) ? err.message : String(err);
            try { console.log('LUMEN boot error', err); } catch (e1) {}
            try {
                if (window.Lampa && Lampa.Noty) {
                    Lampa.Noty.show('LUMEN ошибка boot: ' + msg, { time: 8000 });
                }
            } catch (e2) {}
        }
    };

    LUMEN.scheduleInit();

    } catch (fatal) {
        window.lumen_plugin_loaded = false;
        try { console.log('LUMEN fatal', fatal); } catch (e1) {}
        try {
            if (window.Lampa && Lampa.Noty) {
                Lampa.Noty.show('LUMEN fatal: ' + (fatal && fatal.message ? fatal.message : fatal), { time: 8000 });
            }
        } catch (e2) {}
    }
})();
