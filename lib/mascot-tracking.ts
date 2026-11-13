export const DIRECTIONS = [
  "up-left", "up", "up-right", "left", "center", "right", "down-left", "down", "down-right",
] as const;

const CLOCKWISE = [5, 8, 7, 6, 3, 0, 1, 2];
const SECTOR = Math.PI / 4;
const HYSTERESIS = 0.12;
const RESPONSE_MS = 55;
const MIN_POSE_MS = 40;

export type LookTarget = { x: number; y: number; away: boolean };
export type DirectionGrid = 3 | 5;
export type TrackingState = { x: number; y: number; pose: number; changedAt: number; grid: DirectionGrid };

export function createTrackingState(grid: DirectionGrid = 3): TrackingState {
  return { x: 0, y: 0, pose: Math.floor(grid * grid / 2), changedAt: -Infinity, grid };
}

export function pointerTarget(dx: number, dy: number, wasAway: boolean, grid: DirectionGrid = 3): LookTarget {
  const distance = Math.hypot(dx, dy);
  // Separate entry and exit thresholds prevent chattering near the neutral zone.
  if (distance < (wasAway ? 60 : 78)) return { x: 0, y: 0, away: false };
  if (grid === 5) return { x: Math.tanh(dx / 220), y: Math.tanh(dy / 220), away: true };
  return { x: dx / distance, y: dy / distance, away: true };
}

export function directionName(pose: number, grid: DirectionGrid): string {
  if (grid === 3) return DIRECTIONS[pose];
  const yaw = ['left', 'half-left', '', 'half-right', 'right'][pose % 5];
  const pitch = ['up', 'half-up', '', 'half-down', 'down'][Math.floor(pose / 5)];
  return [pitch, yaw].filter(Boolean).join('-') || 'center';
}

function desiredPose(state: TrackingState): number {
  if (state.grid === 5) {
    const quantize = (value: number, previous: number) =>
      Math.abs(value - previous) < 0.58 ? previous :
        Math.max(-2, previous - 1, Math.min(2, previous + 1, Math.round(value)));
    const x = quantize(state.x * 2, state.pose % 5 - 2);
    const y = quantize(state.y * 2, Math.floor(state.pose / 5) - 2);
    return (y + 2) * 5 + x + 2;
  }
  if (Math.hypot(state.x, state.y) < 0.22) return 4;
  const angle = Math.atan2(state.y, state.x);
  const previousSector = CLOCKWISE.indexOf(state.pose);
  if (previousSector !== -1) {
    const difference = angle - previousSector * SECTOR;
    const wrapped = Math.atan2(Math.sin(difference), Math.cos(difference));
    if (Math.abs(wrapped) < SECTOR / 2 + HYSTERESIS) return state.pose;
  }
  return CLOCKWISE[(Math.round(angle / SECTOR) + 8) % 8];
}

/** Advances a ref-owned tracker; no React render is needed for pointer samples. */
export function advanceTracking(
  state: TrackingState,
  target: LookTarget,
  elapsedMs: number,
  now: number,
): { pose: number; settled: boolean } {
  // Frame-rate independent damping; cap long stalls to avoid a sudden catch-up snap.
  const amount = 1 - Math.exp(-Math.min(Math.max(elapsedMs, 0), 48) / RESPONSE_MS);
  state.x += (target.x - state.x) * amount;
  state.y += (target.y - state.y) * amount;
  const close = Math.hypot(target.x - state.x, target.y - state.y) < 0.005;
  if (close) {
    state.x = target.x;
    state.y = target.y;
  }
  const next = desiredPose(state);
  if (next !== state.pose && now - state.changedAt >= MIN_POSE_MS) {
    state.pose = next;
    state.changedAt = now;
  }
  return { pose: state.pose, settled: close && state.pose === desiredPose(state) };
}
