/**
 * kimchi.space contains astronomical bodies (called 'bodies' for short) and
 * their Object3Ds.
 */

var kimchi = (function (kimchi) {
	var $ = kimchi.jQuery;

	kimchi.space = {};

	// raw data of each body
	kimchi.space.data = [
		{
			'name': 'Sun',
			'radius': 696000 / 10,
			'position': new THREE.Vector3(0, 0, 0),
			'visibleDistance': 1000000,
			'move': function () {},
			'mesh': new THREE.Mesh(
				new THREE.SphereGeometry(696000 * kimchi.config.scales.radius / 10, kimchi.config.sphereSegments, kimchi.config.sphereSegments),
				new THREE.MeshBasicMaterial({ // not Lambert since sunlight is in the center of the sun
					'map': new THREE.ImageUtils.loadTexture('images/textures/sun2.jpg')
				})
			)
		},
		{
			'name': 'Earth',
			'radius': 6378,
			'position': new THREE.Vector3(0, 1.00000011, 0),
			'visibleDistance': 50,
			'move': function () {
//		this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.001);
//		this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
			},
			'children': [
				{
					'name': 'Moon',
					'radius': 1737,
					'position': new THREE.Vector3(0, 1.00000011, 0),
					'visibleDistance': 20,
					'move': function () {
						this.mesh.rotateOnAxis(new THREE.Vector3(1, 1, 1), 0.001);
						this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.025);
					}
				}
			]
		},
		{
			'name': 'Mars',
			'radius': 3397,
			'position': new THREE.Vector3(0, 1.52366231, 0),
			'visibleDistance': 50,
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
			}
		},
		{
			'name': 'Jupiter',
			'radius': 71492,
			'position': new THREE.Vector3(0, 5.20336301, 0),
			'visibleDistance': 250,
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(-1, -1, -1), 0.001);
				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
			}
		},
		{
			'name': 'Saturn',
			'radius': 60267,
			'position': new THREE.Vector3(0, 9.53707032, 0),
			'visibleDistance': 250,
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
			}
		},
		{
			'name': 'Neptune',
			'radius': 24766,
			'position': new THREE.Vector3(0, 30.06896348, 0),
			'visibleDistance': 1000,
			'move': function () {
				this.mesh.rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
				this.mesh.orbit(new THREE.Vector3(0, 0, 1), 0.0025);
			}
		}
	];



	/**
	 * Class for astronomical bodies. All spheres for now.
	 * Currently not extensible; set the functions in the prototype to do that.
	 * name: Required. Label displayed to users.
	 * radius: In km.
	 * position: Vector3 of the starting position in AU. Not to be confused with
	 *   Mesh.position, which gives the current position.
	 * rotation: Vector3 of the starting rotation.
	 * visibleDistance: How far away the text mesh remains visible.
	 *   TODO rename to textMeshDistance or something.
	 * move: Optional. Given an Object3D (Mesh), perform rotations and revolutions.
	 * texturePath: Optional path to the texture image. The default is name.jpg.
	 */
	kimchi.space.Body = function (options) {
		var length, curve;

		$.extend(this, { // default options
			'name': '',
			'radius': 0,
			'position': new THREE.Vector3(),
			'rotation': new THREE.Vector3(),
			'collideable': true,
			'visibleDistance': 100,
			'move': function () {},
			'texturePath': 'images/textures/' + options.name.toLowerCase() + '.jpg'
		}, options);

		this.radius *= kimchi.config.scales.radius;

		// create a Mesh for the body; it can already be set in space.data
		if (typeof this.mesh !== 'object') { 
			this.mesh = new THREE.Mesh(
				new THREE.SphereGeometry(this.radius, kimchi.config.sphereSegments, kimchi.config.sphereSegments),
				new THREE.MeshLambertMaterial({
					'map': new THREE.ImageUtils.loadTexture(this.texturePath)
				})
			);
		}
		this.position.multiplyScalar(kimchi.config.scales.position);
		this.mesh.position.copy(this.position);
		this.mesh.rotation.copy(this.rotation);
		length = this.position.length();

		// create a Curve for the orbit, which can be used to create a Line
		curve = new THREE.EllipseCurve(0, 0, 2 * length, length, 0, 2 * Math.PI, true);
		this.line = curve.createLine({
			'color': kimchi.config.orbits.color,
			'opacity': kimchi.config.orbits.opacity,
			'lineSegments': kimchi.config.orbits.lineSegments,
		});

		/**
		 * Create a Mesh for the text label. We could do
		 *   this.mesh.add(this.textMesh);
		 * but then the text Mesh rotates with the body and it is nontrivial to
		 * rotate it back.
		 */
/*		this.textMesh = new THREE.Mesh(
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
*/
		this.$label = $('<div class="label">').text(this.name).appendTo('body');
	};



	// contains instances of space.Body
	kimchi.space.bodies = {};
	kimchi.space.setBodies = function () {
		$.each(kimchi.space.data, function (i, options) {
			kimchi.space.bodies[options.name] = new kimchi.space.Body(options);
		});
	};



	// return an array of Object3Ds objects for each spaces.bodies
	kimchi.space.getObject3Ds = function () {
		var objects = [];
		$.each(kimchi.space.bodies, function (name, body) {
			objects.push(body.mesh, body.line); // , body.textMesh
		});
		return objects;
	};



	// update() updates the position of HTML elements which attach to Meshes
	// move() updates the position of Meshes as well
	kimchi.space.move = function (delta) { // TODO use delta
		$.each(kimchi.space.bodies, function (name, body) {
			var distance, scale;

			// move the body mesh (custom function)
			body.move();

			kimchi.space.update();
		});
	};
	kimchi.space.update = function () {
		// update the positioning of all elements that don't move in move()
		$.each(kimchi.space.bodies, function (name, body) {
			var distance = kimchi.camera.position.distanceTo(body.mesh.position);

			// move the text mesh
/*		if (distance > body.visibleDistance) {
				body.textMesh.visible = false;
			} else {
				body.textMesh.visible = true;

				scale = distance / 1000;
				body.textMesh.scale.set(scale, scale, scale);

				// the text mesh always face the camera
				body.textMesh.rotation.copy(kimchi.camera.rotation.clone());

				// move it in front of the associated mesh so it's not hidden inside
				body.textMesh.geometry.computeBoundingSphere();
				var v = kimchi.camera.position.clone().sub(body.mesh.position)
					.normalize().multiplyScalar(body.radius + 0.01);
				var w = body.mesh.position.clone().add(v);
				var x = body.mesh.position.clone().cross(v).cross(v)
					.normalize().multiplyScalar(
						body.textMesh.geometry.boundingSphere.radius / 100
					);
				body.textMesh.position.copy(w);//.add(x));
			}
*/

			// overlay text labels on top of the canvas
			if (distance > body.visibleDistance) { // too far away
				body.$label.hide();
			} else {
				var projector = new THREE.Projector();
				var v = projector.projectVector(body.mesh.position.clone(), kimchi.camera);
				var left = (v.x + 1) / 2 * kimchi.size.width;
				var top = (1 - v.y) / 2 * kimchi.size.height;

				if (left < -body.$label.outerWidth() || left > kimchi.size.width || top < -body.$label.outerHeight() || top > kimchi.size.height) {
					// the body is not visible on screen
					body.$label.hide();
				} else {
					body.$label.css({
						'left': left - body.$label.outerWidth() / 2,
						'top': top - body.$label.outerHeight() / 2,
					}).show();
				}
			}
		});
	};



	// returns an array of Mesh objects set to be collideable with the camera
	kimchi.space.getCollideableObject3Ds = function () {
		var object3Ds = [];
		$.each(kimchi.space.bodies, function (name, body) {
			if (body.collideable) {
				object3Ds.push(body.mesh);
			}
		});
		return object3Ds;
	};



	return kimchi;
}(kimchi));