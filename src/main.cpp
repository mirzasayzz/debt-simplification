#include "minimize_cash_flow.h"
#include <iostream>
#include <vector>
#include <string>
#include <iomanip>

void printTransactions(const std::vector<std::vector<std::string>>& txs) {
    if (txs.empty()) {
        std::cout << "  No transactions needed (already settled)!\n";
        return;
    }
    for (const auto& tx : txs) {
        std::cout << "  " << tx[0] << " pays " << tx[1] << " \u20b9" << tx[2] << "\n";
    }
}

void runDemo(const std::string& title, std::vector<std::vector<std::string>> txs) {
    std::cout << "\n==================================================\n";
    std::cout << " RUNNING DEMO: " << title << "\n";
    std::cout << "==================================================\n";
    std::cout << "Original Transactions:\n";
    for (const auto& tx : txs) {
        std::cout << "  " << tx[0] << " owes " << tx[1] << " \u20b9" << tx[2] << "\n";
    }
    
    auto optimized = minimizeCashFlow(txs);
    std::cout << "\nOptimized Settlement (" << optimized.size() << " transactions):\n";
    printTransactions(optimized);
}

int main(int argc, char* argv[]) {
    // Enable UTF-8 console output for currency symbol if supported
    #ifdef _WIN32
    // Windows specific setup if needed, but we are on Mac
    #endif

    std::cout << "==================================================\n";
    std::cout << "   DEBT SIMPLIFICATION / CASH FLOW MINIMIZER      \n";
    std::cout << "==================================================\n";

    if (argc > 1 && std::string(argv[1]) == "--interactive") {
        std::cout << "\n[Interactive Mode]\n";
        std::cout << "Enter the number of transactions: ";
        int n;
        if (!(std::cin >> n) || n <= 0) {
            std::cerr << "Invalid number of transactions.\n";
            return 1;
        }

        std::vector<std::vector<std::string>> transactions;
        std::cout << "Enter each transaction as: Debtor Creditor Amount\n";
        std::cout << "Example: Alice Bob 1000\n";
        for (int i = 0; i < n; ++i) {
            std::string debtor, creditor, amount_str;
            std::cout << "Transaction #" << i + 1 << ": ";
            std::cin >> debtor >> creditor >> amount_str;
            transactions.push_back({debtor, creditor, amount_str});
        }

        std::cout << "\nSimplifying debts...\n";
        auto optimized = minimizeCashFlow(transactions);
        std::cout << "\nOptimized Transactions (" << optimized.size() << " transfers):\n";
        printTransactions(optimized);
        return 0;
    }

    // Default mode: Run demos
    // 1. Example 1
    runDemo("Example 1 (Chain Settle)", {
        {"Tom", "Jerry", "1000"},
        {"Jerry", "Spike", "1000"},
        {"Spike", "Tom", "500"}
    });

    // 2. Example 2
    runDemo("Example 2 (Circular Debts)", {
        {"Alice", "Bob", "4000"},
        {"Bob", "Charlie", "2000"},
        {"Charlie", "David", "1000"},
        {"David", "Alice", "500"}
    });

    // 3. DP vs Greedy Comparison Demo
    // Balances:
    // Person0 (A): +9
    // Person1 (B): -5
    // Person2 (C): -4
    // Person3 (D): +6
    // Person4 (E): -3
    // Person5 (F): -3
    // Under Greedy: takes 5 transactions.
    // Under DP (Optimal): splits into {A, B, C} and {D, E, F}, taking 4 transactions.
    runDemo("Greedy vs DP Optimality Comparison", {
        {"B", "A", "5"},
        {"C", "A", "4"},
        {"E", "D", "3"},
        {"F", "D", "3"}
    });

    std::cout << "\nTo run interactive mode, execute: ./minimize_cash_flow --interactive\n\n";
    return 0;
}
