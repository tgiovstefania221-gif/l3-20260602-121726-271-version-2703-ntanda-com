(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-search-category]');
  var yearInput = document.querySelector('[data-search-year]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var movies = [];

  if (!form || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + escapeHtml(movie.href) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <span class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback="' + escapeHtml(movie.title) + '">',
      '      <span class="poster-shade"></span>',
      '      <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
      '      <span class="poster-play" aria-hidden="true">▶</span>',
      '    </span>',
      '    <span class="card-copy">',
      '      <strong>' + escapeHtml(movie.title) + '</strong>',
      '      <small>' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</small>',
      '      <span>' + escapeHtml(movie.oneLine) + '</span>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function readParams() {
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }
    if (categorySelect && params.get('category')) {
      categorySelect.value = params.get('category');
    }
    if (yearInput && params.get('year')) {
      yearInput.value = params.get('year');
    }
  }

  function applySearch() {
    var query = input ? input.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var year = yearInput ? yearInput.value.trim() : '';

    var matched = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' ').toLowerCase();
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesCategory = !category || movie.category === category;
      var matchesYear = !year || movie.year === year;
      return matchesQuery && matchesCategory && matchesYear;
    }).slice(0, 120);

    results.innerHTML = matched.map(renderCard).join('\n');

    if (status) {
      status.textContent = '找到 ' + matched.length + ' 条结果' + (matched.length === 120 ? '，已显示前 120 条。' : '。');
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applySearch();
  });

  [input, categorySelect, yearInput].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    }
  });

  if (Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    movies = window.MOVIE_SEARCH_INDEX;
    readParams();
    applySearch();
  } else if (status) {
    status.textContent = '搜索索引加载失败，请检查 assets/search-index.js 是否存在。';
  }
})();
