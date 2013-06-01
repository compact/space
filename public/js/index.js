(function ($, THREE) {
	var config, $window, width, height, scene, camera, renderer, sphere;

	// constants
	config = {
		'scale': 123,
		'moveSpeed': 0.0001,
		'lookSpeed': 0.1
	};

	// dimensions
	$window = $(window);
	width = $window.width();
	height = $window.height() - 5;

	// clock: for movement speed
	clock = new THREE.Clock();

	// scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 100);
	camera = new THREE.OrthographicCamera(-width / config.scale, width / config.scale, height / config.scale, -height / config.scale, 0.1, 100);

	// canvas
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	$('body').append(renderer.domElement);



	// construct objects
	sphere = new THREE.Mesh(
		new THREE.SphereGeometry(3, 32, 32),
		new THREE.MeshLambertMaterial({
			'color': 0xcc8844,
			'wireframe': true
		})
	);
	sphere.position.set(-4, 3, 6);
	scene.add(sphere);

	sphere2 = new THREE.Mesh(
		new THREE.SphereGeometry(6, 32, 32),
		new THREE.MeshPhongMaterial({
			'color': 0x4488cc,
			'wireframe': true
		})
	);
	sphere2.position.set(10, 0, 6);
	scene.add(sphere2);



	// light
	light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
	light = new THREE.PointLight(0x8888cc, 10, 15);
	light.position.set(2, 2, 3);
	scene.add(light);



	camera.lookAt(new THREE.Vector3(1, 2, 3));



	// first person controls
	controls = new THREE.FirstPersonControls(camera);
	controls.movementSpeed = config.movementSpeed;
	controls.lookSpeed = config.lookSpeed;

	// render
	function render() {
		window.requestAnimationFrame(render);

		controls.update(clock.getDelta());

		sphere.rotation.x += 0.01;
		sphere.rotation.y += 0.02;
		sphere2.rotation.x -= 0.005;
		sphere2.rotation.y += 0.002;

		renderer.render(scene, camera);
	}
	render();

	$(function () {
		$window.on({
			'focus': function() {
				if (controls) controls.freeze = false;
			},
			'blur': function() {
				if (controls) controls.freeze = true;
			}
		});
	});
}(jQuery, THREE));