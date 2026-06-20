(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMoviePlayer(videoId, streamUrl, overlayId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var message = video ? video.parentElement.querySelector(".player-message") : null;
      var started = false;

      if (!video || !streamUrl) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("show");
        }
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showMessage("视频暂时无法播放");
              hls.destroy();
            }
          }
        });
      } else {
        showMessage("视频暂时无法播放");
      }

      function start() {
        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {
            showMessage("点击画面继续播放");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
