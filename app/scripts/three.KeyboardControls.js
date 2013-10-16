/**
 * Keyboard controls. Mouse controls are handled in separate classes. Based on
 *   the three.js example {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}.
 * @author      mrdoob / http://mrdoob.com/
 * @author      Chris
 * @constructor KeyboardControls
 * @memberOf    external:THREE
 */
(function (_, THREE) {
  'use strict';

  var KeyboardControls = function (camera, options) {
    var self = this;

    this.camera = camera;
    this.options = _.assign({
      'zSpeed': 500,
      'strafeSpeed': 500,
      'rollSpeed': 2
    }, options);
    this.resetStates();

    /**
     * Event handlers. Not in the propotype because they need to reference self.
     * @alias    events
     * @instance
     * @memberOf external:THREE.KeyboardControls
     */
    this.events = {};

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
   * @alias    resetStates
   * @instance
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.resetStates = function () {
    /**
     * All translation and roll states are stored as booleans to indicate
     *   whether each state is currently active.
     * @alias    states
     * @instance
     * @memberOf external:THREE.KeyboardControls
     */
    this.states = {
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
   * @alias    enabled
   * @instance
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.enabled = false;

  /**
   * Enable the controls.
   * @alias    enable
   * @instance
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.enable = function () {
    document.addEventListener('keydown', this.events.keydown, false);
    document.addEventListener('keyup', this.events.keyup, false);

    this.enabled = true;
  };

  /**
   * Disable the controls.
   * @alias    disable
   * @instance
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.disable = function () {
    this.enabled = false;

    document.removeEventListener('keydown', this.events.keydown, false);
    document.removeEventListener('keyup', this.events.keyup, false);

    this.resetStates();
  };



  /**
   * Get the translation vector for the camera, were it to move right now
   *   based on the current state. The values are local to the camera.
   * @param    {Number} [multiplier=1]
   * @returns  {THREE.Vector3}
   * @alias    getCameraMovement
   * @instance
   * @function
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.getCameraTranslationVector = (function () {
    var vector = new THREE.Vector3();

    return function (multiplier) {
      if (typeof multiplier === 'undefined') {
        multiplier = 1;
      }

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

  /**
   * Get the rotation angles for the camera, were it to move right now based
   *   on the current state. The values are local to the camera. For these
   *   controls, there is only one angle, about the z-axis.
   * @param    {Number} [multiplier=1]
   * @returns  {Object} rotationAngles
   * @returns  {Number} rotationAngles.z
   * @alias    getCameraMovement
   * @instance
   * @function
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.getCameraRotationAngles = (function () {
    var angles = {};

    return function (multiplier) {
      if (typeof multiplier === 'undefined') {
        multiplier = 1;
      }

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

  /**
   * Move the camera. It is all or nothing: Either all current translations
   *   and rotations take place, or none do.
   * @param    {Object}   [translationVector] As returned by
   *   getCameraTranslationVector().
   * @param    {Object}   [rotationAngles]    As returned by
   *   getCameraRotationAngles().
   * @alias    moveCamera
   * @instance
   * @function
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.moveCamera = (function () {
    var translationDirection = new THREE.Vector3(), translationDistance;

    return function (translationVector, rotationAngles) {
      if (typeof translationVector === 'undefined') {
        translationVector = this.getCameraTranslationVector();
      }
      if (typeof rotationAngles === 'undefined') {
        rotationAngles = this.getCameraRotationAngles();
      }

      // translate
      translationDistance = translationVector.length();
      translationDirection.copy(translationVector).normalize();
      this.camera.translateOnAxis(translationDirection, translationDistance);

      // rotate
      this.camera.rotateZ(rotationAngles.z);
    };
  }());



  THREE.KeyboardControls = KeyboardControls;
}(_, THREE));