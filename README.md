# ⚛️ Quantum Vault

### A quantum-powered search game based on Grover's Algorithm

> **Find the hidden Quantum Core before you amplify too far.**

**Quantum Vault** is an interactive browser game that turns **Grover's quantum search algorithm** into a playable challenge.

You are given a set of possible quantum states. One state secretly contains the **Quantum Core**.

Your job is simple:

**AMPLIFY → WATCH → MEASURE**

Use Grover amplification to increase the probability of the hidden Core, then choose the right moment to perform a quantum measurement.

But be careful...

**Too many amplifications can make the probability fall again.**

---

## 🎮 How to Play

### Your Goal

Find the hidden **Quantum Core**.

At the beginning, all possible states have an equal probability.

### Step 1 — AMPLIFY ⚡

Press **AMPLIFY** to perform one Grover iteration.

The game performs:

```text
Oracle
   ↓
Diffusion
   ↓
Amplitude Amplification
```

The probability distribution changes after every iteration.

---

### Step 2 — WATCH 👀

Watch the probability bars and see where the probability becomes concentrated.

The hidden Core is **not directly revealed**.

You have to decide when the probability is strong enough.

---

### Step 3 — MEASURE 🎯

Press **MEASURE** when you think the time is right.

The game performs a **probability-weighted measurement**.

The highest-probability state is more likely to be selected, but it is **not guaranteed**.

### If the hidden Core is selected:

🟢 **CORE FOUND**

You win.

### If another state is selected:

🔴 **CORE MISSED**

Try again.

---

## 🧠 The Quantum Idea

Quantum Vault is based on **Grover's Search Algorithm**.

In a classical search, you may need to check possible answers one by one.

Grover's algorithm uses **amplitude amplification** to increase the probability of a marked solution before measurement.

The game turns that idea into a decision:

> **How many times should I amplify before I measure?**

That's the main gameplay mechanic.

---

## ⚡ Why More Amplification Isn't Always Better

This is one of the important ideas demonstrated by the game.

For the 16-state example, the target probability follows an oscillating pattern:

| Grover Iteration | Approx. Target Probability |
| ---------------: | -------------------------: |
|                0 |                      6.25% |
|                1 |                     47.27% |
|                2 |                     90.84% |
|                3 |                     96.13% |
|                4 |                     58.17% |
|                5 |                     12.55% |

So the player cannot simply keep pressing **AMPLIFY** forever.

The probability rises toward an optimal point and can then fall again.

This creates the main gameplay decision:

> **When should I stop amplifying and measure?**

---

## 🔬 What Happens During AMPLIFY?

Each amplification performs a Grover iteration.

### 1. Oracle

The hidden solution is internally marked by changing its phase.

The target is **not revealed to the player**.

### 2. Diffusion

The diffusion operation amplifies the marked state's amplitude relative to the others.

### 3. Probability Update

The game calculates:

```text
Probability = |Amplitude|²
```

The updated probabilities are then displayed visually.

---

## 🎯 What Happens During MEASURE?

Measurement samples one state according to the current probability distribution.

For example:

```text
State A → 90%
State B → 5%
State C → 5%
```

State A is much more likely to be selected, but the game does **not** simply choose A automatically.

This models the probabilistic nature of quantum measurement.

---

## 🎮 Game Features

* ⚛️ Real Grover Search mathematics
* 🔬 Oracle + diffusion operations
* 📊 Live probability visualization
* 🎯 Hidden Quantum Core
* 🎲 Probability-weighted measurement
* 📈 Grover probability oscillation
* ⚠️ Overshooting mechanic
* 🏆 Score and streak system
* ⚡ Amplification energy / decision pressure
* 🎮 Interactive tutorial
* 📚 Quantum explanation section
* 🔊 Procedural game sound effects
* ✨ Quantum visual effects
* ⌨️ Keyboard controls
* 📱 Responsive interface

---

## 🕹️ Controls

| Key | Action           |
| --- | ---------------- |
| `A` | Amplify          |
| `M` | Measure          |
| `R` | Reset            |
| `H` | Open How to Play |

You can also use the on-screen buttons.

---

## 🚀 Run the Game Locally

### Requirements

You only need:

* A modern web browser
* Python **or** another local HTTP server

### Option 1 — Python

Open a terminal in the project directory:

```bash
cd C:\Quantum-Vault
```

Then run:

```bash
python -m http.server 4173
```

Open:

```text
http://localhost:4173
```

### Option 2 — Directly Open

You can also open:

```text
index.html
```

directly in a modern browser.

Using a local HTTP server is recommended for the most reliable experience.

---

## 🧪 Testing

The project includes automated tests for the quantum and game logic.

Tests verify areas including:

* Equal initial amplitudes
* Probability normalization
* Oracle behavior
* Diffusion behavior
* Grover iterations
* Probability evolution
* Weighted measurement
* Reset behavior
* Target hiding
* Game integration

Run the tests with:

```bash
npm test
```

---

## 📁 Project Structure

```text
Quantum-Vault/
│
├── index.html
├── style.css
├── package.json
├── README.md
│
├── js/
│   ├── grover.js
│   ├── game.js
│   ├── ui.js
│   ├── tutorial.js
│   └── effects.js
│
└── tests/
    ├── grover.test.js
    └── integration.test.js
```

### Core files

**`grover.js`**

Contains the quantum mathematics and Grover operations.

**`game.js`**

Controls the game state, levels, scoring and measurement.

**`ui.js`**

Handles the interface and probability visualization.

**`tutorial.js`**

Provides the beginner-friendly tutorial.

**`effects.js`**

Controls visual and audio feedback.

---

## 🧩 Quantum-to-Gameplay Mapping

| Quantum Concept   | Game Mechanic                                 |
| ----------------- | --------------------------------------------- |
| Superposition     | Multiple possible states                      |
| Marked state      | Hidden Quantum Core                           |
| Oracle            | Internally marks the hidden state             |
| Diffusion         | Amplifies the marked state's amplitude        |
| Amplitude         | Determines probability                        |
| Measurement       | Selects one state                             |
| Probability       | Determines measurement chance                 |
| Grover iterations | Player's AMPLIFY actions                      |
| Overshooting      | Probability decreases after the optimal point |

This mapping is the heart of Quantum Vault.

---

## 🏆 Why This Is a Game

Quantum Vault is not just a visualization of Grover's algorithm.

The quantum behavior directly creates the gameplay decision.

The player must decide:

```text
Should I amplify again?

        ↓

Will the probability improve?

        ↓

Should I measure now?
```

Amplifying too little can leave the Core difficult to find.

Amplifying too much can cause the probability to fall after the optimal point.

Therefore, the quantum algorithm itself creates the player's strategy.

---

## 🎓 What You Learn

By playing Quantum Vault, you can understand the basic idea behind Grover's algorithm without starting with complex quantum-computing mathematics.

The game demonstrates:

1. Quantum states can represent multiple possible outcomes.
2. A marked state can be amplified.
3. Probability can be concentrated around a desired state.
4. Measurement is probabilistic.
5. Grover iterations have an optimal region.
6. Repeating the operation too many times can overshoot that region.

---

## 🛠️ Technology

* **HTML5**
* **CSS3**
* **JavaScript**
* **Canvas / browser graphics**
* **Web Audio API**
* **Node.js / npm for testing**

No backend is required.

No paid API is required.

---

## 🌌 Game Flow

```text
START
  │
  ▼
Equal Probability
  │
  ▼
AMPLIFY ⚡
  │
  ▼
Oracle + Diffusion
  │
  ▼
Probability Changes
  │
  ├───────────────┐
  │               │
  ▼               ▼
AMPLIFY        MEASURE 🎯
  │               │
  │               ▼
  │          Quantum Measurement
  │               │
  │        ┌──────┴──────┐
  │        ▼             ▼
  │   CORE FOUND     CORE MISSED
  │        │             │
  │        ▼             ▼
  │      WIN           TRY AGAIN
  │
  └── Continue carefully
```

---

## 💡 The One-Sentence Explanation

> **Quantum Vault turns Grover's Search Algorithm into a game where you amplify the probability of a hidden Quantum Core and choose when to measure it.**

---

## 🚀 Hackathon Project

Built for the **QURIOSITY Quantum Game Dev Challenge**.

The project focuses on making a real quantum-computing concept understandable through gameplay rather than using quantum mechanics only as a visual theme.

---

## 👥 Team

**Team:** Tech Titans

**Project:** Quantum Vault

**Concept:** Grover's Search Algorithm

---

## 📜 License

This project is created for educational and hackathon purposes.
