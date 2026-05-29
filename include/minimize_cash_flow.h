#ifndef MINIMIZE_CASH_FLOW_H
#define MINIMIZE_CASH_FLOW_H

#include <vector>
#include <string>

/**
 * Simplifies a complicated network of debts to determine the minimum number of
 * transactions required to settle all balances completely.
 *
 * Each transaction in the input is represented as a vector of three strings:
 * [PersonA, PersonB, AmountStr]
 * which means PersonA owes PersonB AmountStr.
 *
 * Constraints:
 * - 1 <= number of transactions <= 10^4
 * - 1 <= amount <= 10^9
 * - Names are unique strings of English letters.
 *
 * @param transactions A list of transactions to simplify.
 * @return A minimized list of transactions in the same format.
 */
std::vector<std::vector<std::string>> minimizeCashFlow(
    std::vector<std::vector<std::string>>& transactions
);

#endif // MINIMIZE_CASH_FLOW_H
