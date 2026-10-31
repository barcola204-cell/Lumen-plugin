    // ===== Manifest context menu =====
    LUMEN.registerManifest = function () {
        try {
            Lampa.Manifest.plugins = {
                type: 'video',
                version: LUMEN.VERSION,
                name: 'LUMEN',
                description: 'LUMEN v1 — user-authorized sources',
                onContextMenu: function () {
                    return { title: LUMEN.t('lumen_button') };
                },
                onContextLauch: function (card) {
                    if (!card) return;
                    Lampa.Activity.push({
                        url: '',
                        title: LUMEN.t('lumen_sources'),
                        component: LUMEN.COMPONENT_SOURCES,
                        movie: card,
                        search: LUMEN.Utils.movieTitle(card),
                        search_one: LUMEN.Utils.movieTitle(card),
                        search_two: LUMEN.Utils.movieOriginal(card),
                        page: 1
                    });
                }
            };
        } catch (e) {
            LUMEN.Debug.warn('Manifest.plugins: ' + e);
        }
    };
