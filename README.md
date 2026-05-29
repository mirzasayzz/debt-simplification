# Debt Simplification / Cash Flow Minimizer

This project implements an optimized debt simplifier (similar to Splitwise). It includes:
1. A high-performance **C++ library and command-line tool**.
2. A gorgeous, interactive **web-based User Interface** that runs the exact same algorithms in JavaScript.

It takes a list of transactions representing who owes whom and how much, and simplifies them into the minimum number of money transfers required to settle all balances completely.

## Core Problem Statement
Given a complicated network of payments among a group of friends where:
- Negatives denote people who need to pay money (debtors).
- Positives denote people who need to receive money (creditors).
- Every person's net balance must eventually become zero.
- The total amount paid and received must remain mathematically correct.
- The total number of transactions is minimized.

---

## Strategy & Algorithm Design

### 1. Mathematical Optimality (NP-Hardness)
Finding the *absolute minimum* number of transactions is an NP-hard problem. It can be reduced from the **Subset Sum Problem** (partitioning the net balances into the maximum number of independent subsets that sum to zero).
- If a group of $K$ people has a net balance sum of 0, they can be settled among themselves in exactly $K - 1$ transactions.
- Therefore, if we partition $N$ people into $M$ disjoint zero-sum subsets, the total number of transactions is:
  $$\sum_{i=1}^M (K_i - 1) = N - M$$
- To minimize the number of transactions, we must **maximize $M$**, the number of zero-sum subsets.

### 2. The Hybrid Approach
To ensure the program is both mathematically optimal for typical group sizes and highly scalable for large groups, we implement a **Hybrid Algorithm**:

#### A. Optimal Bitmask Dynamic Programming ($N \le 20$)
- **DP State**: Let $N'$ be the number of people with non-zero balances. Let `dp[mask]` represent the maximum number of zero-sum subsets we can form using the subset of people represented by the bits in `mask`.
- **Recurrence**:
  - `sum[mask] = sum[mask ^ (1 << i)] + balance[i]` (for any set bit `i`).
  - `dp[mask] = max_{i in mask} (dp[mask ^ (1 << i)])`
  - If `sum[mask] == 0`, a new component is formed, so: `dp[mask]++`.
- **Reconstruction**: We trace the optimal partition by searching for submasks that satisfy the DP transition.
- **Sequential Settlement**: For each independent zero-sum subset, we settle the members sequentially, guaranteeing exactly $K-1$ transfers.

#### B. Greedy Heap-Based Fallback ($N > 20$)
- For larger groups, the $O(2^N)$ DP is computationally expensive.
- We fall back to a **Greedy Algorithm** using two heaps: a Max-Heap for creditors (positive balances) and a Min-Heap for debtors (negative balances).
- At each step, we match the largest debtor with the largest creditor, settle the maximum possible amount, and push any remaining balance back to the heap.
- This runs in $O(N \log N)$ and is highly efficient.

### 3. Preventing Overflow
With amounts up to $10^9$ and up to $10^4$ transactions, net balances can reach $10^{13}$. To guarantee safety against integer overflows, the algorithm uses 64-bit signed integers/numbers (`long long` in C++, standard numbers in JS) for all balance calculations.

---

## Directory Structure
```
pea/
├── index.html                    # Web UI Main Entry Point
├── style.css                     # Web UI Premium Styling
├── app.js                        # Web UI ported algorithm & DOM controller
├── include/
│   └── minimize_cash_flow.h      # C++ function signature & documentation
├── src/
│   ├── minimize_cash_flow.cpp    # Core Hybrid Algorithm implementation
│   └── main.cpp                  # CLI runner with built-in demos & interactive mode
├── tests/
│   └── test_minimize_cash_flow.cpp # Unit test suite
├── Makefile                      # Build automation script
└── .gitignore                    # Git ignore file
```

---

## Build & Run Instructions

### 1. Running the Web UI (Easiest for Teachers!)
Since the Web UI runs entirely in the browser using client-side JavaScript, you do not need to install anything:
- **Double Click**: Simply locate the [index.html](index.html) file in your file explorer and double-click to open it in Chrome, Safari, or Firefox.
- **Local Server (Optional)**: If you prefer to serve it, run:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

### 2. Compile and Run C++ Automated Tests
To run all automated C++ unit tests verifying the correctness, optimality, and edge cases:
```bash
make test
```

### 3. Run C++ CLI Demos
To run the automated console demos:
```bash
make run
```

### 4. Run C++ Interactive Mode
To input your own custom list of transactions in the console:
```bash
make build
./minimize_cash_flow --interactive
```

### 5. Clean C++ Build Files
To delete temporary object files and executable binaries:
```bash
make clean
```

---

## Technical Details

### Complexity Analysis
- **Bitmask DP ($N \le 20$)**:
  - **Time Complexity**: $O(2^N \cdot N)$ to compute the DP table. The reconstruction path takes $O(N \cdot 2^{N})$ in the worst case (though optimized to $O(1)$ when no partitions are possible).
  - **Space Complexity**: $O(2^N)$ to store DP values and subset sums.
- **Greedy Fallback ($N > 20$)**:
  - **Time Complexity**: $O(N \log N)$ due to heap operations.
  - **Space Complexity**: $O(N)$ to store heap elements.
