import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceTracking, createTrackingState, directionName, pointerTarget } from '../lib/mascot-tracking.ts';

const right = { x: 1, y: 0, away: true };
const left = { x: -1, y: 0, away: true };
const center = { x: 0, y: 0, away: false };

function run(state, target, start, duration, interval = 16) {
  const poses = [];
  let result;
  for (let time = start + interval; time <= start + duration; time += interval) {
    result = advanceTracking(state, target, interval, time);
    if (poses.at(-1) !== result.pose) poses.push(result.pose);
  }
  return { poses, result };
}

test('uses a stable neutral zone instead of toggling at one boundary', () => {
  assert.equal(pointerTarget(70, 0, false).away, false);
  assert.equal(pointerTarget(70, 0, true).away, true);
  assert.equal(pointerTarget(59, 0, true).away, false);
});

test('large opposite turns pass through the center pose', () => {
  const state = createTrackingState();
  run(state, right, 0, 400);
  const { poses, result } = run(state, left, 400, 400);
  assert.equal(poses.at(0), 5);
  assert.ok(poses.includes(4), `expected a center pose in ${poses}`);
  assert.equal(poses.at(-1), 3);
  assert.equal(result.settled, true);
});

test('return to center is eased, then the animation can stop', () => {
  const state = createTrackingState();
  run(state, right, 0, 400);
  const first = advanceTracking(state, center, 16, 416);
  assert.equal(first.pose, 5);
  assert.equal(first.settled, false);
  const { result } = run(state, center, 416, 400);
  assert.equal(result.pose, 4);
  assert.equal(result.settled, true);
});

test('direction-boundary noise does not chatter between frames', () => {
  const state = createTrackingState();
  run(state, right, 0, 400);
  for (let time = 416; time < 1000; time += 16) {
    const angle = Math.PI / 8 + (time % 32 ? 0.02 : -0.02);
    const result = advanceTracking(state, { x: Math.cos(angle), y: Math.sin(angle), away: true }, 16, time);
    assert.equal(result.pose, 5);
  }
});

test('damping agrees across display refresh rates', () => {
  const slow = createTrackingState();
  const fast = createTrackingState();
  run(slow, right, 0, 96, 16);
  run(fast, right, 0, 96, 8);
  assert.ok(Math.abs(slow.x - fast.x) < 1e-10);
  assert.equal(slow.pose, fast.pose);
});

test('all eight directions settle on their corresponding sprite cells', () => {
  for (const [dx, dy, expected] of [[-100,-100,0],[0,-100,1],[100,-100,2],[-100,0,3],[100,0,5],[-100,100,6],[0,100,7],[100,100,8]]) {
    const state = createTrackingState();
    const { result } = run(state, pointerTarget(dx, dy, false), 0, 400);
    assert.equal(result.pose, expected);
    assert.equal(result.settled, true);
  }
});

test('the 5x5 renderer can reach each of the 25 head poses', () => {
  for (let row = 0; row < 5; row++) {
    for (let column = 0; column < 5; column++) {
      const state = createTrackingState(5);
      const { result } = run(state, { x: (column - 2) / 2, y: (row - 2) / 2, away: true }, 0, 500);
      assert.equal(result.pose, row * 5 + column);
      assert.equal(result.settled, true);
    }
  }
});

test('5x5 reversals visit both half turns and center, even after a frame stall', () => {
  const state = createTrackingState(5);
  run(state, right, 0, 500);
  const { poses, result } = run(state, left, 500, 600, 48);
  assert.deepEqual(poses, [13, 12, 11, 10]);
  assert.equal(result.settled, true);
  assert.equal(directionName(10, 5), 'left');
  assert.equal(directionName(11, 5), 'half-left');
});

test('5x5 tracking uses distance to reveal intermediate yaw and pitch', () => {
  const near = pointerTarget(100, 0, false, 5);
  const far = pointerTarget(500, 0, true, 5);
  assert.ok(near.x < far.x);
  assert.ok(near.x > 0 && far.x < 1);
  assert.equal(near.y, 0);
});
