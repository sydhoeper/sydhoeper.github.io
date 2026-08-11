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
    "local-design-system": "pages/User Experience Design/local-design-system.html",

    "under-the-eye": "pages/Games and Interactive Media/under-the-eye.html",
    emora: "pages/Games and Interactive Media/oracle-deck.html",
    "desire-chamber": "pages/Games and Interactive Media/desire-chamber.html",
    "buffalo-jump": "pages/Games and Interactive Media/buffalo-jump.html",
    "aria-engine": "pages/Games and Interactive Media/aria-engine.html",
    "vr-bee": "pages/Games and Interactive Media/bee-game.html",
    frokost: "pages/Games and Interactive Media/frokost-game.html",

    "emora-diorama": "pages/Sculpture/sculpture-emora.html",
    "physical-product-design": "pages/Sculpture/physical-product-design.html",
    "stained-glass": "pages/Sculpture/stained-glass.html",
    "digital-portraits": "pages/Illustration/digital-illustration.html",
    "digital-drawings": "pages/Illustration/digital-illustration.html",
    "event-posters": "pages/Illustration/digital-illustration.html",
    "digital-illustration": "pages/Illustration/digital-illustration.html",
    "oracle-deck": "pages/Illustration/digital-illustration.html",
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

function initializeSparkleTrail() {
    const finePointerQuery = window.matchMedia("(pointer: fine)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const toggle = document.querySelector("[data-sparkler-toggle]");
    let sparklesEnabled = false;
    let lastSparkleTime = 0;
    let lastX = 0;
    let lastY = 0;

    const setSparklesEnabled = (enabled) => {
        sparklesEnabled = enabled;
        toggle?.setAttribute("aria-checked", String(enabled));

        if (!enabled) {
            document.querySelectorAll(".cursor-sparkle").forEach((sparkle) => sparkle.remove());
        }
    };

    setSparklesEnabled(false);
    toggle?.addEventListener("click", () => {
        setSparklesEnabled(!sparklesEnabled);
    });

    document.addEventListener("pointermove", (event) => {
        if (!sparklesEnabled || !finePointerQuery.matches || reducedMotionQuery.matches) {
            return;
        }

        const now = performance.now();
        const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);

        if (now - lastSparkleTime < 72 || distance < 9) {
            return;
        }

        const directionX = (event.clientX - lastX) / distance;
        const directionY = (event.clientY - lastY) / distance;
        const perpendicularX = -directionY;
        const perpendicularY = directionX;
        const spread = Math.random() * 22 - 11;
        const trailDistance = 10 + Math.random() * 7;

        lastSparkleTime = now;
        lastX = event.clientX;
        lastY = event.clientY;

        const sparkle = document.createElement("span");
        sparkle.className = "cursor-sparkle";
        sparkle.textContent = "✦";
        sparkle.setAttribute("aria-hidden", "true");
        sparkle.style.left = `${event.clientX - directionX * 7 + perpendicularX * spread}px`;
        sparkle.style.top = `${event.clientY - directionY * 7 + perpendicularY * spread}px`;
        sparkle.style.fontSize = `${10 + Math.random() * 12}px`;
        sparkle.style.setProperty("--sparkle-drift-x", `${-directionX * trailDistance + perpendicularX * spread * 0.5}px`);
        sparkle.style.setProperty("--sparkle-drift-y", `${-directionY * trailDistance + perpendicularY * spread * 0.5}px`);
        sparkle.style.setProperty("--sparkle-rotation", `${Math.random() * 40 - 20}deg`);

        document.body.append(sparkle);
        sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
    }, { passive: true });
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
            initializeLocalAnchors(contentArea);
            initializeCarousels(contentArea);
            initializePhysicalProductPage(contentArea);
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
    document.title = "Syd Hoeper";
    window.scrollTo(0, 0);

    if (focusContent) {
        const focusTarget = pageHeading || contentArea;
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.focus({ preventScroll: true });
    }
}

function initializeLocalAnchors(root = document) {
    root.querySelectorAll("[data-scroll-target]").forEach((link) => {
        link.addEventListener("click", (event) => {
            const target = root.querySelector(`#${CSS.escape(link.dataset.scrollTarget)}`);

            if (!target) {
                return;
            }

            event.preventDefault();
            const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                ? "auto"
                : "smooth";
            target.scrollIntoView({ behavior, block: "start" });
        });
    });
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

function initializeCarousels(root = document) {
    root.querySelectorAll("[data-carousel]").forEach((carousel) => {
        const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
        const previousButton = carousel.querySelector("[data-carousel-previous]");
        const nextButton = carousel.querySelector("[data-carousel-next]");
        const thumbnailsContainer = carousel.querySelector("[data-carousel-thumbnails]");
        const status = carousel.querySelector("[data-carousel-status]");

        if (slides.length === 0 || !previousButton || !nextButton) {
            return;
        }

        const hasMultipleSlides = slides.length > 1;
        previousButton.hidden = !hasMultipleSlides;
        nextButton.hidden = !hasMultipleSlides;

        let currentIndex = 0;
        let pointerStartX = null;

        const thumbnails = thumbnailsContainer ? slides.map((slide, index) => {
            const sourceMedia = slide.querySelector("img, video");
            const thumbnail = document.createElement("button");
            const isVideo = sourceMedia?.tagName === "VIDEO";
            const setThumbnailRatio = (width, height) => {
                if (width > 0 && height > 0) {
                    thumbnail.style.setProperty("--thumbnail-aspect-ratio", `${width} / ${height}`);
                }
            };

            thumbnail.className = "emora-carousel-thumbnail";
            thumbnail.type = "button";
            thumbnail.setAttribute("aria-label", `Show ${isVideo ? "video" : "photo"} slide ${index + 1} of ${slides.length}`);

            if (isVideo) {
                const preview = document.createElement("video");
                const source = sourceMedia.querySelector("source")?.getAttribute("src");
                preview.muted = true;
                preview.playsInline = true;
                preview.preload = "metadata";
                preview.setAttribute("aria-hidden", "true");
                preview.tabIndex = -1;

                if (source) {
                    preview.src = source;
                }

                preview.addEventListener("loadedmetadata", () => {
                    setThumbnailRatio(preview.videoWidth, preview.videoHeight);
                }, { once: true });

                thumbnail.dataset.videoThumbnail = "";
                thumbnail.append(preview);
            } else if (sourceMedia) {
                const preview = document.createElement("img");
                preview.src = sourceMedia.getAttribute("src");
                preview.alt = "";
                preview.loading = "lazy";
                preview.addEventListener("load", () => {
                    setThumbnailRatio(preview.naturalWidth, preview.naturalHeight);
                }, { once: true });
                thumbnail.append(preview);
            }

            thumbnail.addEventListener("click", () => showSlide(index));
            thumbnailsContainer.append(thumbnail);
            return thumbnail;
        }) : [];

        if (thumbnailsContainer) {
            thumbnailsContainer.style.setProperty("--thumbnail-count", thumbnails.length);
            thumbnailsContainer.style.setProperty(
                "--thumbnail-mobile-columns",
                Math.ceil(thumbnails.length / 2)
            );
        }

        const showSlide = (index) => {
            slides[currentIndex]?.querySelector("video")?.pause();
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                const isCurrent = slideIndex === currentIndex;
                slide.hidden = !isCurrent;
                slide.setAttribute("aria-hidden", String(!isCurrent));
            });

            thumbnails.forEach((thumbnail, thumbnailIndex) => {
                if (thumbnailIndex === currentIndex) {
                    thumbnail.setAttribute("aria-current", "true");
                } else {
                    thumbnail.removeAttribute("aria-current");
                }
            });

            const currentThumbnail = thumbnails[currentIndex];

            if (currentThumbnail && thumbnailsContainer) {
                const centeredPosition = currentThumbnail.offsetLeft
                    - (thumbnailsContainer.clientWidth - currentThumbnail.offsetWidth) / 2;
                thumbnailsContainer.scrollTo({ left: centeredPosition, behavior: "smooth" });
            }

            if (status) {
                status.textContent = `Slide ${currentIndex + 1} of ${slides.length}`;
            }
        };

        previousButton.addEventListener("click", () => showSlide(currentIndex - 1));
        nextButton.addEventListener("click", () => showSlide(currentIndex + 1));

        carousel.addEventListener("keydown", (event) => {
            if (event.target.closest("video")) {
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showSlide(currentIndex - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showSlide(currentIndex + 1);
            }
        });

        carousel.addEventListener("pointerdown", (event) => {
            if (event.pointerType === "touch") {
                pointerStartX = event.clientX;
            }
        });

        carousel.addEventListener("pointerup", (event) => {
            if (pointerStartX === null) {
                return;
            }

            const distance = event.clientX - pointerStartX;
            pointerStartX = null;

            if (Math.abs(distance) < 48) {
                return;
            }

            showSlide(currentIndex + (distance < 0 ? 1 : -1));
        });

        showSlide(0);
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

function initializePhysicalProductPage(root = document) {
    const page = root.querySelector("[data-physical-product-page]");

    if (!page) {
        return;
    }

    page.querySelectorAll("[data-product-gallery]").forEach((gallery) => {
        const { slug, extension, title } = gallery.dataset;
        const imageCount = Number.parseInt(gallery.dataset.count, 10);

        if (!slug || !extension || !title || !Number.isFinite(imageCount)) {
            return;
        }

        const fragment = document.createDocumentFragment();

        for (let index = 1; index <= imageCount; index += 1) {
            const button = document.createElement("button");
            const image = document.createElement("img");

            button.className = "art-gallery-item";
            button.type = "button";
            button.dataset.galleryItem = "";

            image.src = `/images/Physical%20Product%20Design/${slug}-${index}.${extension}`;
            image.alt = `${title}, image ${index}`;
            image.loading = "lazy";
            image.decoding = "async";

            button.append(image);
            fragment.append(button);
        }

        gallery.append(fragment);
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
    const pageAliases = {
        "digital-portraits": "digital-illustration",
        "digital-drawings": "digital-illustration",
        "event-posters": "digital-illustration",
        "oracle-deck": "digital-illustration"
    };
    const activePageName = pageAliases[pageName] || pageName;

    navigationLinks.forEach((link) => {
        const isHomeLink = link.dataset.page === "home";
        const isCurrentPage = link.dataset.page === activePageName;

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
initializeSparkleTrail();

const initialPage = getCurrentPage();
if (initialPage) {
    loadPage(initialPage);
} else {
    loadPage("home");
}
