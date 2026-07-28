(function () {
    const KEYBOARD_STEP = 24;
    const STORAGE_KEY = "demoApp.homePage.textResizerWidth";

    function readStoredWidth() {
        try {
            const width = parseFloat(window.localStorage.getItem(STORAGE_KEY));
            return Number.isFinite(width) && width > 0 ? width : null;
        } catch (error) {
            return null;
        }
    }

    function storeWidth(width) {
        try {
            window.localStorage.setItem(STORAGE_KEY, `${width}`);
        } catch (error) {
            // Ignore storage errors; the current page width still updates.
        }
    }

    function getMinWidth(container, maxWidth) {
        const minWidth = parseFloat(window.getComputedStyle(container).minWidth);
        if (Number.isNaN(minWidth)) {
            return Math.min(220, maxWidth);
        }

        return Math.min(minWidth, maxWidth);
    }

    function clampWidth(container, width, maxWidth) {
        const minWidth = getMinWidth(container, maxWidth);
        return Math.min(Math.max(width, minWidth), maxWidth);
    }

    function setWidth(container, width) {
        const parentWidth = container.parentElement.clientWidth;
        const nextWidth = clampWidth(container, width, parentWidth);
        container.style.width = `${nextWidth}px`;
        return nextWidth;
    }

    document.querySelectorAll("[data-text-resizer]").forEach((container) => {
        const handle = container.querySelector(".text-resizer__handle");
        if (!handle) {
            return;
        }

        let startX = 0;
        let startWidth = 0;
        const storedWidth = readStoredWidth();

        if (storedWidth !== null) {
            setWidth(container, storedWidth);
        }

        handle.addEventListener("pointerdown", (event) => {
            startX = event.clientX;
            startWidth = container.getBoundingClientRect().width;
            container.classList.add("is-resizing");
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
        });

        handle.addEventListener("pointermove", (event) => {
            if (!container.classList.contains("is-resizing")) {
                return;
            }

            const nextWidth = setWidth(container, startWidth + event.clientX - startX);
            storeWidth(nextWidth);
        });

        handle.addEventListener("pointerup", (event) => {
            container.classList.remove("is-resizing");
            handle.releasePointerCapture(event.pointerId);
        });

        handle.addEventListener("pointercancel", (event) => {
            container.classList.remove("is-resizing");
            handle.releasePointerCapture(event.pointerId);
        });

        handle.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                const nextWidth = setWidth(
                    container,
                    container.getBoundingClientRect().width - KEYBOARD_STEP,
                );
                storeWidth(nextWidth);
                event.preventDefault();
            }

            if (event.key === "ArrowRight") {
                const nextWidth = setWidth(
                    container,
                    container.getBoundingClientRect().width + KEYBOARD_STEP,
                );
                storeWidth(nextWidth);
                event.preventDefault();
            }
        });

        window.addEventListener("resize", () => {
            const latestStoredWidth = readStoredWidth();

            if (latestStoredWidth !== null) {
                setWidth(container, latestStoredWidth);
            }
        });
    });
})();
