const contentArea = document.querySelector("#main-content");
const navigationLinks = document.querySelectorAll("[data-page]");

const pageMap = {
    home: "pages/home.html",
    about: "pages/about.html",
    resume: "pages/background.html",
    contact: "pages/contact.html",

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
        updateActiveLink(pageName);
        window.scrollTo(0, 0);
    } catch (error) {
        showComingSoon(pageName, pagePath);
        console.error(error);
    }
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
    return window.location.hash.replace("#", "") || "home";
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
        loadPage(link.dataset.page);
    });
});

window.addEventListener("hashchange", () => {
    loadPage(getCurrentPage());
});

loadPage(getCurrentPage());