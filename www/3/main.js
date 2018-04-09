'use strict';


var random = function (min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
};


var randomColour = function () {
  return [
    'rgba(',
    random(0, 255), ', ',
    random(0, 255), ', ',
    random(0, 255), ', ',
    (random(0, 100) / 100).toFixed(1),
    ')'
  ].join('');
};


var initTags = function (data) {
  Object.keys(data.stats).forEach(function (key) {
    var items = Object.keys(data.stats[key]);
    var $el = $('#' + key);
    $el.html('<span>' + items[random(0, items.length - 1)] + '</span>');
  });

  setTimeout(initTags.bind(null, data), 50);
};


var fetchNews = function () {
  $.getJSON('/state', function (data) {
    if (!data) {
      return alert('Error loading news...');
    }

    setTimeout(function () {
      initTags(data);
    }, 1000);
  });
};


fetchNews();
