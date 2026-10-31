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
