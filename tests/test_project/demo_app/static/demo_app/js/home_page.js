(function () {
    const KEYBOARD_STEP = 24;

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
    }

    document.querySelectorAll("[data-text-resizer]").forEach((container) => {
        const handle = container.querySelector(".text-resizer__handle");
        if (!handle) {
            return;
        }

        let startX = 0;
        let startWidth = 0;

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

            setWidth(container, startWidth + event.clientX - startX);
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
                setWidth(container, container.getBoundingClientRect().width - KEYBOARD_STEP);
                event.preventDefault();
            }

            if (event.key === "ArrowRight") {
                setWidth(container, container.getBoundingClientRect().width + KEYBOARD_STEP);
                event.preventDefault();
            }
        });
    });
})();
