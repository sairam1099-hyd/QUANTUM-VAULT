const percent = (probability) => `${(probability * 100).toFixed(2)}%`;

export class GameUI {
  constructor(actions) {
    this.actions = actions;

    // HUD Elements
    this.roundValue = document.querySelector('#roundValue');
    this.iterationValue = document.querySelector('#iterationValue');
    this.scoreValue = document.querySelector('#scoreValue');
    this.streakValue = document.querySelector('#streakValue');
    this.bestScoreValue = document.querySelector('#bestScoreValue');
    this.efficiencyValue = document.querySelector('#efficiencyValue');
    this.highestProbabilityValue = document.querySelector('#highestProbabilityValue');
    this.highestStateValue = document.querySelector('#highestStateValue');

    // Main Interactive Elements
    this.grid = document.querySelector('#nodeGrid');
    this.message = document.querySelector('#message');
    this.phaseIndicator = document.querySelector('#phaseIndicator');
    this.amplifyButton = document.querySelector('#amplifyButton');
    this.measureButton = document.querySelector('#measureButton');
    this.resetButton = document.querySelector('#resetButton');
    this.muteButton = document.querySelector('#muteButton');
    this.historyCanvas = document.querySelector('#historyCanvas');

    // Outcome Modals
    this.winModal = document.querySelector('#winModal');
    this.missModal = document.querySelector('#missModal');
    this.winDetails = document.querySelector('#winDetails');
    this.missDetails = document.querySelector('#missDetails');
    this.playAgainBtn = document.querySelector('#playAgainBtn');
    this.tryAgainBtn = document.querySelector('#tryAgainBtn');

    // Reference Modal
    this.referenceModal = document.querySelector('#referenceModal');
    this.openModalBtn = document.querySelector('#tutorialButton');
    this.closeModalBtn = document.querySelector('#closeModalBtn');
    this.tabButtons = document.querySelectorAll('.modal-tab-btn');
    this.tabPanes = document.querySelectorAll('.modal-tab-pane');

    if (this.historyCanvas) {
      this.chartCtx = this.historyCanvas.getContext('2d');
    }

    this.bindEvents();
  }

  bindEvents() {
    this.amplifyButton?.addEventListener('click', this.actions.amplify);
    this.measureButton?.addEventListener('click', this.actions.measure);
    this.resetButton?.addEventListener('click', this.actions.reset);
    this.playAgainBtn?.addEventListener('click', this.actions.playAgain);
    this.tryAgainBtn?.addEventListener('click', this.actions.tryAgain);

    this.muteButton?.addEventListener('click', () => {
      const isMuted = this.actions.toggleMute();
      this.muteButton.textContent = isMuted ? '🔇 MUTED' : '🔊 AUDIO';
      this.muteButton.classList.toggle('muted', isMuted);
    });

    this.openModalBtn?.addEventListener('click', () => this.openReferenceModal());
    this.closeModalBtn?.addEventListener('click', () => this.closeReferenceModal());

    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.tabButtons.forEach((b) => b.classList.toggle('active', b === btn));
        this.tabPanes.forEach((p) => p.classList.toggle('active', p.id === tab));
      });
    });

    this.referenceModal?.addEventListener('click', (e) => {
      if (e.target === this.referenceModal) this.closeReferenceModal();
    });

    window.addEventListener('resize', () => {
      if (this.lastHistory) this.drawHistoryChart(this.lastHistory);
    });
  }

  setPhaseText(phaseName) {
    if (!this.phaseIndicator) return;
    if (!phaseName) {
      this.phaseIndicator.textContent = 'STANDBY';
      this.phaseIndicator.className = 'phase-indicator idle';
    } else {
      this.phaseIndicator.textContent = phaseName;
      this.phaseIndicator.className = 'phase-indicator active';
    }
  }

  render({
    round,
    iterations,
    score,
    streak,
    bestScore,
    efficiency,
    probabilities,
    status,
    measuredIndex,
    targetIndex,
    won,
    message,
    history,
    scanningIndex
  }) {
    this.lastHistory = history;

    // Update HUD Metrics
    if (this.roundValue) this.roundValue.textContent = round;
    if (this.iterationValue) this.iterationValue.textContent = iterations;
    if (this.scoreValue) this.scoreValue.textContent = score;
    if (this.streakValue) this.streakValue.textContent = streak;
    if (this.bestScoreValue) this.bestScoreValue.textContent = bestScore;
    if (this.efficiencyValue) this.efficiencyValue.textContent = `${efficiency}%`;

    // Strongest Node Information (Without revealing target!)
    const highest = Math.max(...probabilities);
    const highestIndices = probabilities.reduce(
      (all, p, i) => (Math.abs(p - highest) < 1e-9 ? [...all, i] : all),
      []
    );
    if (this.highestProbabilityValue) {
      this.highestProbabilityValue.textContent = percent(highest);
    }
    if (this.highestStateValue) {
      if (highestIndices.length === probabilities.length) {
        this.highestStateValue.textContent = 'All states tied';
      } else {
        const nodeStr = `Node ${String(highestIndices[0] + 1).padStart(2, '0')}`;
        this.highestStateValue.textContent = highestIndices.length === 1 ? `Leader: ${nodeStr}` : `${highestIndices.length} dominant states`;
      }
    }

    if (this.message) {
      this.message.textContent = message;
    }

    // Button states
    const isBusy = status === 'AMPLIFYING' || status === 'SCANNING' || status === 'COLLAPSING';
    const isFinished = status === 'CORE_FOUND' || status === 'CORE_MISSED';

    if (this.amplifyButton) this.amplifyButton.disabled = isBusy || isFinished;
    if (this.measureButton) this.measureButton.disabled = isBusy || isFinished;

    // Render 16 Quantum Nodes in 4x4 Grid
    if (this.grid) {
      this.grid.replaceChildren(
        ...probabilities.map((prob, idx) =>
          this.createNodeElement(idx, prob, highestIndices, measuredIndex, targetIndex, isFinished, won, scanningIndex)
        )
      );
    }

    // Draw Live Trajectory Chart
    this.drawHistoryChart(history);
  }

  createNodeElement(index, probability, highestIndices, measuredIndex, targetIndex, isFinished, won, scanningIndex) {
    const node = document.createElement('article');
    node.setAttribute('role', 'listitem');
    node.setAttribute('tabindex', '0');

    // 4-qubit binary string |0000> to |1111>
    const binaryKet = `|${index.toString(2).padStart(4, '0')}⟩`;
    const label = `NODE ${String(index + 1).padStart(2, '0')}`;

    const isMeasured = index === measuredIndex;
    const isActualTarget = isFinished && index === targetIndex;
    const isScanningActive = index === scanningIndex;
    const isDominant = highestIndices.includes(index) && highestIndices.length < 16;

    let stateClass = '';
    if (isMeasured) {
      stateClass = won ? ' node-win' : ' node-miss';
    } else if (isActualTarget && !won) {
      stateClass = ' node-was-target';
    } else if (isScanningActive) {
      stateClass = ' node-scanning';
    } else if (isDominant && probability > 0.35) {
      stateClass = ' node-dominant';
    }

    node.className = `quantum-node${stateClass}`;
    node.setAttribute('aria-label', `${label} (${binaryKet}): probability ${percent(probability)}`);

    // Subtle glow intensity based on probability
    const intensity = Math.min(1, Math.max(0, probability));
    const glowPx = Math.round(6 + intensity * 40);
    const glowAlpha = (0.12 + intensity * 0.55).toFixed(2);

    if (!isMeasured && !isActualTarget) {
      node.style.boxShadow = `0 0 ${glowPx}px rgba(0, 240, 255, ${glowAlpha})`;
      if (intensity > 0.4) {
        node.style.borderColor = `rgba(0, 240, 255, ${0.4 + intensity * 0.6})`;
      }
    }

    // Radial gauge stroke calculation
    const circumference = 113.1;
    const strokeDash = (probability * circumference).toFixed(1);

    let badgeHtml = '';
    if (isMeasured) {
      badgeHtml = `<span class="node-badge ${won ? 'badge-win' : 'badge-miss'}">${won ? '★ CORE FOUND' : '✕ COLLAPSED'}</span>`;
    } else if (isActualTarget && !won) {
      badgeHtml = `<span class="node-badge badge-target">CORE WAS HERE</span>`;
    } else if (isDominant && probability > 0.4) {
      badgeHtml = `<span class="node-badge badge-strongest">STRONGEST</span>`;
    }

    node.innerHTML = `
      <div class="node-header">
        <span class="node-num">${label}</span>
        <span class="node-ket">${binaryKet}</span>
      </div>
      <div class="node-center-gauge">
        <svg class="radial-ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle class="ring-bg" cx="22" cy="22" r="18" />
          <circle class="ring-fg" cx="22" cy="22" r="18"
            style="stroke-dasharray: ${strokeDash} ${circumference}" />
        </svg>
        <div class="core-orb" style="transform: scale(${0.7 + intensity * 0.7}); opacity: ${0.4 + intensity * 0.6};"></div>
      </div>
      <strong class="node-probability">${percent(probability)}</strong>
      ${badgeHtml}
      <div class="node-bottom-track" aria-hidden="true">
        <div class="node-bottom-fill" style="width: ${Math.min(100, probability * 100)}%"></div>
      </div>
    `;

    return node;
  }

  drawHistoryChart(history) {
    if (!this.historyCanvas || !this.chartCtx) return;
    const canvas = this.historyCanvas;
    const ctx = this.chartCtx;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const padLeft = 44;
    const padRight = 20;
    const padTop = 24;
    const padBottom = 26;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    if (plotW <= 0 || plotH <= 0) return;

    // Background horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let p = 0; p <= 1; p += 0.25) {
      const y = padTop + plotH - p * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(p * 100)}%`, padLeft - 6, y + 3);
    }

    // X-axis ticks (0 to 6 iterations)
    const maxK = 6;
    ctx.textAlign = 'center';
    for (let k = 0; k <= maxK; k += 1) {
      const x = padLeft + (k / maxK) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
      ctx.fillText(`k=${k}`, x, padTop + plotH + 15);
    }

    // Highlight Optimal Peak Zone (k=3 for N=16)
    const peakX = padLeft + (3 / maxK) * plotW;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.fillRect(peakX - plotW / (maxK * 2), padTop, plotW / maxK, plotH);
    ctx.fillStyle = '#10b981';
    ctx.font = '9px Inter, sans-serif';
    ctx.fillText('PEAK (k=3)', peakX, padTop - 8);

    // Theoretical Grover Curve for N=16: sin²((2k+1)θ) where θ = arcsin(1/4)
    const theta = Math.asin(1 / 4);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    for (let px = 0; px <= plotW; px += 2) {
      const kVal = (px / plotW) * maxK;
      const angle = (2 * kVal + 1) * theta;
      const prob = Math.sin(angle) * Math.sin(angle);
      const y = padTop + plotH - prob * plotH;
      if (px === 0) ctx.moveTo(padLeft + px, y);
      else ctx.lineTo(padLeft + px, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual Player Path
    if (!history || history.length === 0) return;

    ctx.beginPath();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    history.forEach((pt, i) => {
      const x = padLeft + (Math.min(maxK, pt.iteration) / maxK) * plotW;
      const y = padTop + plotH - pt.targetProb * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Data points
    history.forEach((pt, i) => {
      const x = padLeft + (Math.min(maxK, pt.iteration) / maxK) * plotW;
      const y = padTop + plotH - pt.targetProb * plotH;
      const isLatest = i === history.length - 1;

      if (isLatest) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, y, isLatest ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isLatest ? '#ffffff' : '#00f0ff';
      ctx.fill();
      ctx.strokeStyle = '#0b1120';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  showWinModal(stats) {
    if (!this.winModal) return;
    if (this.winDetails) {
      this.winDetails.innerHTML = `
        <div class="result-stats-grid">
          <div class="stat-box"><span>SCORE EARNED</span><strong>+${stats.roundScore}</strong></div>
          <div class="stat-box"><span>TOTAL SCORE</span><strong>${stats.score}</strong></div>
          <div class="stat-box"><span>ITERATIONS USED</span><strong>${stats.iterations}</strong></div>
          <div class="stat-box"><span>PEAK PROBABILITY</span><strong>${stats.peakProb}</strong></div>
          <div class="stat-box"><span>EFFICIENCY</span><strong>${stats.efficiency}</strong></div>
          <div class="stat-box"><span>WIN STREAK</span><strong>${stats.streak}</strong></div>
        </div>
      `;
    }
    this.winModal.hidden = false;
    this.playAgainBtn?.focus();
  }

  showMissModal(stats) {
    if (!this.missModal) return;
    if (this.missDetails) {
      this.missDetails.innerHTML = `
        <div class="result-stats-grid">
          <div class="stat-box"><span>MEASURED NODE</span><strong>${stats.measuredNode}</strong></div>
          <div class="stat-box"><span>TARGET PROBABILITY WAS</span><strong>${stats.prob}</strong></div>
          <div class="stat-box"><span>ITERATIONS</span><strong>${stats.iterations}</strong></div>
          <div class="stat-box"><span>STREAK</span><strong>0 (Reset)</strong></div>
        </div>
        <p class="miss-explainer">Measurement is probabilistic. Even with high amplitude, non-target states still retain a chance of collapsing!</p>
      `;
    }
    this.missModal.hidden = false;
    this.tryAgainBtn?.focus();
  }

  hideModals() {
    if (this.winModal) this.winModal.hidden = true;
    if (this.missModal) this.missModal.hidden = true;
  }

  openReferenceModal() {
    if (this.referenceModal) {
      this.referenceModal.hidden = false;
      this.closeModalBtn?.focus();
    }
  }

  closeReferenceModal() {
    if (this.referenceModal) {
      this.referenceModal.hidden = true;
      this.openModalBtn?.focus();
    }
  }
}
