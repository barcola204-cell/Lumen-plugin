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
