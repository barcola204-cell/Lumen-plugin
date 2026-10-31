    // ===== Full-card button (only full:complite + e.data.movie) =====
    // Latest Lampa (full_start_new): .view--torrent lives inside .hide.buttons--container.
    // Online-style insert after torrent = invisible on the card. Put a visible button into
    // .full-start-new__buttons, and also register in buttons--container for Play menu.
    LUMEN.FullHook = {
        openSources: function (movie) {
            if (!movie) {
                Lampa.Noty.show(LUMEN.t('lumen_no_movie'));
                return;
            }
            LUMEN.Debug.log('push sources for ' + LUMEN.Utils.movieTitle(movie) + ' #' + movie.id);
            Lampa.Activity.push({
                url: '',
                title: LUMEN.t('lumen_sources'),
                component: LUMEN.COMPONENT_SOURCES,
                movie: movie,
                search: LUMEN.Utils.movieTitle(movie),
                search_one: LUMEN.Utils.movieTitle(movie),
                search_two: LUMEN.Utils.movieOriginal(movie),
                page: 1
            });
        },

        makeButton: function (movie, extraClass) {
            var btn = $(
                '<div class="full-start__button selector button--lumen ' + (extraClass || '') + '">'
                    + '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
                    + '<span>' + LUMEN.t('lumen_button') + '</span>'
                    + '</div>'
            );
            btn.on('hover:enter', function () {
                LUMEN.FullHook.openSources(movie);
            });
            return btn;
        },

        addButton: function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity || !e.data || !e.data.movie) {
                    LUMEN.Debug.warn('full:complite without movie');
                    return;
                }

                var render = e.object.activity.render();
                if (!render || !render.length) return;

                // Already mounted (visible or menu)
                if (render.find('.button--lumen').length) return;

                var movie = e.data.movie;
                var mounted = false;

                // 1) VISIBLE row on current full card
                var visible = render.find('.full-start-new__buttons').first();
                if (!visible.length) visible = render.find('.full-start__buttons').first();
                if (visible.length) {
                    var play = visible.find('.button--play').first();
                    var visBtn = LUMEN.FullHook.makeButton(movie, 'button--lumen-visible');
                    if (play.length) play.after(visBtn);
                    else visible.prepend(visBtn);
                    mounted = true;
                }

                // 2) Play-menu pool (.buttons--container) — same contract as plugins/online
                var menuBox = render.find('.buttons--container').first();
                if (menuBox.length) {
                    var menuBtn = LUMEN.FullHook.makeButton(movie, 'button--lumen-menu');
                    var torrent = menuBox.find('.view--torrent').first();
                    if (torrent.length) torrent.after(menuBtn);
                    else menuBox.append(menuBtn);
                    mounted = true;
                }

                if (!mounted) {
                    var anyBtn = render.find('.full-start__button').last();
                    if (anyBtn.length) {
                        anyBtn.after(LUMEN.FullHook.makeButton(movie, 'button--lumen-visible'));
                        mounted = true;
                    }
                }

                if (!mounted) {
                    LUMEN.Debug.warn('no button container to append LUMEN');
                    return;
                }
                LUMEN.Debug.log('LUMEN button attached (visible+menu)');
            } catch (err) {
                LUMEN.Debug.error('addButton: ' + (err && err.message ? err.message : err));
            }
        },

        install: function () {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') LUMEN.FullHook.addButton(e);
            });
        }
    };
