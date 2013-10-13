/**
 * Based on {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}. Requires
 *   THREE.unitVectors, as defined in three.extensions.js.
 * @author      mrdoob / http://mrdoob.com/ Edited by Chris.
 * @constructor Controls
 * @memberOf    THREE
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
     * @memberOf THREE.PointerLockControls
     */
    this.events = {};

    this.events.mousemove = function (event) {
      var movementX, movementY;

      movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      self.states.rotateAngleX = -movementY * self.options.lookSpeed;
      self.states.rotateAngleY = -movementX * self.options.lookSpeed;

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
   * Reset all movement states.
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.resetStates = function () {
    /**
     * All translation and roll states are stored as booleans. The mousemove movement are stored as numbers
     * @memberOf THREE.PointerLockControls
     */
    this.states = {
      'rotateAngleX': 0,
      'rotateAngleY': 0,
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
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.enabled = false;

  /**
   * Enable the controls.
   * @memberOf THREE.PointerLockControls
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
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.disable = function () {
    this.enabled = false;

    document.removeEventListener('mousemove', this.events.mousemove, false);
    document.removeEventListener('keydown', this.events.keydown, false);
    document.removeEventListener('keyup', this.events.keyup, false);

    this.resetStates();
  };



  /**
   * Move the camera based on the current states.
   * @param    {Number} speedMultiplier            Delta which applies to all
   *   movements, i.e. both translations and rotations.
   * @param    {Number} translationSpeedMultiplier Additional multiplier which
   *   applies only to translations.
   * @returns  {Boolean}                           Whether the camera moves.
   * @function
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.moveCamera = (function () {
    var translationVector, camera, options, rotateAngleZ, moving;
    translationVector = new THREE.Vector3();

    return function (speedMultiplier, translationSpeedMultiplier) {
      translationVector.set(0, 0, 0);
      camera = this.camera;
      options = this.options;
      rotateAngleZ = 0;
      moving = false;

      // translate
      translationVector = this.getLocalTranslationVector();
      if (translationVector.length() > 0) {
        camera.translateX(translationVector.x * options.strafeSpeed *
          speedMultiplier * translationSpeedMultiplier);
        camera.translateY(translationVector.y * options.strafeSpeed *
          speedMultiplier * translationSpeedMultiplier);
        camera.translateZ(translationVector.z * options.zSpeed *
          speedMultiplier * translationSpeedMultiplier);
        moving = true;
      }

      // rotate about the z-axis
      if (this.states.rollLeft) {
        rotateAngleZ -= options.rollSpeed * speedMultiplier;
      }
      if (this.states.rollRight) {
        rotateAngleZ += options.rollSpeed * speedMultiplier;
      }
      if (rotateAngleZ !== 0) {
        camera.rotateOnAxis(THREE.unitVectors.z, rotateAngleZ);
        moving = true;
      }

      // Rotate about the x- and y-axes. Mousemove angles get reset immediately
      // after rotation, unlike the other states.
      if (this.states.rotateAngleX !== 0) {
        camera.rotateOnAxis(THREE.unitVectors.x, this.states.rotateAngleX);
        this.states.rotateAngleX = 0;
        moving = true;
      }
      if (this.states.rotateAngleY !== 0) {
        camera.rotateOnAxis(THREE.unitVectors.y, this.states.rotateAngleY);
        this.states.rotateAngleY = 0;
        moving = true;
      }

      return moving;
    };
  }());



  /**
   * To check whether the camera is currently moving, check
   *   .getTranslationVector().length() > 0.
   * @returns  {THREE.Vector3} A vector corresponding to the current local
   *   movement direction(s).
   * @function
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.getLocalTranslationVector = (function () {
    var vector = new THREE.Vector3();

    return function () {
      vector.set(0, 0, 0);

      if (this.states.moveForward) {
        vector.add(THREE.unitVectors.negZ);
      }
      if (this.states.moveBackward) {
        vector.add(THREE.unitVectors.z);
      }
      if (this.states.moveLeft) {
        vector.add(THREE.unitVectors.negX);
      }
      if (this.states.moveRight) {
        vector.add(THREE.unitVectors.x);
      }
      if (this.states.moveUp) {
        vector.add(THREE.unitVectors.y);
      }
      if (this.states.moveDown) {
        vector.add(THREE.unitVectors.negY);
      }

      return vector;
    };
  }());

  /**
   * TODO: Not used, can delete.
   * @returns  {THREE.Vector3}
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.getWorldTranslationVector = function () {
    return this.camera.localToWorld(this.getLocalTranslationVector());
  };

  THREE.PointerLockControls = PointerLockControls;
}(_, THREE));