window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        location.reload();
    }
    document.body.classList.add("fade-in");
});

window.addEventListener("beforeunload", () => {
    document.body.classList.add("fade-out");
});

window.goto = {
    set href(url) {
        document.body.classList.add("fade-out");
        setTimeout(() => {
            window.location.href = url;
        }, 350);
    }
};