const contentArea = document.querySelector("#main-content");
const navigationLinks = document.querySelectorAll("[data-page]");

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
    "marker-doodles": "pages/Illustration/marker-doodles.html",
    "plein-air": "pages/Illustration/plein-air-sketches.html"
};

async function loadPage(pageName) {
    const pagePath = pageMap[pageName];

    if (!pagePath) {
        showComingSoon(pageName);
        return;
    }

    try {
        contentArea.innerHTML = "<p>Loading...</p>";

        const response = await fetch(encodeURI(pagePath));

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
        const galleryPage = gallery.closest(".marker-gallery-page");
        const dialog = galleryPage?.querySelector(".marker-lightbox");
        const items = [...gallery.querySelectorAll(".marker-gallery-item")];
        const lightboxImage = dialog?.querySelector("[data-gallery-image]");
        const counter = dialog?.querySelector("[data-gallery-counter]");
        const previousButton = dialog?.querySelector("[data-gallery-previous]");
        const nextButton = dialog?.querySelector("[data-gallery-next]");
        const closeButton = dialog?.querySelector("[data-gallery-close]");

        if (!dialog || !lightboxImage || !counter || items.length === 0) {
            return;
        }

        let currentIndex = 0;
        let openingButton = null;

        const showImage = (index) => {
            currentIndex = (index + items.length) % items.length;

            const item = items[currentIndex];
            const thumbnail = item.querySelector("img");

            lightboxImage.src = item.dataset.full || thumbnail.src;
            lightboxImage.alt = thumbnail.alt;
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
            lightboxImage.removeAttribute("src");
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
