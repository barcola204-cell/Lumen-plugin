(function () {
    'use strict';

    Lampa.Component.add('lumen_engine', function (object) {
        var comp = this;
        var card = object.card;
        
        this.create = function () {
            return this.render();
        };

        this.start = function () {
            var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || '';
            var imdb_id = card.imdb_id || '';
            
            var url = 'https://lumen-proxy.barcola204.workers.dev/?kp=' + kp_id + '&imdb=' + imdb_id;

            Lampa.Select.show({
                title: 'Lumen Engine',
                items: [{ title: 'Загрузка источников...', spinner: true }],
                onSelect: function () {}
            });

            fetch(url)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (!data || !data.length) {
                        Lampa.Noty.show('Источники не найдены');
                        return;
                    }
                    var items = data.map(function (item) {
                        return {
                            title: item.name + ' (' + item.quality + ')',
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
                    Lampa.Noty.show('Ошибка загрузки');
                });
        };
    });
})();
