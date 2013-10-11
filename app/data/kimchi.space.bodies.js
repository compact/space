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
    'ephemerisIndex': 10,
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
    'ephemerisIndex': 0,
    'radiusInKm': 2439.64,
    'distanceFromSun': 0.38709893,
    'labelVisibleDistance': 20,
    'createOrbit': true
  },
  {
    'name': 'Venus',
    'type': 'planet',
    'ephemerisIndex': 1,
    'radiusInKm': 6051.59,
    'distanceFromSun': 0.72333199,
    'labelVisibleDistance': 20,
    'createOrbit': true
  },
  {
    'name': 'Earth',
    'type': 'planet',
    'ephemerisIndex': 2,
    'radiusInKm': 6378,
    'distanceFromSun': 1.00000011,
    'labelVisibleDistance': 50,
    'rotationArray': [1, 2, 3],
    'rotationAngle': 0.2,
    'createOrbit': true,
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
  {
    'name': 'Moon',
    'type': 'moon',
    'ephemerisIndex': 9,
    'radiusInKm': 1737,
    'labelVisibleDistance': 10,
    'hasBumpMap': true
  },
  {
    'name': 'Mars',
    'type': 'planet',
    'ephemerisIndex': 3,
    'radiusInKm': 3397,
    'distanceFromSun': 1.52366231,
    'labelVisibleDistance': 50,
    'createOrbit': true
  },
  {
    'name': 'Jupiter',
    'type': 'planet',
    'ephemerisIndex': 4,
    'radiusInKm': 71492,
    'distanceFromSun': 5.20336301,
    'labelVisibleDistance': 250,
    'createOrbit': true
  },
  {
    'name': 'Saturn',
    'type': 'planet',
    'ephemerisIndex': 5,
    'radiusInKm': 60267,
    'distanceFromSun': 9.53707032,
    'labelVisibleDistance': 250,
    'createOrbit': true,
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
    'ephemerisIndex': 6,
    'radiusInKm': 25557.25,
    'distanceFromSun': 19.19126393,
    'labelVisibleDistance': 500,
    'createOrbit': true
  },
  {
    'name': 'Neptune',
    'type': 'planet',
    'ephemerisIndex': 7,
    'radiusInKm': 24766,
    'distanceFromSun': 30.06896348,
    'labelVisibleDistance': 1000,
    'createOrbit': true
  },
  {
    'name': 'Pluto',
    'type': 'planet',
    'ephemerisIndex': 8,
    'radiusInKm': 1148.07,
    'distanceFromSun': 39.482,
    'labelVisibleDistance': 1000,
    'createOrbit': true
  }
];