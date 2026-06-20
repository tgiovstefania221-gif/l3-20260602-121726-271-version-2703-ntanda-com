(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-main-nav]');
    var search = qs('.header-search');

    if (!button || !nav || !search) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      search.classList.toggle('open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function resultHtml(item) {
    return [
      '<a class="search-result-item" href="' + escapeHtml(item.url) + '">',
      '  <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
      '  <span>',
      '    <strong>' + escapeHtml(item.title) + '</strong>',
      '    <span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function initGlobalSearch() {
    var data = window.SEARCH_DATA || [];
    var forms = qsa('[data-global-search-form]');

    forms.forEach(function (form) {
      var input = qs('[data-global-search-input]', form);
      var results = qs('[data-global-search-results]', form);

      if (!input || !results) {
        return;
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();

        if (!keyword) {
          results.classList.remove('active');
          results.innerHTML = '';
          return;
        }

        var matches = data.filter(function (item) {
          return item.searchText.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          results.innerHTML = '<div class="search-result-item"><span><strong>未找到匹配影片</strong><span>请尝试更换关键词</span></span></div>';
        } else {
          results.innerHTML = matches.map(resultHtml).join('');
        }

        results.classList.add('active');
      }

      input.addEventListener('input', render);
      input.addEventListener('focus', render);

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    });

    document.addEventListener('click', function (event) {
      forms.forEach(function (form) {
        if (!form.contains(event.target)) {
          var results = qs('[data-global-search-results]', form);
          if (results) {
            results.classList.remove('active');
          }
        }
      });
    });
  }

  function initPageFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-filter-year]', scope);
      var type = qs('[data-filter-type]', scope);
      var count = qs('[data-filter-count]', scope);
      var cards = qsa('.filter-card');

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matched = true;

          if (keyword && searchText.indexOf(keyword) === -1) {
            matched = false;
          }

          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }

          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部影片';
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initPageFilters();
  });
})();
