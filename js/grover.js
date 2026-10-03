/**
 * Mathematical model for Grover's Amplitude Amplification Algorithm.
 * Decoupled from DOM and UI rendering.
 * Fully supports arbitrary N-state quantum registers (e.g. 4, 8, 16, 32).
 */
export class GroverSimulation {
  /**
   * @param {number} stateCount - Number of quantum states (e.g., 4, 8, 16, 32).
   * @param {number|null} targetIndex - Index of the marked state. If null, chosen at random.
   */
  constructor(stateCount = 16, targetIndex = null) {
    if (!Number.isInteger(stateCount) || stateCount < 2) {
      throw new Error('A search space requires at least two states.');
    }
    this.stateCount = stateCount;
    this.qubitCount = Math.round(Math.log2(stateCount));
    this.reset(targetIndex);
  }

  /**
   * Resets simulation state register to uniform superposition:
   * |ψ₀⟩ = 1/√N ∑ |x⟩
   * @param {number|null} targetIndex 
   */
  reset(targetIndex = null) {
    if (targetIndex !== null) {
      if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= this.stateCount) {
        throw new Error('Target index is outside the state register bounds.');
      }
      this.targetIndex = targetIndex;
    } else {
      this.targetIndex = Math.floor(Math.random() * this.stateCount);
    }

    const initialAmplitude = 1 / Math.sqrt(this.stateCount);
    this.amplitudes = new Float64Array(this.stateCount).fill(initialAmplitude);
    this.iterationCount = 0;
  }

  /**
   * Phase Inversion Oracle (U_w):
   * Inverts the phase of the marked target state:
   * |x⟩ -> -|x⟩ if x = target, else |x⟩ -> |x⟩.
   */
  oracle() {
    this.amplitudes[this.targetIndex] = -this.amplitudes[this.targetIndex];
  }

  /**
   * Grover Diffusion Operator (2|s⟩⟨s| - I):
   * Inversion about the mean amplitude.
   * μ = (1/N) ∑ a_i
   * a'_i = 2μ - a_i
   */
  diffusion() {
    let sum = 0;
    for (let i = 0; i < this.stateCount; i += 1) {
      sum += this.amplitudes[i];
    }
    const mean = sum / this.stateCount;
    for (let i = 0; i < this.stateCount; i += 1) {
      this.amplitudes[i] = 2 * mean - this.amplitudes[i];
    }
  }

  /**
   * Executes one full Grover iteration: Oracle followed by Diffusion.
   * @returns {number[]} Normalized probabilities after this iteration.
   */
  iterate() {
    this.oracle();
    this.diffusion();
    this.iterationCount += 1;
    return this.probabilities();
  }

  /**
   * Calculates Born rule probabilities: P_i = |a_i|²
   * Normalized to guarantee ∑ P_i = 1.0 despite floating-point rounding.
   * @returns {number[]} Array of probabilities for each state.
   */
  probabilities() {
    const raw = new Array(this.stateCount);
    let total = 0;
    for (let i = 0; i < this.stateCount; i += 1) {
      const p = this.amplitudes[i] * this.amplitudes[i];
      raw[i] = p;
      total += p;
    }
    if (total === 0) {
      return new Array(this.stateCount).fill(1 / this.stateCount);
    }
    const normalized = new Array(this.stateCount);
    for (let i = 0; i < this.stateCount; i += 1) {
      normalized[i] = raw[i] / total;
    }
    return normalized;
  }

  /**
   * Returns current probability of the hidden target state.
   */
  getTargetProbability() {
    const probs = this.probabilities();
    return probs[this.targetIndex];
  }

  /**
   * Returns the maximum probability across all states and the list of dominant indices.
   */
  getHighestProbability() {
    const probs = this.probabilities();
    let max = -1;
    for (let i = 0; i < probs.length; i += 1) {
      if (probs[i] > max) max = probs[i];
    }
    const indices = [];
    for (let i = 0; i < probs.length; i += 1) {
      if (Math.abs(probs[i] - max) < 1e-9) {
        indices.push(i);
      }
    }
    return { probability: max, indices };
  }

  /**
   * Performs a quantum projective measurement via weighted random sampling (Born rule).
   * @param {() => number} rng - Random number generator returning [0, 1).
   * @returns {number} The measured state index.
   */
  measure(rng = Math.random) {
    const probs = this.probabilities();
    let threshold = rng();
    for (let i = 0; i < probs.length; i += 1) {
      threshold -= probs[i];
      if (threshold <= 0 || i === probs.length - 1) {
        return i;
      }
    }
    return probs.length - 1;
  }

  /**
   * Theoretical optimal iterations for N items:
   * Exact: k_opt = round(π / (4 * θ) - 0.5) where θ = arcsin(1 / √N)
   * For N=4  -> 1 iteration (100% peak!)
   * For N=8  -> 2 iterations (~94.5% peak)
   * For N=16 -> 3 iterations (~96.1% peak)
   * For N=32 -> 4 iterations (~99.9% peak)
   */
  getOptimalIterations() {
    const theta = Math.asin(1 / Math.sqrt(this.stateCount));
    return Math.max(1, Math.round(Math.PI / (4 * theta) - 0.5));
  }

  /**
   * Theoretical target probability after k iterations:
   * P(k) = sin²((2k + 1) * θ) where sin(θ) = 1 / √N
   */
  theoreticalProbability(k) {
    const theta = Math.asin(1 / Math.sqrt(this.stateCount));
    const angle = (2 * k + 1) * theta;
    const s = Math.sin(angle);
    return s * s;
  }

  /**
   * Calculates quantum efficiency percentage based on how close the measurement was
   * to the peak probability region.
   */
  calculateEfficiency(k = this.iterationCount) {
    const currentTargetP = this.theoreticalProbability(k);
    const optimalP = this.theoreticalProbability(this.getOptimalIterations());
    const ratio = Math.min(1, Math.max(0, currentTargetP / optimalP));
    return Math.round(ratio * 100);
  }
}
