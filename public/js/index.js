// precision is the number of decimals
Math.round2 = function (number, precision) {
	var multiplier = Math.pow(10, precision);
	return Math.round(number * multiplier) / multiplier;
};

(function ($, THREE) {
	var config;

	// extensions
	THREE.OrthographicCamera.prototype.update = function (width, height) {
		this.left = -0.5 * width / config.zoom;
		this.right = 0.5 * width / config.zoom;
		this.top = 0.5 * height / config.zoom;
		this.bottom = -0.5 * height / config.zoom;
		this.near = config.near;
		this.far = config.far;
		this.updateProjectionMatrix();
	};

	// constants
	config = {
		'zoom': 5,
		'near': 0.1,
		'far': 10000,
		'controls': {
			'lookSpeed': 0.00025,
			'moveSpeed': 1000,
			'strafeSpeed': 1000,
			'rollSpeed': 2
		}
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
		camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 10000);
//		camera = new THREE.OrthographicCamera();
//		camera.update(width, height);
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
					'wireframe': true
				})
			),
			new THREE.Mesh(
				new THREE.SphereGeometry(40, 32, 32),
				new THREE.MeshPhongMaterial({
					'color': 0x4488cc,
					'wireframe': true
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


		spheres[1].position.set(-80, 120, 240);
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

			controls.update(clock.getDelta());

			spheres[0].rotateOnAxis(new THREE.Vector3(-1, 1, 0.5), 0.02);
			spheres[1].rotateOnAxis(new THREE.Vector3(1, 2, -3), 0.01);
			spheres[2].rotateOnAxis(new THREE.Vector3(-5, -8, 4), 0.001);

			renderer.render(scene, camera);
		}
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
	});
}(jQuery, THREE));