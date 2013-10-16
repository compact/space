/**
 * Based on the three.js example {@link
 *   http://threejs.org/examples/misc_controls_pointerlock.html}. This class
 *   handles the mouse controls while pointer lock is enabled in the browser.
 *   <br> For the pointer lock flight mode, see {@link
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
    var self = this;

    this.camera = camera;
    this.options = _.assign({
      'lookSpeed': 0.00025,
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
     * The base yaw and pitch angles are stored as numbers from
     *   event.movementX and event.movementY.
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
   * Get the rotation angles for the camera, were it to move right now based
   *   on the current state. The values are local to the camera. For these
   *   controls, there are only two angles, about the x- and y-axes.
   * @param    {Number} [multiplier=1]
   * @returns  {Object} rotationAngles
   * @returns  {Number} rotationAngles.x
   * @returns  {Number} rotationAngles.y
   * @alias    getCameraMovement
   * @instance
   * @function
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.getCameraRotationAngles = (function () {
    var angles = {};

    return function (multiplier) {
      if (typeof multiplier === 'undefined') {
        multiplier = 1;
      }

      angles.x = this.states.baseRotationAngleX * this.options.lookSpeed *
        multiplier;
      angles.y = this.states.baseRotationAngleY * this.options.lookSpeed *
        multiplier;

      // mousemove angles get reset immediately, unlike the other states
      this.states.baseRotationAngleX = 0;
      this.states.baseRotationAngleY = 0;

      return angles;
    };
  }());

  /**
   * Move the camera.
   * @param    {Object}   [rotationAngles] As returned by
   *   getCameraRotationAngles().
   * @alias    moveCamera
   * @instance
   * @function
   * @memberOf external:THREE.PointerLockControls
   */
  PointerLockControls.prototype.moveCamera = function (rotationAngles) {
    if (typeof rotationAngles === 'undefined') {
      rotationAngles = this.getCameraRotationAngles();
    }

    // rotate; TODO: consider a composition of the three rotations, like for
    // translation
    this.camera.rotateX(rotationAngles.x);
    this.camera.rotateY(rotationAngles.y);
  };



  THREE.PointerLockControls = PointerLockControls;
}(_, THREE));