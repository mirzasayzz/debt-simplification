// Custom Priority Queue (Binary Heap) for JavaScript Greedy Solver
class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this.heap = [];
        this.comparator = comparator;
    }
    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.size() === 0;
    }
    push(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    pop() {
        const top = this.heap[0];
        const end = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = end;
            this.bubbleDown();
        }
        return top;
    }
    bubbleUp() {
        let idx = this.size() - 1;
        const element = this.heap[idx];
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.heap[parentIdx];
            if (this.comparator(element, parent)) {
                this.heap[idx] = parent;
                this.heap[parentIdx] = element;
                idx = parentIdx;
            } else {
                break;
            }
        }
    }
    bubbleDown() {
        let idx = 0;
        const length = this.size();
        const element = this.heap[0];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;
            if (leftChildIdx < length) {
                leftChild = this.heap[leftChildIdx];
                if (this.comparator(leftChild, element)) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heap[rightChildIdx];
                if (
                    (swap === null && this.comparator(rightChild, element)) ||
                    (swap !== null && this.comparator(rightChild, leftChild))
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.heap[idx] = this.heap[swap];
            this.heap[swap] = element;
            idx = swap;
        }
    }
}

// State variables
let currentTransactions = [];

// DOM Elements
const transactionForm = document.getElementById('transaction-form');
const inputDebtor = document.getElementById('input-debtor');
const inputCreditor = document.getElementById('input-creditor');
const inputAmount = document.getElementById('input-amount');
const transactionsList = document.getElementById('transactions-list');
const emptyState = document.getElementById('empty-state');
const btnClearAll = document.getElementById('btn-clear-all');
const btnSimplify = document.getElementById('btn-simplify');

const sectionBalances = document.getElementById('section-balances');
const balancesGrid = document.getElementById('balances-grid');

const sectionComponents = document.getElementById('section-components');
const componentsContainer = document.getElementById('components-container');

const sectionLog = document.getElementById('section-log');
const logContainer = document.getElementById('log-container');

// Simulator DOM Elements
const sectionSimulator = document.getElementById('section-simulator');
const btnSimAction = document.getElementById('btn-sim-action');
const simStepText = document.getElementById('sim-step-text');
const simDebtorName = document.getElementById('sim-debtor-name');
const simDebtorBal = document.getElementById('sim-debtor-bal');
const simCreditorName = document.getElementById('sim-creditor-name');
const simCreditorBal = document.getElementById('sim-creditor-bal');
const simMoneyIcon = document.getElementById('sim-money-icon');
const simAmountLabel = document.getElementById('sim-amount-label');
const simExplanation = document.getElementById('sim-explanation');

// Simulator State
let simTransfers = [];
let simActiveNames = [];
let simActiveBalances = [];
let simCurrentStep = 0;

const sectionTransfers = document.getElementById('section-transfers');
const transfersList = document.getElementById('transfers-list');
const transfersBadge = document.getElementById('transfers-badge');

// Preset Buttons
const btnDemo1 = document.getElementById('btn-demo1');
const btnDemo2 = document.getElementById('btn-demo2');
const btnDemo3 = document.getElementById('btn-demo3');

// Preset Data
const demos = {
    demo1: [
        { debtor: "Tom", creditor: "Jerry", amount: 1000 },
        { debtor: "Jerry", creditor: "Spike", amount: 1000 },
        { debtor: "Spike", creditor: "Tom", amount: 500 }
    ],
    demo2: [
        { debtor: "Alice", creditor: "Bob", amount: 4000 },
        { debtor: "Bob", creditor: "Charlie", amount: 2000 },
        { debtor: "Charlie", creditor: "David", amount: 1000 },
        { debtor: "David", creditor: "Alice", amount: 500 }
    ],
    demo3: [
        { debtor: "B", creditor: "A", amount: 5 },
        { debtor: "C", creditor: "A", amount: 4 },
        { debtor: "E", creditor: "D", amount: 3 },
        { debtor: "F", creditor: "D", amount: 3 }
    ]
};

// Event Listeners
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const debtor = inputDebtor.value.trim();
    const creditor = inputCreditor.value.trim();
    const amount = parseInt(inputAmount.value);

    if (!debtor || !creditor || isNaN(amount) || amount <= 0) return;
    if (debtor.toLowerCase() === creditor.toLowerCase()) {
        alert("A person cannot owe money to themselves.");
        return;
    }

    addTransaction(debtor, creditor, amount);
    transactionForm.reset();
    inputDebtor.focus();
});

btnClearAll.addEventListener('click', () => {
    currentTransactions = [];
    updateTransactionsUI();
    hideResultSections();
});

btnSimplify.addEventListener('click', () => {
    if (currentTransactions.length === 0) {
        alert("Please add at least one transaction to simplify.");
        return;
    }
    simplifyDebts();
});

btnDemo1.addEventListener('click', () => loadDemo('demo1'));
btnDemo2.addEventListener('click', () => loadDemo('demo2'));
btnDemo3.addEventListener('click', () => loadDemo('demo3'));

// Functions
function loadDemo(key) {
    currentTransactions = JSON.parse(JSON.stringify(demos[key]));
    updateTransactionsUI();
    hideResultSections();
    simplifyDebts(); // Auto simplify on demo load
}

function addTransaction(debtor, creditor, amount) {
    currentTransactions.push({ debtor, creditor, amount });
    updateTransactionsUI();
}

function deleteTransaction(index) {
    currentTransactions.splice(index, 1);
    updateTransactionsUI();
    hideResultSections();
}

function updateTransactionsUI() {
    transactionsList.innerHTML = '';
    if (currentTransactions.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    currentTransactions.forEach((tx, idx) => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <span class="tx-info">
                <span class="tx-debtor">${tx.debtor}</span>
                <span class="tx-arrow">&rarr;</span>
                <span class="tx-creditor">${tx.creditor}</span>
                <span class="tx-amount">&#8377;${tx.amount}</span>
            </span>
            <button class="btn btn-danger btn-sm" onclick="deleteTransaction(${idx})">Delete</button>
        `;
        transactionsList.appendChild(li);
    });
}

function hideResultSections() {
    sectionBalances.style.display = 'none';
    sectionComponents.style.display = 'none';
    sectionLog.style.display = 'none';
    sectionSimulator.style.display = 'none';
    sectionTransfers.style.display = 'none';
}

function logStep(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-line log-${type}`;
    div.innerHTML = message;
    logContainer.appendChild(div);
}

// The core algorithm implementation
function simplifyDebts() {
    // Clear logs
    logContainer.innerHTML = '';
    logStep("Starting Debt Simplification...", "highlight");

    // 1. Map names to unique IDs
    const nameToId = new Map();
    const idToName = [];

    function getId(name) {
        if (nameToId.has(name)) {
            return nameToId.get(name);
        }
        const id = idToName.length;
        nameToId.set(name, id);
        idToName.push(name);
        logStep(`  - Registered: ${name} (Index ID: ${id})`, 'info');
        return id;
    }

    logStep("Step 1: Mapping participant names to unique indices...", "highlight");

    // Calculate net balances
    const tempBalances = [];
    currentTransactions.forEach(tx => {
        const dId = getId(tx.debtor);
        const cId = getId(tx.creditor);
        
        while (tempBalances.length < idToName.length) {
            tempBalances.push(0);
        }

        tempBalances[dId] -= tx.amount;
        tempBalances[cId] += tx.amount;
    });

    logStep("Step 2: Processing transactions to calculate initial net balances...", "highlight");
    currentTransactions.forEach(tx => {
        logStep(`  - ${tx.debtor} owes ${tx.creditor} &#8377;${tx.amount} &rarr; ${tx.debtor}'s balance decreases, ${tx.creditor}'s balance increases.`, 'info');
    });

    logStep("Computed Initial Net Balances:", "highlight");
    idToName.forEach((name, id) => {
        const bal = tempBalances[id];
        if (bal < 0) {
            logStep(`  - ${name}: -&#8377;${-bal} (needs to pay)`, 'warning');
        } else if (bal > 0) {
            logStep(`  - ${name}: +&#8377;${bal} (needs to receive)`, 'success');
        } else {
            logStep(`  - ${name}: &#8377;0 (already settled)`, 'info');
        }
    });

    // Filter non-zero active members
    logStep("Step 3: Filtering out members who are already settled (net balance of 0)...", "highlight");
    const activeNames = [];
    const activeBalances = [];

    tempBalances.forEach((bal, id) => {
        if (bal !== 0) {
            activeNames.push(idToName[id]);
            activeBalances.push(bal);
        } else {
            logStep(`  - ${idToName[id]} has a net balance of 0. Filtered out from calculations.`, 'info');
        }
    });

    const N = activeNames.length;
    logStep(`Active participants to settle: ${N} (${activeNames.join(', ')})`, 'info');

    // Display balances
    renderBalancesUI(activeNames, activeBalances);

    if (N === 0) {
        logStep("All members are already settled! No transfers needed.", "success");
        renderTransfersUI([]);
        sectionLog.style.display = 'block';
        return;
    }

    let simplifiedTransfers = [];

    if (N <= 20) {
        logStep(`Active member count N = ${N} (&le; 20). Running mathematical-optimal Bitmask DP.`, 'highlight');
        
        const numStates = 1 << N;
        const sum = new Array(numStates).fill(0);
        const dp = new Array(numStates).fill(0);

        logStep(`Precomputing sum of balances for all 2^N = ${numStates} possible combinations (bitmasks)...`, 'info');
        // Precompute subset sums
        for (let mask = 1; mask < numStates; ++mask) {
            const i = 31 - Math.clz32(mask & -mask);
            sum[mask] = sum[mask ^ (1 << i)] + activeBalances[i];
        }

        logStep(`Computing DP values: Find the maximum number of zero-sum subsets...`, 'info');
        // Compute DP
        for (let mask = 1; mask < numStates; ++mask) {
            let maxSub = 0;
            for (let i = 0; i < N; ++i) {
                if (mask & (1 << i)) {
                    maxSub = Math.max(maxSub, dp[mask ^ (1 << i)]);
                }
            }
            dp[mask] = maxSub;
            if (sum[mask] === 0) {
                dp[mask]++;
            }
        }

        const maxZeroSumSubsets = dp[numStates - 1];
        logStep(`DP execution completed. Maximum number of independent zero-sum groups: ${maxZeroSumSubsets}`, 'success');
        logStep(`Optimal transfers count will be: N - MaxGroups = ${N} - ${maxZeroSumSubsets} = ${N - maxZeroSumSubsets}`, 'highlight');

        logStep(`Step 4: Reconstructing the independent zero-sum groups from DP transitions...`, 'highlight');
        let activeMask = numStates - 1;
        const components = [];

        while (activeMask > 0) {
            if (dp[activeMask] === 1) {
                const comp = [];
                for (let i = 0; i < N; ++i) {
                    if (activeMask & (1 << i)) {
                        comp.push(i);
                    }
                }
                components.push(comp);
                logStep(`  - Isolated Group: [${comp.map(idx => activeNames[idx]).join(', ')}] (sum is exactly 0)`, 'code');
                break;
            }

            let found = false;
            for (let T = (activeMask - 1) & activeMask; T > 0; T = (T - 1) & activeMask) {
                if (sum[T] === 0 && dp[activeMask ^ T] + 1 === dp[activeMask]) {
                    const comp = [];
                    for (let i = 0; i < N; ++i) {
                        if (T & (1 << i)) {
                            comp.push(i);
                        }
                    }
                    components.push(comp);
                    logStep(`  - Isolated Group: [${comp.map(idx => activeNames[idx]).join(', ')}] (sum is exactly 0)`, 'code');
                    activeMask ^= T;
                    found = true;
                    break;
                }
            }

            if (!found) {
                const comp = [];
                for (let i = 0; i < N; ++i) {
                    if (activeMask & (1 << i)) {
                        comp.push(i);
                    }
                }
                components.push(comp);
                logStep(`  - Isolated Group: [${comp.map(idx => activeNames[idx]).join(', ')}] (sum is exactly 0)`, 'code');
                break;
            }
        }

        // Render zero-sum subsets
        renderComponentsUI(components, activeNames);

        // Settle components sequentially
        logStep(`Step 5: Settling each group sequentially using (K - 1) transfers for size K...`, 'highlight');
        components.forEach((comp, compIdx) => {
            const K = comp.length;
            if (K <= 1) return;

            logStep(`Settle Group #${compIdx + 1} (${comp.map(idx => activeNames[idx]).join(', ')}):`, 'highlight');
            const compBalances = comp.map(idx => activeBalances[idx]);

            for (let i = 0; i < K - 1; ++i) {
                const bal = compBalances[i];
                if (bal === 0) {
                    logStep(`  - ${activeNames[comp[i]]} is already settled (0 balance).`, 'info');
                    continue;
                }

                if (bal < 0) {
                    logStep(`  - ${activeNames[comp[i]]} has a debt of &#8377;${-bal}. They pay ${activeNames[comp[i+1]]}.`, 'warning');
                    simplifiedTransfers.push({
                        from: activeNames[comp[i]],
                        to: activeNames[comp[i+1]],
                        amount: -bal
                    });
                    compBalances[i+1] += bal;
                    logStep(`    - Balance of ${activeNames[comp[i+1]]} updated to &#8377;${compBalances[i+1]}.`, 'info');
                } else {
                    logStep(`  - ${activeNames[comp[i]]} is owed &#8377;${bal}. ${activeNames[comp[i+1]]} pays them.`, 'success');
                    simplifiedTransfers.push({
                        from: activeNames[comp[i+1]],
                        to: activeNames[comp[i]],
                        amount: bal
                    });
                    compBalances[i+1] += bal;
                    logStep(`    - Balance of ${activeNames[comp[i+1]]} updated to &#8377;${compBalances[i+1]}.`, 'info');
                }
                compBalances[i] = 0;
            }
            logStep(`  - Group #${compIdx + 1} is now fully settled!`, 'success');
        });

    } else {
        logStep(`Active member count N = ${N} (> 20). Running Greedy Heap-based fallback solver.`, 'highlight');
        
        const maxHeap = new PriorityQueue((a, b) => a.val > b.val);
        const minHeap = new PriorityQueue((a, b) => a.val < b.val);

        logStep(`Pushing creditors to Max-Heap and debtors to Min-Heap...`, 'info');
        for (let i = 0; i < N; ++i) {
            if (activeBalances[i] > 0) {
                maxHeap.push({ val: activeBalances[i], idx: i });
                logStep(`  - Creditor: ${activeNames[i]} (+&#8377;${activeBalances[i]})`, 'success');
            } else if (activeBalances[i] < 0) {
                minHeap.push({ val: activeBalances[i], idx: i });
                logStep(`  - Debtor: ${activeNames[i]} (-&#8377;${-activeBalances[i]})`, 'warning');
            }
        }

        let step = 1;
        while (!maxHeap.isEmpty() && !minHeap.isEmpty()) {
            const credit = maxHeap.pop();
            const debit = minHeap.pop();

            const creditVal = credit.val;
            const debitVal = -debit.val;
            const settleVal = Math.min(creditVal, debitVal);

            logStep(`Greedy Match #${step++}:`, 'highlight');
            logStep(`  - Max creditor: ${activeNames[credit.idx]} (+&#8377;${creditVal})`, 'success');
            logStep(`  - Max debtor: ${activeNames[debit.idx]} (-&#8377;${debitVal})`, 'warning');
            logStep(`  - Settlement: ${activeNames[debit.idx]} pays ${activeNames[credit.idx]} &#8377;${settleVal}.`, 'info');

            simplifiedTransfers.push({
                from: activeNames[debit.idx],
                to: activeNames[credit.idx],
                amount: settleVal
            });

            const remCredit = creditVal - settleVal;
            const remDebit = debit.val + settleVal;

            if (remCredit > 0) {
                maxHeap.push({ val: remCredit, idx: credit.idx });
                logStep(`    - ${activeNames[credit.idx]} still owed &#8377;${remCredit}. Pushed back to Max-Heap.`, 'info');
            } else {
                logStep(`    - ${activeNames[credit.idx]} is now fully settled!`, 'success');
            }
            if (remDebit < 0) {
                minHeap.push({ val: remDebit, idx: debit.idx });
                logStep(`    - ${activeNames[debit.idx]} still owes &#8377;${-remDebit}. Pushed back to Min-Heap.`, 'info');
            } else {
                logStep(`    - ${activeNames[debit.idx]} is now fully settled!`, 'success');
            }
        }
    }

    sectionLog.style.display = 'block';
    renderTransfersUI(simplifiedTransfers);
    initSimulator(simplifiedTransfers, activeNames, activeBalances);
}

function renderBalancesUI(names, balances) {
    balancesGrid.innerHTML = '';
    
    // Sort names alphabetically so the list is stable
    const list = names.map((name, i) => ({ name, bal: balances[i] }))
                      .sort((a, b) => a.name.localeCompare(b.name));

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = `balance-card ${item.bal < 0 ? 'balance-debtor' : 'balance-creditor'}`;
        div.innerHTML = `
            <div class="balance-name" title="${item.name}">${item.name}</div>
            <div class="balance-val">${item.bal > 0 ? '+' : ''}&#8377;${item.bal}</div>
        `;
        balancesGrid.appendChild(div);
    });

    sectionBalances.style.display = 'block';
}

function renderComponentsUI(components, activeNames) {
    componentsContainer.innerHTML = '';
    
    components.forEach((comp, idx) => {
        const div = document.createElement('div');
        div.className = 'component-card';
        
        const badgesHtml = comp.map(memberIdx => 
            `<span class="component-member-badge">${activeNames[memberIdx]}</span>`
        ).join('');

        div.innerHTML = `
            <div class="component-title">Group #${idx + 1}</div>
            <div class="component-members">${badgesHtml}</div>
        `;
        componentsContainer.appendChild(div);
    });

    sectionComponents.style.display = 'block';
}

function renderTransfersUI(transfers) {
    transfersList.innerHTML = '';
    transfersBadge.textContent = `${transfers.length} transfer${transfers.length === 1 ? '' : 's'}`;

    if (transfers.length === 0) {
        transfersList.innerHTML = `<div class="empty-state">Everyone is fully settled! No transfers needed.</div>`;
    } else {
        transfers.forEach(tf => {
            const li = document.createElement('li');
            li.className = 'transfer-item';
            li.innerHTML = `
                <span class="transfer-details">
                    <span class="transfer-payee">${tf.from}</span>
                    <span class="transfer-middle">pays</span>
                    <span class="transfer-rec">${tf.to}</span>
                </span>
                <span class="transfer-val">&#8377;${tf.amount}</span>
            `;
            transfersList.appendChild(li);
        });
    }

    sectionTransfers.style.display = 'block';
}

function initSimulator(transfers, activeNames, activeBalances) {
    simTransfers = transfers;
    simActiveNames = [...activeNames];
    simActiveBalances = [...activeBalances];
    simCurrentStep = 0;
    
    if (transfers.length === 0) {
        sectionSimulator.style.display = 'none';
        return;
    }

    btnSimAction.textContent = transfers.length > 1 ? 'Next Step' : 'Reset Simulation';
    sectionSimulator.style.display = 'block';
    renderSimulationStep();
}

function renderSimulationStep() {
    if (simTransfers.length === 0) return;
    
    const currentStep = simCurrentStep;
    simStepText.textContent = `Step ${currentStep + 1} of ${simTransfers.length}`;

    // Restart coin animation
    simMoneyIcon.classList.remove('animate');
    void simMoneyIcon.offsetWidth; // Force reflow
    simMoneyIcon.classList.add('animate');

    const tx = simTransfers[currentStep];
    
    // Calculate balances BEFORE this transaction
    const tempBals = [...simActiveBalances];
    for (let j = 0; j < currentStep; ++j) {
        const prevTx = simTransfers[j];
        const prevDebtorIdx = simActiveNames.indexOf(prevTx.from);
        const prevCreditorIdx = simActiveNames.indexOf(prevTx.to);
        tempBals[prevDebtorIdx] += prevTx.amount;
        tempBals[prevCreditorIdx] -= prevTx.amount;
    }

    const debtorIdx = simActiveNames.indexOf(tx.from);
    const creditorIdx = simActiveNames.indexOf(tx.to);

    const balDebtorBefore = tempBals[debtorIdx];
    const balCreditorBefore = tempBals[creditorIdx];

    const balDebtorAfter = balDebtorBefore + tx.amount;
    const balCreditorAfter = balCreditorBefore - tx.amount;

    // Display values before payment
    simDebtorName.textContent = tx.from;
    simDebtorBal.textContent = `₹${balDebtorBefore}`;
    
    simCreditorName.textContent = tx.to;
    simCreditorBal.textContent = `₹${balCreditorBefore}`;
    
    simAmountLabel.textContent = `₹${tx.amount}`;
    
    simExplanation.innerHTML = `<span class="transfer-payee">${tx.from}</span> is transferring <span class="transfer-val">₹${tx.amount}</span> to <span class="transfer-rec">${tx.to}</span>...`;

    // Dynamic balance updates half-way through the animation (750ms)
    setTimeout(() => {
        if (simCurrentStep === currentStep) {
            simDebtorBal.textContent = `₹${balDebtorAfter}`;
            simCreditorBal.textContent = `₹${balCreditorAfter}`;
            
            let statusText = '';
            if (balDebtorAfter === 0) {
                statusText += `<span class="transfer-payee">${tx.from}</span> is now <strong>fully settled</strong>. `;
            } else {
                statusText += `<span class="transfer-payee">${tx.from}</span>'s remaining debt is reduced to ₹${-balDebtorAfter}. `;
            }

            if (balCreditorAfter === 0) {
                statusText += `<span class="transfer-rec">${tx.to}</span> is now <strong>fully paid</strong>.`;
            } else {
                statusText += `<span class="transfer-rec">${tx.to}</span> is owed ₹${balCreditorAfter} more.`;
            }

            simExplanation.innerHTML = `<span class="transfer-payee">${tx.from}</span> paid <span class="transfer-rec">${tx.to}</span> <span class="transfer-val">₹${tx.amount}</span>!<br><small>${statusText}</small>`;
        }
    }, 750);
}

// Single Action Button click handler
btnSimAction.addEventListener('click', () => {
    if (simTransfers.length === 0) return;
    
    if (btnSimAction.textContent === 'Reset Simulation') {
        simCurrentStep = 0;
        btnSimAction.textContent = simTransfers.length > 1 ? 'Next Step' : 'Reset Simulation';
        renderSimulationStep();
        return;
    }
    
    simCurrentStep++;
    if (simCurrentStep >= simTransfers.length) {
        simCurrentStep = simTransfers.length - 1; // hold at last step
        simExplanation.innerHTML = `<strong>All debts are fully settled!</strong><br><small>Click Reset to watch the simulation again.</small>`;
        btnSimAction.textContent = 'Reset Simulation';
        simMoneyIcon.classList.remove('animate');
    } else {
        renderSimulationStep();
        if (simCurrentStep === simTransfers.length - 1) {
            btnSimAction.textContent = 'Reset Simulation';
        }
    }
});
