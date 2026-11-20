(() => {
    const carousel = document.querySelector('.project-preview[aria-roledescription="carousel"]');
    if (!carousel) return;

    const viewport = carousel.querySelector('.carousel-viewport');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const previous = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const counter = carousel.querySelector('.carousel-counter');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let dragStart = null;

    const update = () => {
        current = Math.min(slides.length - 1, Math.max(0, Math.round(viewport.scrollLeft / (viewport.clientWidth || 1))));
        previous.disabled = current === 0;
        next.disabled = current === slides.length - 1;
        counter.textContent = `${current + 1} / ${slides.length}`;
    };
    const goTo = (index, behavior = reducedMotion.matches ? 'auto' : 'smooth') => {
        const target = Math.min(slides.length - 1, Math.max(0, index));
        viewport.scrollTo({ left: target * viewport.clientWidth, behavior });
    };

    previous.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    viewport.addEventListener('scroll', update, { passive: true });
    carousel.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    viewport.addEventListener('pointerdown', event => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        dragStart = { x: event.clientX, scrollLeft: viewport.scrollLeft, pointerId: event.pointerId };
        viewport.setPointerCapture(event.pointerId);
        viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', event => {
        if (!dragStart || event.pointerId !== dragStart.pointerId) return;
        viewport.scrollLeft = dragStart.scrollLeft + dragStart.x - event.clientX;
    });
    const endDrag = event => {
        if (!dragStart || event.pointerId !== dragStart.pointerId) return;
        dragStart = null;
        viewport.classList.remove('is-dragging');
        viewport.releasePointerCapture(event.pointerId);
        goTo(Math.round(viewport.scrollLeft / (viewport.clientWidth || 1)));
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', () => goTo(current, 'auto'));
    update();
})();
