(function () {
    'use strict';

    if (window.lumen_plugin_loaded) return;
    window.lumen_plugin_loaded = true;

    var PLUGIN_NAME = 'Lumen';
    var COMPONENT = 'lumen_online';
    var VERSION = '1.0.2';

    // ===== Стили =====
    var css = document.createElement('style');
    css.innerHTML = ''
        + '.lumen-card{display:flex;align-items:center;justify-content:space-between;padding:1.3em 1.5em;margin:0.5em 1em;background:rgba(255,255,255,0.07);border-radius:10px;}'
        + '.lumen-card.focus{background:rgba(255,255,255,0.16);}'
        + '.lumen-card__title{font-size:1.2em;font-weight:600;margin-bottom:0.2em;}'
        + '.lumen-card__info{font-size:0.95em;opacity:0.7;}'
        + '.lumen-card__badge{font-size:0.85em;padding:0.3em 0.65em;background:rgba(0,170,255,0.25);border-radius:6px;}'
        + '.lumen-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:55vh;text-align:center;opacity:0.85;}'
        + '.lumen-loading__title{font-size:1.5em;margin-bottom:0.4em;}'
        + '.lumen-loading__text{font-size:1.05em;opacity:0.7;}'
        + '.lumen-error{padding:2em;text-align:center;}'
        + '.lumen-error__title{font-size:1.4em;margin-bottom:0.5em;}';
    document.head.appendChild(css);

    // ===== Шаблон =====
    Lampa.Template.add('lumen_card', 
        '<div class="lumen-card selector">' +
            '<div class="lumen-card__body">' +
                '<div class="lumen-card__title">{title}</div>' +
                '<div class="lumen-card__info">{info}</div>' +
            '</div>' +
            '<div class="lumen-card__badge">{badge}</div>' +
        '</div>'
    );

    // ===== Компонент =====
    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var files = new Lampa.Explorer(object);
        var destroyed = false;
        var last = null;

        this.create = function () {
            this.init();
            return this.render();
        };

        this.render = function () {
            return files.render();
        };

        this.init = function () {
            files.appendHead(scroll.render());
            this.showLoading('Загрузка', 'Подключаемся...');
            
            // Небольшая задержка, чтобы интерфейс успел отрисоваться
            setTimeout(function () {
                if (!destroyed) {
                    this.showContent();
                }
            }.bind(this), 600);
        };

        this.showLoading = function (title, text) {
            scroll.clear();
            scroll.append(
                '<div class="lumen-loading">' +
                    '<div class="lumen-loading__title">' + title + '</div>' +
                    '<div class="lumen-loading__text">' + text + '</div>' +
                '</div>'
            );
        };

        this.showContent = function () {
            if (destroyed) return;

            scroll.clear();

            var items = [
                { title: 'Тестовый источник 1', info: 'Плагин успешно загружен', badge: 'OK' },
                { title: 'Тестовый источник 2', info: 'Готов к доработке', badge: 'Готово' }
            ];

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var el = Lampa.Template.get('lumen_card', item);

                el.on('hover:enter', function (current) {
                    return function () {
                        Lampa.Noty.show('Выбрано: ' + current.title);
                    };
                }(item));

                el.on('hover:focus', function (e) {
                    last = e.target;
                    try {
                        scroll.update($(e.target), true);
                    } catch (err) {}
                });

                scroll.append(el);
            }

            setTimeout(function () {
                Lampa.Controller.toggle('content');
            }, 50);
        };

        this.start = function () {
            if (destroyed) return;

            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    var target = last || scroll.render().find('.selector')[0];
                    if (target) {
                        Lampa.Controller.collectionFocus(target, scroll.render());
                    }
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
            try { files.destroy(); } catch (e) {}
            try { scroll.destroy(); } catch (e) {}
        };

        this.pause = function () {};
        this.stop = function () {
            this.destroy();
        };
    }

    // ===== Регистрация компонента =====
    Lampa.Component.add(COMPONENT, component);

    // ===== Кнопка на карточке =====
    function addButton() {
        try {
            var activity = Lampa.Activity.active();
            if (!activity || activity.component !== 'full') return;

            var render = activity.activity && activity.activity.render 
                ? activity.activity.render() 
                : $('.full').last();

            if (!render || !render.length) return;
            if (render.find('.lumen-btn').length) return;

            var buttons = render.find('.full-start__button');
            if (!buttons.length) return;

            var btn = $('<div class="full-start__button selector lumen-btn"><span>' + PLUGIN_NAME + '</span></div>');

            btn.on('hover:enter', function () {
                var movie = activity.card || activity.movie || (activity.activity && activity.activity.card);
                if (!movie) return;

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
            console.log('Lumen button error', e);
        }
    }

    // Слушаем события
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

    // ===== Манифест =====
    try {
        if (!Lampa.Manifest.plugins) Lampa.Manifest.plugins = [];

        // Удаляем старую версию, если есть
        Lampa.Manifest.plugins = Lampa.Manifest.plugins.filter(function (p) {
            return !p || p.component !== COMPONENT;
        });

        Lampa.Manifest.plugins.unshift({
            type: 'video',
            version: VERSION,
            name: PLUGIN_NAME,
            description: 'Онлайн плагин Lumen',
            component: COMPONENT
        });
              
