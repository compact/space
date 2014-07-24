/**
 * Ephemeris API.
 */

var getPlanetPositionArrays = require('./getPlanetPositionArrays');

module.exports = function (app) {
  app.get('/ephemeris', function (req, res) {
    // URL query parameters
    var julian = parseInt(req.query.start, 10) || 2451545;
    var step = parseInt(req.query.step, 10) || 1;
    var limit = parseInt(req.query.limit, 10) || 1;

    // compute the positions of the planets on the given days
    var planetPositionArrays = {};
    while (limit > 0) {
      planetPositionArrays[julian] = getPlanetPositionArrays(julian);
      julian += step;
      limit--;
    }

    // output JSON
    res.set('Content-Type', 'application/json');
    res.send({
      'planetPositionArrays': planetPositionArrays
    });
  });
};
