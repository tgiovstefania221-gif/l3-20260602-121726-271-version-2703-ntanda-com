import { H as Hls } from "./hls-core.js";

function attachSource(video, sourceUrl) {
    if (!video || !sourceUrl) {
        return;
    }

    if (window.__activeHlsPlayer) {
        try {
            window.__activeHlsPlayer.destroy();
        } catch (error) {
            console.warn("清理播放器实例失败", error);
        }
        window.__activeHlsPlayer = null;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
                video.controls = true;
            });
        });

        window.__activeHlsPlayer = hls;
        return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        video.play().catch(function () {
            video.controls = true;
        });
        return;
    }

    video.outerHTML = '<div class="content-block"><p>当前浏览器不支持 HLS 播放，请使用支持 M3U8 的浏览器访问。</p></div>';
}

document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("[data-player-start]");
    var video = document.querySelector("[data-m3u8]");

    if (!button || !video) {
        return;
    }

    button.addEventListener("click", function () {
        button.classList.add("is-hidden");
        video.controls = true;
        attachSource(video, video.getAttribute("data-m3u8"));
    });
});
