/**
 * Based on the three.js example {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}. This class
 *   handles the controls only. <br> For the pointer lock flight mode, see
 *   {@link
 *   module:KIMCHI.flight.modes.pointerLock|KIMCHI.flight.modes.pointerLock}.
 *   <br> For the pointer lock API handler, see {@link
 *   module:KIMCHI.pointerLock|KIMCHI.pointerLock}.
 * @author      mrdoob / http://mrdoob.com/
 * @author      Chris
 * @constructor PointerLockControls
 * @memberOf    external:THREE
 */
(function (_, THREE) {
  'use strict';

  var PointerLockControls = function (camera, options) {
    var self;

    self = this;

    this.camera = camera;
    this.options = _.assign({
      'lookSpeed': 0.00025
    }, options);
    this.resetStates();

    /**
     * Event handlers. Not in the propotype because they need to reference self.
     * @alias    events
     * @instance
     * @memberOf external:THREE.PointerLockControls
     */
    this.events = {};

    this.events.mousemove = function (event) {
      var movementX, movementY;

      movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      self.states.baseRotationAngleX = -movementY;
      self.states.baseRotationAngleY = -movementX;
    };
  };



  /**
   * Reset all movement states; stop all camera movement. To disable the
   *   controls, call disable() instead—it calls this function.
   * @alias    resetStates
   * @instance
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.resetStates = function () {
    /**
     * The yaw and pitch angles, based on mousemove, are stored as numbers.
     * @alias    states
     * @instance
     * @memberOf external:THREE.PointerLockControls
     */
    this.states = {
      'baseRotationAngleX': 0,
      'baseRotationAngleY': 0
    };
  };



  /**
   * Whether the controls are currently enabled. Do not set this directly; use
   *   enable() and disable().
   * @alias    enabled
   * @instance
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.enabled = false;

  /**
   * Enable the controls.
   * @alias    enable
   * @instance
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.enable = function () {
    // can't use jQuery for this.events.mousemove, because we need the
    // properties event.movementX and event.movementY
    document.addEventListener('mousemove', this.events.mousemove, false);

    this.enabled = true;
  };

  /**
   * Disable the controls.
   * @alias    disable
   * @instance
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.disable = function () {
    this.enabled = false;

    document.removeEventListener('mousemove', this.events.mousemove, false);

    this.resetStates();
  };



  /**
   * Move the camera, unless the callback returns false.
   * @param    {Function} [callback] If given, the callback must return a
   *   boolean to determine whether the move should occur.
   * @alias    move
   * @instance
   * @function
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.move = (function () {
    var getNextMovement, getRotationAngles, rotationAngles;

    /**
     * Helper function in move().
     * @returns  {Object}
     * @private
     * @instance
     * @memberOf external:THREE.PointerLockControls
     */
    getRotationAngles = function () {
      var angles = {};

      angles.x = this.states.baseRotationAngleX * this.options.lookSpeed;
      angles.y = this.states.baseRotationAngleY * this.options.lookSpeed;
      angles.z = 0;

      return angles;
    };

    /**
     * Helper function in move(). Get the translation vector and rotation
     *   angles for the camera, were it to move right now based on the current
     *   state. The values are local to the camera. The returned object is
     *   passed into the optional callback given to move().
     * @returns  {Object}        movement
     * @returns  {Object}        movement.rotationAngles
     * @returns  {Number}        movement.rotationAngles.x
     * @returns  {Number}        movement.rotationAngles.y
     * @returns  {Number}        movement.rotationAngles.z
     * @private
     * @instance
     * @memberOf external:THREE.PointerLockControls
     */
    getNextMovement = function () {
      // get rotation angles
      rotationAngles = getRotationAngles.call(this);

      // mousemove angles get reset immediately, unlike the other states
      this.states.baseRotationAngleX = 0;
      this.states.baseRotationAngleY = 0;

      return {
        'rotationAngles': rotationAngles
      };
    };

    return function (callback) {
      var movement, move;

      movement = getNextMovement.call(this);
      move = true;

      // callback
      if (typeof callback === 'function') {
        move = callback(movement);
      }

      // move
      if (move) {
        // rotate; TODO: consider a composition of the three rotations, like for
        // translation
        this.camera.rotateX(movement.rotationAngles.x);
        this.camera.rotateY(movement.rotationAngles.y);
        this.camera.rotateZ(movement.rotationAngles.z);
      }
    };
  }());



  THREE.PointerLockControls = PointerLockControls;
}(_, THREE));
