(function () {
    'use strict';

    var PLUGIN_NAME = 'Lumen TEST';
    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.7';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    // Безопасный сериализатор для JSON
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

    // Класс компонента по стандарту Lampa
    function LumenComponent(object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html   = $('<div></div>');
        var body   = $('<div class="lumen-test-body"></div>');

        // Обязательный метод 1: Создание экрана
        this.create = function () {
            var _this = this;

            // Скрываем индикатор загрузки Lampa
            if (this.activity && this.activity.loader) {
                this.activity.loader(false);
            }

            body.css({
                'padding': '1.5em',
                'color': '#fff',
                'font-size': '1.1em',
                'white-space': 'pre-wrap',
                'word-break': 'break-all',
                'font-family': 'monospace'
            });

            var title = $('<div style="font-size: 1.4em; font-weight: bold; margin-bottom: 1em; color: #4ae08a;">LUMEN: OBJECT DATA</div>');
            body.append(title);

            var output = $('<div></div>');

            try {
                var dataToRender = object.movie || object.card || object;
                output.text(safeStringify(dataToRender));
            } catch (e) {
                output.text('Ошибка сериализации:\n\n' + e.toString());
            }

            body.append(output);

            scroll.minus();
            scroll.append(body);
            html.append(scroll.render());

            return this.render();
        };

        // Обязательный метод 2: Возврат DOM-элемента
        this.render = function () {
            return html;
        };

        // Обязательный метод 3: Включение управления пультом
        this.start = function () {
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.move();
                },
                up: function () {
                    scroll.up();
                },
                down: function () {
                    scroll.down();
                },
                back: function () {
                    Lampa.Activity.back();
                }
            });

            Lampa.Controller.toggle('content');
        };

        // Обязательный метод 4: Очистка памяти при закрытии
        this.destroy = function () {
            scroll.destroy();
            html.remove();
        };
    }

    // Регистрируем компонент
    Lampa.Component.add(COMPONENT, LumenComponent);

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
                var movieData = currentActivity.card || currentActivity.movie;

                Lampa.Activity.push({
                    url: '',
                    title: PLUGIN_NAME,
                    component: COMPONENT,
                    movie: movieData,
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
            setTimeout(addButton, 200);
            setTimeout(addButton, 800);
        });
    }

    console.log('LUMEN TEST ' + VERSION + ' LOADED');
})();
