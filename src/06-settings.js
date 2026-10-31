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
