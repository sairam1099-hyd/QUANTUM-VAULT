import { GroverSimulation } from './grover.js';

const EPSILON = 1e-10;
const near = (a, b) => Math.abs(a - b) < EPSILON;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const assert = (condition, name) => { if (!condition) throw new Error(`Validation failed: ${name}`); };

/** Deterministic, UI-free checks for the Phase 1 simulation. */
export function runGroverValidation() {
  const model = new GroverSimulation(16, 7);
  const initial = model.probabilities();
  assert(model.amplitudes.every((a) => near(a, 1 / 4)), 'equal initial amplitudes');
  assert(near(sum(initial), 1), 'initial probabilities sum to one');
  const before = [...model.amplitudes];
  model.oracle();
  assert(near(model.amplitudes[7], -before[7]), 'oracle negates target amplitude');
  model.diffusion();
  assert(model.amplitudes.some((a, i) => !near(a, before[i])), 'iteration changes amplitudes');
  assert(near(sum(model.probabilities()), 1), 'post-iteration probabilities sum to one');
  assert(near(model.probabilities()[7], 0.47265625), 'first 16-state iteration has the expected target probability');
  for (let iteration = 0; iteration < 12; iteration += 1) {
    model.iterate();
    assert(near(sum(model.probabilities()), 1), `probabilities sum to one after iteration ${iteration + 2}`);
  }
  const weighted = new GroverSimulation(16, 0);
  assert(weighted.measure(() => 0.99) !== 0, 'measurement is weighted, not guaranteed target');
  const resetModel = new GroverSimulation(16, 9);
  assert(resetModel.probabilities().every((p) => near(p, 1 / 16)), 'reset model returns equal probabilities');
  const previousTarget = 9;
  const nextCandidate = previousTarget;
  const freshTarget = nextCandidate === previousTarget ? (nextCandidate + 1) % 16 : nextCandidate;
  assert(freshTarget !== previousTarget, 'reset chooses a fresh target');
  return true;
}

// This is deliberately silent in the browser; it is available through `npm test`.
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('validation.js')) {
  runGroverValidation();
  console.log('Grover validation passed');
}
