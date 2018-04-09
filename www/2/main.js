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


var shuffle = function (array) {
  var rand;
  var index = 0;
  var shuffled = [];
  var i, len, value;

  for (i = 0, len = array.length; i < len; i++) {
    value = array[i];
    rand = random(index++);
    shuffled[index - 1] = shuffled[rand];
    shuffled[rand] = value;
  }

  return shuffled;
}


var initBgImage = function (data) {
  var randomResult = data.results[random(0, data.results.length - 1)];
  // Always use `https` instead of `http`.
  var url = randomResult.thumbnail_standard.replace(/^http:/, 'https:');
  $('html').css('background-image', 'url(' + url + ')');
  setTimeout(initBgImage.bind(null, data), 3 * 1000);
};


var initHeading = function (data) {
  var $h1 = $('h1');
  var all = Object.keys(data.stats).reduce(function (memo, topic) {
    return memo.concat(Object.keys(data.stats[topic]));
  }, []);

  var shuffled = shuffle(all);
  var pos = 0;

  var next = function () {
    if (pos >= shuffled.length) {
      pos = 0;
    }

    $h1.text(shuffled[pos++]);
    setTimeout(next, 5 * 1000);
  };

  $h1.css('display', 'inline-block');
  next();
};


var fetchNews = function () {
  $.getJSON('/state', function (data) {
    if (!data) {
      return alert('Error loading news...');
    }

    setTimeout(function () {
      initBgImage(data);
      initHeading(data);
    }, 2 * 1000);
  });
};


fetchNews();
