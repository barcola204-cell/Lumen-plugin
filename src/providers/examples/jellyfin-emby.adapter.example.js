/**
 * EXAMPLE ONLY — not included in LUMEN v1 build.
 * Copy into src/providers/ and register when you have a media server.
 * Implements the same search(card, network, done) contract as Custom/Demo.
 */
    // ===== Jellyfin / Emby adapters (user server + API key) =====
    (function () {
        function normalizeBase(url) {
            if (!url) return '';
            return String(url).replace(/\/+$/, '');
        }

        function makeAdapter(opts) {
            return {
                id: opts.id,
                title: opts.title,
                enabled: function () {
                    return !!(normalizeBase(LUMEN.field(opts.urlKey, '')) && LUMEN.field(opts.tokenKey, ''));
                },
                search: function (card, network, done) {
                    var base = normalizeBase(LUMEN.field(opts.urlKey, ''));
                    var token = LUMEN.field(opts.tokenKey, '');
                    if (!base || !token) {
                        done(null, []);
                        return;
                    }

                    var title = LUMEN.Utils.movieTitle(card);
                    var original = LUMEN.Utils.movieOriginal(card);
                    var year = LUMEN.Utils.movieYear(card);
                    var isTv = LUMEN.Utils.isTv(card);
                    var searchTerm = encodeURIComponent(title || original || '');
                    var include = isTv ? 'Movie,Series,Episode' : 'Movie,Series';
                    var url = base + '/Items?SearchTerm=' + searchTerm
                        + '&IncludeItemTypes=' + include
                        + '&Recursive=true&Fields=Overview,ProviderIds,MediaSources,Path'
                        + '&Limit=20';

                    network.silent(url, function (json) {
                        var data = typeof json === 'string' ? LUMEN.Utils.safeJson(json) : json;
                        if (!data || !data.Items) {
                            done('bad response', []);
                            return;
                        }

                        var items = [];
                        data.Items.forEach(function (it) {
                            if (year && it.ProductionYear && String(it.ProductionYear) !== String(year)) {
                                // soft filter — keep if title strongly matches
                                var n = (it.Name || '').toLowerCase();
                                var t = (title || '').toLowerCase();
                                if (n !== t && n.indexOf(t) === -1) return;
                            }

                            if (it.Type === 'Series') {
                                items.push({
                                    title: it.Name || title,
                                    subtitle: opts.title + ' · Series',
                                    voice: opts.title,
                                    quality: '',
                                    kind: 'series',
                                    season: null,
                                    meta: { server: base, token: token, id: it.Id, type: 'Series' },
                                    // lazy episodes resolved on select
                                    resolveEpisodes: true
                                });
                                return;
                            }

                            var stream = base + '/Videos/' + encodeURIComponent(it.Id)
                                + '/stream?Static=true&api_key=' + encodeURIComponent(token);
                            items.push({
                                title: it.Name || title,
                                subtitle: opts.title + (it.Type === 'Episode' && it.IndexNumber
                                    ? (' · S' + (it.ParentIndexNumber || '?') + 'E' + it.IndexNumber)
                                    : (' · ' + (it.Type || 'Video'))),
                                voice: opts.title,
                                quality: (it.Width ? (it.Width + 'p') : ''),
                                url: stream,
                                kind: it.Type === 'Episode' ? 'episode' : 'movie',
                                season: it.ParentIndexNumber || null,
                                episode: it.IndexNumber || null,
                                meta: { server: base, token: token, id: it.Id, type: it.Type }
                            });
                        });

                        done(null, items);
                    }, function () {
                        done('network error', []);
                    }, false, {
                        headers: {
                            'X-Emby-Token': token,
                            'X-Emby-Authorization': 'MediaBrowser Client="LUMEN", Device="Lampa", DeviceId="lumen", Version="' + LUMEN.VERSION + '", Token="' + token + '"'
                        }
                    });
                },

                fetchEpisodes: function (meta, network, done) {
                    var base = meta.server;
                    var token = meta.token;
                    var url = base + '/Shows/' + encodeURIComponent(meta.id)
                        + '/Episodes?Fields=Overview,MediaSources&Limit=200';

                    network.silent(url, function (json) {
                        var data = typeof json === 'string' ? LUMEN.Utils.safeJson(json) : json;
                        if (!data || !data.Items) {
                            done('bad episodes', []);
                            return;
                        }
                        var playlist = data.Items.map(function (ep) {
                            return {
                                title: 'S' + (ep.ParentIndexNumber || 0) + 'E' + (ep.IndexNumber || 0)
                                    + (ep.Name ? (' · ' + ep.Name) : ''),
                                url: base + '/Videos/' + encodeURIComponent(ep.Id)
                                    + '/stream?Static=true&api_key=' + encodeURIComponent(token),
                                season: ep.ParentIndexNumber || null,
                                episode: ep.IndexNumber || null
                            };
                        });
                        done(null, playlist);
                    }, function () {
                        done('network error', []);
                    }, false, {
                        headers: { 'X-Emby-Token': token }
                    });
                }
            };
        }

        var jellyfin = makeAdapter({
            id: 'jellyfin',
            title: 'Jellyfin',
            urlKey: 'lumen_jellyfin_url',
            tokenKey: 'lumen_jellyfin_token'
        });
        var emby = makeAdapter({
            id: 'emby',
            title: 'Emby',
            urlKey: 'lumen_emby_url',
            tokenKey: 'lumen_emby_token'
        });

        LUMEN.Providers.register(jellyfin);
        LUMEN.Providers.register(emby);
        LUMEN.Jellyfin = jellyfin;
        LUMEN.Emby = emby;
    })();
