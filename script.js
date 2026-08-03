const contentArea = document.querySelector("#main-content");
const navigationLinks = document.querySelectorAll("[data-page]");

async function loadPage(pageName) {
    try {
        contentArea.innerHTML = "<p>Loading...</p>";

        const response = await fetch(`pages/${pageName}.html`);

        if (!response.ok) {
            throw new Error();
        }

        const pageContent = await response.text();

        contentArea.innerHTML = pageContent;

        updateActiveLink(pageName);

        window.scrollTo(0, 0);
    } catch {
        contentArea.innerHTML = `
            <h1>Coming Soon</h1>
            <p>This page hasn't been built yet.</p>
        `;

        updateActiveLink(pageName);
    }
}

function updateActiveLink(pageName) {
    navigationLinks.forEach((link) => {
        if (link.dataset.page === pageName) {
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