#include "minimize_cash_flow.h"
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <stdexcept>
#include <cassert>

// Color codes for console output
#define ANSI_GREEN "\033[32m"
#define ANSI_RED "\033[31m"
#define ANSI_RESET "\033[0m"

// Test counter
int tests_run = 0;
int tests_failed = 0;

#define RUN_TEST(test_func) \
    do { \
        tests_run++; \
        std::cout << "[ RUN     ] " << #test_func << "\n"; \
        try { \
            test_func(); \
            std::cout << ANSI_GREEN << "[      OK ] " << #test_func << ANSI_RESET << "\n"; \
        } catch (const std::exception& e) { \
            std::cout << ANSI_RED << "[  FAILED ] " << #test_func << ": " << e.what() << ANSI_RESET << "\n"; \
            tests_failed++; \
        } catch (...) { \
            std::cout << ANSI_RED << "[  FAILED ] " << #test_func << ": Unknown exception" << ANSI_RESET << "\n"; \
            tests_failed++; \
        } \
    } while (0)

// Helper to verify that net balances match exactly
bool verifyBalances(
    const std::vector<std::vector<std::string>>& original,
    const std::vector<std::vector<std::string>>& optimized
) {
    std::unordered_map<std::string, long long> original_balances;
    for (const auto& tx : original) {
        original_balances[tx[0]] -= std::stoll(tx[2]);
        original_balances[tx[1]] += std::stoll(tx[2]);
    }

    std::unordered_map<std::string, long long> optimized_balances;
    for (const auto& tx : optimized) {
        optimized_balances[tx[0]] -= std::stoll(tx[2]);
        optimized_balances[tx[1]] += std::stoll(tx[2]);
    }

    // Clean up zero balances to make comparison simpler
    for (auto it = original_balances.begin(); it != original_balances.end(); ) {
        if (it->second == 0) it = original_balances.erase(it);
        else ++it;
    }
    for (auto it = optimized_balances.begin(); it != optimized_balances.end(); ) {
        if (it->second == 0) it = optimized_balances.erase(it);
        else ++it;
    }

    if (original_balances.size() != optimized_balances.size()) return false;
    for (const auto& pair : original_balances) {
        auto it = optimized_balances.find(pair.first);
        if (it == optimized_balances.end() || it->second != pair.second) {
            return false;
        }
    }
    return true;
}

// ----------------------------------------------------
// TEST CASES
// ----------------------------------------------------

void testExample1() {
    std::vector<std::vector<std::string>> original = {
        {"Tom", "Jerry", "1000"},
        {"Jerry", "Spike", "1000"},
        {"Spike", "Tom", "500"}
    };

    auto optimized = minimizeCashFlow(original);
    
    assert(verifyBalances(original, optimized));
    assert(optimized.size() == 1);
    assert(optimized[0][0] == "Tom");
    assert(optimized[0][1] == "Spike");
    assert(optimized[0][2] == "500");
}

void testExample2() {
    std::vector<std::vector<std::string>> original = {
        {"Alice", "Bob", "4000"},
        {"Bob", "Charlie", "2000"},
        {"Charlie", "David", "1000"},
        {"David", "Alice", "500"}
    };

    auto optimized = minimizeCashFlow(original);

    assert(verifyBalances(original, optimized));
    assert(optimized.size() == 3);
}

void testDPVsGreedyComparison() {
    // 6-person scenario where Greedy takes 5 transactions, but Bitmask DP takes 4.
    // Balances are:
    // A: +9, B: -5, C: -4
    // D: +6, E: -3, F: -3
    std::vector<std::vector<std::string>> original = {
        {"B", "A", "5"},
        {"C", "A", "4"},
        {"E", "D", "3"},
        {"F", "D", "3"}
    };

    auto optimized = minimizeCashFlow(original);

    assert(verifyBalances(original, optimized));
    // DP should achieve exactly 4 transactions (optimal)
    assert(optimized.size() == 4);
}

void testSelfDebtsAndZeroAmount() {
    std::vector<std::vector<std::string>> original = {
        {"Alice", "Alice", "1000"}, // self debt
        {"Alice", "Bob", "0"},       // zero amount
        {"Bob", "Alice", "1000"},
        {"Alice", "Bob", "1000"}     // cancels out Bob owes Alice
    };

    auto optimized = minimizeCashFlow(original);
    assert(optimized.empty());
}

void testLargeAmounts() {
    std::vector<std::vector<std::string>> original = {
        {"A", "B", "1000000000"}, // 10^9
        {"B", "C", "1000000000"},
        {"C", "A", "500000000"}
    };

    auto optimized = minimizeCashFlow(original);
    assert(verifyBalances(original, optimized));
    assert(optimized.size() == 1);
    assert(optimized[0][2] == "500000000");
}

void testLargeScaleGreedy() {
    // 22 unique active people. Since N > 20, this will trigger the Greedy path.
    std::vector<std::vector<std::string>> original;
    for (int i = 0; i < 11; ++i) {
        std::string debtor = "Debtor" + std::to_string(i);
        std::string creditor = "Creditor" + std::to_string(i);
        original.push_back({debtor, creditor, "100"});
    }

    auto optimized = minimizeCashFlow(original);

    assert(verifyBalances(original, optimized));
    // Check that we got a valid settlement
    assert(!optimized.empty());
    for (const auto& tx : optimized) {
        assert(std::stoll(tx[2]) > 0);
    }
}

int main() {
    std::cout << "==================================================\n";
    std::cout << "          RUNNING CASH FLOW TEST SUITE            \n";
    std::cout << "==================================================\n";

    RUN_TEST(testExample1);
    RUN_TEST(testExample2);
    RUN_TEST(testDPVsGreedyComparison);
    RUN_TEST(testSelfDebtsAndZeroAmount);
    RUN_TEST(testLargeAmounts);
    RUN_TEST(testLargeScaleGreedy);

    std::cout << "\n==================================================\n";
    if (tests_failed == 0) {
        std::cout << ANSI_GREEN << "SUCCESS: All " << tests_run << " tests passed!" << ANSI_RESET << "\n";
    } else {
        std::cout << ANSI_RED << "FAILURE: " << tests_failed << " out of " << tests_run << " tests failed!" << ANSI_RESET << "\n";
    }
    std::cout << "==================================================\n";

    return tests_failed;
}
