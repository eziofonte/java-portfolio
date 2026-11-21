(() => {
    // Replace these placeholder paths and descriptions with your own photos.
    // Each photo can belong to one or more of: places, favorites, cars.
    const photos = [
        { src: '/dwayne/assets/photos/fav1.jpg', alt: 'Placeholder portrait of Dwayne', categories: ['favorites'] },
        { src: '/dwayne/assets/photos/fav2.png', alt: 'Placeholder portrait of Dwayne', categories: ['favorites'] },
        { src: '/dwayne/assets/photos/fav3.png', alt: 'Placeholder portrait of Dwayne', categories: ['favorites'] },
        { src: '/dwayne/assets/photos/fav4.png', alt: 'Placeholder portrait of Dwayne', categories: ['favorites'] },
        { src: '/dwayne/assets/photos/fav5.png', alt: 'Placeholder portrait of Dwayne', categories: ['favorites'] },

        { src: '/dwayne/assets/photos/places1.png', alt: 'Placeholder project screenshot for places', categories: ['places'] },
        { src: '/dwayne/assets/photos/places2.png', alt: 'Placeholder project screenshot for places', categories: ['places'] },
        { src: '/dwayne/assets/photos/places3.png', alt: 'Placeholder project screenshot for places', categories: ['places'] },
        { src: '/dwayne/assets/photos/places4.png', alt: 'Placeholder project screenshot for places', categories: ['places'] },
        { src: '/dwayne/assets/photos/places5.png', alt: 'Placeholder project screenshot for places', categories: ['places'] },

        { src: '/dwayne/assets/photos/cars1.png', alt: 'Placeholder project screenshot for cars', categories: ['cars'] },
        { src: '/dwayne/assets/photos/cars2.png', alt: 'Placeholder project screenshot for cars', categories: ['cars'] },
        { src: '/dwayne/assets/photos/cars3.png', alt: 'Placeholder project screenshot for cars', categories: ['cars'] },
        { src: '/dwayne/assets/photos/cars4.png', alt: 'Placeholder project screenshot for cars', categories: ['cars'] },
        { src: '/dwayne/assets/photos/cars5.png', alt: 'Placeholder project screenshot for cars', categories: ['cars'] },

    ];
    // Add an audio path or direct audio URL, artwork path, and more tracks here.
    const tracks = [
        { title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', artwork: '/dwayne/assets/music/eagles.png', audio: '/dwayne/assets/music/Eagles%20-%20Hotel%20California.mp3', duration: '6:31' },
        { title: 'Piano Man', artist: 'Billy Joel', album: 'Piano Man', artwork: '/dwayne/assets/music/billyjoel.png', audio: '/dwayne/assets/music/Billy%20Joel%20-%20Piano%20Man.mp3', duration: '5:40' },
        { title: 'Nights', artist: 'Frank Ocean', album: 'Blonde', artwork: '/dwayne/assets/music/frankocean.png', audio: '/dwayne/assets/music/Frank%20Ocean%20-%20Nights.mp3', duration: '5:07' },
        { title: 'Stand By Me', artist: 'Oasis', album: 'Be Here Now', artwork: '/dwayne/assets/music/oasis.png', audio: '/dwayne/assets/music/Oasis%20-%20Stand%20By%20Me.mp3', duration: '5:55' },
        { title: 'Black', artist: 'Pearl Jam', album: 'Ten', artwork: '/dwayne/assets/music/pearljam.png', audio: '/dwayne/assets/music/Pearl%20Jam%20-%20Black.mp3', duration: '5:45' },
    ];

    const about = document.getElementById('dwayne-about');
    const gallery = document.querySelector('.about-photo-card');
    const galleryNext = document.querySelector('.gallery-next');
    const categoryBar = document.querySelector('.gallery-categories');
    const galleryStatus = document.querySelector('.gallery-status');
    const categoryButtons = [...document.querySelectorAll('.gallery-category')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let front = document.querySelector('.gallery-image-front');
    let back = document.querySelector('.gallery-image-back');
    let category = 'all';
    let photoIndex = 0;
    let timer = null;
    let galleryFocused = false;
    let photoRequest = 0;

    const visiblePhotos = () => category === 'all' ? photos : photos.filter(photo => photo.categories.includes(category));
    const showPhoto = (index, announce = false) => {
        const items = visiblePhotos();
        if (!items.length) {
            gallery.classList.add('is-empty');
            galleryStatus.textContent = `No ${category} photos yet`;
            return;
        }
        gallery.classList.remove('is-empty');
        photoIndex = (index + items.length) % items.length;
        const photo = items[photoIndex];
        back.src = photo.src;
        back.alt = photo.alt;
        back.removeAttribute('aria-hidden');
        front.setAttribute('aria-hidden', 'true');
        const request = ++photoRequest;
        window.requestAnimationFrame(() => {
            if (request !== photoRequest) return;
            back.classList.add('is-active');
            front.classList.remove('is-active');
            [front, back] = [back, front];
        });
        if (announce) galleryStatus.textContent = `${category === 'all' ? 'All photos' : category} · ${photoIndex + 1} / ${items.length}`;
    };
    const resetTimer = () => {
        if (timer !== null) window.clearInterval(timer);
        timer = null;
        if (!about.hidden && !document.hidden && !galleryFocused && !reducedMotion.matches && visiblePhotos().length > 1) {
            timer = window.setInterval(() => showPhoto(photoIndex + 1), 7000);
        }
    };
    categoryButtons.forEach(button => button.addEventListener('click', () => {
        category = button.dataset.category;
        categoryButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        categoryBar.style.setProperty('--gallery-selected', categoryButtons.indexOf(button));
        showPhoto(0, true);
        resetTimer();
    }));
    galleryNext.addEventListener('click', () => { showPhoto(photoIndex + 1, true); resetTimer(); });
    let touchStartX = 0;
    galleryNext.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    galleryNext.addEventListener('touchend', event => {
        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) < 40) return;
        event.preventDefault();
        showPhoto(photoIndex + (distance < 0 ? 1 : -1), true);
        resetTimer();
    });
    gallery.addEventListener('focusin', () => { galleryFocused = true; resetTimer(); });
    gallery.addEventListener('focusout', event => {
        if (gallery.contains(event.relatedTarget)) return;
        galleryFocused = false;
        resetTimer();
    });
    document.addEventListener('visibilitychange', resetTimer);
    reducedMotion.addEventListener('change', resetTimer);
    about.addEventListener('portfolio:viewchange', () => {
        if (about.hidden) galleryFocused = false;
        resetTimer();
    });
    resetTimer();

    const music = document.querySelector('.music-card');
    const title = document.querySelector('.music-title');
    const artist = document.querySelector('.music-artist');
    const artwork = document.querySelector('.music-artwork');
    const record = document.querySelector('.music-record');
    const status = document.querySelector('.music-status');
    const playlist = document.querySelector('.music-playlist');
    const playlistToggle = document.querySelector('.music-playlist-toggle');
    const previous = document.querySelector('.music-previous');
    const next = document.querySelector('.music-next');
    const play = document.querySelector('.music-play');
    const mute = document.querySelector('.music-mute');
    const audio = document.querySelector('.music-audio');
    const seek = document.querySelector('.music-seek');
    const elapsed = document.querySelector('.music-elapsed');
    const duration = document.querySelector('.music-duration');
    let trackIndex = 0;
    let audioFailed = false;

    const updateSeekFill = () => seek.style.setProperty('--seek-fill', `${seek.value / seek.max * 100}%`);
    const updateMusic = () => {
        const track = tracks[trackIndex];
        const available = Boolean(track.audio) && !audioFailed;
        title.textContent = track.title;
        artist.textContent = `${track.artist} — ${track.album}`;
        artwork.hidden = !track.artwork;
        record.hidden = Boolean(track.artwork);
        if (track.artwork) { artwork.src = track.artwork; artwork.alt = `${track.title} artwork`; }
        else { artwork.removeAttribute('src'); artwork.alt = ''; }
        previous.disabled = trackIndex === 0;
        next.disabled = trackIndex === tracks.length - 1;
        play.disabled = !available;
        mute.disabled = !available;
        seek.disabled = !available;
        duration.textContent = track.duration;
        playlist.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-current', String(index === trackIndex)));
        play.classList.toggle('is-paused', audio.paused);
        play.setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
        mute.setAttribute('aria-pressed', String(audio.muted));
        mute.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
        mute.classList.toggle('is-muted', audio.muted);
        status.textContent = audioFailed ? 'Audio unavailable' : available ? '' : 'Audio coming soon';
    };
    const startPlayback = () => audio.play().catch(() => { audioFailed = true; music.classList.remove('is-playing'); updateMusic(); });
    const selectTrack = (index, shouldPlay = false) => {
        audio.pause();
        trackIndex = index;
        audioFailed = false;
        const track = tracks[trackIndex];
        if (track.audio) { audio.src = track.audio; audio.load(); }
        else audio.removeAttribute('src');
        updateMusic();
        elapsed.textContent = '0:00';
        seek.value = 0;
        updateSeekFill();
        if (shouldPlay && track.audio) startPlayback();
    };
    playlist.replaceChildren(...tracks.map((track, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        const info = document.createElement('span');
        const name = document.createElement('strong');
        const subtitle = document.createElement('small');
        const time = document.createElement('span');
        name.textContent = track.title;
        subtitle.textContent = `${track.artist} — ${track.album}`;
        time.textContent = track.duration;
        info.append(name, subtitle);
        button.append(info, time);
        button.addEventListener('click', () => { selectTrack(index, true); playlist.hidden = true; playlistToggle.setAttribute('aria-expanded', 'false'); playlistToggle.setAttribute('aria-label', 'Show playlist'); });
        return button;
    }));
    playlistToggle.addEventListener('click', () => {
        playlist.hidden = !playlist.hidden;
        playlistToggle.setAttribute('aria-expanded', String(!playlist.hidden));
        playlistToggle.setAttribute('aria-label', playlist.hidden ? 'Show playlist' : 'Hide playlist');
    });
    previous.addEventListener('click', () => selectTrack(Math.max(0, trackIndex - 1), !audio.paused));
    next.addEventListener('click', () => selectTrack(Math.min(tracks.length - 1, trackIndex + 1), !audio.paused));
    play.addEventListener('click', () => {
        if (play.disabled) return;
        if (audio.paused) startPlayback();
        else audio.pause();
    });
    mute.addEventListener('click', () => { audio.muted = !audio.muted; updateMusic(); });
    audio.addEventListener('play', () => { music.classList.add('is-playing'); updateMusic(); });
    audio.addEventListener('pause', () => { music.classList.remove('is-playing'); updateMusic(); });
    audio.addEventListener('timeupdate', () => {
        const seconds = Math.floor(audio.currentTime);
        elapsed.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        seek.value = Number.isFinite(audio.duration) ? Math.round(audio.currentTime / audio.duration * seek.max) : 0;
        updateSeekFill();
    });
    seek.addEventListener('input', () => {
        if (!Number.isFinite(audio.duration)) return;
        audio.currentTime = seek.value / seek.max * audio.duration;
        updateSeekFill();
    });
    audio.addEventListener('ended', () => { if (trackIndex < tracks.length - 1) selectTrack(trackIndex + 1, true); else { music.classList.remove('is-playing'); updateMusic(); } });
    audio.addEventListener('error', () => { audioFailed = true; music.classList.remove('is-playing'); updateMusic(); });
    window.addEventListener('pagehide', () => audio.pause());
    selectTrack(0);
})();
