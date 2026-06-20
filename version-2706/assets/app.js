(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
            });
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-root]").forEach(function (root) {
            var container = root.parentElement;
            var list = container ? container.querySelector("[data-filter-list]") : null;
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];
            if (!cards.length) {
                return;
            }
            var keywordInput = root.querySelector("input[name='keyword']");
            var regionSelect = root.querySelector("select[name='region']");
            var yearSelect = root.querySelector("select[name='year']");
            var typeSelect = root.querySelector("select[name='type']");
            var categorySelect = root.querySelector("select[name='category']");
            var status = root.querySelector("[data-filter-status]");

            function textValue(input) {
                return input && input.value ? input.value.trim().toLowerCase() : "";
            }

            function selectedValue(input) {
                return input && input.value ? input.value : "";
            }

            function apply() {
                var keyword = textValue(keywordInput);
                var region = selectedValue(regionSelect);
                var year = selectedValue(yearSelect);
                var type = selectedValue(typeSelect);
                var category = selectedValue(categorySelect);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title || "",
                        card.dataset.region || "",
                        card.dataset.year || "",
                        card.dataset.type || "",
                        card.dataset.genre || "",
                        card.dataset.tags || ""
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (region && card.dataset.region !== region) {
                        matched = false;
                    }
                    if (year && card.dataset.year !== year) {
                        matched = false;
                    }
                    if (type && card.dataset.type !== type) {
                        matched = false;
                    }
                    if (category && card.dataset.category !== category) {
                        matched = false;
                    }
                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (status) {
                    var active = keyword || region || year || type || category;
                    status.textContent = active ? "已找到 " + visible + " 部相关影片" : "";
                }
            }

            [keywordInput, regionSelect, yearSelect, typeSelect, categorySelect].forEach(function (input) {
                if (!input) {
                    return;
                }
                input.addEventListener(input.tagName === "INPUT" ? "input" : "change", apply);
            });

            var query = new URLSearchParams(window.location.search).get("q");
            if (query && keywordInput) {
                keywordInput.value = query;
                apply();
            }
        });
    }

    function initPlayer() {
        var video = document.querySelector("video[data-stream]");
        if (!video) {
            return;
        }
        var cover = document.querySelector("[data-player-cover]");
        var source = video.getAttribute("data-stream");
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !source) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }
            video.src = source;
            video.load();
        }

        function start() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!prepared) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayer();
    });
})();
