(function () {
    'use strict';

    function addLumenButton(render, movieData) {
        if (!render || render.find('.button--lumen').length) return;

        var btn = $('<div class="full-start__button selector button--lumen" style="background: rgba(255,255,255,0.1); margin-left: 10px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

        btn.on('hover:enter click', function () {
            var card = movieData || {};
            var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || '';
            var title = card.title || card.name || card.original_title || '';

            Lampa.Noty.show('Lumen: Поиск источников...');

            var params = new URLSearchParams();
            if (kp_id) params.append('kp', kp_id);
            if (title) params.append('title', title);

            fetch('https://lumen-proxy.barcola204.workers.dev/?' + params.toString())
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (!data || !Array.isArray(data) || data.length === 0) {
                        Lampa.Noty.show('Lumen: Источники не найдены');
                        return;
                    }

                    Lampa.Select.show({
                        title: 'Lumen Engine',
                        items: data.map(function (item) {
                            return {
                                title: item.name || 'Смотреть',
                                subtitle: item.quality || 'Auto',
                                url: item.url
                            };
                        }),
                        onSelect: function (element) {
                            if (element && element.url) {
                                Lampa.Platform.screen('player', {
                                    url: element.url,
                                    title: title
                                });
                            }
                        },
                        onBack: function () {
                            Lampa.Controller.toggle('full_start');
                        }
                    });
                })
                .catch(function (err) {
                    Lampa.Noty.show('Lumen: Ошибка ' + err.message);
                });
        });

        // Пробуем вставить кнопку в разные возможные контейнеры Lampa
        var target = render.find('.full-start__buttons, .full-start-new__buttons, .buttons').first();
        if (target.length) {
            target.append(btn);
        } else {
            render.find('.selector').last().after(btn);
        }
    }

    function init() {
        // Уведомление при успешном старте плагина
        setTimeout(function() {
            if (window.Lampa && Lampa.Noty) {
                Lampa.Noty.show('Lumen Plugin Loaded!');
            }
        }, 1000);

        // Слушатель событий открытой карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' || e.type === 'build') {
                var render = e.object.activity.render();
                var movieData = e.data.movie;
                addLumenButton(render, movieData);
            }
        });
    }

    if (window.appready) init();
    else if (window.Lampa) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
