window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        location.reload();
    }
    document.body.classList.add("fade-in");
});

document.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
        window.__ignoreFade = true;
    }
});

window.addEventListener("beforeunload", () => {
    if (!window.__ignoreFade) {
        document.body.classList.add("fade-out");
    }
});


window.goto = {
    set href(url) {
        document.body.classList.add("fade-out");
        setTimeout(() => {
            window.location.href = url;
        }, 350);
    }
};
