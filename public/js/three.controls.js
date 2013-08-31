/**
 * Based on PointerLockControls.js. Requires THREE.unitVectors, as defined in
 *   three.extensions.js.
 * @author      mrdoob / http://mrdoob.com/ Edited by Chris.
 * @constructor THREE.Controls
 * @memberOf    THREE
 */
(function (_, THREE) {
  'use strict';

  THREE.Controls = function (camera, options) {
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
          case 38: case 87: self.states.moveForward = true; break; // up, W
          case 40: case 83: self.states.moveBackward = true; break; // down, S
          case 37: case 65: self.states.moveLeft = true; break; // left, A
          case 39: case 68: self.states.moveRight = true; break; // right, D
          case 82: self.states.moveUp = true; break; // R
          case 70: self.states.moveDown = true; break; // F
          case 81: self.states.rollLeft = true; break; // Q
          case 69: self.states.rollRight = true; break; // E
        }
      },
      'keyup': function (event) {
        switch (event.which) {
          case 38: case 87: self.states.moveForward = false; break; // up, W
          case 40: case 83: self.states.moveBackward = false; break; // down, S
          case 37: case 65: self.states.moveLeft = false; break; // left, A
          case 39: case 68: self.states.moveRight = false; break; // right, D
          case 82: self.states.moveUp = false; break; // R
          case 70: self.states.moveDown = false; break; // F
          case 81: self.states.rollLeft = false; break; // Q
          case 69: self.states.rollRight = false; break; // E
        }
      }
    };
  };



  /**
   * Reset all movement states to false.
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.resetStates = function () {
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
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.enabled = false;

  /**
   * Enable the controls.
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.enable = function () {
    // can't use jQuery for this.events.mousemove, because we need the
    // properties event.movementX and event.movementY
    document.addEventListener('mousemove', this.events.mousemove, false);
    document.addEventListener('keydown', this.events.keydown, false);
    document.addEventListener('keyup', this.events.keyup, false);

    this.enabled = true;
  };

  /**
   * Disable the controls.
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.disable = function () {
    this.resetStates();

    document.removeEventListener('mousemove', this.events.mousemove, false);
    document.removeEventListener('keydown', this.events.keydown, false);
    document.removeEventListener('keyup', this.events.keyup, false);

    this.enabled = false;
  };



  /**
   * Move the camera based on the current states.
   * @param    {Number} speedMultiplier            Delta which applies to all
   *   movements (both translations and rotations).
   * @param    {Number} translationSpeedMultiplier Additional multiplier which
   *   applies only to translations.
   * @function
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.moveCamera = (function () {
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
   *                           movement direction(s).
   * @function
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.getLocalTranslationVector = (function () {
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
   * @memberOf THREE.Controls
   */
  THREE.Controls.prototype.getWorldTranslationVector = function () {
    return this.camera.localToWorld(this.getLocalTranslationVector());
  };
}(_, THREE));