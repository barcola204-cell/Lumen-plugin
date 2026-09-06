(function () {
    'use strict';

    var PLUGIN_NAME = 'Lumen TEST';
    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.4';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    function component(object) {

        var container = document.createElement('div');

        container.style.padding = '2em';
        container.style.color = '#fff';
        container.style.fontSize = '1.1em';
        container.style.whiteSpace = 'pre-wrap';
        container.style.overflow = 'auto';
        container.style.height = '80vh';

        var title = document.createElement('div');
        title.textContent = 'LUMEN: ОБЪЕКТ ACTIVITY';
        title.style.fontSize = '1.5em';
        title.style.marginBottom = '1em';

        container.appendChild(title);

        var output = document.createElement('div');

        try {
            output.textContent = JSON.stringify(object, function (key, value) {
                if (typeof value === 'function') return '[FUNCTION]';
                if (value instanceof HTMLElement) return '[HTML ELEMENT]';
                return value;
            }, 2);
        } catch (e) {
            output.textContent =
                'Ошибка JSON:\n\n' +
                e.toString() +
                '\n\nТип object: ' +
                typeof object;
        }

        container.appendChild(output);

        return container;
    }

    Lampa.Component.add(COMPONENT, component);

    function addButton() {

        try {

            var activity = Lampa.Activity.active();

            if (!activity) return;

            if (activity.component !== 'full') return;

            var render = activity.activity && activity.activity.render
                ? activity.activity.render()
                : $('.full').last();

            if (!render || !render.length) return;

            if (render.find('.lumen-test-btn').length) return;

            var buttons = render.find('.full-start__button');

            if (!buttons.length) return;

            var btn = $(
                '<div class="full-start__button selector lumen-test-btn">' +
                    '<span>' + PLUGIN_NAME + '</span>' +
                '</div>'
            );

            btn.on('hover:enter', function () {

                console.log('LUMEN: КНОПКА НАЖАТА');

                var movie =
                    activity.card ||
                    activity.movie ||
                    (activity.activity && activity.activity.card);

                console.log('LUMEN: MOVIE =', movie);
                console.log('LUMEN: ACTIVITY =', activity);

                Lampa.Activity.push({
                    url: '',
                    title: PLUGIN_NAME,
                    component: COMPONENT,

                    movie: movie,

                    activity: activity,

                    page: 1
                });

            });

            buttons.last().after(btn);

        } catch (e) {

            console.log('LUMEN BUTTON ERROR:', e);

        }
    }

    if (Lampa.Listener && Lampa.Listener.follow) {

        Lampa.Listener.follow('full', function () {

            setTimeout(addButton, 100);
            setTimeout(addButton, 500);
            setTimeout(addButton, 1200);

        });

        Lampa.Listener.follow('activity', function () {

            setTimeout(addButton, 300);

        });

    }

    try {

        if (!Lampa.Manifest.plugins) {
            Lampa.Manifest.plugins = [];
        }

        Lampa.Manifest.plugins.unshift({
            type: 'video',
            version: VERSION,
            name: PLUGIN_NAME,
            description: 'Lumen diagnostic plugin',
            component: COMPONENT
        });

    } catch (e) {}

    console.log('LUMEN TEST ' + VERSION + ' LOADED');

})();
