/**
 * Interactive Beginner Tutorial and Quantum Theory Reference.
 * Implements the 6-step guided walkthrough required by Section 18:
 * STEP 1: All 16 possibilities start equally likely (grid highlight).
 * STEP 2: AMPLIFY reshapes probabilities using Grover's algorithm (AMPLIFY highlight).
 * STEP 3: "Try one." Wait for player to press AMPLIFY.
 * STEP 4: "Watch how the probabilities changed."
 * STEP 5: "Try another Amplify."
 * STEP 6: "Now decide when to measure."
 */

export class TutorialController {
  constructor({ onAmplifyRequest, onTutorialComplete }) {
    this.onAmplifyRequest = onAmplifyRequest;
    this.onTutorialComplete = onTutorialComplete;
    this.step = 0;
    this.isActive = false;

    this.overlay = document.getElementById('tutorialOverlay');
    this.card = document.getElementById('tutorialStepCard');
    this.stepNum = document.getElementById('tutStepNum');
    this.stepTitle = document.getElementById('tutStepTitle');
    this.stepText = document.getElementById('tutStepText');
    this.nextBtn = document.getElementById('tutNextBtn');
    this.skipBtn = document.getElementById('tutSkipBtn');
    this.actionBtn = document.getElementById('tutActionBtn');

    // Reference Modal
    this.modal = document.getElementById('referenceModal');
    this.openModalBtn = document.getElementById('tutorialButton');
    this.closeModalBtn = document.getElementById('closeModalBtn');
    this.tabButtons = document.querySelectorAll('.modal-tab-btn');
    this.tabPanes = document.querySelectorAll('.modal-tab-pane');
    this.restartTutorialBtn = document.getElementById('restartTutorialBtn');

    this.initEvents();
  }

  initEvents() {
    this.nextBtn?.addEventListener('click', () => this.nextStep());
    this.skipBtn?.addEventListener('click', () => this.endTutorial());
    this.actionBtn?.addEventListener('click', () => {
      if (this.step === 3 || this.step === 5) {
        if (this.onAmplifyRequest) this.onAmplifyRequest();
      } else {
        this.nextStep();
      }
    });

    this.openModalBtn?.addEventListener('click', () => this.openReferenceModal());
    this.closeModalBtn?.addEventListener('click', () => this.closeReferenceModal());
    this.restartTutorialBtn?.addEventListener('click', () => {
      this.closeReferenceModal();
      this.startTutorial(true);
    });

    // Modal Tabs
    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
        this.tabPanes.forEach((p) => p.classList.toggle('active', p.id === tab));
      });
    });

    // Close modal on Escape or background click
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.modal.hidden) this.closeReferenceModal();
        if (this.isActive) this.endTutorial();
      }
    });

    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeReferenceModal();
    });
  }

  checkAutoStart() {
    const seen = localStorage.getItem('quantum_vault_tutorial_seen');
    if (!seen) {
      this.startTutorial();
    }
  }

  startTutorial(force = false) {
    if (!this.overlay) return;
    this.isActive = true;
    this.step = 1;
    this.overlay.hidden = false;
    this.renderStep();
  }

  nextStep() {
    if (this.step >= 6) {
      this.endTutorial();
      return;
    }
    this.step += 1;
    this.renderStep();
  }

  onPlayerAmplified(currentIterations) {
    if (!this.isActive) return;
    if (this.step === 3 && currentIterations === 1) {
      // Transition from step 3 to step 4
      this.step = 4;
      this.renderStep();
    } else if (this.step === 5 && currentIterations >= 2) {
      // Transition from step 5 to step 6
      this.step = 6;
      this.renderStep();
    }
  }

  renderStep() {
    // Clear previous spotlight classes
    document.querySelectorAll('.tutorial-spotlight').forEach((el) => {
      el.classList.remove('tutorial-spotlight');
    });

    if (this.stepNum) this.stepNum.textContent = `STEP ${this.step} OF 6`;

    if (this.step === 1) {
      this.stepTitle.textContent = 'Equal Superposition';
      this.stepText.innerHTML = 'All 16 quantum possibilities start <strong>equally likely</strong> (6.25% each). The Quantum Core is hidden in one node, but its amplitude is completely uniform across the register.';
      const grid = document.getElementById('nodeGrid');
      grid?.classList.add('tutorial-spotlight');
      this.actionBtn.hidden = true;
      this.nextBtn.hidden = false;
      this.nextBtn.textContent = 'Next →';
    } else if (this.step === 2) {
      this.stepTitle.textContent = 'Grover Amplitude Amplification';
      this.stepText.innerHTML = 'Pressing <strong>AMPLIFY</strong> performs one full Grover cycle: <em>Oracle (π-phase flip)</em> followed by <em>Diffusion (inversion about mean)</em>. This constructively interferes the marked state!';
      const amp = document.getElementById('amplifyButton');
      amp?.classList.add('tutorial-spotlight');
      this.actionBtn.hidden = true;
      this.nextBtn.hidden = false;
      this.nextBtn.textContent = 'Next →';
    } else if (this.step === 3) {
      this.stepTitle.textContent = 'Try Your First Amplification';
      this.stepText.innerHTML = 'Press the glowing <strong>AMPLIFY [A]</strong> button below to run 1 iteration. Watch the probability field react!';
      const amp = document.getElementById('amplifyButton');
      amp?.classList.add('tutorial-spotlight');
      this.nextBtn.hidden = true;
      this.actionBtn.hidden = false;
      this.actionBtn.textContent = 'Execute AMPLIFY →';
    } else if (this.step === 4) {
      this.stepTitle.textContent = 'Probabilities Reshaped';
      this.stepText.innerHTML = 'Look at the grid! The target amplitude has jumped to <strong>~47.27%</strong>, while all other states dropped to ~3.5%. The live chart tracks this probability surge.';
      const graph = document.getElementById('historyCard');
      const grid = document.getElementById('nodeGrid');
      graph?.classList.add('tutorial-spotlight');
      grid?.classList.add('tutorial-spotlight');
      this.actionBtn.hidden = true;
      this.nextBtn.hidden = false;
      this.nextBtn.textContent = 'Continue →';
    } else if (this.step === 5) {
      this.stepTitle.textContent = 'Approaching The Peak';
      this.stepText.innerHTML = 'Try another <strong>AMPLIFY</strong>. For N=16, the theoretical peak occurs around <strong>3 iterations (~96.1%)</strong>.';
      const amp = document.getElementById('amplifyButton');
      amp?.classList.add('tutorial-spotlight');
      this.nextBtn.hidden = true;
      this.actionBtn.hidden = false;
      this.actionBtn.textContent = 'Execute AMPLIFY →';
    } else if (this.step === 6) {
      this.stepTitle.textContent = 'Decide When To Measure!';
      this.stepText.innerHTML = '<strong>CRITICAL:</strong> Grover rotation is periodic! If you overdo it (>3 iterations), the probability collapses back down. Stop near the peak and press <strong>MEASURE [M]</strong> to collapse the wave!';
      const measure = document.getElementById('measureButton');
      measure?.classList.add('tutorial-spotlight');
      this.actionBtn.hidden = true;
      this.nextBtn.hidden = false;
      this.nextBtn.textContent = 'Start Playing! 🚀';
    }
  }

  endTutorial() {
    this.isActive = false;
    if (this.overlay) this.overlay.hidden = true;
    document.querySelectorAll('.tutorial-spotlight').forEach((el) => {
      el.classList.remove('tutorial-spotlight');
    });
    localStorage.setItem('quantum_vault_tutorial_seen', 'true');
    if (this.onTutorialComplete) this.onTutorialComplete();
  }

  openReferenceModal() {
    if (this.modal) {
      this.modal.hidden = false;
      this.openModalBtn?.setAttribute('aria-expanded', 'true');
      this.closeModalBtn?.focus();
    }
  }

  closeReferenceModal() {
    if (this.modal) {
      this.modal.hidden = true;
      this.openModalBtn?.setAttribute('aria-expanded', 'false');
      this.openModalBtn?.focus();
    }
  }
}
