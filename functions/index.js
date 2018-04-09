const functions = require('firebase-functions');
const request = require('request');


const apiKey = (functions.config().nyt || {}).key;
const apiUrl = 'http://api.nytimes.com/svc/news/v3/content/iht/';
const facets = [ 'geo', 'per', 'des', 'org' ];
const sections = [
  'arts',
  'booming',
  'business',
  'business day',
  'education',
  'health',
  'science',
  'technology',
  'magazine',
  'none',
  'open',
  'opinion',
  'public editor',
  'sports',
  'sunday magazine',
  'global home',
  'world',
  'blogs',
  'automobiles',
  'autos',
  'books',
  'corrections',
  'crosswords & games',
  'crosswords/games',
  'dining & wine',
  'fashion & style',
  'giving',
  'great homes and destinations',
  'home & garden',
  'job market',
  'movies',
  'multimedia',
  'multimedia/photos',
  'n.y. / region',
  'obituaries',
  'real estate',
  'style',
  'sunday review',
  't magazine',
  't:style',
  'theater',
  'times topics',
  'timesmachine',
  'travel',
  'u.s.',
  'urbaneye',
  'washington',
  'week in review',
  'your money'
];


exports.state = functions.https.onRequest((req, resp) => {
 // 20 news published in the last 168 hours (1 week) in the given sections.
 request({
   url: `${apiUrl}${sections.join(';')}/168.json?api-key=${apiKey}`,
   json: true
 }, (err, { statusCode, body }) => {
   if (err) {
     return resp.status(500).json(err);
   } else if (statusCode !== 200) {
     return resp.status(statusCode).json(body);
   }
   return resp
     .set('Cache-Control', 'public, max-age=600, s-maxage=1800')
     .json(Object.assign({}, body, {
       stats: body.results.reduce((memo, result) => {
         facets.forEach(facet => {
           memo[facet] = memo[facet] || {};
           if (result[`${facet}_facet`]) {
             result[`${facet}_facet`].forEach(val => {
               memo[facet][val] = memo[facet][val] ? memo[facet][val] + 1 : 1;
             });
           }
         });
         return memo;
       }, {}),
     }));
 });
});
