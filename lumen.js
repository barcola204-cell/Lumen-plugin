(function () {
    'use strict';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.2';

    console.log('[Lumen] Loading ' + VERSION);


    // =========================================================
    // COMPONENT
    // =========================================================

    function component(object) {

        var destroyed = false;
        var container;


        // Создание компонента
        this.create = function () {

            console.log('[Lumen] create()');


            // Создаём настоящий DOM Node
            container = document.createElement('div');

            container.className = 'lumen-test-container';

            container.style.cssText =
                'width:100%;' +
                'height:100%;' +
                'box-sizing:border-box;' +
                'padding:3em;' +
                'text-align:center;';


            // Заголовок
            var title = document.createElement('div');

            title.style.cssText =
                'font-size:2em;' +
                'margin-bottom:1em;';

            title.textContent =
                'Lumen работает';


            // Текст
            var text = document.createElement('div');

            text.style.cssText =
                'font-size:1.2em;' +
                'opacity:0.7;';

            text.textContent =
                'Наш компонент успешно создан';


            // Информация
            var info = document.createElement('div');

            info.style.cssText =
                'margin-top:1.5em;' +
                'opacity:0.5;';

            info.textContent =
                'Lumen TEST ' + VERSION;


            container.appendChild(title);
            container.appendChild(text);
            container.appendChild(info);


            console.log(
                '[Lumen] DOM Node created'
            );


            // ВАЖНО:
            // Возвращаем именно Node,
            // а не HTML-строку и не jQuery-объект.

            return container;
        };


        this.render = function () {

            return container;
        };


        this.start = function () {

            console.log(
                '[Lumen] component started'
            );

        };


        this.pause = function () {};


        this.stop = function () {

            console.log(
                '[Lumen] component stopped'
            );

        };


        this.destroy = function () {

            destroyed = true;

            console.log(
                '[Lumen] component destroyed'
            );

        };

    }


    // =========================================================
    // REGISTER COMPONENT
    // =========================================================

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
            '[Lumen] Component API unavailable'
        );

        return;
    }


    // =========================================================
    // BUTTON
    // =========================================================

    function addButton() {

        try {

            var activity =
                Lampa.Activity.active();


            if (!activity) return;


            if (
                activity.component !== 'full'
            ) {
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
                        '[Lumen] Button pressed'
                    );


                    var movie =
                        activity.card ||
                        activity.movie ||
                        (
                            activity.activity &&
                            activity.activity.card
                        );


                    console.log(
                        '[Lumen] Movie:',
                        movie
                    );


                    Lampa.Activity.push({

                        url: '',

                        title: 'Lumen TEST',

                        component: COMPONENT,

                        movie: movie,

                        page: 1

                    });

                }
            );


            buttons.last().after(button);


            console.log(
                '[Lumen] Button added'
            );

        } catch (error) {

            console.error(
                '[Lumen] Button error:',
                error
            );

        }

    }


    // =========================================================
    // LISTENERS
    // =========================================================

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


    // =========================================================
    // MANIFEST
    // =========================================================

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
                    'Lumen diagnostic plugin',

                component: COMPONENT

            });

        }

    } catch (error) {

        console.error(
            '[Lumen] Manifest error:',
            error
        );

    }


    console.log(
        '[Lumen] Loaded successfully'
    );

})();
