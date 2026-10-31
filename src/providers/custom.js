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
