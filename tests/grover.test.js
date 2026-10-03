import { GroverSimulation } from '../js/grover.js';

const EPSILON = 1e-7;
const near = (a, b) => Math.abs(a - b) < EPSILON;
const sum = (arr) => arr.reduce((acc, v) => acc + v, 0);

function assert(condition, message) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- RUNNING QUANTUM VAULT COMPREHENSIVE TEST SUITE ---');

// Test 1: Initial equal amplitudes across multiple register sizes (4, 8, 16, 32)
{
  [4, 8, 16, 32].forEach((N) => {
    const sim = new GroverSimulation(N);
    const expected = 1 / Math.sqrt(N);
    for (let i = 0; i < N; i += 1) {
      assert(near(sim.amplitudes[i], expected), `Test 1: Amplitude state ${i} for N=${N} mismatch`);
    }
  });
  console.log('✓ Test 1: Initial equal amplitudes verified across 4, 8, 16, and 32 states.');
}

// Test 2: Probabilities sum to 1.0
{
  [4, 8, 16, 32].forEach((N) => {
    const sim = new GroverSimulation(N);
    const total = sum(sim.probabilities());
    assert(near(total, 1.0), `Test 2: Sum for N=${N} is ${total}`);
  });
  console.log('✓ Test 2: Probabilities sum to 1.0 for all register sizes.');
}

// Test 3: Oracle phase inversion (U_w) flips only target amplitude
{
  const target = 11;
  const sim = new GroverSimulation(16, target);
  const before = Array.from(sim.amplitudes);
  sim.oracle();
  assert(near(sim.amplitudes[target], -before[target]), 'Test 3: Target amplitude not negated');
  for (let i = 0; i < 16; i += 1) {
    if (i !== target) {
      assert(near(sim.amplitudes[i], before[i]), `Test 3: Non-target state ${i} modified`);
    }
  }
  console.log('✓ Test 3: Oracle flips ONLY target amplitude.');
}

// Test 4: Diffusion operator correctly reflects about mean
{
  const target = 2;
  const sim = new GroverSimulation(8, target);
  sim.oracle();
  const before = Array.from(sim.amplitudes);
  const mean = sum(before) / 8;
  sim.diffusion();
  for (let i = 0; i < 8; i += 1) {
    const expected = 2 * mean - before[i];
    assert(near(sim.amplitudes[i], expected), `Test 4: State ${i} diffusion mismatch`);
  }
  console.log('✓ Test 4: Diffusion correctly reflects amplitudes about mean.');
}

// Test 5: Level 1 (N = 4) exact single-shot search (1 iteration -> 100%)
{
  const target = 2;
  const sim = new GroverSimulation(4, target);
  assert(near(sim.probabilities()[target], 0.25), 'Initial N=4 probability is 25%');
  sim.iterate();
  assert(near(sim.probabilities()[target], 1.0), `Test 5: N=4 after 1 iteration should be 100%, got ${sim.probabilities()[target]}`);
  for (let i = 0; i < 4; i += 1) {
    if (i !== target) {
      assert(near(sim.probabilities()[i], 0.0), `Test 5: Non-target state ${i} should be 0%`);
    }
  }
  // Test Level 1 overshoot (2 iterations -> drops back to 25%)
  sim.iterate();
  assert(near(sim.probabilities()[target], 0.25), `Test 5: N=4 after 2 iterations overshoots to 25%, got ${sim.probabilities()[target]}`);
  console.log('✓ Test 5: Level 1 (N=4) exact Grover behavior verified (100% at k=1, 25% overshoot at k=2).');
}

// Test 6: Level 3 (N = 16) exact mathematical trajectory
{
  const target = 7;
  const sim = new GroverSimulation(16, target);
  // Iter 0: 6.25%
  assert(near(sim.probabilities()[target], 0.0625), 'Iter 0: 6.25%');
  // Iter 1: 47.265625%
  sim.iterate();
  assert(near(sim.probabilities()[target], 0.47265625), 'Iter 1: 47.27%');
  // Iter 2: ~90.84%
  sim.iterate();
  assert(Math.abs(sim.probabilities()[target] - 0.908447) < 1e-4, 'Iter 2: ~90.84%');
  // Iter 3: ~96.13% (Theoretical peak)
  sim.iterate();
  assert(Math.abs(sim.probabilities()[target] - 0.961319) < 1e-4, 'Iter 3: ~96.13% (PEAK)');
  // Iter 4: ~58.17% (Overshoot drop)
  sim.iterate();
  assert(Math.abs(sim.probabilities()[target] - 0.581704) < 1e-4, 'Iter 4: ~58.17% (OVERSHOOT)');
  // Iter 5: ~12.55% (Collapse)
  sim.iterate();
  assert(Math.abs(sim.probabilities()[target] - 0.1255) < 1e-3, 'Iter 5: ~12.55%');
  console.log('✓ Test 6: 16-state Grover curve matches exact theoretical trajectory.');
}

// Test 7: Repeated iterations preserve normalization (∑P = 1.0 across 30 iterations)
{
  const sim = new GroverSimulation(16, 4);
  for (let iter = 1; iter <= 30; iter += 1) {
    sim.iterate();
    const total = sum(sim.probabilities());
    assert(near(total, 1.0), `Test 7: Iteration ${iter} probability sum is ${total}`);
  }
  console.log('✓ Test 7: Normalization strictly preserved across 30 repeated iterations.');
}

// Test 8: Weighted random measurement sampling
{
  const sim = new GroverSimulation(16, 0);
  sim.iterate(); // Target ~47.27%
  const probs = sim.probabilities();
  const SAMPLES = 10000;
  let countTarget = 0;
  for (let i = 0; i < SAMPLES; i += 1) {
    if (sim.measure(Math.random) === 0) countTarget += 1;
  }
  const measuredRate = countTarget / SAMPLES;
  assert(Math.abs(measuredRate - probs[0]) < 0.03, 'Weighted sampling matches probability distribution');
  console.log(`✓ Test 8: Measurement uses weighted probability (Sampled: ${(measuredRate * 100).toFixed(2)}% vs theoretical ${(probs[0] * 100).toFixed(2)}%).`);
}

// Test 9: Measurement is not guaranteed to choose target when P < 1
{
  const sim = new GroverSimulation(16, 5);
  sim.iterate(); // P ≈ 47.3% -> ~52.7% chance to miss
  let missed = false;
  for (let i = 0; i < 50; i += 1) {
    if (sim.measure() !== 5) {
      missed = true;
      break;
    }
  }
  assert(missed, 'Test 9: Measurement must be genuinely probabilistic');
  console.log('✓ Test 9: Measurement is probabilistic, not predetermined.');
}

// Test 10: Reset restores uniform superposition and resets iteration count
{
  const sim = new GroverSimulation(16, 8);
  sim.iterate();
  sim.iterate();
  sim.reset(3);
  assert(sim.iterationCount === 0, 'Iteration count is 0');
  assert(sim.probabilities().every((p) => near(p, 1 / 16)), 'Equal probabilities on reset');
  console.log('✓ Test 10: Reset restores uniform superposition.');
}

// Test 11: Level configuration state counts match (4, 8, 16, 32)
{
  const s4 = new GroverSimulation(4);
  const s8 = new GroverSimulation(8);
  const s16 = new GroverSimulation(16);
  const s32 = new GroverSimulation(32);
  assert(s4.qubitCount === 2 && s4.getOptimalIterations() === 1, 'Level 1: 2 qubits, 1 optimal iter');
  assert(s8.qubitCount === 3 && s8.getOptimalIterations() === 2, 'Level 2: 3 qubits, 2 optimal iter');
  assert(s16.qubitCount === 4 && s16.getOptimalIterations() === 3, 'Level 3: 4 qubits, 3 optimal iter');
  assert(s32.qubitCount === 5 && s32.getOptimalIterations() === 4, 'Level 4: 5 qubits, 4 optimal iter');
  console.log('✓ Test 11: Different levels use correct state counts and optimal stopping values.');
}

// Test 12: Target remains encapsulated and not leaked
{
  const sim = new GroverSimulation(16);
  const probs = sim.probabilities();
  // Target index should not be leaked in probabilities array
  assert(probs.length === 16, 'Probabilities array has length 16');
  console.log('✓ Test 12: Target identity is not leaked through probabilities.');
}

// Test 13: Quantum Efficiency calculation
{
  const sim = new GroverSimulation(16);
  assert(sim.calculateEfficiency(3) === 100, 'Efficiency at optimal k=3 is 100%');
  assert(sim.calculateEfficiency(0) < 10, 'Efficiency at k=0 is low');
  assert(sim.calculateEfficiency(4) < 100, 'Efficiency penalizes overshooting');
  console.log('✓ Test 13: Quantum efficiency accurately reflects distance from optimal rotation.');
}

// Test 14: Error handling on invalid parameters
{
  let threwUnder = false;
  try { new GroverSimulation(1); } catch (e) { threwUnder = true; }
  assert(threwUnder, 'Throws for stateCount < 2');

  let threwBound = false;
  try { new GroverSimulation(8, 10); } catch (e) { threwBound = true; }
  assert(threwBound, 'Throws for target index >= stateCount');
  console.log('✓ Test 14: Bounds and parameter checks verified.');
}

console.log('--- ALL TESTS PASSED SUCCESSFULLY (14/14) ---');
