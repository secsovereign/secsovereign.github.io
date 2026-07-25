(function () {
    'use strict';

    function encode(value) {
        return encodeURIComponent(value || '');
    }

    function buildShareActions(ctx) {
        var url = ctx.url;
        var title = ctx.title;
        var text = ctx.text || title;
        var emailBody = text + '\n\n' + url;

        return [
            {
                id: 'native',
                label: 'Share',
                icon: 'fa-solid fa-share-nodes',
                native: true,
                hidden: !navigator.share,
            },
            {
                id: 'x',
                label: 'X',
                icon: 'fab fa-twitter',
                popup: 'https://twitter.com/intent/tweet?url=' + encode(url) + '&text=' + encode(text),
            },
            {
                id: 'facebook',
                label: 'Facebook',
                icon: 'fab fa-facebook',
                popup: 'https://www.facebook.com/sharer/sharer.php?u=' + encode(url),
            },
            {
                id: 'linkedin',
                label: 'LinkedIn',
                icon: 'fab fa-linkedin',
                popup: 'https://www.linkedin.com/sharing/share-offsite/?url=' + encode(url),
            },
            {
                id: 'reddit',
                label: 'Reddit',
                icon: 'fab fa-reddit',
                popup: 'https://www.reddit.com/submit?url=' + encode(url) + '&title=' + encode(title),
            },
            {
                id: 'hackernews',
                label: 'HN',
                icon: 'fab fa-hacker-news',
                popup: 'https://news.ycombinator.com/submitlink?u=' + encode(url) + '&t=' + encode(title),
            },
            {
                id: 'telegram',
                label: 'Telegram',
                icon: 'fab fa-telegram',
                popup: 'https://t.me/share/url?url=' + encode(url) + '&text=' + encode(text),
            },
            {
                id: 'whatsapp',
                label: 'WhatsApp',
                icon: 'fab fa-whatsapp',
                popup: 'https://wa.me/?text=' + encode(text + ' ' + url),
            },
            {
                id: 'email',
                label: 'Email',
                icon: 'fa-solid fa-envelope',
                href: 'mailto:?subject=' + encode(title) + '&body=' + encode(emailBody),
            },
            {
                id: 'copy',
                label: 'Copy',
                icon: 'fa-solid fa-link',
                copy: url,
            },
        ];
    }

    function openPopup(url) {
        window.open(url, 'secsov-share', 'noopener,noreferrer,width=640,height=520');
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(ta);
            }
        });
    }

    function readContext(el) {
        return {
            url: el.getAttribute('data-share-url') || window.location.href,
            title: el.getAttribute('data-share-title') || document.title,
            text: el.getAttribute('data-share-text') || '',
        };
    }

    function createActionElement(action, ctx) {
        var el = document.createElement(action.copy || action.native ? 'button' : 'a');
        el.className = 'share-menu-item';
        el.type = action.copy || action.native ? 'button' : undefined;
        if (action.hidden) el.classList.add('is-hidden');
        el.setAttribute('data-share-id', action.id);
        el.title = action.label;
        el.innerHTML = '<i class="' + action.icon + '" aria-hidden="true"></i><span>' + action.label + '</span>';

        if (action.href) {
            el.href = action.href;
        }

        el.addEventListener('click', function (ev) {
            if (action.native) {
                ev.preventDefault();
                navigator.share({ title: ctx.title, text: ctx.text || ctx.title, url: ctx.url }).catch(function () {});
                return;
            }
            if (action.copy) {
                ev.preventDefault();
                copyText(action.copy).then(function () {
                    var label = el.querySelector('span');
                    var prev = label.textContent;
                    el.classList.add('is-copied');
                    label.textContent = 'Copied';
                    setTimeout(function () {
                        el.classList.remove('is-copied');
                        label.textContent = prev;
                    }, 1600);
                }).catch(function () {});
                return;
            }
            if (action.popup) {
                ev.preventDefault();
                openPopup(action.popup);
            }
        });

        return el;
    }

    function initDropdown(widget) {
        var ctx = readContext(widget);
        var trigger = widget.querySelector('.share-trigger');
        var menu = widget.querySelector('.share-menu');
        if (!trigger || !menu) return;

        buildShareActions(ctx).forEach(function (action) {
            menu.appendChild(createActionElement(action, ctx));
        });

        var outsideClickHandler = null;

        function closeMenu() {
            menu.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            if (outsideClickHandler) {
                document.removeEventListener('click', outsideClickHandler, true);
                document.removeEventListener('touchend', outsideClickHandler, true);
                outsideClickHandler = null;
            }
        }

        function openMenu() {
            menu.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            outsideClickHandler = function (ev) {
                if (!widget.contains(ev.target)) closeMenu();
            };
            setTimeout(function () {
                document.addEventListener('click', outsideClickHandler, true);
                document.addEventListener('touchend', outsideClickHandler, true);
            }, 0);
        }

        trigger.addEventListener('click', function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            if (menu.classList.contains('is-open')) closeMenu();
            else openMenu();
        });

        document.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape') closeMenu();
        });
    }

    function initIconBar(bar) {
        var ctx = readContext(bar);
        var container = bar.querySelector('.article-share-icons');
        if (!container) return;

        buildShareActions(ctx).forEach(function (action) {
            if (action.hidden) return;
            var el = createActionElement(action, ctx);
            el.classList.remove('share-menu-item');
            el.classList.add('share-icon-btn');
            el.querySelector('span').remove();
            el.setAttribute('aria-label', action.label);
            container.appendChild(el);
        });
    }

    document.querySelectorAll('.share-widget').forEach(initDropdown);
    document.querySelectorAll('.article-share-bar').forEach(initIconBar);
})();
