(function () {
    'use strict';

    if (window.lumen_online_plugin) return;
    window.lumen_online_plugin = true;

    var PLUGIN_NAME = 'Lumen';
    var COMPONENT   = 'lumen_online';
    var VERSION     = '1.0.0';
    var SERVER      = 'https://p.bwa.ad';

    // ---------- Шаблон ----------
    Lampa.Template.add('lumen_card', `
        <div class="lumen-card selector">
            <div class="lumen-card__body">
                <div class="lumen-card__title">{title}</div>
                <div class="lumen-card__info">{info}</div>
            </div>
            <div class="lumen-card__badge">{badge}</div>
        </div>
    `);

    // ---------- Стили ----------
    var style = document.createElement('style');
    style.innerHTML = `
        .lumen-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.4em 1.6em;
            margin: 0.6em 1.2em;
            background: rgba(255,255,255,0.06);
            border-radius: 12px;
            transition: background 0.2s;
        }
        .lumen-card.focus {
            background: rgba(255,255,255,0.15);
        }
        .lumen-card__title {
            font-size: 1.25em;
            font-weight: 600;
            margin-bottom: 0.25em;
        }
        .lumen-card__info {
            font-size: 0.95em;
            opacity: 0.7;
        }
        .lumen-card__badge {
            font-size: 0.85em;
            padding: 0.35em 0.7em;
            background: rgba(0,180,255,0.25);
            border-radius: 6px;
            white-space: nowrap;
        }
        .lumen-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            text-align: center;
            opacity: 0.85;
        }
        .lumen-loading__title {
            font-size: 1.6em;
            margin-bottom: 0.5em;
        }
        .lumen-loading__text {
            font-size: 1.1em;
            opacity: 0.7;
        }
        .lumen-error {
            padding: 2em;
            text-align: center;
        }
        .lumen-error__title {
            font-size: 1.5em;
            margin-bottom: 0.6em;
        }
    `;
    document.head.appendChild(style);

    // ---------- Компонент ----------
    function component(object) {
        var network   = new Lampa.Reguest();
        var scroll    = new Lampa.Scroll({ mask: true, over: true });
        var files     = new Lampa.Explorer(object);
        var destroyed = false;
        var last      = null;

        this.create = function () {
            this.initialize();
            return this.render();
        };

        this.render = function () {
            return files.render();
        };

        this.initialize = function () {
            files.appendHead(scroll.render());
            this.startLoading('Подключение…', 'Проверяем сервер');
            this.requestTest();
        };

        this.startLoading = function (title, text) {
            scroll.clear();
            scroll.append(`
                <div class="lumen-loading">
                    <div class="lumen-loading__title">${title}</div>
                    <div class="lumen-loading__text">${text}</div>
                </div>
            `);
            this.loading(true);
        };

        this.loading = function (status) {
            files.render().toggleClass('explorer--loading', status);
        };

        this.requestTest = function () {
            var testUrl = SERVER + '/';

            network.timeout(10000);
            network.silent(testUrl, function () {
                if (destroyed) return;
                showSuccess.call(this);
            }.bind(this), function (error) {
                if (destroyed) return;
                showError.call(this, error);
            }.bind(this));
        };

        function showSuccess() {
            scroll.clear();

            var items = [
                { title: 'Сервер доступен', info: 'Ответ получен', badge: 'OK' },
                { title: 'Тестовый источник', info: 'Готово к подключению балансеров', badge: 'Готово' }
            ];

            items.forEach(function (item) {
                var el = Lampa.Template.get('lumen_card', item);

                el.on('hover:enter', function () {
                    Lampa.Noty.show('Выбрано: ' + item.title);
                });

                el.on('hover:focus', function (e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });

                scroll.append(el);
            });

            this.loading(false);

            setTimeout(function () {
                Lampa.Controller.toggle('content');
            }, 50);
        }

        function showError(err) {
            scroll.clear();
            var msg = (err && (err.message || err.statusText)) ? (err.message || err.statusText) : 'Сервер не ответил';

            scroll.append(`
                <div class="lumen-error">
                    <div class="lumen-error__title">Ошибка подключения</div>
                    <div>${msg}</div>
                    <div style="margin-top:1.2em;opacity:0.7">${SERVER}</div>
                </div>
            `);
            this.loading(false);
        }

        this.start = function () {
            if (destroyed) return;

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    var target = last || scroll.render().find('.selector').first()[0];
                    if (target) Lampa.Controller.collectionFocus(target, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    Navigator.move('down');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    Navigator.move('right');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });

            Lampa.Controller.toggle('content');
        };

        this.destroy = function () {
            destroyed = true;
            network.clear();
            files.destroy();
            scroll.destroy();
        };

        this.pause = function () {};
        this.stop  = function () { this.destroy(); };
    }

    // ---------- Регистрация ----------
    Lampa.Component.add(COMPONENT, component);

    function insertButton() {
        try {
            var act = Lampa.Activity.active();
            if (!act || act.component !== 'full') return;

            var render = act.activity && act.activity.render ? act.activity.render() : $('.full').last();
            if (!render.length || render.find('.lumen-online-btn').length) return;

            var buttons = render.find('.full-start__button');
            if (!buttons.length) return;

            var btn = $(`
                <div class="full-start__button selector lumen-online-btn">
                    <span>${PLUGIN_NAME}</span>
                </div>
            `);

            btn.on('hover:enter', function () {
                var movie = act.card || act.movie || (act.activity && act.activity.card);
                if (!movie) return;

                Lampa