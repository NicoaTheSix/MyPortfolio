import { Body, Box, ContactMaterial, Material, Plane, SAPBroadphase, Vec3, World } from 'cannon-es';

export const FIXED_STEP = 1 / 120;
export const DICE_COUNT = 96;
export const DICE_TYPES = ['jelly', 'white', 'black'];
const edge = 4.7;
const cornerRadius = .8;
const cornerCenter = edge - cornerRadius;

export function createDiceWorld(count = DICE_COUNT) {
  const world = new World({ gravity: new Vec3(0, 0, 0), allowSleep: true });
  world.broadphase = new SAPBroadphase(world);
  world.solver.iterations = 12;
  const material = new Material('wall');
  const materials = Object.fromEntries(DICE_TYPES.map(type => [type, new Material(type)]));
  const contacts = [['wall', material], ...Object.entries(materials)];
  contacts.forEach(([type, first], index) => {
    for (const [otherType, second] of contacts.slice(index)) {
      const soft = type === 'jelly' || otherType === 'jelly';
      world.addContactMaterial(new ContactMaterial(first, second, {
        friction: soft ? .12 : .08,
        restitution: soft ? .82 : .68,
        contactEquationStiffness: soft ? 8e5 : 1e7,
        contactEquationRelaxation: soft ? 5 : 3,
      }));
    }
  });

  function wall(x, y, length, angle) {
    const body = new Body({ mass: 0, material, shape: new Box(new Vec3(length / 2, .12, 2.5)) });
    body.position.set(x, y, 0);
    body.quaternion.setFromEuler(0, 0, angle);
    world.addBody(body);
  }
  const straight = cornerCenter * 2;
  wall(0, edge + .12, straight, 0);
  wall(0, -edge - .12, straight, 0);
  wall(edge + .12, 0, straight, Math.PI / 2);
  wall(-edge - .12, 0, straight, Math.PI / 2);
  // Each quadrant uses a smooth polygonal arc to match the rounded container.
  const segments = 12;
  const angleStep = Math.PI / 2 / segments;
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    const start = quadrant * Math.PI / 2;
    const centerX = quadrant === 0 || quadrant === 3 ? cornerCenter : -cornerCenter;
    const centerY = quadrant < 2 ? cornerCenter : -cornerCenter;
    for (let segment = 0; segment < segments; segment++) {
      const angle = start + (segment + .5) * angleStep;
      const radius = cornerRadius + .12;
      wall(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius,
        2 * radius * Math.tan(angleStep / 2) + .025, angle + Math.PI / 2);
    }
  }
  const back = new Body({ mass: 0, material, shape: new Plane() });
  back.position.z = -1.35;
  world.addBody(back);
  const front = new Body({ mass: 0, material, shape: new Plane() });
  front.position.z = 1.35;
  front.quaternion.setFromEuler(Math.PI, 0, 0);
  world.addBody(front);

  let randomState = 78971;
  function random() {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  }
  const dice = [];
  for (let index = 0; index < count; index++) {
    const type = DICE_TYPES[index % DICE_TYPES.length];
    const size = .42 + random() * .16;
    const body = new Body({
      mass: type === 'jelly' ? .85 : 1,
      material: materials[type],
      shape: new Box(new Vec3(size / 2, size / 2, size / 2)),
      linearDamping: .43,
      angularDamping: .58,
      sleepSpeedLimit: .035,
      sleepTimeLimit: 1.4,
    });
    let position;
    for (let attempt = 0; attempt < 3000; attempt++) {
      position = new Vec3((random() - .5) * 8.1, (random() - .5) * 8.1, (random() - .5) * 1.2);
      if (dice.every(other => other.body.position.distanceTo(position) > (other.size + size) * .88)) break;
    }
    body.position.copy(position);
    body.quaternion.setFromEuler(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    world.addBody(body);
    const die = { body, size, type, deformation: 0, deformationVelocity: 0, compressionAxis: 0 };
    if (type === 'jelly') {
      const localNormal = new Vec3();
      body.addEventListener('collide', ({ contact }) => {
        const impact = Math.abs(contact.getImpactVelocityAlongNormal());
        if (impact < .15) return;
        body.quaternion.conjugate().vmult(contact.ni, localNormal);
        const axes = [Math.abs(localNormal.x), Math.abs(localNormal.y), Math.abs(localNormal.z)];
        die.compressionAxis = axes.indexOf(Math.max(...axes));
        die.deformationVelocity = Math.min(4.5, die.deformationVelocity + impact * .85);
      });
    }
    dice.push(die);
  }

  function push(cursor) {
    const dx = cursor.x - cursor.previousX;
    const dy = cursor.y - cursor.previousY;
    const segmentLength = dx * dx + dy * dy;
    if (segmentLength < .00001) return;
    for (const { body, size } of dice) {
      const t = Math.max(0, Math.min(1,
        ((body.position.x - cursor.previousX) * dx + (body.position.y - cursor.previousY) * dy) / segmentLength));
      const offsetX = body.position.x - (cursor.previousX + t * dx);
      const offsetY = body.position.y - (cursor.previousY + t * dy);
      const distance = Math.hypot(offsetX, offsetY);
      const reach = size * .6 + .75;
      if (distance > reach) continue;
      const influence = (1 - distance / reach) ** 1.4;
      const length = Math.max(.001, distance);
      const travel = Math.min(1.5, Math.sqrt(segmentLength));
      const impulse = new Vec3(
        (Math.max(-2.8, Math.min(2.8, dx)) * 5 + offsetX / length * 2 * travel) * influence,
        (Math.max(-2.8, Math.min(2.8, dy)) * 5 + offsetY / length * 2 * travel) * influence,
        (body.position.z >= 0 ? 1 : -1) * influence * travel * .55,
      );
      body.applyImpulse(impulse, new Vec3(offsetX * .12, offsetY * .12, size * .22));
      body.angularVelocity.x += dy * influence * 1.4;
      body.angularVelocity.y -= dx * influence * 1.4;
      const speed = body.velocity.length();
      if (speed > 18) body.velocity.scale(18 / speed, body.velocity);
      const rotationSpeed = body.angularVelocity.length();
      if (rotationSpeed > 16) body.angularVelocity.scale(16 / rotationSpeed, body.angularVelocity);
    }
  }
  const vertex = new Vec3();
  const worldVertex = new Vec3();
  function containDie({ body, size }) {
    // Project any escaping cube vertex back inside after a high-speed contact.
    // The rigid-body solver still supplies the cube-to-cube and wall impulses.
    const half = size / 2;
    for (let iteration = 0; iteration < 3; iteration++) {
      for (const x of [-half, half]) {
        for (const y of [-half, half]) {
          for (const z of [-half, half]) {
            vertex.set(x, y, z);
            body.quaternion.vmult(vertex, worldVertex);
            worldVertex.vadd(body.position, worldVertex);
            const nearestX = Math.max(-cornerCenter, Math.min(cornerCenter, worldVertex.x));
            const nearestY = Math.max(-cornerCenter, Math.min(cornerCenter, worldVertex.y));
            const dx = worldVertex.x - nearestX;
            const dy = worldVertex.y - nearestY;
            const distance = Math.hypot(dx, dy);
            if (distance > cornerRadius) {
              const nx = dx / distance;
              const ny = dy / distance;
              const penetration = distance - cornerRadius + .001;
              body.position.x -= nx * penetration;
              body.position.y -= ny * penetration;
              const outwardSpeed = body.velocity.x * nx + body.velocity.y * ny;
              if (outwardSpeed > 0) {
                body.velocity.x -= nx * outwardSpeed * 1.65;
                body.velocity.y -= ny * outwardSpeed * 1.65;
              }
              body.aabbNeedsUpdate = true;
            }
            if (Math.abs(worldVertex.z) > 1.35) {
              const direction = Math.sign(worldVertex.z);
              body.position.z -= direction * (Math.abs(worldVertex.z) - 1.35 + .001);
              if (body.velocity.z * direction > 0) body.velocity.z *= -.65;
              body.aabbNeedsUpdate = true;
            }
          }
        }
      }
    }
  }
  return {
    world,
    dice,
    step() {
      world.step(FIXED_STEP);
      dice.forEach(containDie);
      for (const die of dice) {
        if (die.type !== 'jelly') continue;
        die.deformationVelocity += (-110 * die.deformation - 9 * die.deformationVelocity) * FIXED_STEP;
        die.deformation += die.deformationVelocity * FIXED_STEP;
        die.deformation = Math.max(-.14, Math.min(.34, die.deformation));
      }
    },
    push,
  };
}
