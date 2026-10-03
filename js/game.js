import { GroverSimulation } from './grover.js';
import { GameUI } from './ui.js';
import { sound, QuantumCanvasEffect } from './effects.js';

const STATE_COUNT = 16;
const OPTIMAL_K = 3; // Theoretical optimal iterations for N=16 (~96.13%)

class QuantumVaultGame {
  constructor() {
    this.round = 1;
    this.score = 0;
    this.streak = 0;
    this.bestScore = parseInt(localStorage.getItem('qv_best_score') || '0', 10);
    this.status = 'READY';
    this.measuredIndex = null;
    this.won = false;
    this.history = [];
    this.scanningIndex = null;

    // Initialize UI
    this.ui = new GameUI({
      amplify: () => this.amplify(),
      measure: () => this.measure(),
      reset: () => this.reset(),
      playAgain: () => this.playAgain(),
      tryAgain: () => this.tryAgain(),
      toggleMute: () => sound.toggleMute()
    });

    // Background Canvas
    const bgCanvas = document.getElementById('quantumBgCanvas');
    if (bgCanvas) {
      this.effects = new QuantumCanvasEffect(bgCanvas);
    }

    this.initRound();
    this.installKeyboardControls();
  }

  initRound() {
    // Pick fresh target
    const prevTarget = this.simulation ? this.simulation.targetIndex : null;
    let target = Math.floor(Math.random() * STATE_COUNT);
    if (prevTarget !== null && target === prevTarget) {
      target = (target + 1 + Math.floor(Math.random() * (STATE_COUNT - 1))) % STATE_COUNT;
    }

    this.simulation = new GroverSimulation(STATE_COUNT, target);
    this.measuredIndex = null;
    this.won = false;
    this.status = 'READY';

    this.history = [{
      iteration: 0,
      targetProb: this.simulation.getTargetProbability(),
      highestProb: this.simulation.getHighestProbability().probability
    }];

    this.ui.hideModals();
    this.ui.setPhaseText(null);
    this.render('All states are equally likely.');
  }

  reset() {
    sound.playClick();
    this.initRound();
  }

  playAgain() {
    sound.playClick();
    this.round += 1;
    this.initRound();
  }

  tryAgain() {
    sound.playClick();
    this.round += 1;
    this.initRound();
  }

  async amplify() {
    if (this.status !== 'READY' && this.status !== 'READY_TO_MEASURE') return;

    sound.init();

    // Fast, crisp visual phase animation (~260ms Oracle + ~260ms Diffusion)
    this.status = 'AMPLIFYING';
    this.ui.setPhaseText('ORACLE PHASE');
    sound.playOracleTone();
    this.effects?.triggerPulse(0.5, 0.5, '#8b5cf6');
    this.render('Inverting phase of hidden target...');

    await new Promise((r) => setTimeout(r, 260));

    this.ui.setPhaseText('DIFFUSION PHASE');
    sound.playDiffusionChime();
    this.effects?.triggerPulse(0.5, 0.5, '#00f0ff');
    this.simulation.iterate();
    this.render('Reflecting amplitudes across the mean...');

    await new Promise((r) => setTimeout(r, 280));

    this.status = 'READY_TO_MEASURE';
    this.ui.setPhaseText(null);

    const k = this.simulation.iterationCount;
    const targetP = this.simulation.getTargetProbability();
    const highestP = this.simulation.getHighestProbability().probability;

    this.history.push({
      iteration: k,
      targetProb: targetP,
      highestProb: highestP
    });

    // Concise, beginner-friendly contextual coaching
    let guidance = '';
    if (k === 1) {
      guidance = 'The probability is concentrating.';
    } else if (k === 2 || k === OPTIMAL_K) {
      guidance = 'Good time to measure!';
    } else {
      guidance = 'You amplified too far.';
    }

    this.render(guidance);
  }

  async measure() {
    if (this.status !== 'READY' && this.status !== 'READY_TO_MEASURE') return;

    sound.init();
    this.status = 'SCANNING';
    this.ui.setPhaseText('MEASURING...');
    this.render('Sampling quantum state vector...');

    // Snappy scan strobe (~350ms)
    for (let i = 0; i < 8; i += 1) {
      this.scanningIndex = Math.floor(Math.random() * STATE_COUNT);
      sound.playScanBlip(420 + i * 40);
      this.render();
      await new Promise((r) => setTimeout(r, 45));
    }
    this.scanningIndex = null;

    // Fast collapse (~300ms)
    this.status = 'COLLAPSING';
    this.ui.setPhaseText('COLLAPSING...');
    sound.playCollapseSweep();
    this.effects?.triggerPulse(0.5, 0.5, '#65f5b4');
    this.render('Collapsing wavefunction...');

    await new Promise((r) => setTimeout(r, 300));

    // Born-rule weighted measurement resolution
    this.measuredIndex = this.simulation.measure();
    this.won = this.measuredIndex === this.simulation.targetIndex;

    const targetP = this.simulation.getTargetProbability();
    const k = this.simulation.iterationCount;
    const efficiency = this.simulation.calculateEfficiency(k);

    if (this.won) {
      this.status = 'CORE_FOUND';
      this.streak += 1;

      // Score calculation
      const probBonus = Math.round(targetP * 1000);
      const optimalBonus = k === OPTIMAL_K ? 500 : 0;
      const streakMultiplier = 1 + (this.streak - 1) * 0.25;
      const roundScore = Math.round((1000 + probBonus + optimalBonus) * streakMultiplier);
      this.score += roundScore;

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('qv_best_score', String(this.bestScore));
      }

      sound.playWinChord();
      sound.playLevelCompleteSound?.();
      this.effects?.triggerPulse(0.5, 0.5, '#10b981');

      this.render('CORE FOUND! Measurement selected the Core based on its probability.');

      setTimeout(() => {
        this.ui.showWinModal({
          score: this.score,
          roundScore,
          iterations: k,
          peakProb: `${(targetP * 100).toFixed(2)}%`,
          efficiency: `${efficiency}%`,
          streak: this.streak
        });
      }, 500);

    } else {
      this.status = 'CORE_MISSED';
      this.streak = 0;
      sound.playMissSound();
      this.effects?.triggerPulse(0.5, 0.5, '#f43f5e');

      this.render('CORE MISSED. Measurement selected a state based on its probability.');

      setTimeout(() => {
        this.ui.showMissModal({
          measuredNode: `Node ${String(this.measuredIndex + 1).padStart(2, '0')}`,
          prob: `${(targetP * 100).toFixed(2)}%`,
          iterations: k
        });
      }, 500);
    }
  }

  render(customMessage) {
    const probs = this.simulation.probabilities();
    const efficiency = this.simulation.calculateEfficiency(this.simulation.iterationCount);

    this.ui.render({
      round: this.round,
      iterations: this.simulation.iterationCount,
      score: this.score,
      streak: this.streak,
      bestScore: this.bestScore,
      efficiency,
      probabilities: probs,
      status: this.status,
      measuredIndex: this.measuredIndex,
      targetIndex: this.simulation.targetIndex,
      won: this.won,
      message: customMessage || this.lastMessage || '',
      history: this.history,
      scanningIndex: this.scanningIndex
    });

    if (customMessage) this.lastMessage = customMessage;
  }

  installKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = event.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const key = event.key.toLowerCase();
      if (key === 'a') {
        event.preventDefault();
        this.amplify();
      } else if (key === 'm') {
        event.preventDefault();
        this.measure();
      } else if (key === 'r') {
        event.preventDefault();
        this.reset();
      } else if (key === 'h') {
        event.preventDefault();
        this.ui.openReferenceModal();
      } else if (key === 'escape') {
        this.ui.closeReferenceModal();
        this.ui.hideModals();
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.quantumGame = new QuantumVaultGame();
  });
}
