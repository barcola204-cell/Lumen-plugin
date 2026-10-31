    // ===== Full-card button (only full:complite + e.data.movie) =====
    LUMEN.FullHook = {
        addButton: function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity || !e.data || !e.data.movie) {
                    LUMEN.Debug.warn('full:complite without movie');
                    return;
                }

                var render = e.object.activity.render();
                if (!render || !render.length) return;
                if (render.find('.button--lumen').length) return;

                var movie = e.data.movie;
                var btn = $(
                    '<div class="full-start__button selector button--lumen">'
                        + '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
                        + '<span>' + LUMEN.t('lumen_button') + '</span>'
                        + '</div>'
                );

                btn.on('hover:enter', function () {
                    // Always push a copy of movie on activity params (survives stop/start)
                    var card = movie;
                    if (!card) {
                        Lampa.Noty.show(LUMEN.t('lumen_no_movie'));
                        return;
                    }
                    LUMEN.Debug.log('push sources for ' + LUMEN.Utils.movieTitle(card) + ' #' + card.id);
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
                });

                var anchor = render.find('.view--torrent').first();
                if (anchor.length) {
                    anchor.after(btn);
                } else {
                    var buttons = render.find('.full-start__buttons, .full-start-new__buttons').first();
                    if (buttons.length) buttons.prepend(btn);
                    else {
                        var anyBtn = render.find('.full-start__button').last();
                        if (anyBtn.length) anyBtn.after(btn);
                        else {
                            LUMEN.Debug.warn('no button container to append LUMEN');
                            return;
                        }
                    }
                }
                LUMEN.Debug.log('LUMEN button attached');
            } catch (err) {
                LUMEN.Debug.error('addButton: ' + (err && err.message ? err.message : err));
            }
        },

        install: function () {
            Lampa.Listener.follow('full', function (e) {
                // Do NOT listen to 'build' — movie payload may be incomplete (bug #1 hypothesis)
                if (e.type === 'complite') LUMEN.FullHook.addButton(e);
            });
        }
    };
