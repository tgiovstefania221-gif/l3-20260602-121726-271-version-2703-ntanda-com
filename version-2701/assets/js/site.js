(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var siteNav = document.querySelector("[data-site-nav]");

        if (menuButton && siteNav) {
            menuButton.addEventListener("click", function () {
                siteNav.classList.toggle("is-open");
            });
        }

        document.addEventListener("error", function (event) {
            var target = event.target;

            if (target && target.tagName === "IMG") {
                target.style.display = "none";
                if (target.parentElement) {
                    target.parentElement.classList.add("poster-fallback");
                }
            }
        }, true);

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            activeIndex = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, index) {
                slide.classList.toggle("is-active", index === activeIndex);
            });

            dots.forEach(function (dot, index) {
                dot.classList.toggle("is-active", index === activeIndex);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var searchButton = document.querySelector("[data-search-button]");
        var resultCount = document.querySelector("[data-result-count]");
        var searchCards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards() {
            if (!searchInput) {
                return;
            }

            var query = normalize(searchInput.value);
            var visibleCount = 0;

            searchCards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("hidden-by-search", !matched);

                if (matched) {
                    visibleCount += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = "当前显示 " + visibleCount + " 部影片";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterCards);
        }

        if (searchButton) {
            searchButton.addEventListener("click", filterCards);
        }

        filterCards();
    });
})();
