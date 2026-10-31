    // ===== Activity: lumen_episodes =====
    LUMEN.EpisodesComponent = function (object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div class="lumen-screen"></div>');
        var inited = false;
        var last = null;
        var movie = object.movie || null;
        var sourceItem = object.lumen_item || {};
        var focusKey = 'focus_eps_' + (movie && movie.id ? movie.id : 'x') + '_' + (sourceItem.season || '0');

        this.create = function () {
            inited = true;
            html.empty();
            html.append(scroll.render(true));
            this.build();
            return this.render();
        };

        this.render = function () {
            return html;
        };

        this.build = function () {
            var self = this;
            var list = sourceItem.playlist || [];
            scroll.clear();

            var head = $('<div class="lumen-hero"></div>');
            var poster = LUMEN.Utils.posterUrl(movie, 'w300');
            if (poster) head.append($('<img class="lumen-hero__poster" loading="lazy" alt="">').attr('src', poster));
            var meta = $('<div class="lumen-hero__meta"></div>');
            meta.append($('<div class="lumen-hero__title"></div>').text(sourceItem.title || LUMEN.Utils.movieTitle(movie)));
            meta.append($('<div class="lumen-hero__sub"></div>').text(LUMEN.t('lumen_episodes')));
            head.append(meta);
            html.prepend(head);

            scroll.append($('<div class="lumen-section-title"></div>').text(LUMEN.t('lumen_episodes')));

            if (!list.length) {
                scroll.append($('<div class="lumen-empty"><div class="lumen-empty__title">' + LUMEN.t('lumen_empty') + '</div></div>'));
                this.start();
                return;
            }

            var saved = LUMEN.Utils.loadFocus(focusKey);
            var i;
            for (i = 0; i < list.length; i++) {
                (function (ep, index) {
                    var el = $(
                        '<div class="lumen-card selector">'
                            + '<div class="lumen-card__body">'
                            + '<div class="lumen-card__title"></div>'
                            + '<div class="lumen-card__info"></div>'
                            + '</div>'
                            + '<div class="lumen-card__badge"></div>'
                            + '</div>'
                    );
                    el.find('.lumen-card__title').text(ep.title || (LUMEN.t('lumen_episode') + ' ' + (ep.episode || (index + 1))));
                    el.find('.lumen-card__info').text(
                        (ep.season ? (LUMEN.t('lumen_season') + ' ' + ep.season) : '')
                    );
                    el.find('.lumen-card__badge').text(ep.quality || '▶');
                    el.attr('data-lumen-index', String(index));

                    el.on('hover:focus', function (e) {
                        last = e.target;
                        LUMEN.Utils.saveFocus(focusKey, String(index));
                        try { scroll.update($(e.target), true); } catch (err) {}
                    });

                    el.on('hover:enter', function () {
                        // play from this episode with remaining playlist
                        var playlist = list.slice(index).map(function (p) {
                            return { title: p.title, url: p.url };
                        });
                        LUMEN.Playback.playItem({
                            title: ep.title,
                            url: ep.url,
                            playlist: playlist
                        }, movie);
                    });

                    scroll.append(el);
                    if (saved !== '' && String(index) === String(saved)) last = el[0];
                })(list[i], i);
            }

            this.start();
        };

        this.start = function () {
            if (!inited) return;
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
        this.stop = function () {};
        this.destroy = function () {
            inited = false;
            try { scroll.destroy(); } catch (e) {}
            try { html.remove(); } catch (e2) {}
            last = null;
        };
    };
