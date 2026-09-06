(function () {
    'use strict';

    var PLUGIN_NAME = 'Lumen TEST';
    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.5';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    // Безопасный сериализатор для объектов Lampa (игнорирует циклические ссылки)
    function safeStringify(obj) {
        var cache = new Set();
        return JSON.stringify(obj, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.has(value)) return '[CIRCULAR]';
                cache.add(value);
            }
            if (typeof value === 'function') return '[FUNCTION]';
            if (value instanceof HTMLElement || (value && value.jquery)) return '[DOM ELEMENT]';
            return value;
        }, 2);
    }

    function component(object) {
        var container = document.createElement('div');
        container.style.padding = '2em';
        container.style.color = '#fff';
        container.style.fontSize = '1.1em';
        container.style.whiteSpace = 'pre-wrap';
        container.style.overflow = 'auto';
        container.style.height = '80vh';

        var title = document.createElement('div');
        title.textContent = 'LUMEN: ОБЪЕКТ CARD / MOVIE';
        title.style.fontSize = '1.5em';
        title.style.marginBottom = '1em';
        container.appendChild(title);

        var output = document.createElement('div');

        try {
            // Берем данные из object.movie, которые мы явно прокинули при push
            var dataToRender = object.movie || object.card || object;
            output.textContent = safeStringify(dataToRender);
        } catch (e) {
            output.textContent = 'Ошибка сериализации:\n\n' + e.toString();
        }

        container.appendChild(output);
        return container;
    }

    Lampa.Component.add(COMPONENT, component);

    function addButton() {
        try {
            var activity = Lampa.Activity.active();
            if (!activity || activity.component !== 'full') return;

            var render = activity.activity && activity.activity.render
                ? activity.activity.render()
                : $('.full').last();

            if (!render || !render.length || render.find('.lumen-test-btn').length) return;

            var buttons = render.find('.full-start__button');
            if (!buttons.length) return;

            var btn = $(
                '<div class="full-start__button selector lumen-test-btn">' +
                    '<span>' + PLUGIN_NAME + '</span>' +
                '</div>'
            );

            btn.on('hover:enter', function () {
                var currentActivity = Lampa.Activity.active();
                
                // Получаем чистый объект фильма (без циклических DOM-деревьев)
                var movieData = currentActivity.card || currentActivity.movie;

                Lampa.Activity.push({
                    url: '',
                    title: PLUGIN_NAME,
                    component: COMPONENT,
                    movie: movieData // Пробрасываем чистый объект
                });
            });

            buttons.last().after(btn);
        } catch (e) {
            console.log('LUMEN BUTTON ERROR:', e);
        }
    }

    if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('full', function () {
            setTimeout(addButton, 200);
            setTimeout(addButton, 800);
        });
    }
})();
