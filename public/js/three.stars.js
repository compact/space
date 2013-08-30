/**
 * Based on {@link http://threejs.org/examples/misc_controls_fly.html}
 *   Multiple geometries and materials are used for variability in the stars.
 * @constructor THREE.Stars
 * @memberOf    THREE
 */
(function ($, THREE) {
	'use strict';

	THREE.Stars = function (options) {
		var i, vertex, scale, particleSystem, // iterators
			geometries, counts, materials, particleSystems;

		particleSystems = [];

		options = _.assign({
			'scale': 1000,
			'count': 1000
		}, options);

		geometries = [new THREE.Geometry(), new THREE.Geometry()];

		// number of stars in each geometry
		counts = [options.count * 0.25, options.count * 0.75];

		for (i = 0; i < counts[0]; i++) {
			vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1; // random number in [-1, 1]
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			geometries[0].vertices.push(vertex);
		}

		for (i = 0; i < counts[1]; i ++) {
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

			scale = i * options.scale;
			particleSystem.scale.set(scale, scale, scale);

			particleSystem.matrixAutoUpdate = false;
			particleSystem.updateMatrix();

			particleSystems.push(particleSystem);
		}

		return particleSystems;
	};
}(jQuery, THREE));