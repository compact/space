/**
 * three.js extensions for KIMCHI.
 * @external    THREE
 */
/**
 * @constructor Object3D
 * @memberOf    external:THREE
 */
/**
 * @constructor PerspectiveCamera
 * @memberOf    external:THREE
 */
/**
 * @constructor Vector3
 * @memberOf    external:THREE
 */
/**
 * @constructor Matrix3
 * @memberOf    external:THREE
 */
/**
 * @constructor Curve
 * @memberOf    external:THREE
 */

(function (_, $, THREE) {
  'use strict';

  /**
   * "Constant" vectors. Take care to not set other variables to these objects
   *   directly lest their coordinates change (e.g. position or rotation). Clone
   *   them instead.
   * @memberOf external:THREE
   */
  THREE.unitVectors = {
    'x': new THREE.Vector3(1, 0, 0),
    'y': new THREE.Vector3(0, 1, 0),
    'z': new THREE.Vector3(0, 0, 1),
    'negX': new THREE.Vector3(-1, 0, 0),
    'negY': new THREE.Vector3(0, -1, 0),
    'negZ': new THREE.Vector3(0, 0, -1)
  };



  /**
   * @param    {THREE.Object3D} object1
   * @param    {THREE.Object3D} object2
   * @return   {Number}         The distance between the two objects.
   * @alias    distance
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.getDistance = function (object1, object2) {
    return object1.position.distanceTo(object2.position);
  };

  /**
   * "Overload" the original function of THREE.Object3D.prototype.add to
   *   accept arrays as well.
   * @param    {THREE.Object3D|Array} param
   *   Either an Object3D or an array of Object3Ds to be added.
   * @alias    add
   * @instance
   * @function
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.prototype.add = (function () {
    var addSingle = THREE.Object3D.prototype.add;
    return function (param) {
      var self = this;

      if (Object.prototype.toString.call(param) === '[object Array]') { // add multiple Object3Ds
        _.each(param, function (object) {
          self.add(object);
        });
      } else { // add a single Object3D
        addSingle.call(self, param);
      }
    };
  }());

  /**
   * Revolve around the given world axis. TODO provide a translation
   *   vector for cases where the world axis doesn't pass through the origin
   * @param    {THREE.Vector3} worldAxis Not local based on the object, but
   *                                     but global in the world.
   * @param    {Number}        angle     In Radians.
   * @alias    orbit
   * @instance
   * @function
   * @memberOf external:THREE.Object3D
   */
  THREE.Object3D.prototype.orbit = (function () {
    var position, sin, cos, x, y, z, rotationMatrix, scalingMatrix;
    rotationMatrix = new THREE.Matrix3();
    scalingMatrix = new THREE.Matrix3();

    return function (worldAxis, angle) {
      sin = Math.sin(angle);
      cos = Math.cos(angle);
      worldAxis = worldAxis.normalize();
      x = worldAxis.x;
      y = worldAxis.y;
      z = worldAxis.z;

      scalingMatrix.set( // TODO
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      );
      rotationMatrix.set( // http://en.wikipedia.org/wiki/Rotation_matrix
        cos + x * x * (1 - cos),
        x * y * (1 - cos) - z * sin,
        x * z * (1 - cos) + y * sin,
        y * x * (1 - cos) + z * sin,
        cos + y * y * (1 - cos),
        y * z * (1 - cos) - x * sin,
        z * x * (1 - cos) - y * sin,
        z * y * (1 - cos) + x * sin,
        cos + z * z * (1 - cos)
      );

      position = this.position.clone();
      position.applyMatrix3(scalingMatrix)
        .applyMatrix3(rotationMatrix)
        .applyMatrix3(scalingMatrix.inverse());
      this.position.copy(position);
    };
  }());



  /**
   * Update the camera given dimensions.
   * @param    {Number} width
   * @param    {Number} height
   * @alias    update
   * @instance
   * @memberOf external:THREE.PerspectiveCamera
   */
  THREE.PerspectiveCamera.prototype.update = function (width, height) {
    this.aspect = width / height;
    this.updateProjectionMatrix();
  };



  /**
   * Set the x, y, and z values of this vector to all be the given value.
   * @param    {Number} value
   * @memberOf external:THREE.Vector3
   */
  THREE.Vector3.prototype.setXYZ = function (value) {
    return this.set(value, value, value);
  };



  /**
   * The original function getInverse() also sets this and requires a Matrix4,
   *   so we write our own function to only return the inverse.
   * @returns  {Matrix3} The inverse matrix.
   * @alias    inverse
   * @instance
   * @function
   * @memberOf external:THREE.Matrix3
   */
  THREE.Matrix3.prototype.inverse = (function () {
    var determinant, e, inverse = new THREE.Matrix3();

    return function () {
      determinant = this.determinant();
      e = this.elements;

      if (determinant === 0) {
        throw new Error('Matrix3.inverse(): Matrix not invertible.');
      }

      inverse.set(
        e[4] * e[8] - e[5] * e[7],
        e[2] * e[7] - e[1] * e[8],
        e[1] * e[5] - e[2] * e[4],
        e[5] * e[6] - e[3] * e[8],
        e[0] * e[8] - e[2] * e[6],
        e[2] * e[3] - e[0] * e[5],
        e[3] * e[7] - e[4] * e[6],
        e[1] * e[6] - e[0] * e[7],
        e[0] * e[4] - e[1] * e[3]
      );

      return inverse.multiplyScalar(1 / determinant);
    };
  }());



  /**
   * For this Curve, create a Line which can be added to a scene.
   *   Based on {@link
   *   http://mrdoob.github.io/three.js/examples/webgl_geometry_shapes.html}
   * @param    {Object}      options
   * <br>      position:     THREE.Vector3.
   * <br>      rotation:     THREE.Euler.
   * <br>      color:        Hexadecimal.
   * <br>      opacity:      Number.
   * <br>      lineSegments: Number of line segments to make up the Line.
   * <br>      scale:        THREE.Vector3.
   * @returns  {THREE.Line}
   * @alias    createLine
   * @instance
   * @memberOf external:THREE.Curve
   */
  THREE.Curve.prototype.createLine = function (options) {
    var curvePath, geometry, line;

    options = _.assign({
      'position': new THREE.Vector3(),
      'rotation': new THREE.Euler(),
      'color': 0x888888,
      'opacity': 1,
      'lineSegments': 360,
      'scale': new THREE.Vector3(1, 1, 1)
    }, options);

    // a CurvePath is needed since it has the createGeometry() functions
    curvePath = new THREE.CurvePath();
    curvePath.add(this);
    geometry = curvePath.createSpacedPointsGeometry(options.lineSegments);

    // create Line
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({
      'color': options.color,
      'transparent': options.opacity < 1,
      'opacity': options.opacity,
      'linewidth': 1
    }));
    line.position.copy(options.position);
    line.rotation.copy(options.rotation);
    line.scale.copy(options.scale);
    return line;
  };
}(_, jQuery, THREE));




/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

  this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

  this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

  this.material = new THREE.ShaderMaterial( {

    uniforms: this.uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader

  } );

  this.renderToScreen = false;

  this.enabled = true;
  this.needsSwap = true;
  this.clear = false;

};

THREE.ShaderPass.prototype = {

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    if ( this.uniforms[ this.textureID ] ) {

      this.uniforms[ this.textureID ].value = readBuffer;

    }

    THREE.EffectComposer.quad.material = this.material;

    if ( this.renderToScreen ) {

      renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

    } else {

      renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, this.clear );

    }

  }

};


/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

  this.scene = scene;
  this.camera = camera;

  this.overrideMaterial = overrideMaterial;

  this.clearColor = clearColor;
  this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

  this.oldClearColor = new THREE.Color();
  this.oldClearAlpha = 1;

  this.enabled = true;
  this.clear = true;
  this.needsSwap = false;

};

THREE.RenderPass.prototype = {

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    this.scene.overrideMaterial = this.overrideMaterial;

    if ( this.clearColor ) {

      this.oldClearColor.copy( renderer.getClearColor() );
      this.oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor( this.clearColor, this.clearAlpha );

    }

    renderer.render( this.scene, this.camera, readBuffer, this.clear );

    if ( this.clearColor ) {

      renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

    }

    this.scene.overrideMaterial = null;

  }

};



/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "h":        { type: "f", value: 1.0 / 512.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float h;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 sum = vec4( 0.0 );",

      "sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
      "sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
      "sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
      "sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
      "sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
      "sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
      "sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
      "sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

      "gl_FragColor = sum;",

    "}"

  ].join("\n")

};



/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "v":        { type: "f", value: 1.0 / 512.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float v;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 sum = vec4( 0.0 );",

      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
      "sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

      "gl_FragColor = sum;",

    "}"

  ].join("\n")

};




/**
 * @author huwb / http://huwbowles.com/
 *
 * God-rays (crepuscular rays)
 *
 * Similar implementation to the one used by Crytek for CryEngine 2 [Sousa2008].
 * Blurs a mask generated from the depth map along radial lines emanating from the light
 * source. The blur repeatedly applies a blur filter of increasing support but constant
 * sample count to produce a blur filter with large support.
 *
 * My implementation performs 3 passes, similar to the implementation from Sousa. I found
 * just 6 samples per pass produced acceptible results. The blur is applied three times,
 * with decreasing filter support. The result is equivalent to a single pass with
 * 6*6*6 = 216 samples.
 *
 * References:
 *
 * Sousa2008 - Crysis Next Gen Effects, GDC2008, http://www.crytek.com/sites/default/files/GDC08_SousaT_CrysisEffects.ppt
 */

THREE.ShaderGodRays = {

  /**
   * The god-ray generation shader.
   *
   * First pass:
   *
   * The input is the depth map. I found that the output from the
   * THREE.MeshDepthMaterial material was directly suitable without
   * requiring any treatment whatsoever.
   *
   * The depth map is blurred along radial lines towards the "sun". The
   * output is written to a temporary render target (I used a 1/4 sized
   * target).
   *
   * Pass two & three:
   *
   * The results of the previous pass are re-blurred, each time with a
   * decreased distance between samples.
   */

  'godrays_generate': {

    uniforms: {

      tInput: {
        type: "t",
        value: null
      },

      fStepSize: {
        type: "f",
        value: 1.0
      },

      vSunPositionScreenSpace: {
        type: "v2",
        value: new THREE.Vector2( 0.5, 0.5 )
      }

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join("\n"),

    fragmentShader: [

      "#define TAPS_PER_PASS 6.0",

      "varying vec2 vUv;",

      "uniform sampler2D tInput;",

      "uniform vec2 vSunPositionScreenSpace;",
      "uniform float fStepSize;", // filter step size

      "void main() {",

        // delta from current pixel to "sun" position

        "vec2 delta = vSunPositionScreenSpace - vUv;",
        "float dist = length( delta );",

        // Step vector (uv space)

        "vec2 stepv = fStepSize * delta / dist;",

        // Number of iterations between pixel and sun

        "float iters = dist/fStepSize;",

        "vec2 uv = vUv.xy;",
        "float col = 0.0;",

        // This breaks ANGLE in Chrome 22
        //  - see http://code.google.com/p/chromium/issues/detail?id=153105

        /*
        // Unrolling didnt do much on my hardware (ATI Mobility Radeon 3450),
        // so i've just left the loop

        "for ( float i = 0.0; i < TAPS_PER_PASS; i += 1.0 ) {",

          // Accumulate samples, making sure we dont walk past the light source.

          // The check for uv.y < 1 would not be necessary with "border" UV wrap
          // mode, with a black border colour. I don't think this is currently
          // exposed by three.js. As a result there might be artifacts when the
          // sun is to the left, right or bottom of screen as these cases are
          // not specifically handled.

          "col += ( i <= iters && uv.y < 1.0 ? texture2D( tInput, uv ).r : 0.0 );",
          "uv += stepv;",

        "}",
        */

        // Unrolling loop manually makes it work in ANGLE

        "if ( 0.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        "if ( 1.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        "if ( 2.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        "if ( 3.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        "if ( 4.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        "if ( 5.0 <= iters && uv.y < 1.0 ) col += texture2D( tInput, uv ).r;",
        "uv += stepv;",

        // Should technically be dividing by 'iters', but 'TAPS_PER_PASS' smooths out
        // objectionable artifacts, in particular near the sun position. The side
        // effect is that the result is darker than it should be around the sun, as
        // TAPS_PER_PASS is greater than the number of samples actually accumulated.
        // When the result is inverted (in the shader 'godrays_combine', this produces
        // a slight bright spot at the position of the sun, even when it is occluded.

        "gl_FragColor = vec4( col/TAPS_PER_PASS );",
        "gl_FragColor.a = 1.0;",

      "}"

    ].join("\n")

  },

  /**
   * Additively applies god rays from texture tGodRays to a background (tColors).
   * fGodRayIntensity attenuates the god rays.
   */

  'godrays_combine': {

    uniforms: {

      tColors: {
        type: "t",
        value: null
      },

      tGodRays: {
        type: "t",
        value: null
      },

      fGodRayIntensity: {
        type: "f",
        value: 0.69
      },

      vSunPositionScreenSpace: {
        type: "v2",
        value: new THREE.Vector2( 0.5, 0.5 )
      }

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

      ].join("\n"),

    fragmentShader: [

      "varying vec2 vUv;",

      "uniform sampler2D tColors;",
      "uniform sampler2D tGodRays;",

      "uniform vec2 vSunPositionScreenSpace;",
      "uniform float fGodRayIntensity;",

      "void main() {",

        // Since THREE.MeshDepthMaterial renders foreground objects white and background
        // objects black, the god-rays will be white streaks. Therefore value is inverted
        // before being combined with tColors

        "gl_FragColor = texture2D( tColors, vUv ) + fGodRayIntensity * vec4( 1.0 - texture2D( tGodRays, vUv ).r );",
        "gl_FragColor.a = 1.0;",

      "}"

    ].join("\n")

  },


  /**
   * A dodgy sun/sky shader. Makes a bright spot at the sun location. Would be
   * cheaper/faster/simpler to implement this as a simple sun sprite.
   */

  'godrays_fake_sun': {

    uniforms: {

      vSunPositionScreenSpace: {
        type: "v2",
        value: new THREE.Vector2( 0.5, 0.5 )
      },

      fAspect: {
        type: "f",
        value: 1.0
      },

      sunColor: {
        type: "c",
        value: new THREE.Color( 0xffee00 )
      },

      bgColor: {
        type: "c",
        value: new THREE.Color( 0x000000 )
      }

    },

    vertexShader: [

      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"

    ].join("\n"),

    fragmentShader: [

      "varying vec2 vUv;",

      "uniform vec2 vSunPositionScreenSpace;",
      "uniform float fAspect;",

      "uniform vec3 sunColor;",
      "uniform vec3 bgColor;",

      "void main() {",

        "vec2 diff = vUv - vSunPositionScreenSpace;",

        // Correct for aspect ratio

        "diff.x *= fAspect;",

        "float prop = clamp( length( diff ) / 0.5, 0.0, 1.0 );",
        "prop = 0.35 * pow( 1.0 - prop, 3.0 );",

        "gl_FragColor.xyz = mix( sunColor, bgColor, 1.0 - prop );",
        "gl_FragColor.w = 1.0;",

      "}"

    ].join("\n")

  }

};



/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.EffectComposer = function ( renderer, renderTarget ) {

  this.renderer = renderer;

  if ( renderTarget === undefined ) {

    var width = window.innerWidth || 1;
    var height = window.innerHeight || 1;
    var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

    renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );

  }

  this.renderTarget1 = renderTarget;
  this.renderTarget2 = renderTarget.clone();

  this.writeBuffer = this.renderTarget1;
  this.readBuffer = this.renderTarget2;

  this.passes = [];

  if ( THREE.CopyShader === undefined )
    console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

  this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

  swapBuffers: function() {

    var tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;

  },

  addPass: function ( pass ) {

    this.passes.push( pass );

  },

  insertPass: function ( pass, index ) {

    this.passes.splice( index, 0, pass );

  },

  render: function ( delta ) {

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    var maskActive = false;

    var pass, i, il = this.passes.length;

    for ( i = 0; i < il; i ++ ) {

      pass = this.passes[ i ];

      if ( !pass.enabled ) continue;

      pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

      if ( pass.needsSwap ) {

        if ( maskActive ) {

          var context = this.renderer.context;

          context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

          this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

          context.stencilFunc( context.EQUAL, 1, 0xffffffff );

        }

        this.swapBuffers();

      }

      if ( pass instanceof THREE.MaskPass ) {
        maskActive = true;

      } else if ( pass instanceof THREE.ClearMaskPass ) {

        maskActive = false;

      }

    }

  },

  reset: function ( renderTarget ) {

    if ( renderTarget === undefined ) {

      renderTarget = this.renderTarget1.clone();

      renderTarget.width = window.innerWidth;
      renderTarget.height = window.innerHeight;

    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

  },

  setSize: function ( width, height ) {

    var renderTarget = this.renderTarget1.clone();

    renderTarget.width = width;
    renderTarget.height = height;

    this.reset( renderTarget );

  }

};




/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

  this.scene = scene;
  this.camera = camera;

  this.enabled = true;
  this.clear = true;
  this.needsSwap = false;

  this.inverse = false;

};

THREE.MaskPass.prototype = {

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    var context = renderer.context;

    // don't update color or depth

    context.colorMask( false, false, false, false );
    context.depthMask( false );

    // set up stencil

    var writeValue, clearValue;

    if ( this.inverse ) {

      writeValue = 0;
      clearValue = 1;

    } else {

      writeValue = 1;
      clearValue = 0;

    }

    context.enable( context.STENCIL_TEST );
    context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
    context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
    context.clearStencil( clearValue );

    // draw into the stencil buffer

    renderer.render( this.scene, this.camera, readBuffer, this.clear );
    renderer.render( this.scene, this.camera, writeBuffer, this.clear );

    // re-enable update of color and depth

    context.colorMask( true, true, true, true );
    context.depthMask( true );

    // only render where stencil is set to 1

    context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
    context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

  }

};


THREE.ClearMaskPass = function () {

  this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

  render: function ( renderer, writeBuffer, readBuffer, delta ) {

    var context = renderer.context;

    context.disable( context.STENCIL_TEST );

  }

};




// shared ortho camera

THREE.EffectComposer.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

THREE.EffectComposer.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );

THREE.EffectComposer.scene = new THREE.Scene();
THREE.EffectComposer.scene.add( THREE.EffectComposer.quad );




/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "opacity":  { type: "f", value: 1.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform float opacity;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "void main() {",

      "vec4 texel = texture2D( tDiffuse, vUv );",
      "gl_FragColor = opacity * texel;",

    "}"

  ].join("\n")

};




// https://github.com/BKcore/Three.js-extensions/blob/master/sources/Utils.js#L13
THREE.projectOnScreen = function (object, camera) {
  var mat = new THREE.Matrix4();
  mat.multiplyMatrices( camera.matrixWorldInverse, object.matrixWorld);
  mat.multiplyMatrices( camera.projectionMatrix , mat);

  var c = mat.n44;
  var lPos = new THREE.Vector3(mat.n14/c, mat.n24/c, mat.n34/c);
  lPos.multiplyScalar(0.5);
  lPos.addScalar(0.5);
  return lPos;
}





/*!
 * THREE.Extras.Shaders contains extra Fx shaders like godrays
 * 
 * @author Thibaut 'BKcore' Despoulain <http://bkcore.com>
 * 
 */

THREE.Shaders = {
  // Volumetric Light Approximation (Godrays)
  Godrays: {
    uniforms: {
      tDiffuse: {type: "t", value:0, texture:null},
      fX: {type: "f", value: 0.5},
      fY: {type: "f", value: 0.5},
      fExposure: {type: "f", value: 0.6},
      fDecay: {type: "f", value: 0.93},
      fDensity: {type: "f", value: 0.96},
      fWeight: {type: "f", value: 0.4},
      fClamp: {type: "f", value: 1.0}
    },

    vertexShader: [
      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"
    ].join("\n"),

    fragmentShader: [
      "varying vec2 vUv;",
      "uniform sampler2D tDiffuse;",

      "uniform float fX;",
      "uniform float fY;",
      "uniform float fExposure;",
      "uniform float fDecay;",
      "uniform float fDensity;",
      "uniform float fWeight;",
      "uniform float fClamp;",

      "const int iSamples = 20;",

      "void main()",
      "{",
        "vec2 deltaTextCoord = vec2(vUv - vec2(fX,fY));",
        "deltaTextCoord *= 1.0 /  float(iSamples) * fDensity;",
        "vec2 coord = vUv;",
        "float illuminationDecay = 1.0;",
        "vec4 FragColor = vec4(0.0);",

        "for(int i=0; i < iSamples ; i++)",
        "{",
          "coord -= deltaTextCoord;",
          "vec4 texel = texture2D(tDiffuse, coord);",
          "texel *= illuminationDecay * fWeight;",

          "FragColor += texel;",

          "illuminationDecay *= fDecay;",
        "}",
        "FragColor *= fExposure;",
        "FragColor = clamp(FragColor, 0.0, fClamp);",
        "gl_FragColor = FragColor;",
      "}"
    ].join("\n")
  },

  // Coeff'd additive buffer blending
  Additive: {
    uniforms: {
      tDiffuse: { type: "t", value: 0, texture: null },
      tAdd: { type: "t", value: 1, texture: null },
      fCoeff: { type: "f", value: 1.0 }
    },

    vertexShader: [
      "varying vec2 vUv;",

      "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

      "}"
    ].join("\n"),

    fragmentShader: [
      "uniform sampler2D tDiffuse;",
      "uniform sampler2D tAdd;",
      "uniform float fCoeff;",

      "varying vec2 vUv;",

      "void main() {",

        "vec4 texel = texture2D( tDiffuse, vUv );",
        "vec4 add = texture2D( tAdd, vUv );",
        "gl_FragColor = texel + add * fCoeff;",

      "}"
    ].join("\n")
  }
};