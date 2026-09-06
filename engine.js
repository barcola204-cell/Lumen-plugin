(function () {
    'use strict';

    function createLumenButton(render, movieData) {
        if (!render || render.find('.button--lumen').length) return;

        var btn = $('<div class="full-start__button selector button--lumen" style="display: inline-flex !important; align-items: center; justify-content: center; background: #e50914 !important; color: #fff !important; padding: 10px 15px; border-radius: 8px; margin: 5px; cursor: pointer; font-weight: bold;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

        btn.on('click hover:enter', function () {
            var card = movieData || {};
            var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || card.kp_id || (card.ids && card.ids.kp) || '';
            var title = card.title || card.name || card.original_title || card.original_name || '';

            if (!kp_id && !title) {
                Lampa.Noty.show('Lumen: Не удалось определить фильм');
                return;
            }

            Lampa.Noty.show('Lumen: Запуск...');

            var params = new URLSearchParams();
            if (kp_id) params.append('kp', kp_id);
            if (title) params.append('title', title);

            fetch('https://lumen-proxy.barcola204.workers.dev/?' + params.toString())
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (!data || !Array.isArray(data) || data.length === 0) {
                        Lampa.Noty.show('Lumen: Источник не найден');
                        return;
                    }

                    var stream = data[0];
                    if (stream && stream.url) {
                        // Открытие плеера через встроенный iframe Lampa
                        Lampa.Activity.push({
                            url: stream.url,
                            title: title,
                            component: 'iframe',
                            page: 1
                        });
                    }
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
