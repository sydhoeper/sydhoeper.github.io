const contentArea = document.querySelector("#main-content");
const navigationLinks = document.querySelectorAll("[data-page]");
const rootElement = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let cometFrame = null;
let cometPhase = window.scrollY * 0.0018;
let lastCometScrollY = window.scrollY;
let previousCometX = null;
let previousCometY = null;

function positionScrollComet() {
    if (!document.body.classList.contains("blob-visible") || reduceMotion.matches) {
        return;
    }

    const cometWidth = Math.min(Math.max(window.innerWidth * 0.43, 380), 650);
    const cometHeight = cometWidth;
    const scrollDistance = Math.abs(window.scrollY - lastCometScrollY);

    cometPhase += scrollDistance * 0.0018;
    lastCometScrollY = window.scrollY;

    const xWave =
        Math.sin(cometPhase * 0.91) * 0.29 +
        Math.sin(cometPhase * 2.17 + 1.3) * 0.13;
    const yWave =
        Math.cos(cometPhase * 1.13 + 0.7) * 0.27 +
        Math.sin(cometPhase * 2.73 + 2.1) * 0.14;
    const xProgress = Math.max(0, Math.min(1, 0.5 + xWave * 1.17));
    const yProgress = Math.max(0, Math.min(1, 0.5 + yWave * 1.2));
    const xStart = cometWidth * -0.42;
    const xEnd = window.innerWidth - cometWidth * 0.58;
    const yStart = cometHeight * -0.42;
    const yEnd = window.innerHeight - cometHeight * 0.58;
    const x = xStart + (xEnd - xStart) * xProgress;
    const y = yStart + (yEnd - yStart) * yProgress;
    const scale = 0.76 + ((Math.sin(cometPhase * 1.47 - 0.8) + 1) / 2) * 0.48;
    const shapeShift = Math.sin(cometPhase * 1.91 + 0.4);
    const scaleX = scale * (1 + shapeShift * 0.13);
    const scaleY = scale * (1 - shapeShift * 0.1);
    const hue = ((Math.sin(cometPhase * 0.83) + 1) / 2) * 70 - 35;
    const radiusA = 44 + Math.sin(cometPhase * 1.37) * 10;
    const radiusB = 56 + Math.cos(cometPhase * 1.61) * 10;
    const radiusC = 50 + Math.sin(cometPhase * 2.03 + 1.2) * 9;
    const radiusD = 50 + Math.cos(cometPhase * 1.79 + 0.5) * 9;
    const movementX = previousCometX === null ? 1 : x - previousCometX;
    const movementY = previousCometY === null ? 0 : y - previousCometY;
    const rotation = Math.atan2(movementY, movementX) * 57.2958;

    previousCometX = x;
    previousCometY = y;

    rootElement.style.setProperty("--comet-x", `${x}px`);
    rootElement.style.setProperty("--comet-y", `${y}px`);
    rootElement.style.setProperty("--comet-rotation", `${rotation}deg`);
    rootElement.style.setProperty("--comet-scale-x", scaleX.toFixed(3));
    rootElement.style.setProperty("--comet-scale-y", scaleY.toFixed(3));
    rootElement.style.setProperty("--comet-hue", `${hue.toFixed(1)}deg`);
    rootElement.style.setProperty(
        "--comet-radius",
        `${radiusA.toFixed(1)}% ${radiusB.toFixed(1)}% ${radiusC.toFixed(1)}% ${radiusD.toFixed(1)}% / ${radiusB.toFixed(1)}% ${radiusD.toFixed(1)}% ${radiusA.toFixed(1)}% ${radiusC.toFixed(1)}%`
    );
}

function requestCometPosition() {
    if (cometFrame !== null) {
        return;
    }

    cometFrame = window.requestAnimationFrame(() => {
        positionScrollComet();
        cometFrame = null;
    });
}

positionScrollComet();
window.addEventListener("scroll", requestCometPosition, { passive: true });
window.addEventListener("resize", requestCometPosition);

const pageMap = {
    home: "pages/home.html",
    "va-pdfs": "pages/User Experience Design/va-pdfs.html",
    "booking-platform": "pages/User Experience Design/booking-platform.html",
    "map-redesign": "pages/User Experience Design/map-redesign.html",
    "search-redesign": "pages/User Experience Design/search-update.html",

    "under-the-eye": "pages/Games and Interactive Media/under-the-eye.html",
    emora: "pages/Games and Interactive Media/oracle-deck.html",
    "desire-chamber": "pages/Games and Interactive Media/desire-chamber.html",
    "buffalo-jump": "pages/Games and Interactive Media/buffalo-jump.html",
    "vr-bee": "pages/Games and Interactive Media/bee-game.html",
    frokost: "pages/Games and Interactive Media/frokost-game.html",

    "emora-diorama": "pages/Sculpture/sculpture-emora.html",
    "stained-glass": "pages/Sculpture/stained-glass.html",
    felting: "pages/Sculpture/felting-works.html",

    "digital-portraits": "pages/Illustration/digital-portraits.html",
    "digital-drawings": "pages/Illustration/digital-drawings.html",
    "event-posters": "pages/Illustration/event-posters.html",
    "oracle-deck": "pages/Illustration/oracle-deck.html",
    "marker-doodles": "pages/Illustration/marker-doodles.html",
    "plein-air": "pages/Illustration/plein-air-sketches.html"
};

async function loadPage(pageName) {
    const pagePath = pageMap[pageName];

    document.body.classList.toggle("blob-visible", pageName === "home");

    if (pageName === "home") {
        lastCometScrollY = window.scrollY;
        requestCometPosition();
    }

    if (!pagePath) {
        showComingSoon(pageName);
        return;
    }

    try {
        contentArea.innerHTML = "<p>Loading...</p>";

        const response = await fetch(encodeURI(pagePath), { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${pagePath}`);
        }

        const pageContent = await response.text();

        contentArea.innerHTML = pageContent;
        requestAnimationFrame(() => {
            fitGameEmbeds(contentArea);
            initializeGalleries(contentArea);
        });
        updateActiveLink(pageName);
        window.scrollTo(0, 0);
    } catch (error) {
        showComingSoon(pageName, pagePath);
        console.error(error);
    }
}

function fitGameEmbeds(root = document) {
    root.querySelectorAll(".itch-widget iframe").forEach((iframe) => {
        const container = iframe.parentElement;
        const embedWidth = Number(iframe.getAttribute("width"));
        const embedHeight = Number(iframe.getAttribute("height"));

        if (!container || !embedWidth || !embedHeight) {
            return;
        }

        const scale = Math.min(1, container.clientWidth / embedWidth);

        iframe.style.transform = `scale(${scale})`;
        container.style.height = `${embedHeight * scale}px`;
    });
}

function initializeGalleries(root = document) {
    root.querySelectorAll("[data-gallery]").forEach((gallery) => {
        const galleryPage = gallery.closest("[data-gallery-page], .marker-gallery-page");
        const dialog = galleryPage?.querySelector("[data-gallery-dialog], .marker-lightbox");
        const items = [...gallery.querySelectorAll("[data-gallery-item], .marker-gallery-item")];
        const lightboxImage = dialog?.querySelector("[data-gallery-image]");
        const lightboxVideo = dialog?.querySelector("[data-gallery-video]");
        const counter = dialog?.querySelector("[data-gallery-counter]");
        const previousButton = dialog?.querySelector("[data-gallery-previous]");
        const nextButton = dialog?.querySelector("[data-gallery-next]");
        const closeButton = dialog?.querySelector("[data-gallery-close]");

        if (!dialog || (!lightboxImage && !lightboxVideo) || !counter || items.length === 0) {
            return;
        }

        let currentIndex = 0;
        let openingButton = null;

        const showImage = (index) => {
            currentIndex = (index + items.length) % items.length;

            const item = items[currentIndex];
            const thumbnail = item.querySelector("img, video");
            const isVideo = item.dataset.galleryType === "video" || thumbnail?.tagName === "VIDEO";
            const source = item.dataset.full || thumbnail?.currentSrc || thumbnail?.src;

            if (!thumbnail || !source) {
                return;
            }

            if (lightboxVideo) {
                lightboxVideo.pause();
                lightboxVideo.removeAttribute("src");
                lightboxVideo.hidden = !isVideo;
            }

            if (lightboxImage) {
                lightboxImage.hidden = isVideo;
            }

            if (isVideo && lightboxVideo) {
                lightboxVideo.src = source;
                lightboxVideo.load();
            } else if (lightboxImage) {
                lightboxImage.src = source;
                lightboxImage.alt = thumbnail.alt;
            }

            counter.textContent = `${currentIndex + 1} / ${items.length}`;
        };

        items.forEach((item, index) => {
            item.addEventListener("click", () => {
                openingButton = item;
                showImage(index);
                dialog.showModal();
            });
        });

        previousButton?.addEventListener("click", () => showImage(currentIndex - 1));
        nextButton?.addEventListener("click", () => showImage(currentIndex + 1));
        closeButton?.addEventListener("click", () => dialog.close());

        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });

        dialog.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showImage(currentIndex - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showImage(currentIndex + 1);
            }
        });

        dialog.addEventListener("close", () => {
            lightboxImage?.removeAttribute("src");
            lightboxVideo?.pause();
            lightboxVideo?.removeAttribute("src");
            lightboxVideo?.load();
            openingButton?.focus();
        });
    });
}

function showComingSoon(pageName, pagePath = "") {
    contentArea.innerHTML = `
        <h1>Coming Soon</h1>
        <p>This page hasn't been built yet.</p>
        ${pagePath ? `<p><small>Missing file: ${pagePath}</small></p>` : ""}
    `;

    updateActiveLink(pageName);
}

function updateActiveLink(pageName) {
    navigationLinks.forEach((link) => {
        const isHomeLink = link.dataset.page === "home";

        if (link.dataset.page === pageName && !isHomeLink) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function getCurrentPage() {
    const page = window.location.hash.replace("#", "");
    return page || null;
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        loadPage(link.dataset.page);
    });
});

window.addEventListener("hashchange", () => {
    loadPage(getCurrentPage());
});

window.addEventListener("resize", () => {
    fitGameEmbeds(contentArea);
});

const initialPage = getCurrentPage();
if (initialPage) {
    loadPage(initialPage);
} else {
    loadPage("home");
}
