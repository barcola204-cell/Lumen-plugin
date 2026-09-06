(function () {
    'use strict';

    if (window.lumen_test_loaded) return;
    window.lumen_test_loaded = true;

    var COMPONENT = 'lumen_test';
    var VERSION = '0.0.3';


    // =========================================================
    // COMPONENT
    // =========================================================

    function component(object) {

        var container;


        this.create = function () {

            container = document.createElement('div');

            container.style.cssText =
                'width:100%;' +
                'height:100%;' +
                'box-sizing:border-box;' +
                'padding:2em;' +
                'overflow:auto;' +
                'font-family:monospace;';


            var title = document.createElement('div');

            title.style.cssText =
                'font-size:2em;' +
                'margin-bottom:1em;';

            title.textContent =
                'Lumen — данные фильма';


            container.appendChild(title);


            var info = document.createElement('div');

            info.style.cssText =
                'font-size:1.1em;' +
                'line-height:1.6;' +
                'white-space:pre-wrap;' +
                'word-break:break-word;';


            /*
             * Показываем объект фильма,
             * который Lampa передала компоненту.
             */

            var movie = object && (
                object.movie ||
                object.card
            );


            if (movie) {

                try {

                    info.textContent =
                        JSON.stringify(
                            movie,
                            null,
                            2
                        );

                } catch (error) {

                    info.textContent =
                        'Не удалось прочитать объект фильма';

                }

            } else {

                info.textContent =
                    'Lampa не передала объект movie';

            }


            container.appendChild(info);


            return container;
        };


        this.render = function () {
            return container;
        };


        this.start = function () {};

        this.pause = function () {};

        this.stop = function () {};

        this.destroy = function () {};

    }


    // =========================================================
    // REGISTER
    // =========================================================

    Lampa.Component.add(
        COMPONENT,
        component
    );


    // =========================================================
    // BUTTON
    // =========================================================

    function addButton() {

        try {

            var activity =
                Lampa.Activity.active();


            if (
                !activity ||
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

                    var movie =
                        activity.card ||
                        activity.movie ||
                        (
                            activity.activity &&
                            activity.activity.card
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

        } catch (error) {

            console.error(
                '[Lumen]',
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


    console.log(
        'Lumen TEST ' +
        VERSION +
        ' loaded'
    );

})();
