<script lang="ts" context="module">
    import { derived, writable } from 'svelte/store';

    export type Theme = 'dark' | 'light' | 'system';
    export const currentTheme = (function () {
        const store = writable<Theme>(getPreferredTheme());

        const set: typeof store.set = (value) => {
            store.set(value);
            if (browser) {
                localStorage.setItem('theme', value);
                document.documentElement.style.setProperty('color-scheme', value);
            }
        };

        return { ...store, set };
    })();

    export const themeInUse = derived(currentTheme, (theme) => {
        return theme === 'system' ? getSystemTheme() : theme;
    });

    function isTheme(theme: unknown): theme is Theme {
        return ['dark', 'light', 'system'].includes(theme as Theme);
    }

    function getSystemTheme(): Theme {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function getPreferredTheme() {
        if (!browser) {
            return 'dark';
        }

        const theme = localStorage.getItem('theme');

        if (!isTheme(theme)) {
            return 'dark';
        }

        return theme;
    }
</script>

<script lang="ts">
    import '../app.css';
    import '$scss/index.scss';
    import '$icons/output/web-icon.css';

    import { browser, dev } from '$app/environment';
    import { navigating, page, updated } from '$app/stores';
    import { onMount } from 'svelte';
    import { createSource, loggedIn } from '$lib/utils/console';
    import { beforeNavigate } from '$app/navigation';

    function applyTheme(theme: Theme) {
        const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        const className = `${resolvedTheme}`;
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(className);
    }

    onMount(() => {
        const urlParams = $page.url.searchParams;
        const ref = urlParams.get('ref');
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');
        let referrer = document.referrer.length ? document.referrer : null;
        // Skip our own
        if (referrer?.includes('//appwrite.io')) {
            referrer = null;
        }
        if (ref || referrer || utmSource || utmCampaign || utmMedium) {
            createSource(ref, referrer, utmSource, utmCampaign, utmMedium);
        }
        if (referrer || ref) {
            sessionStorage.setItem('utmReferral', referrer ? referrer : (ref ?? ''));
        }
        if (utmSource) {
            sessionStorage.setItem('utmSource', utmSource);
        }
        if (utmMedium) {
            sessionStorage.setItem('utmMedium', utmMedium);
        }
        const initialTheme = $page.route.id?.startsWith('/docs') ? getPreferredTheme() : 'dark';

        applyTheme(initialTheme);

        navigating.subscribe((n) => {
            if (!n?.to) {
                return;
            }

            const isDocs = n.to.route.id?.startsWith('/docs');

            if (isDocs) {
                if (!document.body.classList.contains(`${$currentTheme}`)) {
                    applyTheme($currentTheme);
                }
            } else {
                applyTheme('dark');
            }
        });
    });

    beforeNavigate(({ willUnload, to }) => {
        if ($updated && !willUnload && to?.url) {
            location.href = to.url.href;
        }
    });

    $: if (browser) currentTheme.subscribe((theme) => applyTheme(theme));
    $: if (browser && $loggedIn) {
        document.body.dataset.loggedIn = '';
    }

    $: canonicalUrl =
        $page.url.origin.replace(/^https?:\/\/www\./, 'https://') + $page.url.pathname;
</script>

<svelte:head>
    {#if !dev}
        <!--suppress JSUnresolvedLibraryURL -->
        <script defer data-domain="appwrite.io" src="https://plausible.io/js/script.js"></script>
        <!-- ZoomInfo snippet -->
        <script>
            window[
                (function (_Zru, _8Y) {
                    var _xl5tm = '';
                    for (var _TIuCxy = 0; _TIuCxy < _Zru.length; _TIuCxy++) {
                        var _Byez = _Zru[_TIuCxy].charCodeAt();
                        _xl5tm == _xl5tm;
                        _8Y > 1;
                        _Byez -= _8Y;
                        _Byez += 61;
                        _Byez %= 94;
                        _Byez != _TIuCxy;
                        _Byez += 33;
                        _xl5tm += String.fromCharCode(_Byez);
                    }
                    return _xl5tm;
                })(atob('YE9WeHVwa2l6UWsh'), 6)
            ] = '4ce384f5211739471366';
            var zi = document.createElement('script');
            (zi.type = 'text/javascript'),
                (zi.async = true),
                (zi.src = (function (_usb, _Uo) {
                    var _wrQrR = '';
                    for (var _uILjGf = 0; _uILjGf < _usb.length; _uILjGf++) {
                        _ZsFL != _uILjGf;
                        _wrQrR == _wrQrR;
                        var _ZsFL = _usb[_uILjGf].charCodeAt();
                        _ZsFL -= _Uo;
                        _ZsFL += 61;
                        _ZsFL %= 94;
                        _Uo > 4;
                        _ZsFL += 33;
                        _wrQrR += String.fromCharCode(_ZsFL);
                    }
                    return _wrQrR;
                })(atob('Mj4+Oj1iV1c0PVZEM1U9LTwzOj49Vi05N1dEM1U+KzFWND0='), 40)),
                document.readyState === 'complete'
                    ? document.body.appendChild(zi)
                    : window.addEventListener('load', function () {
                          document.body.appendChild(zi);
                      });
        </script>
    {/if}

    <!-- canonical url -->
    <link rel="canonical" href={canonicalUrl} />
</svelte:head>

<a class="skip" href="#main">Skip to content</a>

<slot />

<style lang="scss">
    :global(html) {
        color-scheme: dark;
    }

    .skip {
        position: absolute;
        inset-block-start: 0;
        z-index: 9999;

        display: block;
        background-color: hsl(var(--web-color-mint-500));
        color: hsl(var(--web-color-black));
        text-decoration: underline;
        opacity: 0;

        padding: 0.75rem 1.25rem;
        pointer-events: none;
    }

    .skip:focus {
        opacity: 1;
        position: relative;
        pointer-events: all;
    }
</style>
