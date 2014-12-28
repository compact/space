var KIMCHI = KIMCHI || {};

KIMCHI.space = KIMCHI.space || {};

/**
 * Options for each Body to be passed into the constructor.
 * @alias    data
 * @memberOf module:KIMCHI.space
 */
KIMCHI.space.data = [
  {
    'name': 'Sun',
    'type': 'star',
    'radiusInKm': 696000,
    'labelVisibleDistance': 1000000,
    'material': function () {
      return new THREE.MeshBasicMaterial({
        'map': THREE.ImageUtils.loadTexture(this.getTexturePath())
      });
    }
  },
  {
    'name': 'Mercury',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 2439.64,
    'distanceFromSun': 0.38709893,
    'labelVisibleDistance': 20,
    'hasOrbitLine': true,
    'orbitalPeriod': 0.2408467 * 365.25
  },
  {
    'name': 'Venus',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 6051.59,
    'distanceFromSun': 0.72333199,
    'labelVisibleDistance': 20,
    'hasOrbitLine': true,
    'orbitalPeriod': 0.61519726 * 365.25
  },
  {
    'name': 'Earth',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 6378,
    'distanceFromSun': 1.00000011,
    'labelVisibleDistance': 50,
    'rotationArray': [1, 2, 3],
    'rotationAngle': 0.2,
    'hasOrbitLine': true,
    'orbitalPeriod': 1.0000174 * 365.25,
    'hasBumpMap': true,
    // 'hasSpecularMap': true,
    'callback': function () {
      var cloud = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius * 1.001,
          KIMCHI.config.get('sphere-segments'),
          KIMCHI.config.get('sphere-segments')),
        new THREE.MeshPhongMaterial({
          'map': THREE.ImageUtils.loadTexture(this.getTexturePath('clouds')),
          'side': THREE.DoubleSide,
          'opacity': 0.25,
          'transparent': true,
          'depthWrite': false
        })
      );
      this.object3Ds.main.add(cloud);
    }
  },
  // {
  //   'name': 'Moon',
  //   'type': 'moon',
  //   'radiusInKm': 1737,
  //   'labelVisibleDistance': 10,
  //   'hasBumpMap': true
  // },
  {
    'name': 'Mars',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 3397,
    'distanceFromSun': 1.52366231,
    'labelVisibleDistance': 50,
    'hasOrbitLine': true,
    'orbitalPeriod': 1.8808476 * 365.25
  },
  {
    'name': 'Jupiter',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 71492,
    'distanceFromSun': 5.20336301,
    'labelVisibleDistance': 250,
    'hasOrbitLine': true,
    'orbitalPeriod': 11.862615 * 365.25
  },
  {
    'name': 'Saturn',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 60267,
    'distanceFromSun': 9.53707032,
    'labelVisibleDistance': 250,
    'hasOrbitLine': true,
    'orbitalPeriod': 29.447498 * 365.25,
    'callback': function () {
      var curve = new THREE.EllipseCurve(0, 0, this.radius + 0.2, this.radius + 0.2, 0, 2 * Math.PI);
      var curvePath = new THREE.CurvePath();
      curvePath.add(curve);
      var geometry = curvePath.createSpacedPointsGeometry(100);
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(
          this.radius + 7000 / KIMCHI.constants.kmPerAu,
          this.radius + 60300 / KIMCHI.constants.kmPerAu,
          360
        ),
        new THREE.MeshBasicMaterial({
          'map': THREE.ImageUtils.loadTexture(this.getTexturePath('ring')),
          'side': THREE.DoubleSide
          // 'opacity': 0.25,
          // 'transparent': true,
          // 'depthWrite': false
        })
      );
      this.object3Ds.main.add(ring);
    }
  },
  {
    'name': 'Uranus',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 25557.25,
    'distanceFromSun': 19.19126393,
    'labelVisibleDistance': 500,
    'hasOrbitLine': true,
    'orbitalPeriod': 84.016846 * 365.25
  },
  {
    'name': 'Neptune',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 24766,
    'distanceFromSun': 30.06896348,
    'labelVisibleDistance': 1000,
    'hasOrbitLine': true,
    'orbitalPeriod': 164.79132 * 365.25
  },
  {
    'name': 'Pluto',
    'type': 'planet',
    'inEphemeris': true,
    'radiusInKm': 1148.07,
    'distanceFromSun': 39.482,
    'labelVisibleDistance': 1000,
    'hasOrbitLine': true,
    'orbitalPeriod': 247.92065 * 365.25
  }
];
