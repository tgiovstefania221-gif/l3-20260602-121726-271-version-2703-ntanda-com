(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilter() {
    var input = qs('[data-card-search]');
    var year = qs('[data-year-filter]');
    var cards = qsa('[data-title]');
    if (!input || !cards.length) {
      return;
    }

    function apply() {
      var term = input.value.trim().toLowerCase();
      var yearValue = year ? year.value : '';
      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedText = !term || title.indexOf(term) >= 0 || genre.indexOf(term) >= 0;
        var matchedYear = !yearValue || cardYear === yearValue;
        card.style.display = matchedText && matchedYear ? '' : 'none';
      });
    }

    input.addEventListener('input', apply);
    if (year) {
      year.addEventListener('change', apply);
    }
  }

  function attachHls(video, src, status, shell) {
    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    if (!src) {
      setStatus('播放源未加载');
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      shell.classList.add('ready');
      setStatus('');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        shell.classList.add('ready');
        setStatus('');
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('视频加载异常，请稍后重试');
        }
      });
      video._hlsInstance = hls;
      return;
    }

    video.src = src;
    shell.classList.add('ready');
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (shell) {
      var video = qs('video', shell);
      var button = qs('[data-play-button]', shell);
      var status = qs('[data-player-status]', shell);
      var src = shell.getAttribute('data-src');
      if (!video || !button) {
        return;
      }

      var prepared = false;
      function play() {
        if (!prepared) {
          attachHls(video, src, status, shell);
          prepared = true;
        }
        shell.classList.add('playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (status) {
              status.textContent = '点击播放器控件开始播放';
            }
          });
        }
      }

      button.addEventListener('click', play);
      shell.addEventListener('click', function (event) {
        if (event.target === video) {
          play();
        }
      });
    });
  }

  function setupSearchPage() {
    var input = qs('[data-global-search]');
    var results = qs('[data-search-results]');
    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }
      results.innerHTML = items.slice(0, 80).map(function (item) {
        return [
          '<article class="search-result-item">',
          '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy">',
          '<div>',
          '<h3><a href="./' + item.file + '">' + item.title + '</a></h3>',
          '<p>' + item.year + ' · ' + item.genre + ' · ' + item.region + '</p>',
          '</div>',
          '<a class="btn btn-primary" href="./' + item.file + '">进入详情</a>',
          '</article>'
        ].join('');
      }).join('');
    }

    function search() {
      var term = input.value.trim().toLowerCase();
      if (!term) {
        render(window.MOVIE_SEARCH_DATA.slice(0, 40));
        return;
      }
      render(window.MOVIE_SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.genre, item.year, item.region, item.tags].join(' ').toLowerCase();
        return haystack.indexOf(term) >= 0;
      }));
    }

    input.addEventListener('input', search);
    search();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilter();
    setupPlayers();
    setupSearchPage();
  });
})();
