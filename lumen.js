(function () {
    'use strict';

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var btn = $('<div class="full-start__button selector button--lumen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

            btn.on('hover:enter', function () {
                var card = e.data.movie;
                var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || '';
                var imdb_id = card.imdb_id || '';
                var title = card.title || card.name || card.original_title || '';

                Lampa.Loading.start(function () { Lampa.Loading.stop(); });

                var requestWorker = function (params) {
                    var query = new URLSearchParams(params).toString();
                    var url = 'https://lumen-proxy.barcola204.workers.dev/?' + query;

                    fetch(url)
                        .then(function (res) { return res.json(); })
                        .then(function (data) {
                            Lampa.Loading.stop();
                            if (!data || !data.length) {
                                Lampa.Noty.show('Lumen: Потоки не найдены (пустой ответ)');
                                return;
                            }
                            
                            var items = data.map(function (item) {
                                return {
                                    title: (item.name || 'Источник') + (item.quality ? ' [' + item.quality + ']' : ''),
                                    url: item.url
                                };
                            });

                            Lampa.Select.show({
                                title: 'Lumen Engine',
                                items: items,
                                onSelect: function (selected) {
                                    Lampa.Platform.screen('player', { url: selected.url });
                                }
                            });
                        })
                        .catch(function (err) {
                            Lampa.Loading.stop();
                            Lampa.Noty.show('Lumen: Ошибка воркера ' + err.message);
                        });
                };

                // 1. Если есть KP ID или IMDb ID — шлем их
                if (kp_id || imdb_id) {
                    requestWorker({ kp: kp_id, imdb: imdb_id });
                } 
                // 2. Если ID нет — отправляем названиие фильма в воркер
                else if (title) {
                    Lampa.Noty.show('Поиск по названию: ' + title);
                    requestWorker({ title: title });
                } else {
                    Lampa.Loading.stop();
                    Lampa.Noty.show('Lumen: Не найдено данных о фильме');
                }
            });

            e.object.activity.render().find('.full-start__buttons').append(btn);
        }
    });
})();
