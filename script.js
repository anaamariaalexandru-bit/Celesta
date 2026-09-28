/* =========================
   SHARED UI REFERENCES
   Referințe comune pentru galerie și modalul de evenimente.
========================= */
const images = Array.from(document.querySelectorAll(".gallery-container img"));
const eventModal = document.querySelector("#event-modal");
const eventModalTitle = document.querySelector("#event-modal-title");
const eventModalDescription = document.querySelector("#event-modal-description");
const eventModalClose = document.querySelector(".event-modal-close");
const eventVideoButton = document.querySelector(".event-video-button");
const eventVideoPanel = document.querySelector("#event-video-panel");
const eventVideoGrid = document.querySelector("#event-video-grid");

let currentEventType = "";


document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  // Deschide meniul
  function openMenu() {
    navMenu.classList.add('active');
    menuOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Blochează scroll-ul paginii
  }

  // Închide meniul
  function closeMenu() {
    navMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Deblochează scroll-ul
  }

  hamburgerBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // Închide meniul automat când apeși pe o opțiune/link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
});

/* =========================
   PLAYLIST PAGE REFERENCES
   Referințe pentru taburi, lista de melodii și textul de descriere.
========================= */
const playlistTabs = Array.from(document.querySelectorAll(".playlist-tab"));
const playlistList = document.getElementById("playlist-list");
const playlistSelectedType = document.getElementById("playlist-selected-type");

/* =========================
   PLAYER REFERENCES
   Referințe pentru playerul audio, butoane, disc, titlu, artist și timp.
========================= */
const audio = document.getElementById("audio-player");
const progress = document.getElementById("progress");
const playButton = document.getElementById("play-btn");
const playerDisc = document.querySelector(".player-disc");
const playerSongTitle = document.getElementById("player-song-title");
const playerSongArtist = document.getElementById("player-song-artist");
const currentTimeDisplay = document.getElementById("current-time");
const durationTimeDisplay = document.getElementById("duration-time");

/* =========================
   PLAYLIST DATA
   Listele cu fișierele audio pentru Rock și Pop.
========================= */
const rockTrackFiles = [
  "muzicarock/Alternosfera - Nu E Nimeni Vinovat  Official Audio  2007.mp3",
  "muzicarock/Cargo - Daca ploaia s-ar opri (Official Video).mp3",
  "muzicarock/Holograf - Sa nu mi iei niciodată dragostea (Official Video).mp3",
  "muzicarock/Iris - Baby (cu versuri).mp3",
  "muzicarock/Scorpions - Still Loving You (Official Video).mp3",
  "muzicarock/Vama veche - 18 ani.mp3",
  "muzicarock/Vita de Vie - Praf de Stele - Videoclip OFICIAL.mp3"
];

const popTrackFiles = [
  "muzicapop/_umbra x Ana Coman - Căzuți din lună  Official Music Video  2019.mp3",
  "muzicapop/@Smiley - Acasă [Official video HD].mp3",
  "muzicapop/Alina Eremia x Mario Fresh - Ai Fost  Official Video.mp3",
  "muzicapop/Bere Gratis feat Sore - Noapte calda (Official Video).mp3",
  "muzicapop/Deepcentral - O Stea (Official Single).mp3",
  "muzicapop/Irina Rimes - Acasă  Official Video.mp3",
  "muzicapop/Vama Veche-Epilog versuri.mp3",
  "muzicapop/Emeric Imre - Nebun de alb.mp3",
  "muzicapop/IRIS Cristi Minculescu & Valter & Boro - Amintiri  Official Video.mp3",
  "muzicapop/PUYA  @TudorChirilaOnline - Stele Cazatoare  Official Video.mp3",
  "muzicapop/Bosquito - Intuneric in culori (Official Video).mp3",
  "muzicapop/Delia - Cine m-a facut om mare (Official Video).mp3"
];

/* =========================
   TRACK FORMATTER
   Transformă numele fișierelor mp3 în titlu și artist afișate frumos.
========================= */
function formatTrackFromFile(src, tag = "rock") {
  const fileName = src.split("/").pop()?.replace(/\.mp3$/i, "") || "Melodie";
  const parts = fileName.split(" - ");
  const artist = parts.shift() || "Artist";
  const rawTitle = parts.join(" - ") || fileName;

  const title = rawTitle
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\b(official|music|video|audio|hd|lyrics|versuri|videoclip|oficial)\b/gi, "")
    .replace(/\b\d{4}\b/g, "")
    .replace(/\s+-\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return {
    title,
    artist: artist.replace(/[@_]/g, "").trim(),
    tag,
    length: "mp3",
    src
  };
}

const rockSongs = rockTrackFiles.map((file) => formatTrackFromFile(file, "rock"));
const popSongs = popTrackFiles.map((file) => formatTrackFromFile(file, "pop"));

const playlists = {
  rock: {
    label: "Rock",
    note: "Ai ales melodii rock.",
    songs: rockSongs
  },
  pop: {
    label: "Pop",
    note: "Ai ales melodii pop.",
    songs: popSongs
  }
};

/* =========================
   STATE
   Variabile care țin minte playlistul curent, melodia curentă și imaginea curentă.
========================= */
let currentPlaylist = "rock";
let currentIndex = 0;
let activeTrackIndex = null;
let currentImageIndex = 0;

/* =========================
   GENERAL HELPERS
   Funcții generale folosite pe site.
========================= */
function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest('input[type="text"], textarea, select, [contenteditable="true"]')
  );
}

/* =========================
   PLAYER HELPERS
   Funcții care actualizează interfața playerului.
========================= */
function updatePlayButton() {
  if (!playButton || !audio) return;

  playButton.textContent = audio.paused ? "▶" : "❚❚";
  updateTrackActionButtons();
}

function formatPlayerTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const totalSeconds = Math.floor(seconds);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function updatePlaylistSummary(name) {
  const playlist = playlists[name];
  if (!playlist) return;

  if (playlistSelectedType) {
    playlistSelectedType.textContent = `${playlist.note} ${playlist.songs.length} piese afișate.`;
  }
}

function updatePlayerDisc() {
  if (!playerDisc || !audio) return;

  playerDisc.classList.toggle("is-playing", !audio.paused && Boolean(audio.src));
}

function updatePlayerDetails() {
  const songs = playlists[currentPlaylist]?.songs;
  const currentSong = songs?.[currentIndex];

  if (!currentSong) return;

  if (playerSongTitle) {
    playerSongTitle.textContent = currentSong.title;
  }

  if (playerSongArtist) {
    playerSongArtist.textContent = currentSong.artist;
  }
}

function updateActiveTrackCard() {
  if (!playlistList) return;

  Array.from(playlistList.children).forEach((item, index) => {
    item.classList.toggle("active-track", index === activeTrackIndex);
  });

  updateTrackActionButtons();
}

function updateTrackActionButtons() {
  if (!playlistList || !audio) return;

  const buttons = playlistList.querySelectorAll(".playlist-track-action");

  buttons.forEach((button, index) => {
    const isCurrentSong = index === currentIndex;
    const isPlayingCurrentSong = isCurrentSong && Boolean(audio.src) && !audio.paused;

    button.textContent = isPlayingCurrentSong ? "❚❚" : "▶";

    button.setAttribute(
      "aria-label",
      isPlayingCurrentSong ? "Pune piesa pe pauză" : "Pornește melodia"
    );

    button.classList.toggle("is-playing", isPlayingCurrentSong);
  });
}

function syncPlaylistTabs(name) {
  playlistTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.playlist === name);
  });
}

/* =========================
   PLAYLIST RENDER
   Afișează lista de melodii pentru tabul Rock sau Pop.
========================= */
function loadPlaylist(name) {

  if (!playlistList || !playlists[name]) return;

  currentPlaylist = name;
  currentIndex = 0;
  activeTrackIndex = null;
  playlistList.innerHTML = "";

  playlists[name].songs.forEach((song, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="playlist-track-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="playlist-track-main">
        <span class="playlist-track-title">${song.title}</span>
        <span class="playlist-track-artist">${song.artist}</span>
      </div>
      <div class="playlist-track-footer">
        <span>${song.length}</span>
        <button class="playlist-track-action" type="button" aria-label="Pornește melodia">▶</button>
      </div>
    `;

    const playAction = li.querySelector(".playlist-track-action");

    playAction?.addEventListener("click", () => {
      if (index === currentIndex && audio?.src) {
        togglePlay();
        return;
      }

      playSong(index);
    });

    playlistList.appendChild(li);
  });

  updatePlaylistSummary(name);
  updateActiveTrackCard();
  syncPlaylistTabs(name);
  updatePlayerDetails();
}

/* =========================
   PLAYER CORE
   Funcțiile principale pentru play, pause, next și previous.
========================= */
function playSong(index) {
  if (!audio || !progress) return;

  const playlist = playlists[currentPlaylist];
  const song = playlist?.songs[index];

  if (!song) return;

  currentIndex = index;
  activeTrackIndex = index;

  audio.src = song.src;
  audio.currentTime = 0;
  progress.value = 0;

  updateActiveTrackCard();
  updatePlayButton();
  updatePlayerDisc();
  updatePlayerDetails();
  updatePlayerTime();

  audio.play().catch(() => {});
}

function togglePlay() {
  if (!audio) return;

  const currentSong = playlists[currentPlaylist]?.songs[currentIndex];

  if (!audio.src) {
    if (currentSong?.src) {
      playSong(currentIndex);
    }

    return;
  }

  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
  }

  updatePlayButton();
  updatePlayerDisc();
  updatePlayerDetails();
}

function nextSong() {
  const songs = playlists[currentPlaylist]?.songs;
  if (!songs?.length) return;

  currentIndex = (currentIndex + 1) % songs.length;
  playSong(currentIndex);
}

function prevSong() {
  const songs = playlists[currentPlaylist]?.songs;
  if (!songs?.length) return;

  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  playSong(currentIndex);
}

window.togglePlay = togglePlay;
window.nextSong = nextSong;
window.prevSong = prevSong;

/* =========================
   PLAYER KEYBOARD
   Comenzi rapide de la tastatură:
   Space = play/pause, ArrowRight = următoarea, ArrowLeft = anterioara.
========================= */
let isSeeking = false;

function updatePlayerTime() {
  if (!audio || !currentTimeDisplay || !durationTimeDisplay) return;

  currentTimeDisplay.textContent = formatPlayerTime(audio.currentTime);
  durationTimeDisplay.textContent = formatPlayerTime(audio.duration);
}

function handlePlayerKeyboardShortcuts(event) {
  if (!audio || isTypingTarget(event.target)) return;

  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    togglePlay();
  }

  if (event.code === "ArrowRight") {
    event.preventDefault();
    nextSong();
  }

  if (event.code === "ArrowLeft") {
    event.preventDefault();
    prevSong();
  }
}

if (audio && progress) {
  document.addEventListener("keydown", handlePlayerKeyboardShortcuts);

  audio.addEventListener("ended", nextSong);

  audio.addEventListener("play", () => {
    updatePlayButton();
    updatePlayerDisc();
    updatePlayerDetails();
  });

  audio.addEventListener("pause", () => {
    updatePlayButton();
    updatePlayerDisc();
    updatePlayerDetails();
  });

  audio.addEventListener("loadedmetadata", () => {
    updatePlayerTime();
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;

    if (!isSeeking) {
      progress.value = (audio.currentTime / audio.duration) * 100;
    }

    updatePlayerTime();
  });

  progress.addEventListener("input", () => {
    if (!audio.duration) return;

    isSeeking = true;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    updatePlayerTime();
  });

  progress.addEventListener("change", () => {
    isSeeking = false;
  });

  updatePlayerDisc();
  updatePlayerDetails();
  updatePlayerTime();
}


/* =========================
   EVENTS MODAL
   Funcții pentru fereastra modală de la pagina Evenimente.
========================= */
const eventCards = Array.from(document.querySelectorAll(".event-card"));

function openEventModal(title, description, type) {
  if (!eventModal || !eventModalTitle || !eventModalDescription) return;

  currentEventType = type || "";

  eventModalTitle.textContent = title;
  eventModalDescription.textContent = description;
  eventModal.setAttribute("aria-hidden", "false");

  if (eventVideoGrid) {
  const videos = eventVideoGrid.querySelectorAll("video");

  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    video.load();
  });

  eventVideoGrid.innerHTML = "";
}

if (eventVideoPanel) {
  eventVideoPanel.hidden = true;
}

  document.body.style.overflow = "hidden";
}

function closeEventModal() {
  if (!eventModal) return;

  if (eventVideoGrid) {
    const videos = eventVideoGrid.querySelectorAll("video");

    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute("src");
      video.load();
    });

    eventVideoGrid.innerHTML = "";
  }

  if (eventVideoPanel) {
    eventVideoPanel.hidden = true;
  }

  eventModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function handleEventModalEscape(event) {
  if (event.key === "Escape" && eventModal?.getAttribute("aria-hidden") === "false") {
    closeEventModal();
  }
}

function showEventVideos() {
  if (!eventVideoPanel || !eventVideoGrid) return;

  const videos = eventVideos[currentEventType] || [];

  eventVideoGrid.innerHTML = "";

  videos.forEach((video) => {
    const div = document.createElement("div");
    div.className = "event-video-card";

    div.innerHTML = `
  <video controls preload="metadata" tabindex="0" class="celesta-event-video">
    <source src="${video.src}#t=0.1" type="video/mp4">
  </video>
`;

    eventVideoGrid.appendChild(div);
  });

  eventVideoPanel.hidden = false;
}

const eventVideos = {
  repetitii: [
    { src: "video/50ab9649-7040-40cd-be77-c5eb8b6639c3.MP4" },
    { src: "video/46350c74-3500-4d46-adc1-b872302571c6.MP4" },
    { src: "video/ae101265-9077-4d44-a81f-483801dec911.MP4" }
  ],
  concerte: [
    { src: "video/3b810b8b-ea43-42e4-a68d-50dcb3e281dc.MP4" },
    { src: "video/277f5ca8-2dae-4387-99cd-3c43864c3bca.MP4" },
    { src: "video/6559c2dd-9069-4912-a60b-d25f50e65245.MP4" },
    { src: "video/b72de114-a56e-44a4-9fff-b71fcb31af99.MP4" },
    { src: "video/fe747bd6-6bab-48f2-b317-816b0bff8dbf.MP4" }
  ],
  caritabile: [
    { src: "video/f5a2da29-d70f-4ac5-923d-811dfc75136d.MP4" }
  ],
  festivaluri: [
    { src: "video/d9271ebd-8a5c-4130-b004-0903a372c787.MP4" }
  ],
};

function handleEventVideoKeyboard(event) {
  if (!activeEventVideo) return;

  const video = activeEventVideo;

  if (event.key === "Enter" || event.code === "Space") {
    event.preventDefault();

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    video.currentTime = Math.min(video.currentTime + 5, video.duration || video.currentTime + 5);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    video.currentTime = Math.max(video.currentTime - 5, 0);
  }
}


/* =========================
   GALLERY LIGHTBOX
   Funcții pentru galeria cu imagini și navigarea între poze.
========================= */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const lightboxCounter = document.getElementById("lightbox-counter");

function updateLightboxCounter() {
  if (!lightboxCounter || !images.length) return;

  lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function animateLightboxImage(src, alt) {
  if (!lightboxImage) return;

  lightboxImage.classList.remove("is-visible");

  window.setTimeout(() => {
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Imagine din galeria Celesta";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lightboxImage.classList.add("is-visible");
      });
    });
  }, 160);
}

function showLightboxImage(index) {
  if (!images.length || !lightboxImage) return;

  currentImageIndex = (index + images.length) % images.length;
  const selectedImage = images[currentImageIndex];

  animateLightboxImage(selectedImage.src, selectedImage.alt);
  updateLightboxCounter();
}

function openLightbox(index) {
  if (!lightbox || !images.length || !lightboxImage) return;

  currentImageIndex = index;
  const selectedImage = images[currentImageIndex];

  lightboxImage.classList.remove("is-visible");
  lightboxImage.src = selectedImage.src;
  lightboxImage.alt = selectedImage.alt || "Imagine din galeria Celesta";

  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  updateLightboxCounter();

  requestAnimationFrame(() => {
    lightboxImage.classList.add("is-visible");
  });
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (lightboxImage) {
    lightboxImage.classList.remove("is-visible");
  }
}

function showNextImage() {
  showLightboxImage(currentImageIndex + 1);
}

function showPrevImage() {
  showLightboxImage(currentImageIndex - 1);
}

function handleLightboxKeyboard(event) {
  if (lightbox?.getAttribute("aria-hidden") !== "false") return;

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowRight") {
    showNextImage();
  }

  if (event.key === "ArrowLeft") {
    showPrevImage();
  }
}

/* =========================
   PAGE INIT
   Pornește funcționalitățile în funcție de pagina pe care există elementele.
========================= */
if (playlistList && playlistTabs.length) {
  playlistTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      loadPlaylist(tab.dataset.playlist);
    });
  });

  loadPlaylist("rock");
}

if (eventCards.length && eventModal) {
  eventCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.dataset.eventTitle || "Eveniment";
      const description = card.dataset.eventDescription || "Detalii indisponibile.";

      const type = card.dataset.eventType || "";
      openEventModal(title, description, type);
    });
  });

  eventModalClose?.addEventListener("click", closeEventModal);

  eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) {
      closeEventModal();
    }
  });

  document.addEventListener("keydown", handleEventModalEscape);
}

if (images.length && lightbox) {
  images.forEach((img, index) => {
    img.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxNext?.addEventListener("click", showNextImage);
  lightboxPrev?.addEventListener("click", showPrevImage);


  document.addEventListener("keydown", handleLightboxKeyboard);
}

eventVideoButton?.addEventListener("click", showEventVideos);
document.addEventListener("keydown", handleEventVideoKeyboard);


/* =========================
   CONTACT FORM - EMAILJS
========================= */

const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  emailjs.init({
    publicKey: "gcDRC8DjOl_odGDQQ"
  });

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    formStatus.textContent = "Se trimite mesajul...";

    emailjs.send("service_r0stx4s", "template_h21wikh", {
      nume: contactForm.nume.value,
      email: contactForm.email.value,
      mesaj: contactForm.mesaj.value
    })
    .then(function () {
      formStatus.textContent = "Mesajul a fost trimis cu succes!";
      contactForm.reset();
    })
    .catch(function () {
      formStatus.textContent = "A apărut o eroare. Încearcă din nou.";
    });
  });
}