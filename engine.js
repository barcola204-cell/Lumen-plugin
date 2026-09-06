(function () {
    'use strict';

    function startLumen() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                
                // Проверка: если кнопка уже есть, не создаем дубликат
                if (render.find('.button--lumen').length) return;

                var btn = $('<div class="full-start__button selector button--lumen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

                btn.on('hover:enter', function () {
                    var card = e.data.movie;
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
                                Lampa.Noty.show('Lumen: Потоки не найдены');
                                return;
                            }

                            Lampa.Select.show({
                                title: 'Lumen Engine',
                                items: data.map(function(item) {
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
                            Lampa.Noty.show('Lumen: Ошибка сети (' + err.message + ')');
                        });
                });

                render.find('.full-start__buttons').append(btn);
            }
        });
    }

    if (window.appready) startLumen();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startLumen(); });
})();
