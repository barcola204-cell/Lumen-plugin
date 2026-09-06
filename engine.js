(function () {
    'use strict';

    function loadKinoboxScript(callback) {
        if (window.Kinobox) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://kinobox.tv/kinobox.min.js';
        script.onload = callback;
        script.onerror = function () {
            Lampa.Noty.show('Lumen: Ошибка загрузки скрипта Kinobox');
        };
        document.head.appendChild(script);
    }

    function openLumenPlayer(kp_id, title) {
        $('#lumen-player-container').remove();

        var overlay = $(
            '<div id="lumen-player-container" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 999999; display: flex; flex-direction: column;">' +
                '<div style="height: 50px; background: #141414; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #222;">' +
                    '<span style="color: #fff; font-size: 16px; font-weight: bold; font-family: sans-serif;">' + (title || 'Lumen Player') + '</span>' +
                    '<button id="lumen-close-btn" style="background: #e50914; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 14px;">Закрыть ✕</button>' +
                '</div>' +
                '<div class="kinobox_player" style="width: 100%; height: calc(100vh - 50px);"></div>' +
            '</div>'
        );

        overlay.find('#lumen-close-btn').on('click touchstart', function () {
            overlay.remove();
        });

        $('body').append(overlay);

        loadKinoboxScript(function () {
            new Kinobox('.kinobox_player', {
                search: {
                    kinopoisk: kp_id,
                    title: title
                },
                menu: {
                    enable: true,
                    default: 'menu'
                }
            }).init();
        });
    }

    function createLumenButton(render, movieData) {
        if (!render || render.find('.button--lumen').length) return;

        var btn = $('<div class="full-start__button selector button--lumen" style="display: inline-flex !important; align-items: center; justify-content: center; background: #e50914 !important; color: #fff !important; padding: 10px 15px; border-radius: 8px; margin: 5px; cursor: pointer; font-weight: bold;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Lumen Engine</span></div>');

        btn.on('click hover:enter', function () {
            var card = movieData || {};
            var kp_id = card.kinopoisk_id || (card.account && card.account.kinopoisk_id) || card.kp_id || (card.ids && card.ids.kp) || '';
            var title = card.title || card.name || card.original_title || card.original_name || '';

            if (!kp_id && !title) {
                Lampa.Noty.show('Lumen: Не удалось определить фильм');
                return;
            }

            openLumenPlayer(kp_id, title);
        });

        var container = render.find('.full-start__buttons, .full-start-new__buttons, .buttons').first();
        if (container.length) {
            container.prepend(btn);
        } else {
            render.append(btn);
        }
    }

    function init() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite' || e.type === 'build') {
                var render = e.object.activity.render();
                var movieData = e.data.movie;
                createLumenButton(render, movieData);
            }
        });
    }

    if (window.appready) init();
    else if (window.Lampa) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();

