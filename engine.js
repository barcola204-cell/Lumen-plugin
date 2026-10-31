/* LUMEN v1 built 2026-10-31T21:12:37.137Z — do not edit engine.js by hand; edit src/ and run node scripts/build.js */

/* ===== 00-banner.js ===== */

/**
 * LUMEN v1 — plugin for Lampa
 * License note: integrates with Lampa (GPL-2.0). Ship only user-authorized sources.
 * Entry after build: ../engine.js
 */


/* ===== 01-boot-guard.js ===== */

(function () {
    'use strict';

    if (window.lumen_plugin_loaded) return;
    window.lumen_plugin_loaded = true;

    var LUMEN = {
        VERSION: '1.0.0-v1',
        COMPONENT_SOURCES: 'lumen_sources',
        COMPONENT_EPISODES: 'lumen_episodes',
        STORAGE_PREFIX: 'lumen_',
        log: function () {}
    };

    window.LUMEN = LUMEN;


/* ===== 02-debug.js ===== */

    // ===== Debug overlay (remote-friendly) =====
    LUMEN.Debug = (function () {
        var buffer = [];
        var MAX = 50;
        var panel = null;
        var installed = false;

        function enabled() {
            try {
                return !!Lampa.Storage.field('lumen_debug_overlay');
            } catch (e) {
                return false;
            }
        }

        function push(level, msg) {
            var line = '[' + level + '] ' + msg;
            buffer.push({ t: Date.now(), level: level, msg: String(msg) });
            if (buffer.length > MAX) buffer.shift();
            try {
                console.log('LUMEN', line);
            } catch (e1) {}
            if (enabled()) render();
        }

        function ensurePanel() {
            if (panel && panel.parentNode) return panel;
            panel = document.createElement('div');
            panel.className = 'lumen-debug';
            panel.setAttribute('aria-hidden', 'true');
            document.body.appendChild(panel);
            return panel;
        }

        function render() {
            if (!enabled()) {
                if (panel && panel.parentNode) panel.style.display = 'none';
                return;
            }
            var el = ensurePanel();
            el.style.display = 'block';
            var html = '<div class="lumen-debug__title">LUMEN debug · ' + LUMEN.VERSION + '</div>';
            var i;
            var start = Math.max(0, buffer.length - 10);
            for (i = start; i < buffer.length; i++) {
                html += '<div class="lumen-debug__line lumen-debug__line--' + buffer[i].level + '">' +
                    escapeHtml(buffer[i].msg) + '</div>';
            }
            el.innerHTML = html;
        }

        function escapeHtml(s) {
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function installHooks() {
            if (installed) return;
            installed = true;
            var prevOnError = window.onerror;
            window.onerror = function (message, source, lineno, colno, error) {
                push('error', 'onerror: ' + message + ' @' + (source || '') + ':' + lineno + ':' + colno);
                if (typeof prevOnError === 'function') {
                    try { return prevOnError.apply(this, arguments); } catch (e) {}
                }
            };
            if (window.addEventListener) {
                window.addEventListener('unhandledrejection', function (ev) {
                    var reason = ev && ev.reason;
                    push('error', 'unhandledrejection: ' + (reason && reason.message ? reason.message : reason));
                });
            }
        }

        return {
            install: installHooks,
            log: function (msg) { push('info', msg); },
            warn: function (msg) { push('warn', msg); },
            error: function (msg) { push('error', msg); },
            dump: function () { return buffer.slice(); },
            clear: function () { buffer = []; render(); },
            refresh: render,
            showSummary: function () {
                var n = buffer.length;
                var last = n ? buffer[n - 1].msg : 'пусто';
                Lampa.Noty.show('LUMEN debug: ' + n + ' записей. Последняя: ' + last, { time: 5000 });
            }
        };
    })();

    LUMEN.log = function (msg) { LUMEN.Debug.log(msg); };


/* ===== 03-styles.js ===== */

    // ===== Styles (cinematic Disney+-inspired, R3-safe: transform/opacity only) =====
    LUMEN.injectStyles = function () {
        if (document.getElementById('lumen-styles')) return;
        var css = document.createElement('style');
        css.id = 'lumen-styles';
        css.type = 'text/css';
        css.appendChild(document.createTextNode(''
            + '.button--lumen{display:inline-flex;align-items:center;justify-content:center;'
            + 'background:linear-gradient(135deg,#1B2A4A 0%,#243B6B 55%,#2A4580 100%);'
            + 'color:#F7F9FF;padding:0.65em 1.2em;border-radius:999px;margin:0.3em;'
            + 'font-weight:700;letter-spacing:0.04em;text-transform:uppercase;font-size:0.92em;'
            + 'transition:transform 0.15s ease,opacity 0.15s ease;border:1px solid rgba(91,140,255,0.35);}'
            + '.button--lumen.focus,.button--lumen.hover{transform:scale(1.05);'
            + 'outline:2px solid #7AA2FF;outline-offset:3px;opacity:1;}'
            + '.button--lumen svg{margin-right:0.5em;}'
            + '.lumen-screen{background:#07090F;min-height:100%;color:#F2F4F8;}'
            + '.lumen-hero{display:flex;gap:1.35em;padding:1.4em 1.5em 0.8em;align-items:flex-start;}'
            + '.lumen-hero__poster{width:8.2em;height:12.3em;border-radius:14px;object-fit:cover;'
            + 'background:#12141C;flex-shrink:0;border:1px solid rgba(255,255,255,0.06);}'
            + '.lumen-hero__poster--empty{display:flex;align-items:center;justify-content:center;'
            + 'opacity:0.45;font-size:0.85em;letter-spacing:0.12em;}'
            + '.lumen-hero__meta{flex:1;min-width:0;padding-top:0.2em;}'
            + '.lumen-hero__title{font-size:1.7em;font-weight:750;line-height:1.15;margin:0 0 0.4em;'
            + 'letter-spacing:-0.01em;}'
            + '.lumen-hero__sub{font-size:0.95em;opacity:0.62;margin-bottom:0.55em;letter-spacing:0.02em;}'
            + '.lumen-hero__overview{font-size:0.95em;opacity:0.8;line-height:1.4;'
            + 'display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;}'
            + '.lumen-section-title{padding:0.75em 1.5em 0.35em;font-size:0.78em;text-transform:uppercase;'
            + 'letter-spacing:0.14em;opacity:0.5;font-weight:600;}'
            + '.lumen-card{display:flex;align-items:center;justify-content:space-between;'
            + 'padding:1.1em 1.3em;margin:0.45em 1.1em;background:#12151F;border-radius:16px;'
            + 'border:1px solid rgba(255,255,255,0.04);'
            + 'transition:transform 0.15s ease,opacity 0.15s ease;}'
            + '.lumen-card.focus{transform:scale(1.035);outline:2px solid #7AA2FF;outline-offset:2px;'
            + 'background:#182033;border-color:rgba(122,162,255,0.35);}'
            + '.lumen-card__title{font-size:1.18em;font-weight:650;margin-bottom:0.18em;}'
            + '.lumen-card__info{font-size:0.9em;opacity:0.62;}'
            + '.lumen-card__badge{font-size:0.78em;padding:0.32em 0.7em;background:rgba(91,140,255,0.2);'
            + 'border-radius:999px;color:#C9DAFF;margin-left:0.9em;white-space:nowrap;font-weight:600;}'
            + '.lumen-empty,.lumen-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;'
            + 'min-height:42vh;text-align:center;padding:2em;opacity:0.9;}'
            + '.lumen-empty__title,.lumen-loading__title{font-size:1.4em;margin-bottom:0.45em;font-weight:700;}'
            + '.lumen-empty__text,.lumen-loading__text{font-size:1em;opacity:0.68;max-width:28em;line-height:1.4;}'
            + '.lumen-debug{position:fixed;left:0.6em;right:0.6em;bottom:0.6em;max-height:32vh;overflow:hidden;'
            + 'z-index:100000;background:rgba(7,9,15,0.94);border:1px solid rgba(91,140,255,0.4);'
            + 'border-radius:12px;padding:0.55em 0.75em;font-size:0.72em;pointer-events:none;}'
            + '.lumen-debug__title{font-weight:700;margin-bottom:0.3em;color:#7AA2FF;letter-spacing:0.04em;}'
            + '.lumen-debug__line{opacity:0.92;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
            + '.lumen-debug__line--error{color:#FF8A80;}'
            + '.lumen-debug__line--warn{color:#FFD54F;}'
            + '.lumen-debug__line--info{color:#E8EAED;}'
        ));
        document.head.appendChild(css);
    };


/* ===== 04-utils.js ===== */

    // ===== Utils =====
    LUMEN.Utils = {
        movieTitle: function (card) {
            if (!card) return '';
            return card.title || card.name || card.original_title || card.original_name || '';
        },
        movieOriginal: function (card) {
            if (!card) return '';
            return card.original_title || card.original_name || card.title || card.name || '';
        },
        movieYear: function (card) {
            if (!card) return '';
            var d = card.release_date || card.first_air_date || '';
            return d ? String(d).slice(0, 4) : '';
        },
        isTv: function (card) {
            if (!card) return false;
            if (card.media_type === 'tv' || card.type === 'tv') return true;
            if (card.name && !card.title) return true;
            if (card.number_of_seasons || card.seasons) return true;
            return false;
        },
        posterUrl: function (card, size) {
            size = size || 'w300';
            if (!card) return '';
            var path = card.poster_path || card.img || '';
            if (!path) return '';
            if (path.indexOf('http') === 0) return path;
            try {
                if (Lampa.TMDB && Lampa.TMDB.image) {
                    return Lampa.TMDB.image('t/p/' + size + path);
                }
            } catch (e) {}
            return 'https://image.tmdb.org/t/p/' + size + path;
        },
        storageKey: function (name) {
            return LUMEN.STORAGE_PREFIX + name;
        },
        saveFocus: function (key, value) {
            try { Lampa.Storage.set(LUMEN.Utils.storageKey(key), value); } catch (e) {}
        },
        loadFocus: function (key) {
            try { return Lampa.Storage.get(LUMEN.Utils.storageKey(key), ''); } catch (e) { return ''; }
        },
        debounce: function (fn, wait) {
            var t = null;
            return function () {
                var ctx = this, args = arguments;
                if (t) clearTimeout(t);
                t = setTimeout(function () { fn.apply(ctx, args); }, wait);
            };
        },
        safeJson: function (text) {
            try { return JSON.parse(text); } catch (e) { return null; }
        }
    };


/* ===== 05-lang.js ===== */

    // ===== Lang =====
    LUMEN.registerLang = function () {
        if (!Lampa.Lang || !Lampa.Lang.add) return;
        Lampa.Lang.add({
            lumen_title: { ru: 'LUMEN', en: 'LUMEN', uk: 'LUMEN' },
            lumen_button: { ru: 'LUMEN', en: 'LUMEN', uk: 'LUMEN' },
            lumen_sources: { ru: 'Источники LUMEN', en: 'LUMEN sources', uk: 'Джерела LUMEN' },
            lumen_episodes: { ru: 'Серии', en: 'Episodes', uk: 'Серії' },
            lumen_loading: { ru: 'Поиск источников…', en: 'Searching sources…', uk: 'Пошук джерел…' },
            lumen_empty: { ru: 'Ничего не найдено', en: 'Nothing found', uk: 'Нічого не знайдено' },
            lumen_empty_hint: {
                ru: 'Настройте Jellyfin/Emby или Custom URL в Настройки → LUMEN. Demo-источник можно включить для проверки UI.',
                en: 'Configure Jellyfin/Emby or Custom URL in Settings → LUMEN. Enable Demo to test the UI.',
                uk: 'Налаштуйте Jellyfin/Emby або Custom URL у Налаштування → LUMEN.'
            },
            lumen_settings: { ru: 'LUMEN', en: 'LUMEN', uk: 'LUMEN' },
            lumen_settings_descr: {
                ru: 'Легальные источники пользователя и отладка',
                en: 'User-authorized sources and debug',
                uk: 'Легальні джерела користувача та відлагодження'
            },
            lumen_no_movie: { ru: 'LUMEN: нет данных о фильме', en: 'LUMEN: missing movie data', uk: 'LUMEN: немає даних про фільм' },
            lumen_play_error: { ru: 'LUMEN: нет URL для воспроизведения', en: 'LUMEN: no playable URL', uk: 'LUMEN: немає URL' },
            lumen_provider_demo: { ru: 'Demo (тест UI)', en: 'Demo (UI test)', uk: 'Demo (тест UI)' },
            lumen_provider_jellyfin: { ru: 'Jellyfin', en: 'Jellyfin', uk: 'Jellyfin' },
            lumen_provider_emby: { ru: 'Emby', en: 'Emby', uk: 'Emby' },
            lumen_provider_custom: { ru: 'Custom HTTP', en: 'Custom HTTP', uk: 'Custom HTTP' },
            lumen_season: { ru: 'Сезон', en: 'Season', uk: 'Сезон' },
            lumen_episode: { ru: 'Серия', en: 'Episode', uk: 'Серія' }
        });
    };

    LUMEN.t = function (key) {
        try { return Lampa.Lang.translate(key); } catch (e) { return key; }
    };


/* ===== 06-settings.js ===== */

    // ===== Settings =====
    LUMEN.registerSettings = function () {
        if (!Lampa.SettingsApi) return;

        var icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">'
            + '<path d="M8 5v14l11-7z"/></svg>';

        Lampa.SettingsApi.addComponent({
            component: 'lumen',
            name: LUMEN.t('lumen_settings'),
            icon: icon
        });

        Lampa.SettingsApi.addParam({
            component: 'lumen',
            param: { name: 'lumen_debug_overlay', type: 'trigger', default: false },
            field: {
                name: 'Экранный debug-лог',
                description: 'Панель логов для фото с iPhone на Vontar R3'
            },
            onChange: function () {
                LUMEN.Debug.refresh();
                LUMEN.Debug.showSummary();
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'lumen',
            param: { name: 'lumen_demo_enabled', type: 'trigger', default: true },
            field: {
                name: 'Demo-источник',
                description: 'Тестовые ролики (Blender open movies / sample) без своего сервера'
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'lumen',
            param: { name: 'lumen_custom_url', type: 'input', default: '' },
            field: {
                name: 'Custom provider URL',
                description: 'HTTP JSON endpoint (контракт в docs/PROVIDER_CONTRACT.md)'
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'lumen',
            param: {
                name: 'lumen_torrserver_hint',
                type: 'select',
                values: { keep: 'Штатные Торренты Lampa (не в LUMEN)' },
                default: 'keep'
            },
            field: {
                name: 'TorrServer / трекеры',
                description: 'LUMEN не вшивает трекеры. Jackett+TorrServer настраивайте в самой Lampa.'
            }
        });
    };

    LUMEN.field = function (name, fallback) {
        try {
            var v = Lampa.Storage.field(name);
            if (v === undefined || v === null || v === '') return fallback;
            return v;
        } catch (e) {
            return fallback;
        }
    };


/* ===== providers/registry.js ===== */

    // ===== Provider registry =====
    LUMEN.Providers = (function () {
        var list = [];

        function register(provider) {
            if (!provider || !provider.id) return;
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i].id === provider.id) {
                    list[i] = provider;
                    return;
                }
            }
            list.push(provider);
        }

        function enabled() {
            return list.filter(function (p) {
                try { return p.enabled && p.enabled(); } catch (e) { return false; }
            });
        }

        /**
         * search(card, done)
         * done(err, items) — items normalized:
         * { title, subtitle, voice, quality, url, season, episode, playlist, provider, kind, meta }
         */
        function searchAll(card, network, done) {
            var active = enabled();
            if (!active.length) {
                done(null, []);
                return;
            }

            var pending = active.length;
            var all = [];
            var errors = [];

            active.forEach(function (provider) {
                try {
                    provider.search(card, network, function (err, items) {
                        if (err) {
                            errors.push(provider.id + ': ' + err);
                            LUMEN.Debug.warn('provider ' + provider.id + ' error: ' + err);
                        } else if (items && items.length) {
                            items.forEach(function (it) {
                                it.provider = it.provider || provider.id;
                                it.providerTitle = provider.title || provider.id;
                                all.push(it);
                            });
                        }
                        pending -= 1;
                        if (pending <= 0) done(errors.length ? errors.join('; ') : null, all);
                    });
                } catch (e) {
                    errors.push(provider.id + ': ' + (e && e.message ? e.message : e));
                    pending -= 1;
                    if (pending <= 0) done(errors.join('; '), all);
                }
            });
        }

        return {
            register: register,
            list: function () { return list.slice(); },
            enabled: enabled,
            searchAll: searchAll
        };
    })();


/* ===== providers/demo.js ===== */

    // ===== Demo provider (UI / navigation tests, no external API) =====
    LUMEN.Providers.register({
        id: 'demo',
        title: 'Demo',
        enabled: function () {
            return !!LUMEN.field('lumen_demo_enabled', true);
        },
        search: function (card, network, done) {
            var title = LUMEN.Utils.movieTitle(card) || 'Demo';
            var year = LUMEN.Utils.movieYear(card);
            var isTv = LUMEN.Utils.isTv(card);
            var items = [];

            items.push({
                title: title + (year ? ' (' + year + ')' : ''),
                subtitle: 'Demo · Big Buck Bunny',
                voice: 'Original',
                quality: '720p',
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                kind: 'movie'
            });

            if (isTv) {
                items.push({
                    title: title + ' — S01',
                    subtitle: 'Demo · сериал (3 серии)',
                    voice: 'Demo VO',
                    quality: '720p',
                    kind: 'season',
                    season: 1,
                    playlist: [
                        {
                            title: 'S01E01',
                            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            season: 1,
                            episode: 1
                        },
                        {
                            title: 'S01E02',
                            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                            season: 1,
                            episode: 2
                        },
                        {
                            title: 'S01E03',
                            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                            season: 1,
                            episode: 3
                        }
                    ]
                });
            }

            items.push({
                title: 'Sintel (multi-quality)',
                subtitle: 'Demo · выбор качества',
                voice: 'Original',
                quality: '1080p',
                kind: 'movie',
                qualityMap: {
                    '720p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                    '1080p': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
                },
                url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
            });

            setTimeout(function () { done(null, items); }, 120);
        }
    });


/* ===== providers/custom.js ===== */

    // ===== Custom HTTP JSON provider =====
    LUMEN.Providers.register({
        id: 'custom',
        title: 'Custom',
        enabled: function () {
            return !!LUMEN.field('lumen_custom_url', '');
        },
        search: function (card, network, done) {
            var endpoint = LUMEN.field('lumen_custom_url', '');
            if (!endpoint) {
                done(null, []);
                return;
            }

            var title = LUMEN.Utils.movieTitle(card);
            var original = LUMEN.Utils.movieOriginal(card);
            var year = LUMEN.Utils.movieYear(card);
            var isTv = LUMEN.Utils.isTv(card);
            var sep = endpoint.indexOf('?') >= 0 ? '&' : '?';
            var url = endpoint + sep
                + 'tmdb=' + encodeURIComponent(card && card.id ? card.id : '')
                + '&imdb=' + encodeURIComponent(card && card.imdb_id ? card.imdb_id : '')
                + '&type=' + encodeURIComponent(isTv ? 'tv' : 'movie')
                + '&title=' + encodeURIComponent(title)
                + '&original_title=' + encodeURIComponent(original)
                + '&year=' + encodeURIComponent(year);

            network.silent(url, function (json) {
                var data = typeof json === 'string' ? LUMEN.Utils.safeJson(json) : json;
                if (!data) {
                    done('invalid JSON', []);
                    return;
                }
                var raw = data.items || data.results || data;
                if (!Array.isArray(raw)) {
                    done('items[] required', []);
                    return;
                }
                var items = raw.map(function (it) {
                    return {
                        title: it.title || it.name || title,
                        subtitle: it.subtitle || it.voice || 'Custom',
                        voice: it.voice || '',
                        quality: it.quality || '',
                        url: it.url || '',
                        season: it.season || null,
                        episode: it.episode || null,
                        playlist: it.playlist || null,
                        qualityMap: it.qualityMap || it.qualities || null,
                        kind: it.kind || (it.playlist ? 'season' : 'movie')
                    };
                }).filter(function (it) {
                    return it.url || (it.playlist && it.playlist.length) || it.qualityMap;
                });
                done(null, items);
            }, function () {
                done('network error', []);
            });
        }
    });


/* ===== 07-playback.js ===== */

    // ===== Playback mapper → Lampa.Player =====
    LUMEN.Playback = {
        playItem: function (item, card) {
            if (!item) {
                Lampa.Noty.show(LUMEN.t('lumen_play_error'));
                return;
            }

            var title = (item.title || LUMEN.Utils.movieTitle(card) || 'LUMEN');
            var data = {
                title: title,
                url: item.url || '',
                timeline: (card && card.timeline) || false,
                card: card || null
            };

            if (item.qualityMap && typeof item.qualityMap === 'object') {
                data.quality = item.qualityMap;
                if (!data.url) {
                    var keys = Object.keys(item.qualityMap);
                    if (keys.length) data.url = item.qualityMap[keys[0]];
                }
            }

            if (item.playlist && item.playlist.length) {
                data.playlist = item.playlist.map(function (p) {
                    return {
                        title: p.title || title,
                        url: p.url,
                        timeline: p.timeline || false
                    };
                });
                if (!data.url && data.playlist[0]) data.url = data.playlist[0].url;
            }

            if (!data.url) {
                LUMEN.Debug.error('play without url: ' + title);
                Lampa.Noty.show(LUMEN.t('lumen_play_error'));
                return;
            }

            LUMEN.Debug.log('Player.play ' + title + ' · ' + data.url.slice(0, 80));
            Lampa.Player.play(data);
            if (data.playlist && data.playlist.length) {
                try { Lampa.Player.playlist(data.playlist); } catch (e) {}
            }
        },

        chooseQualityThenPlay: function (item, card, onBack) {
            if (!item.qualityMap || typeof item.qualityMap !== 'object') {
                LUMEN.Playback.playItem(item, card);
                return;
            }
            var keys = Object.keys(item.qualityMap);
            if (keys.length <= 1) {
                LUMEN.Playback.playItem(item, card);
                return;
            }
            Lampa.Select.show({
                title: item.title || 'Quality',
                items: keys.map(function (q) {
                    return { title: q, url: item.qualityMap[q], quality: q };
                }),
                onSelect: function (el) {
                    var copy = {};
                    var k;
                    for (k in item) if (Object.prototype.hasOwnProperty.call(item, k)) copy[k] = item[k];
                    copy.url = el.url;
                    copy.quality = el.quality;
                    LUMEN.Playback.playItem(copy, card);
                },
                onBack: function () {
                    if (onBack) onBack();
                    else Lampa.Controller.toggle('content');
                }
            });
        }
    };


/* ===== components/sources.js ===== */

    // ===== Activity: lumen_sources =====
    // Contract: constructor MUST NOT return DOM. create()+render() required. stop ≠ destroy.
    LUMEN.SourcesComponent = function (object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div class="lumen-screen"></div>');
        var inited = false;
        var last = null;
        var movie = object.movie || null;
        var focusKey = 'focus_sources_' + (movie && movie.id ? movie.id : 'x');

        this.create = function () {
            inited = true;
            html.empty();
            html.append(scroll.render(true));
            this.drawHero();
            this.showLoading();
            this.load();
            return this.render();
        };

        this.render = function (add_class) {
            // ActivitySlide may call render(true)
            return html;
        };

        this.drawHero = function () {
            var poster = LUMEN.Utils.posterUrl(movie, 'w300');
            var title = LUMEN.Utils.movieTitle(movie) || 'LUMEN';
            var year = LUMEN.Utils.movieYear(movie);
            var overview = (movie && movie.overview) ? movie.overview : '';
            var hero = $('<div class="lumen-hero"></div>');

            if (poster) {
                hero.append($('<img class="lumen-hero__poster" loading="lazy" alt="">').attr('src', poster));
            } else {
                hero.append($('<div class="lumen-hero__poster lumen-hero__poster--empty">LUMEN</div>'));
            }

            var meta = $('<div class="lumen-hero__meta"></div>');
            meta.append($('<div class="lumen-hero__title"></div>').text(title));
            meta.append($('<div class="lumen-hero__sub"></div>').text(
                (year ? year + ' · ' : '') + (LUMEN.Utils.isTv(movie) ? 'TV' : 'Movie')
                + (movie && movie.id ? ' · TMDB ' + movie.id : '')
            ));
            if (overview) meta.append($('<div class="lumen-hero__overview"></div>').text(overview));
            hero.append(meta);

            // hero sits above scroll content via prepend to html
            html.prepend(hero);
            object._lumen_title = title;
            object._lumen_overview = overview;
            LUMEN.Debug.log('sources hero: ' + title + ' id=' + (movie && movie.id));
        };

        this.showLoading = function () {
            scroll.clear();
            scroll.append(
                $('<div class="lumen-loading">'
                    + '<div class="lumen-loading__title">' + LUMEN.t('lumen_loading') + '</div>'
                    + '<div class="lumen-loading__text">' + (object._lumen_title || '') + '</div>'
                    + '</div>')
            );
        };

        this.showEmpty = function (hint) {
            if (!inited) return;
            scroll.clear();
            scroll.append(
                $('<div class="lumen-empty">'
                    + '<div class="lumen-empty__title">' + LUMEN.t('lumen_empty') + '</div>'
                    + '<div class="lumen-empty__text">' + (hint || LUMEN.t('lumen_empty_hint')) + '</div>'
                    + '</div>')
            );
            this.start();
        };

        this.load = function () {
            var self = this;
            if (!movie) {
                this.showEmpty(LUMEN.t('lumen_no_movie'));
                return;
            }
            LUMEN.Providers.searchAll(movie, network, function (err, items) {
                if (!inited) return;
                if (err) LUMEN.Debug.warn('searchAll: ' + err);
                if (!items || !items.length) {
                    self.showEmpty(err ? String(err) : LUMEN.t('lumen_empty_hint'));
                    return;
                }
                self.buildList(items);
            });
        };

        this.buildList = function (items) {
            var self = this;
            scroll.clear();
            scroll.append($('<div class="lumen-section-title"></div>').text(LUMEN.t('lumen_sources')));

            var saved = LUMEN.Utils.loadFocus(focusKey);
            var i;
            for (i = 0; i < items.length; i++) {
                (function (item, index) {
                    var el = $(
                        '<div class="lumen-card selector">'
                            + '<div class="lumen-card__body">'
                            + '<div class="lumen-card__title"></div>'
                            + '<div class="lumen-card__info"></div>'
                            + '</div>'
                            + '<div class="lumen-card__badge"></div>'
                            + '</div>'
                    );
                    el.find('.lumen-card__title').text(item.title || 'Source');
                    el.find('.lumen-card__info').text(
                        [item.providerTitle || item.provider || '', item.voice || '', item.subtitle || '']
                            .filter(Boolean).join(' · ')
                    );
                    el.find('.lumen-card__badge').text(item.quality || item.kind || 'OK');
                    el.attr('data-lumen-index', String(index));

                    el.on('hover:focus', function (e) {
                        last = e.target;
                        LUMEN.Utils.saveFocus(focusKey, String(index));
                        try { scroll.update($(e.target), true); } catch (err) {}
                    });

                    el.on('hover:enter', function () {
                        self.onSelect(item);
                    });

                    scroll.append(el);
                    if (saved !== '' && String(index) === String(saved)) last = el[0];
                })(items[i], i);
            }

            this.start();
        };

        this.onSelect = function (item) {
            var self = this;
            var card = movie;

            // Series from Jellyfin-like adapters (future) or season playlist
            if (item.resolveEpisodes && item.meta && LUMEN.Jellyfin && item.provider === 'jellyfin') {
                // not in v1 build — fallback
            }

            if (item.kind === 'series' || (item.resolveEpisodes && item.meta)) {
                Lampa.Noty.show('Серии: подключите adapter или playlist в Custom JSON');
                return;
            }

            if (item.playlist && item.playlist.length && (item.kind === 'season' || LUMEN.Utils.isTv(card))) {
                Lampa.Activity.push({
                    url: '',
                    title: LUMEN.t('lumen_episodes'),
                    component: LUMEN.COMPONENT_EPISODES,
                    movie: card,
                    lumen_item: item,
                    page: 1
                });
                return;
            }

            if (item.qualityMap) {
                LUMEN.Playback.chooseQualityThenPlay(item, card, function () {
                    Lampa.Controller.toggle('content');
                });
                return;
            }

            LUMEN.Playback.playItem(item, card);
        };

        this.start = function () {
            if (!inited) return;
            var self = this;
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};

        this.stop = function () {
            // IMPORTANT: do NOT destroy here — activity stays in stack (bugfix)
        };

        this.destroy = function () {
            inited = false;
            try { network.clear(); } catch (e) {}
            try { scroll.destroy(); } catch (e2) {}
            try { html.remove(); } catch (e3) {}
            last = null;
            LUMEN.Debug.log('sources destroy');
        };
    };


/* ===== components/episodes.js ===== */

    // ===== Activity: lumen_episodes =====
    LUMEN.EpisodesComponent = function (object) {
        var scroll = new Lampa.Scroll({ mask: true, over: true });
        var html = $('<div class="lumen-screen"></div>');
        var inited = false;
        var last = null;
        var movie = object.movie || null;
        var sourceItem = object.lumen_item || {};
        var focusKey = 'focus_eps_' + (movie && movie.id ? movie.id : 'x') + '_' + (sourceItem.season || '0');

        this.create = function () {
            inited = true;
            html.empty();
            html.append(scroll.render(true));
            this.build();
            return this.render();
        };

        this.render = function () {
            return html;
        };

        this.build = function () {
            var self = this;
            var list = sourceItem.playlist || [];
            scroll.clear();

            var head = $('<div class="lumen-hero"></div>');
            var poster = LUMEN.Utils.posterUrl(movie, 'w300');
            if (poster) head.append($('<img class="lumen-hero__poster" loading="lazy" alt="">').attr('src', poster));
            var meta = $('<div class="lumen-hero__meta"></div>');
            meta.append($('<div class="lumen-hero__title"></div>').text(sourceItem.title || LUMEN.Utils.movieTitle(movie)));
            meta.append($('<div class="lumen-hero__sub"></div>').text(LUMEN.t('lumen_episodes')));
            head.append(meta);
            html.prepend(head);

            scroll.append($('<div class="lumen-section-title"></div>').text(LUMEN.t('lumen_episodes')));

            if (!list.length) {
                scroll.append($('<div class="lumen-empty"><div class="lumen-empty__title">' + LUMEN.t('lumen_empty') + '</div></div>'));
                this.start();
                return;
            }

            var saved = LUMEN.Utils.loadFocus(focusKey);
            var i;
            for (i = 0; i < list.length; i++) {
                (function (ep, index) {
                    var el = $(
                        '<div class="lumen-card selector">'
                            + '<div class="lumen-card__body">'
                            + '<div class="lumen-card__title"></div>'
                            + '<div class="lumen-card__info"></div>'
                            + '</div>'
                            + '<div class="lumen-card__badge"></div>'
                            + '</div>'
                    );
                    el.find('.lumen-card__title').text(ep.title || (LUMEN.t('lumen_episode') + ' ' + (ep.episode || (index + 1))));
                    el.find('.lumen-card__info').text(
                        (ep.season ? (LUMEN.t('lumen_season') + ' ' + ep.season) : '')
                    );
                    el.find('.lumen-card__badge').text(ep.quality || '▶');
                    el.attr('data-lumen-index', String(index));

                    el.on('hover:focus', function (e) {
                        last = e.target;
                        LUMEN.Utils.saveFocus(focusKey, String(index));
                        try { scroll.update($(e.target), true); } catch (err) {}
                    });

                    el.on('hover:enter', function () {
                        // play from this episode with remaining playlist
                        var playlist = list.slice(index).map(function (p) {
                            return { title: p.title, url: p.url };
                        });
                        LUMEN.Playback.playItem({
                            title: ep.title,
                            url: ep.url,
                            playlist: playlist
                        }, movie);
                    });

                    scroll.append(el);
                    if (saved !== '' && String(index) === String(saved)) last = el[0];
                })(list[i], i);
            }

            this.start();
        };

        this.start = function () {
            if (!inited) return;
            Lampa.Controller.add('content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(scroll.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function () {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: function () {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                left: function () {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: function () {
                    if (Navigator.canmove('right')) Navigator.move('right');
                },
                back: function () {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.destroy = function () {
            inited = false;
            try { scroll.destroy(); } catch (e) {}
            try { html.remove(); } catch (e2) {}
            last = null;
        };
    };


/* ===== 08-full-hook.js ===== */

    // ===== Full-card button (only full:complite + e.data.movie) =====
    LUMEN.FullHook = {
        addButton: function (e) {
            try {
                if (!e || e.type !== 'complite') return;
                if (!e.object || !e.object.activity || !e.data || !e.data.movie) {
                    LUMEN.Debug.warn('full:complite without movie');
                    return;
                }

                var render = e.object.activity.render();
                if (!render || !render.length) return;
                if (render.find('.button--lumen').length) return;

                var movie = e.data.movie;
                var btn = $(
                    '<div class="full-start__button selector button--lumen">'
                        + '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
                        + '<span>' + LUMEN.t('lumen_button') + '</span>'
                        + '</div>'
                );

                btn.on('hover:enter', function () {
                    // Always push a copy of movie on activity params (survives stop/start)
                    var card = movie;
                    if (!card) {
                        Lampa.Noty.show(LUMEN.t('lumen_no_movie'));
                        return;
                    }
                    LUMEN.Debug.log('push sources for ' + LUMEN.Utils.movieTitle(card) + ' #' + card.id);
                    Lampa.Activity.push({
                        url: '',
                        title: LUMEN.t('lumen_sources'),
                        component: LUMEN.COMPONENT_SOURCES,
                        movie: card,
                        search: LUMEN.Utils.movieTitle(card),
                        search_one: LUMEN.Utils.movieTitle(card),
                        search_two: LUMEN.Utils.movieOriginal(card),
                        page: 1
                    });
                });

                var anchor = render.find('.view--torrent').first();
                if (anchor.length) {
                    anchor.after(btn);
                } else {
                    var buttons = render.find('.full-start__buttons, .full-start-new__buttons').first();
                    if (buttons.length) buttons.prepend(btn);
                    else {
                        var anyBtn = render.find('.full-start__button').last();
                        if (anyBtn.length) anyBtn.after(btn);
                        else {
                            LUMEN.Debug.warn('no button container to append LUMEN');
                            return;
                        }
                    }
                }
                LUMEN.Debug.log('LUMEN button attached');
            } catch (err) {
                LUMEN.Debug.error('addButton: ' + (err && err.message ? err.message : err));
            }
        },

        install: function () {
            Lampa.Listener.follow('full', function (e) {
                // Do NOT listen to 'build' — movie payload may be incomplete (bug #1 hypothesis)
                if (e.type === 'complite') LUMEN.FullHook.addButton(e);
            });
        }
    };


/* ===== 09-manifest.js ===== */

    // ===== Manifest context menu =====
    LUMEN.registerManifest = function () {
        try {
            Lampa.Manifest.plugins = {
                type: 'video',
                version: LUMEN.VERSION,
                name: 'LUMEN',
                description: 'LUMEN v1 — user-authorized sources',
                onContextMenu: function () {
                    return { title: LUMEN.t('lumen_button') };
                },
                onContextLauch: function (card) {
                    if (!card) return;
                    Lampa.Activity.push({
                        url: '',
                        title: LUMEN.t('lumen_sources'),
                        component: LUMEN.COMPONENT_SOURCES,
                        movie: card,
                        search: LUMEN.Utils.movieTitle(card),
                        search_one: LUMEN.Utils.movieTitle(card),
                        search_two: LUMEN.Utils.movieOriginal(card),
                        page: 1
                    });
                }
            };
        } catch (e) {
            LUMEN.Debug.warn('Manifest.plugins: ' + e);
        }
    };


/* ===== 10-init.js ===== */

    // ===== Init =====
    LUMEN.init = function () {
        LUMEN.injectStyles();
        LUMEN.registerLang();
        LUMEN.Debug.install();
        LUMEN.registerSettings();
        LUMEN.registerManifest();

        Lampa.Component.add(LUMEN.COMPONENT_SOURCES, LUMEN.SourcesComponent);
        Lampa.Component.add(LUMEN.COMPONENT_EPISODES, LUMEN.EpisodesComponent);

        LUMEN.FullHook.install();
        LUMEN.Debug.log('init complete v' + LUMEN.VERSION);
        try {
            Lampa.Noty.show('LUMEN ' + LUMEN.VERSION + ' готов', { time: 2000 });
        } catch (e) {}
    };

    if (window.appready) LUMEN.init();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') LUMEN.init();
        });
    }
})();

