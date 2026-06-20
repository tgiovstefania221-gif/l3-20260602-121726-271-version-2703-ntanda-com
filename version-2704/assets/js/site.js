(function () {
    const header = document.querySelector("[data-header]");
    const menuButton = document.querySelector("[data-menu-button]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && mobileMenu && header) {
        menuButton.addEventListener("click", function () {
            const expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobileMenu.hidden = expanded;
            header.classList.toggle("menu-open", !expanded);
        });
    }

    document.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
            img.classList.add("image-missing");
        }, { once: true });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const prev = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll(".search-panel").forEach(function (panel) {
        const scope = panel.closest("section") || document;
        const input = panel.querySelector("[data-search-input]");
        const chips = Array.from(panel.querySelectorAll("[data-filter-value]"));
        const cards = Array.from(scope.querySelectorAll("[data-card]"));
        const noResults = scope.querySelector("[data-no-results]");
        let active = "all";

        function matchesFilter(card) {
            if (active === "all") {
                return true;
            }
            const haystack = [
                card.dataset.haystack || "",
                card.dataset.type || "",
                card.dataset.year || "",
                card.dataset.region || "",
                card.dataset.genre || "",
                card.dataset.category || "",
                card.dataset.tags || ""
            ].join(" ").toLowerCase();
            return haystack.indexOf(active.toLowerCase()) !== -1;
        }

        function apply() {
            const query = input ? input.value.trim().toLowerCase() : "";
            let visible = 0;
            cards.forEach(function (card) {
                const haystack = (card.dataset.haystack || card.textContent || "").toLowerCase();
                const ok = (!query || haystack.indexOf(query) !== -1) && matchesFilter(card);
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.dataset.filterValue || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                apply();
            });
        });

        apply();
    });

    document.querySelectorAll("[data-player-video]").forEach(function (video) {
        const shell = video.closest(".player-shell");
        const cover = shell ? shell.querySelector("[data-player-cover]") : null;
        const source = video.dataset.hls;
        let attached = false;
        let hlsInstance = null;

        function attach() {
            if (attached || !source) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
