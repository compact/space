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

    // event handlers
    // not in the propotype because they need to reference self
    this.events = {
      'mousemove': function (event) {
        var movementX, movementY;

        // extra check that we are allowed to move
/*        if (!self.enabled) {
          return;
        }
*/
        movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // TODO perform the rotation in update() instead of here -Chris
        self.camera.rotateOnAxis(THREE.unitVectors.x, -movementY * self.options.lookSpeed);
        self.camera.rotateOnAxis(THREE.unitVectors.y, -movementX * self.options.lookSpeed);
      },
      'keydown': function (event) {
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
      },
      'keyup': function (event) {
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
      }
    };
  };



  /**
   * Reset all movement states to false.
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.resetStates = function () {
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
   * Whether the controls are currently enabled.
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
   *   movements (both translations and rotations).
   * @param    {Number} translationSpeedMultiplier Additional multiplier which
   *   applies only to translations.
   * @function
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.moveCamera = (function () {
    var translationVector = new THREE.Vector3(), angle, camera, options;

    return function (speedMultiplier, translationSpeedMultiplier) {
      translationVector.set(0, 0, 0);
      angle = 0;
      camera = this.camera;
      options = this.options;

      if (!this.enabled) {
        return;
      }

      // translate
      translationVector = this.getLocalTranslationVector();
      camera.translateX(translationVector.x * options.strafeSpeed *
        speedMultiplier * translationSpeedMultiplier);
      camera.translateY(translationVector.y * options.strafeSpeed *
        speedMultiplier * translationSpeedMultiplier);
      camera.translateZ(translationVector.z * options.zSpeed *
        speedMultiplier * translationSpeedMultiplier);

      // rotate
      if (this.states.rollLeft) {
        angle -= options.rollSpeed * speedMultiplier;
      }
      if (this.states.rollRight) {
        angle += options.rollSpeed * speedMultiplier;
      }
      camera.rotateOnAxis(THREE.unitVectors.z, angle);
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

      if (!this.enabled) {
        return vector;
      }

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
   * Not used; can delete.
   * @returns  {THREE.Vector3}
   * @memberOf THREE.PointerLockControls
   */
  PointerLockControls.prototype.getWorldTranslationVector = function () {
    return this.camera.localToWorld(this.getLocalTranslationVector());
  };

  THREE.PointerLockControls = PointerLockControls;
}(_, THREE));