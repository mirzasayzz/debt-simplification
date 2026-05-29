# Splitwise Debt Simplifier

[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Web_UI-violet?style=for-the-badge&logo=github)](https://mirzasayzz.github.io/debt-simplification/)

A simple tool to settle group expenses among friends in the minimum number of transfers. It calculates everyone's net balance and groups people to avoid unnecessary intermediate payments.

Includes both a **Web Interface** (HTML/CSS/JS) and a native **C++ command-line tool**.

---

## Try it in the Browser
Since the UI runs entirely in client-side JavaScript, you do not need to install anything:
*   👉 **[Click here to open the Live Website](https://mirzasayzz.github.io/debt-simplification/)**
*   Or open the local `index.html` file in Chrome/Safari by double-clicking it.

---

## C++ Code Setup & Execution

You will need a C++ compiler (`g++` or `clang++`) and `make` installed.

### 1. Run automated tests
This compiles the C++ logic and runs tests for basic settling, circular debts, zero-value edges, and large amounts:
```bash
make test
```

### 2. Run the console demos
Runs the C++ program showing debt simplification outputs for Example 1 and Example 2:
```bash
make run
```

### 3. Run interactive mode
Input your own transactions via the command line:
```bash
make build
./minimize_cash_flow --interactive
```

---

## How it works (Algorithm Details)

The project combines two approaches depending on the size of the group:

1. **Optimal Settle (N <= 20)**: Settle optimization is an NP-hard problem. The program uses a **Dynamic Programming (Bitmask)** approach to search for independent subgroups that sum to exactly 0. This splits the group into isolated subgroups to guarantee the absolute minimum number of transfers.
2. **Greedy Settle (N > 20)**: For larger groups, the program falls back to a fast **Greedy Min/Max Heap** solver. It repeatedly matches the largest creditor with the largest debtor to settle balances in $O(N \log N)$ time.
