import { GroverSimulation } from '../js/grover.js';

// Headless integration verification of game state machine and mathematical logic
console.log('--- RUNNING QUANTUM VAULT INTEGRATION TEST ---');

function assert(cond, msg) {
  if (!cond) throw new Error(`Integration check failed: ${msg}`);
}

// 1. Initial State Register
const sim = new GroverSimulation(16, 6);
assert(sim.stateCount === 16, 'State count is 16');
assert(sim.targetIndex === 6, 'Target index set to 6');
assert(sim.iterationCount === 0, 'Initial iteration count is 0');

let probs = sim.probabilities();
assert(probs.length === 16, '16 probability values');
assert(Math.abs(probs[6] - 0.0625) < 1e-6, 'Initial target probability is 6.25%');

// 2. Iteration 1
probs = sim.iterate();
assert(sim.iterationCount === 1, 'Iteration count is 1');
assert(Math.abs(probs[6] - 0.47265625) < 1e-6, `Iter 1 target prob is 47.27%, got ${probs[6]}`);
console.log(`✓ Iteration 1 target probability: ${(probs[6] * 100).toFixed(2)}%`);

// 3. Iteration 2
probs = sim.iterate();
assert(sim.iterationCount === 2, 'Iteration count is 2');
assert(Math.abs(probs[6] - 0.908447) < 1e-4, `Iter 2 target prob is ~90.84%, got ${probs[6]}`);
console.log(`✓ Iteration 2 target probability: ${(probs[6] * 100).toFixed(2)}%`);

// 4. Iteration 3 (Optimal Peak)
probs = sim.iterate();
assert(sim.iterationCount === 3, 'Iteration count is 3');
assert(Math.abs(probs[6] - 0.961319) < 1e-4, `Iter 3 target prob is ~96.13%, got ${probs[6]}`);
const eff3 = sim.calculateEfficiency(3);
assert(eff3 === 100, `Efficiency at k=3 should be 100%, got ${eff3}%`);
console.log(`✓ Iteration 3 target probability: ${(probs[6] * 100).toFixed(2)}% (PEAK, Efficiency: ${eff3}%)`);

// 5. Iteration 4 (Overshoot)
probs = sim.iterate();
assert(sim.iterationCount === 4, 'Iteration count is 4');
assert(Math.abs(probs[6] - 0.581704) < 1e-4, `Iter 4 target prob is ~58.17%, got ${probs[6]}`);
assert(probs[6] < 0.96, 'Overshoot confirmed: Iter 4 < Iter 3');
const eff4 = sim.calculateEfficiency(4);
console.log(`✓ Iteration 4 target probability: ${(probs[6] * 100).toFixed(2)}% (OVERSHOOT DROP, Efficiency: ${eff4}%)`);

// 6. Iteration 5 (Severe Collapse)
probs = sim.iterate();
assert(sim.iterationCount === 5, 'Iteration count is 5');
assert(Math.abs(probs[6] - 0.1255) < 1e-3, `Iter 5 target prob is ~12.55%, got ${probs[6]}`);
console.log(`✓ Iteration 5 target probability: ${(probs[6] * 100).toFixed(2)}% (COLLAPSE)`);

// 7. Measurement simulation
const measuredHit = sim.measure(() => 0.05); // low threshold
const measuredMiss = sim.measure(() => 0.95); // high threshold
console.log(`✓ Sampled measurements: threshold 0.05 -> node ${measuredHit}, threshold 0.95 -> node ${measuredMiss}`);

// 8. Reset simulation
sim.reset(14);
assert(sim.targetIndex === 14, 'New target set to 14');
assert(sim.iterationCount === 0, 'Iteration count reset to 0');
assert(Math.abs(sim.probabilities()[14] - 0.0625) < 1e-6, 'Reset restored 6.25%');
console.log('✓ Reset restored uniform superposition.');

console.log('--- ALL INTEGRATION CHECKS PASSED ---');
