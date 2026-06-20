(function () {
  function initPlayer(player) {
    var button = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');
    var source = player.getAttribute('data-video-src');
    var title = player.getAttribute('data-video-title') || '影片';
    var hlsInstance = null;

    if (!button || !video || !source) {
      return;
    }

    function showError(message) {
      button.classList.remove('hidden');
      button.innerHTML = '<span class="player-play-icon">!</span><strong>' + title + '</strong><em>' + message + '</em>';
    }

    function playVideo() {
      button.classList.add('hidden');

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {
          showError('浏览器阻止自动播放，请再次点击播放按钮');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            showError('浏览器阻止自动播放，请再次点击播放按钮');
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('播放源暂时无法加载，请稍后重试');
          }
        });
        return;
      }

      showError('当前浏览器不支持 HLS 播放');
    }

    button.addEventListener('click', playVideo);
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initPlayer);
  });
})();
