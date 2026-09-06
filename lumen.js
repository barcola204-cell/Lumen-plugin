(function () {
    'use strict';

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var btn = $('<div class="full-start__button selector button--lumen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

            btn.on('hover:enter', function () {
                var card = e.data.movie;
                var kp_id = card.kinopoisk_id || '';
                var imdb_id = card.imdb_id || '';

                if (!kp_id && !imdb_id) {
                    Lampa.Noty.show('У этого фильма нет ID Кинопоиск / IMDb');
                    return;
                }

                Lampa.Loading.start(function () {
                    Lampa.Loading.stop();
                });

                var url = 'https://lumen-proxy.barcola204.workers.dev/?kp=' + kp_id + '&imdb=' + imdb_id;

                fetch(url)
                    .then(function (res) { return res.json(); })
                    .then(function (data) {
                        Lampa.Loading.stop();
                        if (!data || !data.length) {
                            Lampa.Noty.show('Источники не найдены');
                            return;
                        }
                        
                        var items = data.map(function (item) {
                            return {
                                title: item.name || 'Источник',
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
                    .catch(function () {
                        Lampa.Loading.stop();
                        Lampa.Noty.show('Ошибка подключения к воркеру');
                    });
            });

            e.object.activity.render().find('.full-start__buttons').append(btn);
        }
    });
})();
