(() => {
    const home = document.getElementById('dwayne-home');
    const about = document.getElementById('dwayne-about');
    const views = new Map([[home.dataset.path, home], [about.dataset.path, about]]);
    let current = home.hidden ? about : home;

    const show = view => {
        const previous = current;
        previous.hidden = true;
        current = view;
        current.hidden = false;
        document.body.classList.toggle('about-page', view === about);
        document.title = view.dataset.title;
        previous.dispatchEvent(new Event('portfolio:viewchange'));
        view.dispatchEvent(new Event('portfolio:viewchange'));
        view.querySelector('main').focus({ preventScroll: true });
    };

    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
        const url = new URL(link.href);
        const view = views.get(url.pathname);
        if (url.origin !== location.origin || !view || view === current) return;

        event.preventDefault();
        history.pushState(null, '', url);
        show(view);
        const anchor = document.getElementById(url.hash.slice(1));
        if (anchor && view.contains(anchor)) anchor.scrollIntoView({ behavior: 'instant' });
        else window.scrollTo({ top: 0, behavior: 'instant' });
    });

    window.addEventListener('popstate', () => {
        const view = views.get(location.pathname);
        if (view && view !== current) show(view);
    });
})();
