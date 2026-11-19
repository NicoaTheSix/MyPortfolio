const bounds = { left: -4.55, right: 4.55, bottom: -6.6, top: 3.1, back: -.85, front: 1.15 };
export const SPHERE_COUNT = 132;
export const FIXED_STEP = 1 / 90;

function randomSequence(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createSpheres(count = SPHERE_COUNT) {
  const random = randomSequence(71691);
  const spheres = [];
  for (let index = 0; index < count; index++) {
    const radius = .19 + random() * .17;
    let x;
    let y;
    let z;
    for (let attempt = 0; attempt < 1200; attempt++) {
      x = bounds.left + radius + random() * (bounds.right - bounds.left - radius * 2);
      y = bounds.bottom + radius + random() * (bounds.top - bounds.bottom - radius * 2);
      z = -.45 + random() * 1.1;
      const outsideCharacter = ((x + .05) / 1.85) ** 2 + ((y + 1.25) / 4.35) ** 2 > 1;
      const separated = spheres.every(other =>
        Math.hypot(x - other.x, y - other.y, z - other.z) > radius + other.radius + .045);
      if (outsideCharacter && separated) break;
    }
    spheres.push({
      x, y, z, radius, vx: 0, vy: 0, vz: 0,
      homeX: x, homeY: y, homeZ: z,
      tone: Math.floor(random() * 5),
    });
  }
  return spheres;
}

export function resetSpheres(spheres) {
  for (const sphere of spheres) {
    sphere.x = sphere.homeX;
    sphere.y = sphere.homeY;
    sphere.z = sphere.homeZ;
    sphere.vx = sphere.vy = sphere.vz = 0;
  }
}

function pushFromCursor(sphere, cursor, dt) {
  if (!cursor.active) return;
  // The swept segment keeps fast mouse movement from tunneling through small balls.
  const dx = cursor.x - cursor.previousX;
  const dy = cursor.y - cursor.previousY;
  const lengthSquared = dx * dx + dy * dy;
  const along = lengthSquared > .00001
    ? Math.max(0, Math.min(1, ((sphere.x - cursor.previousX) * dx + (sphere.y - cursor.previousY) * dy) / lengthSquared))
    : 1;
  const nearestX = cursor.previousX + along * dx;
  const nearestY = cursor.previousY + along * dy;
  const offsetX = sphere.x - nearestX;
  const offsetY = sphere.y - nearestY;
  const distance = Math.hypot(offsetX, offsetY);
  const reach = sphere.radius + .9;
  if (distance >= reach) return;
  const directionX = distance > .001 ? offsetX / distance : 1;
  const directionY = distance > .001 ? offsetY / distance : 0;
  const influence = (1 - distance / reach) ** 2;
  const force = 95 * influence * dt;
  sphere.vx += directionX * force + Math.max(-2, Math.min(2, dx)) * influence * 2;
  sphere.vy += directionY * force + Math.max(-2, Math.min(2, dy)) * influence * 2;
  sphere.vz += (sphere.z >= 0 ? 1 : -1) * force * .1;
}

function contain(sphere) {
  for (const [axis, velocity, low, high] of [
    ['x', 'vx', bounds.left, bounds.right],
    ['y', 'vy', bounds.bottom, bounds.top],
    ['z', 'vz', bounds.back, bounds.front],
  ]) {
    if (sphere[axis] - sphere.radius < low) {
      sphere[axis] = low + sphere.radius;
      sphere[velocity] = Math.abs(sphere[velocity]) * .63;
    } else if (sphere[axis] + sphere.radius > high) {
      sphere[axis] = high - sphere.radius;
      sphere[velocity] = -Math.abs(sphere[velocity]) * .63;
    }
  }
}

export function stepSpheres(spheres, cursor, dt = FIXED_STEP) {
  const drag = Math.exp(-2.3 * dt);
  for (const sphere of spheres) {
    sphere.vx += (sphere.homeX - sphere.x) * 2.8 * dt;
    sphere.vy += (sphere.homeY - sphere.y) * 2.8 * dt;
    sphere.vz += (sphere.homeZ - sphere.z) * 3.8 * dt;
    pushFromCursor(sphere, cursor, dt);
    const speed = Math.hypot(sphere.vx, sphere.vy, sphere.vz);
    const limit = speed > 12 ? 12 / speed : 1;
    sphere.vx *= drag * limit;
    sphere.vy *= drag * limit;
    sphere.vz *= drag * limit;
    sphere.x += sphere.vx * dt;
    sphere.y += sphere.vy * dt;
    sphere.z += sphere.vz * dt;
  }

  for (let iteration = 0; iteration < 2; iteration++) {
    for (let a = 0; a < spheres.length; a++) {
      for (let b = a + 1; b < spheres.length; b++) {
        const first = spheres[a];
        const second = spheres[b];
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const dz = second.z - first.z;
        const contact = first.radius + second.radius;
        const squared = dx * dx + dy * dy + dz * dz;
        if (squared >= contact * contact) continue;
        const distance = Math.max(.0001, Math.sqrt(squared));
        const nx = squared < .000001 ? 1 : dx / distance;
        const ny = dy / distance;
        const nz = dz / distance;
        const correction = (contact - distance) * .51;
        first.x -= nx * correction;
        first.y -= ny * correction;
        first.z -= nz * correction;
        second.x += nx * correction;
        second.y += ny * correction;
        second.z += nz * correction;
        const closingSpeed = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny + (second.vz - first.vz) * nz;
        if (closingSpeed >= 0) continue;
        const impulse = -closingSpeed * .78;
        first.vx -= nx * impulse;
        first.vy -= ny * impulse;
        first.vz -= nz * impulse;
        second.vx += nx * impulse;
        second.vy += ny * impulse;
        second.vz += nz * impulse;
      }
    }
    spheres.forEach(contain);
  }
}
