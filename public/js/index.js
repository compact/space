// precision is the number of decimals
Math.round2 = function (number, precision) {
	var multiplier = Math.pow(10, precision);
	return Math.round(number * multiplier) / multiplier;
};

(function ($, THREE) {
	var config;

	config = {
		'camera': { // for THREE.PerspectiveCamera
			'fov': 30,
			'near': 0.1,
			'far': 10000
		},
		'controls': { // for THREE.Controls
			'lookSpeed': 0.00025, // pitch/yaw with mouse
			'moveSpeed': 1000, // move forward/backward/up/down with keyboard
			'strafeSpeed': 1000, // move left/right with keyboard
			'rollSpeed': 2 // yaw with keyboard
		}
	};

	// unit vectors
	THREE.unitVectors = {
		'x': new THREE.Vector3(1, 0, 0),
		'y': new THREE.Vector3(0, 1, 0),
		'z': new THREE.Vector3(0, 0, 1)
	};
	// extensions
	THREE.PerspectiveCamera.prototype.update = function (width, height) {
		this.fov = config.camera.fov;
		this.aspect = width / height;
		this.near = config.camera.near;
		this.far = config.camera.far;
		this.updateProjectionMatrix();
	};
	// revolve around the given Vector3, which is not local based on the object,
	// but global in the world
	THREE.Object3D.prototype.revolve = function (worldAxis, angle) {
		var sin, cos, x, y, z, rotationMatrix;
		sin = Math.sin(angle);
		cos = Math.cos(angle);
		worldAxis = worldAxis.normalize();
		x = worldAxis.x;
		y = worldAxis.y;
		z = worldAxis.z;
		rotationMatrix = new THREE.Matrix3();

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
		this.position.applyMatrix3(rotationMatrix);
	};

	$(function () {
		var $window, width, height,
			clock, scene, camera, renderer, spheres, controls;

		$window = $(window);
		$overlay = $('#overlay');

		// canvas dimensions
		width = $window.width();
		height = $window.height() - 5;

		// clock: for movement speed
		clock = new THREE.Clock();

		// scene
		scene = new THREE.Scene();

		// camera
		camera = new THREE.PerspectiveCamera();
//		camera = new THREE.OrthographicCamera();
		camera.update(width, height);
		// canvas
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		$('body').append(renderer.domElement);



		// construct objects
		spheres = [
			new THREE.Mesh(
				new THREE.SphereGeometry(100, 32, 32),
				new THREE.MeshLambertMaterial({
					'color': 0xcc8844,
					'wireframe': false,
					'map': new THREE.ImageUtils.loadTexture('images/textures/0.jpg')
				})
			),
			new THREE.Mesh(
				new THREE.SphereGeometry(200, 32, 32),
				new THREE.MeshPhongMaterial({
					'color': 0x4488cc,
					'wireframe': false,
					'map': new THREE.ImageUtils.loadTexture('images/textures/1.jpg')
				})
			),
			new THREE.Mesh(
				new THREE.SphereGeometry(350, 48, 48),
				new THREE.MeshLambertMaterial({
					'color': 0xcc8866,
					'wireframe': true
				})
			)
		];


		spheres[1].position.set(-400, 400, 0);
		spheres[2].position.set(450, -600, 2000);
		$.each(spheres, function (i, sphere) {
			scene.add(sphere);
		});



		// lighting
//		light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
		light = new THREE.PointLight(0x88ffcc, 5, 600);
		light.position.set(-70, 200, -70);
		scene.add(light);
		light2 = new THREE.PointLight(0xaaccff, 10, 1500);
		light2.position.set(-400, -300, 50);
		scene.add(light2);
		light3 = new THREE.PointLight(0xffffff, 1, 2000);
		light3.position.set(200, -250, 1000);
		scene.add(light3);



		// first person controls
		controls = new THREE.Controls(camera, config.controls);



		// animate: render repeatedly
		camera.position.z = -1000;
		camera.lookAt(new THREE.Vector3(0, 0, 1000));
		function animate() {
			window.requestAnimationFrame(animate);

			if (!collision()) {
				controls.update(clock.getDelta());
			}

			moveSpheres();
			updateHud();

			renderer.render(scene, camera);
		}
		var collision = function () {
/*			var ray, intersection;
			ray = new THREE.Ray(camera.position, THREE.unitVectors.z);
			intersection = ray.intersectObjects(spheres);
			if (intersection.length > 1) {
				$.each(intersection, function (i, object) {
					if (camera.position.distanceTo(object.position) < object.geometry.radius + 200) {
						collision = true;
					}
				});
			}*/
			return false;
		};
		var moveSpheres = function () {
			spheres[0].rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
			spheres[1].rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
			spheres[1].revolve(new THREE.Vector3(1, 1, 1), 0.01);
			spheres[2].rotateOnAxis(new THREE.Vector3(-5, -8, 4), 0.001);
		};
		var updateHud = function () {
			$('#hud2').html(
				'position (px): ' +
					Math.round(camera.position.x) + ', ' +
					Math.round(camera.position.y) + ', ' +
					Math.round(camera.position.z) + '<br />' +
				'rotation (deg): ' +
					Math.round(camera.rotation.x * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.y * 180 / Math.PI) + ', ' +
					Math.round(camera.rotation.z * 180 / Math.PI)
			);
		};
		animate();


		// pointer lock
		var havePointerLock = 'pointerLockElement' in document ||
			'mozPointerLockElement' in document ||
			'webkitPointerLockElement' in document;
		if (!havePointerLock) {
			// we can use FirstPersonControls here instead
			console.log('Your browser does not support Pointer Lock API.');
		} else {
			var element = document.body;

			var pointerlockchange = function (event) {
				if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
					controls.enable();
					$overlay.hide();
				} else {
					controls.disable();
					$overlay.find('.notice').text('Click to Continue');
					$overlay.show();
				}
			}

			var pointerlockerror = function (event) {
				console.log('Pointer Lock error:');
				console.log(event);
			}

			// Hook pointer lock state change events
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

			$overlay.on('click', function () {
				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
				element.requestPointerLock();

				$overlay.hide();
			});
		}

		$window.on('resize', function () {
			var width = $window.width(), height = $window.height();
			camera.update(width, height);
			renderer.setSize(width, height);
		});
		console.log(spheres[0]);
	});
}(jQuery, THREE));