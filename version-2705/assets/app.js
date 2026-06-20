(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function render(value) {
      index = (value + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    render(0);
    start();
  }

  function fillYears(cards, select) {
    if (!select) {
      return;
    }
    var years = [];
    cards.forEach(function (card) {
      var year = card.getAttribute('data-year');
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var input = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var sortSelect = document.querySelector('[data-sort-filter]');
    var list = document.querySelector('[data-card-list]');
    var cards = selectAll('[data-card]');
    if (!cards.length || (!input && !yearSelect && !sortSelect)) {
      return;
    }

    fillYears(cards, yearSelect);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && input) {
      input.value = query;
    }

    function filter() {
      var needle = normalize(input && input.value);
      var year = yearSelect ? yearSelect.value : '';
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var visible = (!needle || haystack.indexOf(needle) !== -1) && (!year || cardYear === year);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    function sortCards() {
      if (!list || !sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'year-desc') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        }
        if (mode === 'title') {
          return normalize(a.getAttribute('data-search')).localeCompare(normalize(b.getAttribute('data-search')), 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', filter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        sortCards();
        filter();
      });
    }
    filter();
  }

  window.setupMoviePlayer = function (mediaSource) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');
    var hls = null;
    var attached = false;

    if (!video || !mediaSource) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaSource;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaSource);
        hls.attachMedia(video);
      } else {
        video.src = mediaSource;
      }
      video.controls = true;
    }

    function play(event) {
      if (event) {
        event.preventDefault();
      }
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (cover && cover !== button) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
