/**
 * Based on http://threejs.org/examples/misc_controls_fly.html
 */

(function (THREE) {
	'use strict';

	THREE.Stars = function (particleSystemScale) {
		var i, vertex, scale, // iterators
			geometries, materials, particleSystem;

		this.particleSystems = [];

		if (typeof particleSystemScale === 'undefined') {
			particleSystemScale = 1000;
		}

		geometries = [new THREE.Geometry(), new THREE.Geometry()];

		for (i = 0; i < 500; i++) {
			vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1; // random number in [-1, 1]
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			geometries[0].vertices.push(vertex);
		}

		for (i = 0; i < 1500; i ++) {
			vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			geometries[1].vertices.push(vertex);
		}

		materials = [
			new THREE.ParticleBasicMaterial({ color: 0x555555, size: 2, sizeAttenuation: false }),
			new THREE.ParticleBasicMaterial({ color: 0x555555, size: 1, sizeAttenuation: false }),
			new THREE.ParticleBasicMaterial({ color: 0x333333, size: 2, sizeAttenuation: false }),
			new THREE.ParticleBasicMaterial({ color: 0x3a3a3a, size: 1, sizeAttenuation: false }),
			new THREE.ParticleBasicMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false }),
			new THREE.ParticleBasicMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false })
		];

		for (i = 10; i < 30; i ++) {
			particleSystem = new THREE.ParticleSystem(geometries[i % 2], materials[i % 6]);

			particleSystem.rotation.x = Math.random() * 2 * Math.PI;
			particleSystem.rotation.y = Math.random() * Math.PI;
			particleSystem.rotation.z = Math.random() * 2 * Math.PI;

			scale = i * particleSystemScale;
			particleSystem.scale.set(scale, scale, scale);

			particleSystem.matrixAutoUpdate = false;
			particleSystem.updateMatrix();

			this.particleSystems.push(particleSystem);
		}
	};
}(THREE));