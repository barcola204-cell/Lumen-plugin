(function () {
    'use strict';

    var PLUGIN_NAME = 'Lumen';
    var COMPONENT = 'lumen';
    var VERSION = '0.0.5';

    if (window.lumen_plugin_loaded) return;
    window.lumen_plugin_loaded = true;

    // =========================
    // COMPONENT
    // =========================

    function component(object) {

        var container = document.createElement('div');

        container.style.padding = '2em';
        container.style.color = '#fff';
        container.style.height = '80vh';
        container.style.overflow = 'auto';

        var movie = object && object.movie;

        // -------------------------
        // Заголовок
        // -------------------------

        var title = document.createElement('div');

        title.textContent =
            movie && movie.title
                ? movie.title
                : 'Неизвестный фильм';

        title.style.fontSize = '2em';
        title.style.fontWeight = '600';
        title.style.marginBottom = '1.5em';

        container.appendChild(title);

        // -------------------------
        // Информация
        // -------------------------

        var info = document.createElement('div');

        info.style.fontSize = '1.15em';
        info.style.lineHeight = '1.8';

        if (!movie) {

            info.textContent =
                'Ошибка: Lampa не передала данные фильма.';

            container.appendChild(info);

            return container;
        }

        var type =
            movie.type === 'tv'
                ? 'Сериал'
                : movie.type === 'movie'
                    ? 'Фильм'
                    : (movie.type || 'Неизвестно');

        var tmdb =
            movie.id !== undefined
                ? movie.id
                : 'нет';

        var imdb =
            movie.imdb_id
                ? movie.imdb_id
                : 'нет';

        var tvdb =
            movie.external_ids &&
            movie.external_ids.tvdb_id
                ? movie.external_ids.tvdb_id
                : 'нет';

        var seasons =
            movie.number_of_seasons !== undefined
                ? movie.number_of_seasons
                : 'нет';

        var episodes =
            movie.number_of_episodes !== undefined
                ? movie.number_of_episodes
                : 'нет';

        info.innerHTML =
            '<div><b>Тип:</b> ' + type + '</div>' +
            '<div><b>TMDB ID:</b> ' + tmdb + '</div>' +
            '<div><b>IMDb ID:</b> ' + imdb + '</div>' +
            '<div><b>TVDB ID:</b> ' + tvdb + '</div>' +
            '<div><b>Сезонов:</b> ' + seasons + '</div>' +
            '<div><b>Эпизодов:</b> ' + episodes + '</div>';

        container.appendChild(info);

        // -------------------------
        // Разделитель
        // -------------------------

        var separator = document.createElement('div');

        separator.style.margin = '2em 0';
        separator.style.height = '1px';
        separator.style.background = 'rgba(255,255,255,0.15)';

        container.appendChild(separator);

        // -------------------------
        // Кнопка проверки
        // -------------------------

        var button = document.createElement('div');

        button.className = 'selector';

        button.style.display = 'inline-block';
        button.style.padding = '1em 2em';
        button.style.background = 'rgba(255,255,255,0.12)';
        button.style.borderRadius = '10px';
        button.style.fontSize = '1.1em';

        button.textContent = 'Проверить источник';

        button.addEventListener('click', function () {

            Lampa.Noty.show(
                'Данные получены. Источник пока не подключён.'
            );

            console.log('LUMEN SOURCE TEST');
            console.log('TITLE:', movie.title);
            console.log('TMDB:', movie.id);
            console.log('IMDB:', movie.imdb_id);
            console.log('TYPE:', movie.type);

        });

        container.appendChild(button);

        return container;
    }

    Lampa.Component.add(COMPONENT, component);

    // =========================
    // КНОПКА НА СТРАНИЦЕ ФИЛЬМА
    // =========================

    function addButton() {

        try {

            var activity = Lampa.Activity.active();

            if (!activity) return;

            if (activity.component !== 'full') return;

            var render =
                activity.activity &&
                activity.activity.render
                    ? activity.activity.render()
                    : $('.full').last();

            if (!render || !render.length) return;

            if (render.find('.lumen-btn').length) return;

            var buttons =
                render.find('.full-start__button');

            if (!buttons.length) return;

            var btn = $(
                '<div class="full-start__button selector lumen-btn">' +
                    '<span>' + PLUGIN_NAME + '</span>' +
                '</div>'
            );

            btn.on('hover:enter', function () {

                var movie =
                    activity.card ||
                    activity.movie ||
                    (
                        activity.activity &&
                        activity.activity.card
                    );

                console.log('LUMEN MOVIE:', movie);

                Lampa.Activity.push({

                    url: '',

                    title: PLUGIN_NAME,

                    component: COMPONENT,

                    movie: movie,

                    page: 1

                });

            });

            buttons.last().after(btn);

        } catch (e) {

            console.log(
                'LUMEN BUTTON ERROR:',
                e
            );

        }
    }

    // =========================
    // LISTENERS
    // =========================

    if (
        Lampa.Listener &&
        Lampa.Listener.follow
    ) {

        Lampa.Listener.follow(
            'full',
            function () {

                setTimeout(
                    addButton,
                    100
                );

                setTimeout(
                    addButton,
                    500
                );

                setTimeout(
                    addButton,
                    1200
                );

            }
        );

        Lampa.Listener.follow(
            'activity',
            function () {

                setTimeout(
                    addButton,
                    300
                );

            }
        );

    }

    // =========================
    // MANIFEST
    // =========================

    try {

        if (!Lampa.Manifest.plugins) {

            Lampa.Manifest.plugins = [];

        }

        Lampa.Manifest.plugins =
            Lampa.Manifest.plugins.filter(
                function (plugin) {

                    return !plugin ||
                        plugin.component !== COMPONENT;

                }
            );

        Lampa.Manifest.plugins.unshift({

            type: 'video',

            version: VERSION,

            name: PLUGIN_NAME,

            description:
                'Lumen — тест источника',

            component: COMPONENT

        });

    } catch (e) {}

    console.log(
        'LUMEN ' +
        VERSION +
        ' LOADED'
    );

})();
