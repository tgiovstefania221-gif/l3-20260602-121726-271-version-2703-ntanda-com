(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();

        var filterPanel = document.querySelector("[data-filter-panel]");

        if (filterPanel) {
            var searchInput = filterPanel.querySelector("[data-filter-search]");
            var yearSelect = filterPanel.querySelector("[data-filter-year]");
            var categorySelect = filterPanel.querySelector("[data-filter-category]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            var count = filterPanel.querySelector("[data-filter-count]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (searchInput && query) {
                searchInput.value = query;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function applyFilters() {
                var keyword = normalize(searchInput ? searchInput.value : "");
                var year = yearSelect ? yearSelect.value : "全部年份";
                var category = categorySelect ? categorySelect.value : "全部分类";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardCategory = card.getAttribute("data-category") || "";
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var yearMatch = year === "全部年份" || cardYear.indexOf(year) === 0;
                    var categoryMatch = category === "全部分类" || cardCategory === category;
                    var show = keywordMatch && yearMatch && categoryMatch;

                    card.style.display = show ? "" : "none";

                    if (show) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = "当前显示 " + visible + " 部影片";
                }

                var empty = document.querySelector("[data-empty-state]");
                if (empty) {
                    empty.classList.toggle("visible", visible === 0);
                }
            }

            [searchInput, yearSelect, categorySelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }

        var backTop = document.querySelector("[data-back-top]");

        if (backTop) {
            window.addEventListener("scroll", function () {
                backTop.classList.toggle("visible", window.scrollY > 480);
            });

            backTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    });
})();
