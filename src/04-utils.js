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
