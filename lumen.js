(function () {
    'use strict';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.1';

    console.log('[Lumen] START');

    /*
     * Простейший компонент.
     * Никаких Explorer, Scroll или API,
     * кроме базовых Lampa.Component и Activity.
     */

    function component(object) {

        this.create = function () {

            console.log('[Lumen] COMPONENT CREATE');

            var html =
                '<div style="' +
                    'padding:3em;' +
                    'text-align:center;' +
                '">' +

                    '<div style="' +
                        'font-size:2em;' +
                        'margin-bottom:1em;' +
                    '">' +
                        'Lumen работает' +
                    '</div>' +

                    '<div style="' +
                        'opacity:0.7;' +
                    '">' +
                        'Компонент успешно запущен' +
                    '</div>' +

                '</div>';

            return html;
        };

        this.render = function () {
            return this.create();
        };

        this.start = function () {
            console.log('[Lumen] START COMPONENT');
        };

        this.pause = function () {};

        this.stop = function () {};

        this.destroy = function () {
            console.log('[Lumen] DESTROY');
        };
    }


    /*
     * Регистрируем компонент
     */

    if (
        Lampa.Component &&
        Lampa.Component.add
    ) {

        Lampa.Component.add(
            COMPONENT,
            component
        );

        console.log(
            '[Lumen] Component registered'
        );

    } else {

        console.error(
            '[Lumen] Lampa.Component.add not found'
        );

        return;
    }


    /*
     * Кнопка на странице фильма
     */

    function addButton() {

        try {

            var activity =
                Lampa.Activity.active();

            if (!activity) return;

            if (activity.component !== 'full') {
                return;
            }


            var render =
                activity.activity &&
                activity.activity.render

                    ? activity.activity.render()

                    : $('.full').last();


            if (
                !render ||
                !render.length
            ) {
                return;
            }


            if (
                render.find(
                    '.lumen-test-button'
                ).length
            ) {
                return;
            }


            var buttons =
                render.find(
                    '.full-start__button'
                );


            if (!buttons.length) {
                return;
            }


            var button = $(
                '<div class="' +
                    'full-start__button ' +
                    'selector lumen-test-button' +
                '">' +
                    '<span>Lumen TEST</span>' +
                '</div>'
            );


            button.on(
                'hover:enter',
                function () {

                    console.log(
                        '[Lumen] BUTTON CLICK'
                    );


                    Lampa.Activity.push({

                        url: '',

                        title: 'Lumen TEST',

                        component: COMPONENT,

                        movie:
                            activity.card ||
                            activity.movie,

                        page: 1

                    });

                }
            );


            buttons.last().after(button);


            console.log(
                '[Lumen] BUTTON ADDED'
            );

        } catch (error) {

            console.error(
                '[Lumen] BUTTON ERROR',
                error
            );

        }
    }


    /*
     * Слушаем открытие карточки
     */

    if (
        Lampa.Listener &&
        Lampa.Listener.follow
    ) {

        Lampa.Listener.follow(
            'full',
            function () {

                setTimeout(
                    addButton,
                    300
                );

                setTimeout(
                    addButton,
                    1000
                );

            }
        );


        Lampa.Listener.follow(
            'activity',
            function () {

                setTimeout(
                    addButton,
                    500
                );

            }
        );

    }


    /*
     * Manifest
     */

    try {

        if (
            Lampa.Manifest &&
            Lampa.Manifest.plugins
        ) {

            Lampa.Manifest.plugins.unshift({

                type: 'video',

                version: VERSION,

                name: 'Lumen TEST',

                description:
                    'Диагностический тест',

                component: COMPONENT

            });

        }

    } catch (error) {

        console.error(
            '[Lumen] Manifest error',
            error
        );

    }


    console.log(
        '[Lumen] LOADED ' +
        VERSION
    );

})();
