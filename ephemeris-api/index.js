/**
 * Ephemeris API.
 */

var getPlanetPositionArrays = require('./getPlanetPositionArrays');

module.exports = function (app) {
  app.get('/ephemeris', function (req, res) {
    // URL query parameters
    var jdn = parseInt(req.query.startJDN, 10) || 2451545;
    var jdnStep = parseInt(req.query.jdnStep, 10) || 1;
    var limit = parseInt(req.query.limit, 10) || 1;

    // compute the positions of the planets on the given days
    var planetPositionArrays = {};
    while (limit > 0) {
      planetPositionArrays[jdn] = getPlanetPositionArrays(jdn);
      jdn += jdnStep;
      limit--;
    }

    // output JSON
    res.set('Content-Type', 'application/json');
    res.send({
      'planetPositionArrays': planetPositionArrays
    });
  });
};
