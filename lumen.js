(function () {
    'use strict';

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var btn = $('<div class="full-start__button selector button--lumen"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

            btn.on('hover:enter', function () {
                var card = e.data.movie;
                var kp_id = card.kinopoisk_id || '';
                var imdb_id = card.imdb_id || '';
                var title = card.title || card.name || '';
                var year = (card.release_date || card.first_air_date || '').slice(0, 4);

                Lampa.Loading.start(function () { Lampa.Loading.stop(); });

                // Функция отправки запроса к воркеру
                var sendQuery = function (kp, imdb) {
                    var url = 'https://lumen-proxy.barcola204.workers.dev/?kp=' + kp + '&imdb=' + imdb;

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
                };

                // Если KP ID нет, пробуем автопоиск по Kinopoisk Unofficial API
                if (!kp_id) {
                    var searchUrl = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(title);
                    
                    fetch(searchUrl, {
                        headers: { 'X-API-KEY': '2b910f3c-843e-46cf-9d7a-117565b90f42' }
                    })
                    .then(function (res) { return res.json(); })
                    .then(function (searchData) {
                        if (searchData && searchData.films && searchData.films.length) {
                            kp_id = searchData.films[0].filmId;
                        }
                        sendQuery(kp_id, imdb_id);
                    })
                    .catch(function () {
                        sendQuery(kp_id, imdb_id);
                    });
                } else {
                    sendQuery(kp_id, imdb_id);
                }
            });

            e.object.activity.render().find('.full-start__buttons').append(btn);
        }
    });
})();
