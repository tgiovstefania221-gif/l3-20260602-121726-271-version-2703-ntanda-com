(function () {
    function initMoviePlayer(config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var button = document.getElementById(config.buttonId);
        var status = document.getElementById(config.statusId);
        var source = config.src;
        var hls = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function setStatus(text) {
            if (status) {
                status.textContent = text || "";
            }
        }

        function prepare() {
            if (prepared) {
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
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("播放暂时不可用，请稍后再试");
                        hls.startLoad();
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("正在恢复播放");
                        hls.recoverMediaError();
                        return;
                    }

                    setStatus("播放暂时不可用，请稍后再试");
                });

                return;
            }

            setStatus("当前浏览器暂不支持播放");
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        }

        function showOverlay() {
            if (overlay) {
                overlay.classList.remove("hidden");
            }
        }

        function start() {
            setStatus("");
            prepare();

            var playPromise = video.play();

            if (playPromise && typeof playPromise.then === "function") {
                playPromise.then(function () {
                    hideOverlay();
                }).catch(function () {
                    showOverlay();
                    setStatus("点击继续播放");
                });
            } else {
                hideOverlay();
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        }

        video.addEventListener("play", hideOverlay);
        video.addEventListener("ended", showOverlay);
        video.addEventListener("error", function () {
            showOverlay();
            setStatus("播放暂时不可用，请稍后再试");
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
