#include "minimize_cash_flow.h"
#include <unordered_map>
#include <queue>
#include <cmath>
#include <algorithm>
#include <iostream>
#include <sstream>
#include <stdexcept>

// Computes the minimized cash flow transactions
std::vector<std::vector<std::string>> minimizeCashFlow(
    std::vector<std::vector<std::string>>& transactions
) {
    // 1. Map names to unique IDs
    std::unordered_map<std::string, int> name_to_id;
    std::vector<std::string> id_to_name;

    auto get_id = [&](const std::string& name) {
        auto it = name_to_id.find(name);
        if (it != name_to_id.end()) {
            return it->second;
        }
        int id = id_to_name.size();
        name_to_id[name] = id;
        id_to_name.push_back(name);
        return id;
    };

    // Calculate net balances for each person
    // Use long long to prevent overflow (amount can be 10^9, up to 10^4 transactions)
    std::vector<long long> temp_balances;

    for (const auto& tx : transactions) {
        if (tx.size() != 3) {
            continue; // Skip invalid transactions
        }
        const std::string& debtor = tx[0];
        const std::string& creditor = tx[1];
        long long amount = std::stoll(tx[2]);

        int debtor_id = get_id(debtor);
        int creditor_id = get_id(creditor);

        if (debtor_id == creditor_id) {
            continue; // Self-debt has no effect on net balance
        }

        // Resize balances if new people were added
        if (temp_balances.size() < id_to_name.size()) {
            temp_balances.resize(id_to_name.size(), 0LL);
        }

        temp_balances[debtor_id] -= amount;
        temp_balances[creditor_id] += amount;
    }

    // Filter out people who already have a net balance of 0
    std::vector<std::string> active_names;
    std::vector<long long> active_balances;
    for (size_t i = 0; i < temp_balances.size(); ++i) {
        if (temp_balances[i] != 0) {
            active_names.push_back(id_to_name[i]);
            active_balances.push_back(temp_balances[i]);
        }
    }

    int N = active_names.size();
    std::vector<std::vector<std::string>> result;

    if (N == 0) {
        return result; // Everyone is already settled
    }

    // 2. Decide algorithm based on N
    if (N <= 20) {
        // Optimal DP with bitmask
        // dp[mask] = max number of disjoint zero-sum subsets
        int num_states = 1 << N;
        std::vector<long long> sum(num_states, 0LL);
        std::vector<int> dp(num_states, 0);

        // Precompute subset sums
        for (int mask = 1; mask < num_states; ++mask) {
            // Find lowest set bit
            int i = __builtin_ctz(mask);
            sum[mask] = sum[mask ^ (1 << i)] + active_balances[i];
        }

        // Compute DP
        for (int mask = 1; mask < num_states; ++mask) {
            int max_sub = 0;
            for (int i = 0; i < N; ++i) {
                if (mask & (1 << i)) {
                    max_sub = std::max(max_sub, dp[mask ^ (1 << i)]);
                }
            }
            dp[mask] = max_sub;
            if (sum[mask] == 0) {
                dp[mask]++;
            }
        }

        // Reconstruct components
        int active_mask = num_states - 1;
        std::vector<std::vector<int>> components;

        while (active_mask > 0) {
            if (dp[active_mask] == 1) {
                // The remaining set must form a single zero-sum component
                std::vector<int> comp;
                for (int i = 0; i < N; ++i) {
                    if (active_mask & (1 << i)) {
                        comp.push_back(i);
                    }
                }
                components.push_back(comp);
                break;
            }

            bool found = false;
            // Iterate through submasks of active_mask
            for (int T = (active_mask - 1) & active_mask; T > 0; T = (T - 1) & active_mask) {
                if (sum[T] == 0 && dp[active_mask ^ T] + 1 == dp[active_mask]) {
                    std::vector<int> comp;
                    for (int i = 0; i < N; ++i) {
                        if (T & (1 << i)) {
                            comp.push_back(i);
                        }
                    }
                    components.push_back(comp);
                    active_mask ^= T;
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Fallback in case of numerical/logic edge (should not happen mathematically)
                std::vector<int> comp;
                for (int i = 0; i < N; ++i) {
                    if (active_mask & (1 << i)) {
                        comp.push_back(i);
                    }
                }
                components.push_back(comp);
                break;
            }
        }

        // Settle each component sequentially (K elements -> K - 1 transactions)
        for (const auto& comp : components) {
            int K = comp.size();
            if (K <= 1) continue;

            std::vector<long long> comp_balances(K);
            for (int i = 0; i < K; ++i) {
                comp_balances[i] = active_balances[comp[i]];
            }

            for (int i = 0; i < K - 1; ++i) {
                long long bal = comp_balances[i];
                if (bal == 0) continue;

                if (bal < 0) {
                    // Person i owes money, they pay person i+1
                    result.push_back({active_names[comp[i]], active_names[comp[i+1]], std::to_string(-bal)});
                    comp_balances[i+1] += bal;
                } else {
                    // Person i is owed money, person i+1 pays person i
                    result.push_back({active_names[comp[i+1]], active_names[comp[i]], std::to_string(bal)});
                    comp_balances[i+1] += bal;
                }
                comp_balances[i] = 0;
            }
        }

    } else {
        // Fallback: Greedy algorithm using Max-Heap & Min-Heap
        std::priority_queue<std::pair<long long, int>> max_heap; // {balance, person_idx}
        // Min-heap for negative balances (storing as negative values, so standard min-heap logic works)
        std::priority_queue<std::pair<long long, int>, 
                            std::vector<std::pair<long long, int>>, 
                            std::greater<std::pair<long long, int>>> min_heap;

        for (int i = 0; i < N; ++i) {
            if (active_balances[i] > 0) {
                max_heap.push({active_balances[i], i});
            } else if (active_balances[i] < 0) {
                min_heap.push({active_balances[i], i});
            }
        }

        while (!max_heap.empty() && !min_heap.empty()) {
            auto credit = max_heap.top();
            max_heap.pop();
            auto debit = min_heap.top();
            min_heap.pop();

            long long credit_val = credit.first;
            long long debit_val = -debit.first;
            long long settle_val = std::min(credit_val, debit_val);

            // Debtor pays Creditor
            result.push_back({active_names[debit.second], active_names[credit.second], std::to_string(settle_val)});

            long long rem_credit = credit_val - settle_val;
            long long rem_debit = debit.first + settle_val;

            if (rem_credit > 0) {
                max_heap.push({rem_credit, credit.second});
            }
            if (rem_debit < 0) {
                min_heap.push({rem_debit, debit.second});
            }
        }
    }

    return result;
}
