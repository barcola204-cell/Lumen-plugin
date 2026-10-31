    // ===== Activity: lumen_sources =====
    // Contract: constructor MUST NOT return DOM. create()+render() required. stop ≠ destroy.
    LUMEN.SourcesComponent = function (object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div class="lumen-screen"></div>');
        var inited = false;
        var last = null;
        var movie = object.movie || null;
        var focusKey = 'focus_sources_' + (movie && movie.id ? movie.id : 'x');

        this.create = function () {
            inited = true;
            html.empty();
            html.append(scroll.render(true));
            this.drawHero();
            this.showLoading();
            this.load();
            return this.render();
        };

        this.render = function (add_class) {
            // ActivitySlide may call render(true)
            return html;
        };

        this.drawHero = function () {
            var poster = LUMEN.Utils.posterUrl(movie, 'w300');
            var title = LUMEN.Utils.movieTitle(movie) || 'LUMEN';
            var year = LUMEN.Utils.movieYear(movie);
            var overview = (movie && movie.overview) ? movie.overview : '';
            var hero = $('<div class="lumen-hero"></div>');

            if (poster) {
                hero.append($('<img class="lumen-hero__poster" loading="lazy" alt="">').attr('src', poster));
            } else {
                hero.append($('<div class="lumen-hero__poster lumen-hero__poster--empty">LUMEN</div>'));
            }

            var meta = $('<div class="lumen-hero__meta"></div>');
            meta.append($('<div class="lumen-hero__title"></div>').text(title));
            meta.append($('<div class="lumen-hero__sub"></div>').text(
                (year ? year + ' · ' : '') + (LUMEN.Utils.isTv(movie) ? 'TV' : 'Movie')
                + (movie && movie.id ? ' · TMDB ' + movie.id : '')
            ));
            if (overview) meta.append($('<div class="lumen-hero__overview"></div>').text(overview));
            hero.append(meta);

            // hero sits above scroll content via prepend to html
            html.prepend(hero);
            object._lumen_title = title;
            object._lumen_overview = overview;
            LUMEN.Debug.log('sources hero: ' + title + ' id=' + (movie && movie.id));
        };

        this.showLoading = function () {
            scroll.clear();
            scroll.append(
                $('<div class="lumen-loading">'
                    + '<div class="lumen-loading__title">' + LUMEN.t('lumen_loading') + '</div>'
                    + '<div class="lumen-loading__text">' + (object._lumen_title || '') + '</div>'
                    + '</div>')
            );
        };

        this.showEmpty = function (hint) {
            if (!inited) return;
            scroll.clear();
            scroll.append(
                $('<div class="lumen-empty">'
                    + '<div class="lumen-empty__title">' + LUMEN.t('lumen_empty') + '</div>'
                    + '<div class="lumen-empty__text">' + (hint || LUMEN.t('lumen_empty_hint')) + '</div>'
                    + '</div>')
            );
            this.start();
        };

        this.load = function () {
            var self = this;
            if (!movie) {
                this.showEmpty(LUMEN.t('lumen_no_movie'));
                return;
            }
            LUMEN.Providers.searchAll(movie, network, function (err, items) {
                if (!inited) return;
                if (err) LUMEN.Debug.warn('searchAll: ' + err);
                if (!items || !items.length) {
                    self.showEmpty(err ? String(err) : LUMEN.t('lumen_empty_hint'));
                    return;
                }
                self.buildList(items);
            });
        };

        this.buildList = function (items) {
            var self = this;
            scroll.clear();
            scroll.append($('<div class="lumen-section-title"></div>').text(LUMEN.t('lumen_sources')));

            var saved = LUMEN.Utils.loadFocus(focusKey);
            var i;
            for (i = 0; i < items.length; i++) {
                (function (item, index) {
                    var el = $(
                        '<div class="lumen-card selector">'
                            + '<div class="lumen-card__body">'
                            + '<div class="lumen-card__title"></div>'
                            + '<div class="lumen-card__info"></div>'
                            + '</div>'
                            + '<div class="lumen-card__badge"></div>'
                            + '</div>'
                    );
                    el.find('.lumen-card__title').text(item.title || 'Source');
                    el.find('.lumen-card__info').text(
                        [item.providerTitle || item.provider || '', item.voice || '', item.subtitle || '']
                            .filter(Boolean).join(' · ')
                    );
                    el.find('.lumen-card__badge').text(item.quality || item.kind || 'OK');
                    el.attr('data-lumen-index', String(index));

                    el.on('hover:focus', function (e) {
                        last = e.target;
                        LUMEN.Utils.saveFocus(focusKey, String(index));
                        try { scroll.update($(e.target), true); } catch (err) {}
                    });

                    el.on('hover:enter', function () {
                        self.onSelect(item);
                    });

                    scroll.append(el);
                    if (saved !== '' && String(index) === String(saved)) last = el[0];
                })(items[i], i);
            }

            this.start();
        };

        this.onSelect = function (item) {
            var self = this;
            var card = movie;

            // Series from Jellyfin-like adapters (future) or season playlist
            if (item.resolveEpisodes && item.meta && LUMEN.Jellyfin && item.provider === 'jellyfin') {
                // not in v1 build — fallback
            }

            if (item.kind === 'series' || (item.resolveEpisodes && item.meta)) {
                Lampa.Noty.show('Серии: подключите adapter или playlist в Custom JSON');
                return;
            }

            if (item.playlist && item.playlist.length && (item.kind === 'season' || LUMEN.Utils.isTv(card))) {
                Lampa.Activity.push({
                    url: '',
                    title: LUMEN.t('lumen_episodes'),
                    component: LUMEN.COMPONENT_EPISODES,
                    movie: card,
                    lumen_item: item,
                    page: 1
                });
                return;
            }

            if (item.qualityMap) {
                LUMEN.Playback.chooseQualityThenPlay(item, card, function () {
                    Lampa.Controller.toggle('content');
                });
                return;
            }

            LUMEN.Playback.playItem(item, card);
        };

        this.start = function () {
            if (!inited) return;
            var self = this;
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {
            // IMPORTANT: do NOT destroy here — activity stays in stack (bugfix)
        };

        this.destroy = function () {
            inited = false;
            try { network.clear(); } catch (e) {}
            try { scroll.destroy(); } catch (e2) {}
            try { html.remove(); } catch (e3) {}
            last = null;
            LUMEN.Debug.log('sources destroy');
        };
    };
