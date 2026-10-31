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
