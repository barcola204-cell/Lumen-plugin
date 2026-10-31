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
