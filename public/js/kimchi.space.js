/**
 * Contains astronomical bodies, which are represented by instances of the
 *   {@link Body} class, and their associated Object3Ds. Can only be constructed
 *   inside kimchi.space.js.
 * @namespace space
 * @memberOf  module:KIMCHI
 */
var KIMCHI = (function (KIMCHI, _, $, THREE) {
  'use strict';

  var space = {}, data, Body, bodies;
  KIMCHI.space = space;
  var jsonLoader = new THREE.JSONLoader();


  /**
   * Raw data for each body, to be passed into the Body constructor.
   * @memberOf module:KIMCHI.space
   * @private
   */
  data = [
    {
      'name': 'Sun',
      'radiusInKm': 696000,
      'position': new THREE.Vector3(0, 0, 0),
      'visibleDistance': 1000000,
      'mesh': new THREE.Mesh(
        new THREE.SphereGeometry(696000 * KIMCHI.config.scales.radius, KIMCHI.config.sphereSegments, KIMCHI.config.sphereSegments),
        new THREE.MeshBasicMaterial({ // not Lambert since sunlight is in the center of the sun
          'map': new THREE.ImageUtils.loadTexture('images/textures/sun.jpg')
        })
      )
    },
    {
      'name': 'LOLWTF',
      'radiusInKm': 696000,
      'position': new THREE.Vector3(5, 5, 0),
      'visibleDistance': 1000000,
      'mesh': (function () {
        jsonLoader.load('js/testconvert.json', function (geometry, materials) {
//          data[1].mesh = new THREE.Mesh(geometry, materials);
        });
      }())
    },
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



  /**
   * Class for astronomical bodies. All spheres for now.
   * @param {Object} options Options.
   * <br> name:            Required. Displayed to users.
   * <br> radius:          In km.
   * <br> position:        Vector3 of the body's initial position, in au. Not to
   *                       be confused with Mesh.position, which gives the
   *                       current position.
   * <br> rotation:        Vector3 of the body's initial Euler rotation.
   * <br> visibleDistance: How far away the text mesh remains visible.
   * <br>                  TODO rename to labelMeshDistance or something.
   * <br> mesh:            Optional. If not given, a Mesh is automatically
   *                       generated.
   * <br> move:            Optional. Given an Object3D, perform rotations and
   *                       revolutions.
   * <br> texturePath:     Optional path to the texture image. Defaults to
   *                       'name.jpg'.
   * @constructor Body
   */
  Body = function (options) {
    var length, curve;

    _.assign(this, { // default options
      'name': '',
      'radiusInKm': 0,
      'position': new THREE.Vector3(),
      'rotation': new THREE.Euler(),
      'collideable': true,
      'visibleDistance': 100,
      'move': function () {},
      'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
    }, options);

    // the radius and position are scaled
    this.radius = this.radiusInKm * KIMCHI.config.scales.radius;
    this.position.multiplyScalar(KIMCHI.config.scales.position);

    // create a Mesh for the body; it can already be set in data
    if (typeof this.mesh !== 'object') { 
      this.mesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius, KIMCHI.config.sphereSegments, KIMCHI.config.sphereSegments),
        new THREE.MeshLambertMaterial({
          'map': new THREE.ImageUtils.loadTexture(this.texturePath)
        })
      );
    }

    // store the name in the Mesh, so in situations where we are given the Mesh
    // only, the Body can be identified using space.getBody()
    this.mesh.name = this.name;

    // set the Mesh position and rotation
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);

    // create a Curve for the orbit, which can be used to create a Line
    length = this.position.length();
    curve = new THREE.EllipseCurve(0, 0, 2 * length, length, 0, 2 * Math.PI, true);
    this.line = curve.createLine({
      'color': KIMCHI.config.orbits.color,
      'opacity': KIMCHI.config.orbits.opacity,
      'lineSegments': KIMCHI.config.orbits.lineSegments,
    });

    /***
     * Create a Mesh for the text label. We could do
     *   this.mesh.add(this.labelMesh);
     * but then the text Mesh rotates with the body and it is nontrivial to
     * rotate it back.
     */
    this.labelMesh = new THREE.Mesh(
      new THREE.TextGeometry(this.name, {
        'size': 10,
        'height': 0.1,
        'curveSegments': 10,
        'font': 'helvetiker',
        'bevelEnabled': true,
        'bevelThickness': 0.5,
        'bevelSize': 0.5
      }),
      new THREE.MeshBasicMaterial({
        'color': 0xeeeeff
      })
    );
  };

  /**
   * Bodies do not move by default; this function is to be overwritten by Body
   *   instances.
   * @param    {Number} delta
   * @memberOf Body
   */
  Body.prototype.move = function () {};
  /**
   * @returns {Number} The collision distance between the camera and this Body.
   * @memberOf Body
   */
  Body.prototype.getCollisionDistance = function () {
    return this.radius;
  };



  /**
   * Contains instances of Body.
   * @memberOf module:KIMCHI.space
   * @private
   */
  bodies = {};

  /**
   * Populate the private bodies object.
   * @memberOf module:KIMCHI.space
   */
  space.init = function () {
    _.forEach(data, function (options) {
      bodies[options.name] = new Body(options);
    });
  };

  /**
   * @returns  {Object} Bodies.
   * @memberOf module:KIMCHI.space
   */
  space.getBodies = function () {
    return bodies;
  };
  /**
   * TODO check bodies[name] actually exists
   * @param    {String} name
   * @returns  {Body}
   * @memberOf module:KIMCHI.space
   */
  space.getBody = function (name) {
    return bodies[name];
  };

  /**
   * @returns {Array} Object3Ds from the Bodies. Note that each Body may have
   *   more than one Object3D, e.g. for orbit lines and text labels.
   * @memberOf module:KIMCHI.space
   */
  space.getObject3Ds = function () {
    var object3Ds = [];
    _.forEach(bodies, function (body) {
      object3Ds.push(body.mesh, body.line, body.labelMesh);
    });
    return object3Ds;
  };

  /**
   * @returns  {Array} Object3Ds of Bodies set to be collideable with the
   *   camera.
   * @memberOf module:KIMCHI.space
   */
  space.getCollideableObject3Ds = function () {
    return _.pluck(_.filter(bodies, 'collideable'), 'mesh');
  };
  /**
   * @returns {Object} Bodies with names as keys.
   * @memberOf module:KIMCHI.space
   */
  space.getCollideableBodies = function () {
    // _.filter(bodies, 'collideable') returns an Array, not an Object with keys
    var collideableBodies = {};
    _.forEach(bodies, function (body, name) {
      if (body.collideable) {
        collideableBodies[name] = body;
      }
    });
    return collideableBodies;
  };



  /**
   * Move the Bodies. TODO use delta
   * @memberOf module:KIMCHI.space
   */
  space.moveBodies = function (delta) {
    _.forEach(bodies, function (body) {
      // move the body mesh (custom function)
      body.move(delta);

      space.moveBodyChildren(delta);
    });
  };

  /**
   * Without moving the Body Meshes themselves, update the visibility,
   *   position, and size of all Object3Ds associated with the Bodies (such as
   *   text label Meshes). This function should be called whenever the camera
   *   moves. TODO use delta
   * @memberOf module:KIMCHI.space
   */
  space.moveBodyChildren = function (delta) {
    _.forEach(bodies, function (body) {
      var distance, scale;

      distance = THREE.Object3D.distance(KIMCHI.camera, body.mesh);

      // move the text mesh
      if (distance > body.visibleDistance) {
        body.labelMesh.visible = false;
      } else {
        body.labelMesh.visible = true;

        scale = distance / 1000;
        body.labelMesh.scale.set(scale, scale, scale);

        // the text mesh always face the camera
        body.labelMesh.quaternion.copy(KIMCHI.camera.quaternion.clone());

        // move it in front of the associated mesh so it's not hidden inside
        body.labelMesh.geometry.computeBoundingSphere();
        var v = KIMCHI.camera.position.clone().sub(body.mesh.position)
          .normalize().multiplyScalar(body.radius + 0.01);
        var w = body.mesh.position.clone().add(v);
/*        var x = body.mesh.position.clone().cross(v).cross(v)
          .normalize().multiplyScalar(
            body.labelMesh.geometry.boundingSphere.radius / 100
          );*/
        body.labelMesh.position.copy(w);//.add(x);
      }
    });
  };



  /**
   * @param    {Object} bodies
   * @returns  {Array}  Objects with keys 'name' and 'distance', with the latter
   *   being the distance between the camera and the Body.
   * @memberOf module:KIMCHI.space
   */
  space.getDistances = function (bodies) {
    if (typeof bodies === 'undefined') {
      bodies = KIMCHI.space.getBodies();
    }

    return _.map(bodies, function (body, name) {
      return {
        'name': name,
        'distance': THREE.Object3D.distance(KIMCHI.camera, body.mesh)
      };
    });
/*    return _.forEach(bodies, function (body, name) {
      distances[name] = THREE.Object3D.distance(KIMCHI.camera, body.mesh);
    });*/
  };
  /**
   * @param    {Object} bodies
   * @returns  {Array} Objects with keys 'name' and 'distance', with the latter
   *   being the distance between the camera and the Body. Sorted ascending.
   * @memberOf module:KIMCHI.space
   */
  space.getSortedDistances = function (bodies) {
    return space.getDistances(bodies).sort(function (body1, body2) {
      return body1.distance - body2.distance;
    });
  };
  /**
   * @param   {Object} bodies
   * @returns {Number} The distance to the closest Body Mesh.
   * @memberOf module:KIMCHI.space
   */
  space.getClosestDistance = function (bodies) {
    return KIMCHI.space.getSortedDistances(bodies)[0].distance;
  };



  return KIMCHI;
}(KIMCHI || {}, _, $, THREE));