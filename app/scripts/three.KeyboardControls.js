/**
 * Partly based on the three.js example {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}. This class
 *   handles the keyboard controls only. <br> For the pointer lock flight
 *   mode, see {@link
 *   module:KIMCHI.flight.modes.pointerLock|KIMCHI.flight.modes.pointerLock}.
 *   <br> For the pointer lock API handler, see {@link
 *   module:KIMCHI.pointerLock|KIMCHI.pointerLock}.
 * @author      mrdoob / http://mrdoob.com/
 * @author      Chris
 * @constructor KeyboardControls
 * @memberOf    external:THREE
 */
(function (_, THREE) {
  'use strict';

  var KeyboardControls = function (camera, options) {
    var self, setStatesByKey;

    self = this;

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

    // helper for keydown and keyup
    setStatesByKey = function (which, on) {
      switch (which) {
      case 38: // up
      case 87: // W
        this.states.moveForward = on;
        break;
      case 40: // down
      case 83: // S
        this.states.moveBackward = on;
        break;
      case 37: // left
      case 65: // A
        this.states.moveLeft = on;
        break;
      case 39: // right
      case 68: // D
        this.states.moveRight = on;
        break;
      case 82: // R
        this.states.moveUp = on;
        break;
      case 70: // F
        this.states.moveDown = on;
        break;
      case 81: // Q
        this.states.rollLeft = on;
        break;
      case 69: // E
        this.states.rollRight = on;
        break;
      }
    };

    this.events.keydown = function (event) {
      setStatesByKey.call(self, event.which, true);
    };

    this.events.keyup = function (event) {
      setStatesByKey.call(self, event.which, false);
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
     * All translation and roll states are stored as booleans.
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
   * Move the camera, unless the callback returns false.
   * @param    {Function} [callback] If given, the callback must return a
   *   boolean to determine whether the move should occur.
   * @alias    move
   * @instance
   * @function
   * @memberOf external:THREE.KeyboardControls
   */
  KeyboardControls.prototype.move = (function () {
    var getNextMovement, getTranslationVector, getRotationAngles,
      translationVector, rotationAngles, translationDirection;

    /**
     * Helper function in move().
     * @returns  {THREE.Vector3}
     * @private
     * @instance
     * @memberOf external:THREE.KeyboardControls
     */
    getTranslationVector = function () {
      var vector = new THREE.Vector3();

      if (this.states.moveForward) {
        vector.z -= this.options.zSpeed;
      }
      if (this.states.moveBackward) {
        vector.z += this.options.zSpeed;
      }
      if (this.states.moveLeft) {
        vector.x -= this.options.strafeSpeed;
      }
      if (this.states.moveRight) {
        vector.x += this.options.strafeSpeed;
      }
      if (this.states.moveUp) {
        vector.y += this.options.strafeSpeed;
      }
      if (this.states.moveDown) {
        vector.y -= this.options.strafeSpeed;
      }

      return vector;
    };

    /**
     * Helper function in move().
     * @returns  {Object}
     * @private
     * @instance
     * @memberOf external:THREE.KeyboardControls
     */
    getRotationAngles = function () {
      var angles = {};

      angles.x = 0;
      angles.y = 0;

      angles.z = 0;
      if (this.states.rollLeft) {
        angles.z -= this.options.rollSpeed;
      }
      if (this.states.rollRight) {
        angles.z += this.options.rollSpeed;
      }

      return angles;
    };

    /**
     * Helper function in move(). Get the translation vector and rotation
     *   angles for the camera, were it to move right now based on the current
     *   state. The values are local to the camera. The returned object is
     *   passed into the optional callback given to move().
     * @returns  {Object}        movement
     * @returns  {THREE.Vector3} movement.translationVector
     * @returns  {Object}        movement.rotationAngles
     * @returns  {Number}        movement.rotationAngles.x
     * @returns  {Number}        movement.rotationAngles.y
     * @returns  {Number}        movement.rotationAngles.z
     * @private
     * @instance
     * @memberOf external:THREE.KeyboardControls
     */
    getNextMovement = function () {
      // get translation vector
      translationVector = getTranslationVector.call(this);

      // get rotation angles
      rotationAngles = getRotationAngles.call(this);

      return {
        'translationVector': translationVector,
        'rotationAngles': rotationAngles
      };
    };

    translationDirection = new THREE.Vector3();

    return function (callback) {
      var movement, move, translationDistance;

      movement = getNextMovement.call(this);
      move = true;

      // callback
      if (typeof callback === 'function') {
        move = callback(movement);
      }

      // move
      if (move) {
        // translate
        translationDistance = movement.translationVector.length();
        translationDirection.copy(movement.translationVector).normalize();
        this.camera.translateOnAxis(translationDirection, translationDistance);

        // rotate; TODO: consider a composition of the three rotations, like for
        // translation
        this.camera.rotateX(movement.rotationAngles.x);
        this.camera.rotateY(movement.rotationAngles.y);
        this.camera.rotateZ(movement.rotationAngles.z);
      }
    };
  }());



  THREE.KeyboardControls = KeyboardControls;
}(_, THREE));
