# QUANTUM VAULT

> **Quriosity 2026 — ISAQC at IIIT Hyderabad**  
> **Quantum Concept Category: OPTION 04 — Amplitude Amplification / Grover Search**

---

## 🌌 Overview

**Quantum Vault** is an interactive, mathematically authentic quantum game demonstrating **Grover's Search Algorithm** and **Wavefunction Collapse**.

Within 10 seconds of opening the game, any player understands the objective:
> **FIND THE HIDDEN QUANTUM CORE**  
> **AMPLIFY ➔ WATCH ➔ MEASURE**  
> Amplify increases the hidden Core's probability. Measure to try to find it!

---

## ⚡ The Core Quantum Mechanic: The Overshoot Dilemma

Grover search is a **periodic geometric rotation** in a two-dimensional Hilbert subspace, NOT a monotonic increase:
$$P_{\text{target}}(k) = \sin^2((2k + 1)\theta) \quad \text{where} \quad \theta = \arcsin\left(\frac{1}{\sqrt{N}}\right)$$

For $N = 16$ states ($4$ qubits, $|0000\rangle$ to $|1111\rangle$), with $\theta = \arcsin(0.25) \approx 14.48^\circ$:
* **Iteration 0:** $6.25\%$ (Uniform superposition)
* **Iteration 1:** $47.27\%$ (Constructive interference begins)
* **Iteration 2:** $90.84\%$ (High concentration)
* **Iteration 3:** $\mathbf{96.13\%}$ (**Theoretical Optimal Peak**)
* **Iteration 4:** $\mathbf{58.17\%}$ (**Overshoot drop!** State vector rotated past target axis)
* **Iteration 5:** $12.55\%$ (Destructive collapse)

The player directly learns through gameplay that **"more Amplify is not always better."**

---

## 🎯 Gameplay Features

1. **Focused 16-Node Register:** The 4×4 grid of superposed states ($|0000\rangle$ to $|1111\rangle$) serves as the centerpiece.
2. **Contextual Coaching:**
   * *Start:* "All states are equally likely."
   * *After Amplify:* "The probability is concentrating."
   * *Near peak:* "Good time to measure!"
   * *After overshoot:* "You amplified too far."
   * *After win:* "CORE FOUND! Measurement selected the Core based on its probability."
   * *After miss:* "CORE MISSED. Measurement selected a state based on its probability."
3. **Scoring, Streak & Efficiency:**
   * Round score based on successful detection and probability concentration.
   * Win Streak tracks consecutive successful Core finds.
   * Efficiency scores how close the player measured to the theoretical optimal peak ($k=3$).
4. **Weighted Measurement:**
   Measurement performs genuine Born-rule weighted sampling. If a state has $90.84\%$ probability, it has a $90.84\%$ chance of collapsing to that state, and a $9.16\%$ chance of collapsing to another state.
5. **No Target Leakage:**
   The hidden target is strictly encapsulated. Zero DOM attributes, classes, or coordinates leak its identity prior to measurement.

---

## 🚀 How to Run Locally

The game runs 100% client-side with zero external runtime dependencies:

### Python Server (Already running on port 4173):
```bash
python -m http.server 4173 --directory c:\Quantum-Vault
```
Open **`http://localhost:4173/index.html`** in your browser.

---

## 🧪 Automated Testing

Run the automated test suite verifying all 14 core mathematical properties:
```bash
npm test
```

### Verified Test Cases:
1. Equal initial amplitudes across register sizes ($a_i = 1/\sqrt{N}$).
2. Probability sum normalization ($\sum P_i = 1.0$).
3. Phase Oracle flips ONLY target amplitude.
4. Diffusion operator reflects amplitudes about the mean ($a'_i = 2\mu - a_i$).
5. Level 1 ($N=4$) single-shot search ($100\%$ at $k=1$, $25\%$ overshoot at $k=2$).
6. 16-state Grover curve matches exact theoretical trajectory ($k=3 \to 96.13\%$, $k=4 \to 58.17\%$).
7. Normalization strictly preserved across 30 repeated iterations.
8. Measurement uses weighted probability (Born rule).
9. Measurement is probabilistic, not deterministic.
10. Reset restores uniform superposition.
11. Multi-level configuration and optimal stopping values.
12. Target encapsulation and zero DOM leakage.
13. Quantum efficiency calculation.
14. Bounds and parameter validation.

---

## 🎮 Game Controls

| Key | Control | Action |
|:---:|:---:|:---|
| <kbd>A</kbd> | **AMPLIFY ⚡** | Runs 1 Grover iteration (Oracle + Diffusion). |
| <kbd>M</kbd> | **MEASURE ◉** | Executes wavefunction collapse via Born-rule sampling. |
| <kbd>R</kbd> | **RESET ↺** | Restarts round with a fresh hidden target. |
| <kbd>H</kbd> | **HOW TO PLAY ?** | Opens the manual and quantum theory documentation. |
| <kbd>Esc</kbd>| **CLOSE** | Closes any active modal dialog. |
