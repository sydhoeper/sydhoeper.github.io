const contentArea = document.querySelector("#main-content");
const navigationLinks = document.querySelectorAll("[data-page]");
const sidebar = document.querySelector(".sidebar");
const navigationMenu = document.querySelector("#navigation-menu");
const mobileNavigationToggle = document.querySelector(".mobile-nav-toggle");
const mobileNavigationOverlay = document.querySelector(".mobile-nav-overlay");
const siteFooter = document.querySelector(".site-footer");
const mobileNavigationQuery = window.matchMedia("(max-width: 850px)");
let pageLoadRequest = 0;

const pageMap = {
    home: "pages/home.html",
    "va-pdfs": "pages/User Experience Design/va-pdfs.html",
    "booking-platform": "pages/User Experience Design/booking-platform.html",
    "map-redesign": "pages/User Experience Design/map-redesign.html",
    "search-redesign": "pages/User Experience Design/search-update.html",
    "scheduling-product-creation": "pages/User Experience Design/scheduling-product-creation.html",

    "under-the-eye": "pages/Games and Interactive Media/under-the-eye.html",
    emora: "pages/Games and Interactive Media/oracle-deck.html",
    "desire-chamber": "pages/Games and Interactive Media/desire-chamber.html",
    "buffalo-jump": "pages/Games and Interactive Media/buffalo-jump.html",
    "aria-engine": "pages/Games and Interactive Media/aria-engine.html",
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

function setMobileNavigation(isOpen, { restoreFocus = false } = {}) {
    if (!navigationMenu || !mobileNavigationToggle || !mobileNavigationOverlay) {
        return;
    }

    const shouldOpen = mobileNavigationQuery.matches && isOpen;

    document.body.classList.toggle("mobile-navigation-open", shouldOpen);
    mobileNavigationToggle.setAttribute("aria-expanded", String(shouldOpen));
    mobileNavigationToggle.setAttribute(
        "aria-label",
        shouldOpen ? "Close navigation menu" : "Open navigation menu"
    );
    navigationMenu.hidden = mobileNavigationQuery.matches && !shouldOpen;
    mobileNavigationOverlay.setAttribute("aria-hidden", String(!shouldOpen));
    contentArea.inert = shouldOpen;
    siteFooter.inert = shouldOpen;

    if (restoreFocus && mobileNavigationQuery.matches) {
        mobileNavigationToggle.focus();
    }
}

function initializeMobileNavigation() {
    if (!sidebar || !navigationMenu || !mobileNavigationToggle || !mobileNavigationOverlay) {
        return;
    }

    setMobileNavigation(false);

    mobileNavigationToggle.addEventListener("click", () => {
        const isOpen = mobileNavigationToggle.getAttribute("aria-expanded") === "true";
        setMobileNavigation(!isOpen);
    });

    mobileNavigationOverlay.addEventListener("click", () => {
        setMobileNavigation(false, { restoreFocus: true });
    });

    sidebar.addEventListener("click", (event) => {
        if (event.target.closest("a[href]")) {
            setMobileNavigation(false);
        }
    });

    sidebar.addEventListener("keydown", (event) => {
        const isOpen = mobileNavigationToggle.getAttribute("aria-expanded") === "true";

        if (!isOpen || event.key !== "Tab") {
            return;
        }

        const focusableItems = [...sidebar.querySelectorAll("a[href], button:not([disabled])")]
            .filter((element) => !element.hidden && element.getClientRects().length > 0);
        const firstItem = focusableItems[0];
        const lastItem = focusableItems.at(-1);

        if (event.shiftKey && document.activeElement === firstItem) {
            event.preventDefault();
            lastItem.focus();
        } else if (!event.shiftKey && document.activeElement === lastItem) {
            event.preventDefault();
            firstItem.focus();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobileNavigationToggle.getAttribute("aria-expanded") === "true") {
            setMobileNavigation(false, { restoreFocus: true });
        }
    });

    mobileNavigationQuery.addEventListener("change", () => {
        setMobileNavigation(false);
    });
}

async function loadPage(pageName, { focusContent = false } = {}) {
    const requestId = ++pageLoadRequest;
    const pagePath = pageMap[pageName];

    if (!pagePath) {
        showComingSoon(pageName, "", focusContent);
        return;
    }

    try {
        contentArea.setAttribute("aria-busy", "true");
        contentArea.innerHTML = '<p role="status">Loading...</p>';

        const pageUrl = `${encodeURI(pagePath)}?v=${Date.now()}`;
        const response = await fetch(pageUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Could not load ${pagePath}`);
        }

        const pageContent = await response.text();

        if (requestId !== pageLoadRequest) {
            return;
        }

        contentArea.innerHTML = pageContent;
        requestAnimationFrame(() => {
            fitGameEmbeds(contentArea);
            initializeGalleries(contentArea);
            initializeMapAnimations(contentArea);
            finishPageLoad(pageName, focusContent);
        });
    } catch (error) {
        if (requestId !== pageLoadRequest) {
            return;
        }

        showComingSoon(pageName, pagePath, focusContent);
        console.error(error);
    }
}

function finishPageLoad(pageName, focusContent) {
    const pageHeading = contentArea.querySelector("h1");

    contentArea.setAttribute("aria-busy", "false");
    updateActiveLink(pageName);
    document.title = pageHeading ? `${pageHeading.textContent.trim()} | Syd Hoeper` : "Syd Hoeper";
    window.scrollTo(0, 0);

    if (focusContent) {
        const focusTarget = pageHeading || contentArea;
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
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

function initializeMapAnimations(root = document) {
    root.querySelectorAll("[data-map-animation-toggle]").forEach((button) => {
        const shell = button.closest(".map-animation-shell");
        const image = shell?.querySelector("[data-map-animation]");
        const animatedSource = image?.dataset.animatedSrc;
        const staticSource = image?.dataset.staticSrc;

        if (!image || !animatedSource || !staticSource) {
            return;
        }

        const setPlaying = (shouldPlay) => {
            image.src = shouldPlay ? animatedSource : staticSource;
            button.textContent = shouldPlay ? "Pause animation" : "Play animation";
            button.dataset.playing = String(shouldPlay);
        };

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setPlaying(!prefersReducedMotion);

        button.addEventListener("click", () => {
            setPlaying(button.dataset.playing !== "true");
        });
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

        closeButton?.setAttribute("aria-label", "Close gallery viewer");
        previousButton?.setAttribute("aria-label", "Previous gallery item");
        nextButton?.setAttribute("aria-label", "Next gallery item");

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
                lightboxVideo.setAttribute("aria-label", thumbnail.alt || "Gallery video");
                lightboxVideo.load();
            } else if (lightboxImage) {
                lightboxImage.src = source;
                lightboxImage.alt = thumbnail.alt;
            }

            counter.textContent = `${currentIndex + 1} / ${items.length}`;
        };

        items.forEach((item, index) => {
            const thumbnail = item.querySelector("img, video");
            const itemDescription = thumbnail?.getAttribute("alt") || `Gallery item ${index + 1}`;
            item.setAttribute(
                "aria-label",
                `Open ${itemDescription} full screen, item ${index + 1} of ${items.length}`
            );

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

function showComingSoon(pageName, pagePath = "", focusContent = false) {
    contentArea.innerHTML = `
        <h1>Coming Soon</h1>
        <p>This page hasn't been built yet.</p>
        ${pagePath ? `<p><small>Missing file: ${pagePath}</small></p>` : ""}
    `;

    finishPageLoad(pageName, focusContent);
}

function updateActiveLink(pageName) {
    navigationLinks.forEach((link) => {
        const isHomeLink = link.dataset.page === "home";
        const isCurrentPage = link.dataset.page === pageName;

        if (isCurrentPage && !isHomeLink) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

function getCurrentPage() {
    const page = window.location.hash.replace("#", "");
    return page || null;
}

window.addEventListener("hashchange", () => {
    loadPage(getCurrentPage() || "home", { focusContent: true });
});

window.addEventListener("resize", () => {
    fitGameEmbeds(contentArea);
});

initializeMobileNavigation();

const initialPage = getCurrentPage();
if (initialPage) {
    loadPage(initialPage);
} else {
    loadPage("home");
}
