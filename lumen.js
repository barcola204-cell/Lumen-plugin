(function () {
    'use strict';

    var PLUGIN_NAME = 'Lumen Engine';
    var COMPONENT   = 'lumen_engine';
    var VERSION     = '1.3.0';

    var WORKER_URL  = 'https://lumen-proxy.barcola204.workers.dev';

    if (window.lumen_engine_loaded) return;
    window.lumen_engine_loaded = true;

    function extractMeta(card) {
        var dateStr = card.release_date || card.first_air_date || '';
        return {
            imdb_id: card.imdb_id || '',
            kp_id: card.kp_id || card.kinopoisk_id || '',
            title: card.title || card.name || 'Без названия',
            year: dateStr.length >= 4 ? dateStr.substring(0, 4) : ''
        };
    }

    function Component(object) {
        var network = new Lampa.Reguest();
        var files   = new Lampa.Files();
        var html    = $('<div></div>');
        var meta    = extractMeta(object.movie);

        this.create = function () {
            files.asList = true;
            this.search();
            html.append(files.render());
            return this.render();
        };

        this.search = function () {
            var _this = this;
            var results = [];
            var sources = ['alloha', 'collaps', 'kodik'];
            var pending = sources.length;

            if (!meta.imdb_id && !meta.kp_id) {
                _this.activity.loader(false);
                files.empty('Отсутствует ID фильма (IMDb / Кинопоиск)');
                return;
            }

            function checkDone() {
                pending--;
                if (pending <= 0) {
                    _this.activity.loader(false);
                    if (results.length > 0) {
                        _this.buildList(results);
                    } else {
                        files.empty('Ни в одном из источников поток не найден');
                    }
                }
            }

            sources.forEach(function (source) {
                var url = WORKER_URL + '?action=' + source + '&imdb=' + meta.imdb_id + '&kp=' + meta.kp_id;

                network.silent(url, function (res) {
                    try {
                        if (res && res.status === 'success' && res.data && res.data.iframe) {
                            results.push({
                                title: '[' + source.toUpperCase() + '] Плеер',
                                quality: 'HD / Auto',
                                url: res.data.iframe,
                                type: 'iframe'
                            });
                        }
                    } catch (e) {
                        console.log('LUMEN PARSE ERROR [' + source + ']:', e);
                    }
                    checkDone();
                }, function () {
                    checkDone();
                });
            });
        };

        this.buildList = function (items) {
            var _this = this;

            files.append(items, function (element, item) {
                element.on('hover:enter', function () {
                    _this.play(item);
                });
            });

            this.start();
        };

        this.play = function (item) {
            try {
                var iframeUrl = item.url.indexOf('http') === 0 ? item.url : 'https:' + item.url;
                
                if (Lampa.Platform.is('webos') || Lampa.Platform.is('tizen') || Lampa.Platform.is('android')) {
                    Lampa.Activity.push({
                        component: 'iframe',
                        url: iframeUrl,
                        title: meta.title
                    });
                } else {
                    window.open(iframeUrl, '_blank');
                }
            } catch (err) {
                Lampa.Noty.show('Ошибка запуска видеопотока');
            }
        };

        this.render = function () { return html; };

        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(files.render());
                    Lampa.Controller.move();
                },
                back: function () { Lampa.Activity.back(); }
            });
            Lampa.Controller.toggle('content');
        };

        this.destroy = function () {
            network.clear();
            files.destroy();
            html.remove();
        };
    }

    Lampa.Component.add(COMPONENT, Component);

    function addButton() {
        try {
            var activity = Lampa.Activity.active();
            if (!activity || activity.component !== 'full') return;

            var render = activity.activity && activity.activity.render 
                ? activity.activity.render() 
                : $('.full').last();

            if (!render || !render.length || render.find('.lumen-btn').length) return;

            var buttons = render.find('.full-start__button');
            if (!buttons.length) return;

            var btn = $(
                '<div class="full-start__button selector lumen-btn">' +
                    '<span>' + PLUGIN_NAME + '</span>' +
                '</div>'
            );

            btn.on('hover:enter', function () {
                var currentActivity = Lampa.Activity.active();
                Lampa.Activity.push({
                    title: PLUGIN_NAME,
                    component: COMPONENT,
                    movie: currentActivity.card || currentActivity.movie
                });
            });

            buttons.last().after(btn);
        } catch (e) {
            console.log('LUMEN BUTTON ERROR:', e);
        }
    }

    if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('full', function () {
            setTimeout(addButton, 200);
            setTimeout(addButton, 800);
        });
    }

    console.log('LUMEN ENGINE ' + VERSION + ' STABLE LOADED');
})();
