/**
 * Raw data for each body, to be passed into the Body constructor.
 * @alias    data
 * @memberOf module:KIMCHI.space
 */
var KIMCHI = (function (KIMCHI) {
  'use strict';



  KIMCHI.space.data = [
    {
      'name': 'Sun',
      'radiusInKm': 696000,
      'position': new THREE.Vector3(0, 0, 0),
      'visibleDistance': 1000000,
      'mesh': (function () {
        var mesh = new THREE.Mesh(
          new THREE.SphereGeometry(696000 / KIMCHI.constants.kmPerAu,
            KIMCHI.config.get('sphere-segments'),
            KIMCHI.config.get('sphere-segments')),
          // not Lambert since sunlight is in the center of the sun
          new THREE.MeshBasicMaterial({
            'map': new THREE.ImageUtils.loadTexture('images/textures/sun.jpg')
          })
        );
        mesh.scale.setXYZ(KIMCHI.config.get('scales-size'));

        return mesh;
      }())
    },/*
    {
      'name': 'LOLWTF',
      'radiusInKm': 696000,
      'position': new THREE.Vector3(5, 5, 0),
      'visibleDistance': 1000000,
      'mesh': (function () {
        jsonLoader.load('js/testconvert.json', function (geometry, materials) {
          data[1].mesh = new THREE.Mesh(geometry, materials);
        });
      }())
    },*/
    {
      'name': 'Mercury',
      'radiusInKm': 2439.64,
      'position': new THREE.Vector3(0, 0.38709893, 0),
      'visibleDistance': 20,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Venus',
      'radiusInKm': 6051.59,
      'position': new THREE.Vector3(0, 0.72333199, 0),
      'visibleDistance': 20,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Earth',
      'radiusInKm': 6378,
      'position': new THREE.Vector3(0, 1.00000011, 0),
      'visibleDistance': 50,
      'move': function () {
        this.mesh.rotateOnAxis((new THREE.Vector3(1, 2, 3)).normalize(), 0.1);
//      this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
      },
      'children': [
        {
          'name': 'Moon',
          'radiusInKm': 1737,
          'position': new THREE.Vector3(0, 1.00000011, 0),
          'visibleDistance': 20,
          'move': function () {
            this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
          }
        }
      ]
    },
    {
      'name': 'Mars',
      'radiusInKm': 3397,
      'position': new THREE.Vector3(0, 1.52366231, 0),
      'visibleDistance': 50,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Jupiter',
      'radiusInKm': 71492,
      'position': new THREE.Vector3(0, 5.20336301, 0),
      'visibleDistance': 250,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Saturn',
      'radiusInKm': 60267,
      'position': new THREE.Vector3(0, 9.53707032, 0),
      'visibleDistance': 250,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Uranus',
      'radiusInKm': 25557.25,
      'position': new THREE.Vector3(0, 19.19126393, 0),
      'visibleDistance': 30,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Neptune',
      'radiusInKm': 24766,
      'position': new THREE.Vector3(0, 30.06896348, 0),
      'visibleDistance': 1000,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    },
    {
      'name': 'Pluto',
      'radiusInKm': 1148.07,
      'position': new THREE.Vector3(0, 39.482, 0),
      'visibleDistance': 1000,
      'move': function () {
        this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
      }
    }
  ];



  return KIMCHI;
}(KIMCHI || {}));