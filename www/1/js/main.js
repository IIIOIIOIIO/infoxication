
var randomColour = function () {
  return [
    'rgba(',
    _.random(0, 255), ', ',
    _.random(0, 255), ', ',
    _.random(0, 255), ', ',
    (_.random(0, 100) / 100).toFixed(1),
    ')'
  ].join('');
};


var facets = [ 'geo', 'per', 'des', 'org' ];
var facetColours;

var initFacetColours = function () {
  facetColours = _.reduce(facets, function (memo, facet) {
    memo[facet] = randomColour();
    return memo;
  }, {});
};


var facetToHtml = function (facet, value, type, maxX, maxY) {
  var h = [
    '<div class="facet" style="',
    'background-color: ', facetColours[type], ';',
    'top: ', _.random(0, maxY), 'px;',
    'left: ', _.random(0, maxX), 'px;',
    'font-size: ', value, 'em;',
    '">',
    '<a href="#" class="', type, '_facet">', facet, '</a>',
    '</div>'
  ];

  return h.join('');
};


// Convert an article object as returned by the NYT api to HTML.
var resultToHtml = function (result, maxX, maxY, size) {
  size = size || _.random(1, 8);

  var h = [
    '<article style="',
    'top: ', _.random(0, maxY - 100), 'px;',
    'left: ', _.random(0, maxX - 100), 'px;',
    'font-size: ', size, 'em;',
    'opacity: ', (_.random(1, 10) / 10).toFixed(1), ';',
    '">',
    '<h2>',
    '<a href="', result.url, '" target="_blank">', result.title, '</a>',
    '</h2>',
    //'<p>', result.abstract, '</p>',
    '</article>'
  ];

  return h.join('');
};


var fetchNews = function (cb) {
  $.getJSON('/state', function (data) {
    if (!data) {
      return cb('Error loading news...');
    }

    cb(null, data);
  });
};


$.fn.state = function (options) {
  var $el = this;
  var $win = $(window);
  var width, height;

  function resize() {
    width = $win.width();
    height = $win.height();
    $el.css({ width: width, height: height });
  }

  // Resize container when window is resized.
  $win.on('resize', function () { resize(); });
  // Invoke `resize` to initialize container size.
  resize();

  // Draw data in container.
  function draw(data) {
    if (data) {
      $el.data('data', data);
    } else {
      data = $el.data('data');
    }

    initFacetColours();

    $('body').css('background-color', randomColour());

    $el
      .hide()
      .html(_.reduce(data.results, function (memo, result) {
        return memo += resultToHtml(result, width, height);
      }, ''))
      .append(_.reduce(data.stats, function (memo, data, type) {
        return memo += _.reduce(data, function (memo, v, k) {
          return memo += facetToHtml(k, v, type, width, height);
        }, '');
      }, ''))
      .show();
  }

  function filterArticlesByFacet(value, facetProp) {
    var data = $el.data('data');
    var $articles = $('article');
    _.each(data.results, function (result, i) {
      if (_.indexOf(result[facetProp], value) === -1) {
        $($articles[i]).removeClass('active').hide();
      }
      else {
        $($articles[i]).addClass('active').show();
      }
    });
  }

  $(document).on('click', '.facet a', function (e) {
    var $a = $(e.target);
    var $facet = $a.parents('.facet');
    var $facets = $('.facet');

    if ($facet.hasClass('active')) {
      $facet.removeClass('active');
      $facets.show();
      $('article').removeClass('active').show();
    }
    else {
      $facets.removeClass('active');
      $facet.addClass('active');
      $facets.not('.active').hide();
      filterArticlesByFacet($a.html(), $a.attr('class'));
    }
  });

  $(document).on('click', 'article a', function (e) {
    var $a = $(e.target);
    var $article = $a.parents('article');

    if (!$article.hasClass('active')) {
      e.preventDefault();
    }
  });


  // Fetch news and precompute stats.
  fetchNews(function (err, data) {
    if (err) {
      return alert(err);
    }

    draw(data);
    setInterval(draw, 100);
  });
};
