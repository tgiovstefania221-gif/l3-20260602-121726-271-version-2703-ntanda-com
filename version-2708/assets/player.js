(function () {
  function initPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var message = box.querySelector('[data-player-message]');

    if (!video || !button) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function startPlayback() {
      var source = video.getAttribute('data-src');

      if (!source) {
        setMessage('当前影片暂未配置播放源。');
        return;
      }

      button.classList.add('is-hidden');
      setMessage('正在载入播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击视频播放。');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setMessage('播放源已就绪，请点击视频播放。');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请刷新页面后重试。');
            button.classList.remove('is-hidden');
            hls.destroy();
          }
        });
        return;
      }

      video.src = source;
      video.play().catch(function () {
        setMessage('当前浏览器不支持 HLS 播放，请使用 Safari、Edge、Chrome 或移动端浏览器访问。');
        button.classList.remove('is-hidden');
      });
    }

    button.addEventListener('click', startPlayback);
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
