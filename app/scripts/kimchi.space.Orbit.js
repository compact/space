/**
 * Constructor for an orbit of a Body. Not all Bodies have Orbits. Render a
 *   Line with Vertices each corresponding to the Body's position on a given
 *   Julian Day Number. All the Vertices are updated periodically when the
 *   Body revolves (not every frame).
 * @param       {Object} options
 * @param       {String} options.name          Passed from KIMCHI.space.data.
 * @param       {Number} options.orbitalPeriod Passed from KIMCHI.space.data.
 * @constructor Orbit
 * @memberOf    module:KIMCHI.space
 */
var KIMCHI = (function (KIMCHI, _, THREE) {
  'use strict';

  var Orbit = function (options) {
    _.assign(this, options);

    // set the Julian offsets
    var vertexCount = Math.min(
      // add an extra day to the orbital period to ensure there is no tiny gap
      // in the orbit
      Math.ceil(this.orbitalPeriod) + 1,
      KIMCHI.config.get('maxVertexCountInOrbits')
    );
    this.julianOffsets = [];
    for (var i = 0; i < vertexCount; i++) {
      this.julianOffsets.push(Math.round(
        // -0.25 is an arbitrary offset for where the orbit loops back to
        // itself; it is not 0 to prevent visual discrepancy at the Body
        this.orbitalPeriod * (i / (vertexCount - 1) - 0.25)
      ));
    }

    // create the material
    var material = new THREE.LineBasicMaterial({
      'color': KIMCHI.config.get('orbitsColor'),
      'transparent': KIMCHI.config.get('orbitsOpacity') < 1,
      'opacity': KIMCHI.config.get('orbitsOpacity')
    });

    // create the orbit line
    this.line = new THREE.Line(new THREE.Geometry(), material);

    // update the geometry
    this.update();
  };

  /**
   * Value passed from an object in KIMCHI.space.data.
   * @alias    name
   * @instance
   * @memberOf module:KIMCHI.space.Orbit
   */
  Orbit.prototype.name = '';

  /**
   * Value passed from an object in KIMCHI.space.data.
   * @alias    orbitalPeriod
   * @instance
   * @memberOf module:KIMCHI.space.Orbit
   */
  Orbit.prototype.orbitalPeriod = 365.25;

  /**
   * An array of offsets relative to the current Julian Day Number, each
   *   corresponding to a Vertex in this Orbit.
   * @alias    julianOffsets
   * @type     {Number[]}
   * @instance
   * @memberOf module:KIMCHI.space.Orbit
   */
  Orbit.prototype.julianOffsets = null;

  /**
   * The next Julian Day Number to update this Orbit.
   * @alias    nextJulianForUpdate
   * @type     {Number}
   * @instance
   * @memberOf module:KIMCHI.space.Orbit
   */
  Orbit.prototype.nextJulianForUpdate = null;

  /**
   * Update this Orbit by recalculating the positions of all its Vertices,
   *   provided this Orbit needs to be updated at the current Julian Day
   *   Number.
   * @alias    updateOrbit
   * @instance
   * @memberOf module:KIMCHI.space.Orbit
   */
  Orbit.prototype.update = function () {
    if (KIMCHI.time.getJulian() >= this.nextJulianForUpdate) {
      var geometry = this.line.geometry;
      geometry.vertices = [];

      var getPositionArray = _.partial(
        KIMCHI.ephemeris.getPositionArray,
        this.name
      );
      var julian = KIMCHI.time.getJulian();
      var position;

      _.each(this.julianOffsets, function (julianOffset) {
        position = new THREE.Vector3();
        geometry.vertices.push(position.fromArray(
          getPositionArray(julian + julianOffset)
        ));
      });

      // this property needs to be set to update the vertices
      geometry.verticesNeedUpdate = true;

      // set a new Julian for the next iteration
      this.nextJulianForUpdate = julian + this.julianOffsets[
        Math.round(this.julianOffsets.length * 0.75)
      ];
    }
  };

  KIMCHI.space = KIMCHI.space || {};
  KIMCHI.space.Orbit = Orbit;
  return KIMCHI;
}(KIMCHI || {}, _, THREE));
