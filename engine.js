(function () {
    'use strict';

    function createLumenButton(render, movieData) {
        if (!render || render.find('.button--lumen').length) return;

        var btn = $('<div class="full-start__button selector button--lumen" style="display: inline-flex !important; align-items: center; justify-content: center; background: #e50914 !important; color: #fff !important; padding: 10px 15px; border-radius: 8px; margin: 5px; cursor: pointer; font-weight: bold;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

        btn.on('click hover:enter', function () {
            var card = movieData || {};
            var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || '';
            var title = card.title || card.name || card.original_title || 'Фильм';

            Lampa.Noty.show('Lumen: Поиск источников...');

            var params = new URLSearchParams();
            if (kp_id) params.append('kp', kp_id);
            if (title) params.append('title', title);

            fetch('https://lumen-proxy.barcola204.workers.dev/?' + params.toString())
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (!data || !Array.isArray(data) || data.length === 0) {
                        Lampa.Noty.show('Lumen: Потоки не найдены');
                        return;
                    }

                    Lampa.Select.show({
                        title: 'Lumen Engine',
                        items: data.map(function (item) {
                            return {
                                title: item.name || item.title || 'Смотреть поток',
                                subtitle: item.quality || 'Auto',
                                url: item.url || item.stream || item.file
                            };
                        }),
                        onSelect: function (element) {
                            if (element && element.url) {
                                // Прямой запуск встроенного плеера Lampa
                                var playlist = [{
                                    title: title,
                                    url: element.url
                                }];
                                
                                Lampa.Player.play({
                                    title: title,
                                    url: element.url,
                                    timeline: card.timeline || {},
                                    playlist: playlist
                                });
                                Lampa.Player.playlist(playlist);
                            } else {
                                Lampa.Noty.show('Lumen: Ссылка на видео отсутствует');
                            }
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('full_start');
                        }
                    });
                })
                .catch(function (err) {
                    Lampa.Noty.show('Lumen: Ошибка (' + err.message + ')');
                });
        });

        var container = render.find('.full-start__buttons, .full-start-new__buttons, .buttons').first();
        if (container.length) {
            container.prepend(btn);
        } else {
            render.append(btn);
        }
    }

    function init() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' || e.type === 'build') {
                var render = e.object.activity.render();
                var movieData = e.data.movie;
                createLumenButton(render, movieData);
            }
        });
    }

    if (window.appready) init();
    else if (window.Lampa) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
