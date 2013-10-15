/**
 * Based on {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}. Requires
 *   THREE.unitVectors, as defined in three.extensions.js.
 * @author      mrdoob / http://mrdoob.com/
 * @author      Chris
 * @constructor PointerLockControls
 * @memberOf    external:THREE
 */
(function (_, THREE) {
  'use strict';

  var PointerLockControls = function (camera, options) {
    var self = this;

    this.camera = camera;
    this.options = _.assign({
      'lookSpeed': 0.00025,
      'zSpeed': 500,
      'strafeSpeed': 500,
      'rollSpeed': 2
    }, options);
    this.resetStates();

    /**
     * Event handlers. Not in the propotype because they need to reference self.
     * @memberOf external:THREE.PointerLockControls
     */
    this.events = {};

    this.events.mousemove = function (event) {
      var movementX, movementY;

      movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      self.states.baseRotationAngleX = -movementY;
      self.states.baseRotationAngleY = -movementX;

      // self.camera.rotateOnAxis(THREE.unitVectors.x, -movementY * self.options.lookSpeed);
      // self.camera.rotateOnAxis(THREE.unitVectors.y, -movementX * self.options.lookSpeed);
    };

    this.events.keydown = function (event) {
      switch (event.which) {
      case 38: // up
      case 87: // W
        self.states.moveForward = true;
        break;
      case 40: // down
      case 83: // S
        self.states.moveBackward = true;
        break;
      case 37: // left
      case 65: // A
        self.states.moveLeft = true;
        break;
      case 39: // right
      case 68: // D
        self.states.moveRight = true;
        break;
      case 82: // R
        self.states.moveUp = true;
        break;
      case 70: // F
        self.states.moveDown = true;
        break;
      case 81: // Q
        self.states.rollLeft = true;
        break;
      case 69: // E
        self.states.rollRight = true;
        break;
      }
    };

    this.events.keyup = function (event) {
      switch (event.which) {
      case 38: // up
      case 87: // W
        self.states.moveForward = false;
        break;
      case 40: // down
      case 83: // S
        self.states.moveBackward = false;
        break;
      case 37: // left
      case 65: // A
        self.states.moveLeft = false;
        break;
      case 39: // right
      case 68: // D
        self.states.moveRight = false;
        break;
      case 82: // R
        self.states.moveUp = false;
        break;
      case 70: // F
        self.states.moveDown = false;
        break;
      case 81: // Q
        self.states.rollLeft = false;
        break;
      case 69: // E
        self.states.rollRight = false;
        break;
      }
    };
  };



  /**
   * Reset all movement states; stop all camera movement. To disable the
   *   controls, call disable() instead—it calls this function.
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.resetStates = function () {
    /**
     * All translation and roll states are stored as booleans. The yaw and
     *   pitch angles, based on mousemove, are stored as numbers.
     * @memberOf external:THREE.PointerLockControls
     */
    this.states = {
      'baseRotationAngleX': 0,
      'baseRotationAngleY': 0,
      'moveForward': false,
      'moveBackward': false,
      'moveLeft': false,
      'moveRight': false,
      'moveUp': false,
      'moveDown': false,
      'rollLeft': false,
      'rollRight': false
    };
  };



  /**
   * Whether the controls are currently enabled. Do not set this directly; use
   *   enable() and disable().
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.enabled = false;

  /**
   * Enable the controls.
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.enable = function () {
    // can't use jQuery for this.events.mousemove, because we need the
    // properties event.movementX and event.movementY
    document.addEventListener('mousemove', this.events.mousemove, false);
    document.addEventListener('keydown', this.events.keydown, false);
    document.addEventListener('keyup', this.events.keyup, false);

    this.enabled = true;
  };

  /**
   * Disable the controls.
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.disable = function () {
    this.enabled = false;

    document.removeEventListener('mousemove', this.events.mousemove, false);
    document.removeEventListener('keydown', this.events.keydown, false);
    document.removeEventListener('keyup', this.events.keyup, false);

    this.resetStates();
  };



  /**
   * Get the translation vector and rotation angles for the camera, were it to
   *   move right now based on the current state. The values are local to the
   *   camera.
   * @param    {Number} [translationSpeedMultiplier=1]
   * @param    {Number} [rotationSpeedMultiplier=1]
   * @returns  {Object} movement
   * @returns  {THREE.Vector3} movement.translationVector
   * @returns  {Object} movement.rotationAngles
   * @returns  {Number} movement.rotationAngles.x
   * @returns  {Number} movement.rotationAngles.y
   * @returns  {Number} movement.rotationAngles.z
   * @function
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.getCameraMovement = (function () {
    var getTranslationVector, translationVector, getRotationAngles,
      rotationAngles;

    getTranslationVector = (function () {
      var vector = new THREE.Vector3();

      return function (multiplier) {
        vector.set(0, 0, 0);

        if (this.states.moveForward) {
          vector.z -= this.options.zSpeed * multiplier;
        }
        if (this.states.moveBackward) {
          vector.z += this.options.zSpeed * multiplier;
        }
        if (this.states.moveLeft) {
          vector.x -= this.options.strafeSpeed * multiplier;
        }
        if (this.states.moveRight) {
          vector.x += this.options.strafeSpeed * multiplier;
        }
        if (this.states.moveUp) {
          vector.y += this.options.strafeSpeed * multiplier;
        }
        if (this.states.moveDown) {
          vector.y -= this.options.strafeSpeed * multiplier;
        }

        return vector;
      };
    }());

    getRotationAngles = (function () {
      var angles = {};

      return function (multiplier) {
        angles.x = this.states.baseRotationAngleX * this.options.lookSpeed *
          multiplier;

        angles.y = this.states.baseRotationAngleY * this.options.lookSpeed *
          multiplier;

        angles.z = 0;
        if (this.states.rollLeft) {
          angles.z -= this.options.rollSpeed * multiplier;
        }
        if (this.states.rollRight) {
          angles.z += this.options.rollSpeed * multiplier;
        }

        return angles;
      };
    }());

    return function (translationSpeedMultiplier, rotationSpeedMultiplier) {
      if (typeof translationSpeedMultiplier === 'undefined') {
        translationSpeedMultiplier = 1;
      }
      if (typeof rotationSpeedMultiplier === 'undefined') {
        rotationSpeedMultiplier = 1;
      }

      // get translation vector
      translationVector = getTranslationVector.call(this,
        translationSpeedMultiplier);

      // get rotation angles
      rotationAngles = getRotationAngles.call(this, rotationSpeedMultiplier);

      // mousemove angles get reset immediately, unlike the other states
      this.states.baseRotationAngleX = 0;
      this.states.baseRotationAngleY = 0;

      return {
        'translationVector': translationVector,
        'rotationAngles': rotationAngles
      };
    };
  }());

  /**
   * Move the camera.
   * @param    {Object} [movement] Object in the form returned by
   *   getCameraMovement().
   * @function
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.moveCamera = (function () {
    var translationDirection = new THREE.Vector3(), translationDistance;

    return function (movement) {
      if (typeof movement === 'undefined') {
        movement = this.getCameraMovement();
      }

      // translate
      translationDistance = movement.translationVector.length();
      translationDirection.copy(movement.translationVector).normalize();
      this.camera.translateOnAxis(translationDirection, translationDistance);

      // rotate
      // TODO: consider a composition of the three rotations, like for translation
      this.camera.rotateX(movement.rotationAngles.x);
      this.camera.rotateY(movement.rotationAngles.y);
      this.camera.rotateZ(movement.rotationAngles.z);
    };
  }());



  THREE.PointerLockControls = PointerLockControls;
}(_, THREE));