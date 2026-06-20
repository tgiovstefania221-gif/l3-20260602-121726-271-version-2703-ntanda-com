(function () {
  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 48) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));

  function addUniqueOption(select, value) {
    if (!select || !value) {
      return;
    }
    var exists = Array.prototype.some.call(select.options, function (option) {
      return option.value === value;
    });
    if (!exists) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    }
  }

  filterRoots.forEach(function (root) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var input = root.querySelector('[data-filter-input]');
    var categorySelect = root.querySelector('[data-filter-category]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    cards.forEach(function (card) {
      addUniqueOption(yearSelect, card.getAttribute('data-year'));
      addUniqueOption(regionSelect, card.getAttribute('data-region'));
      addUniqueOption(typeSelect, card.getAttribute('data-type'));
    });

    if (input && q) {
      input.value = q;
    }

    function applyFilters() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var match = true;
        if (text && hay.indexOf(text) === -1) {
          match = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          match = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          match = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          match = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          match = false;
        }
        card.style.display = match ? '' : 'none';
        if (match) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [input, categorySelect, yearSelect, regionSelect, typeSelect].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener('input', applyFilters);
      node.addEventListener('change', applyFilters);
    });

    applyFilters();
  });

  var indexSearch = document.querySelector('[data-index-search]');
  if (indexSearch) {
    indexSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = indexSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  }
})();

function initMoviePlayer(videoId, coverId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  if (!video || !cover || !sourceUrl) {
    return;
  }

  var loaded = false;

  function bindSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playVideo() {
    bindSource();
    cover.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });
}
