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
