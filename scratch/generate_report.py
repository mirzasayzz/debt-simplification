import os
import sys

try:
    from fpdf import FPDF
except ImportError:
    print("fpdf2 not installed. Please run 'pip install fpdf2' first.")
    sys.exit(1)

class ProjectReportPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(110, 110, 110)
            self.set_x(10)
            self.cell(100, 10, "Project Report: Splitwise Debt Simplifier & Settlement Simulator", border=0, align="L")
            self.set_x(110)
            self.cell(90, 10, f"Page {self.page_no()}", border=0, align="R")
            # Running header border line
            self.set_draw_color(220, 220, 220)
            self.line(10, 18, 200, 18)
            self.ln(10)

    def footer(self):
        if self.page_no() > 0:
            self.set_y(-15)
            self.set_x(10)
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(150, 150, 150)
            self.cell(190, 10, "Developed by Tuba Mirza  |  Debt Simplifier Project Report", border=0, align="C")

    def page_title(self, title):
        self.set_x(10)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(63, 54, 150) # Deep violet color accent
        self.cell(190, 12, title, border=0, ln=1, align="L")
        self.ln(2)

    def heading_2(self, text):
        self.set_x(10)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(50, 50, 50)
        self.cell(190, 8, text, border=0, ln=1, align="L")
        self.ln(1)

    def paragraph(self, text):
        self.set_x(10)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(190, 5.5, text)
        self.ln(3)

    def screenshot_placeholder(self, title):
        self.ln(2)
        # Draw a rectangle box with light background and border
        self.set_draw_color(180, 180, 180)
        self.set_fill_color(250, 250, 252)
        
        # Save current position
        self.set_x(10)
        x, y = self.get_x(), self.get_y()
        self.rect(x, y, 190, 45, style='FD')
        
        # Write text centered inside the box
        self.set_y(y + 15)
        self.set_x(10)
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(120, 120, 120)
        self.cell(190, 5, "[ SCREENSHOT PLACEHOLDER ]", border=0, ln=1, align="C")
        
        self.set_x(10)
        self.set_font("Helvetica", "I", 8.5)
        self.set_text_color(140, 140, 140)
        self.cell(190, 5, title, border=0, ln=1, align="C")
        
        self.set_y(y + 45) # Restore cursor position below the box
        self.ln(4)

def print_code_lines(pdf, code_text):
    # Sanitize characters that might crash Helvetica/Courier
    sanitized = code_text.replace("₹", "Rs.").replace("\u20b9", "Rs.")
    sanitized = sanitized.replace("\u2014", "-").replace("\u2022", "*")
    sanitized = sanitized.replace("\u2192", "->").replace("&rarr;", "->")
    sanitized = sanitized.replace("&#8377;", "Rs.")
    sanitized = sanitized.replace("💸", "[money]")
    sanitized = sanitized.replace("✓", "[check]").replace("\u2713", "[check]")
    sanitized = sanitized.replace("🎉", "[success]").replace("\U0001f389", "[success]")
    sanitized = sanitized.replace("•", "*")
    
    # Split into lines and write chunks
    lines = sanitized.split('\n')
    chunk_size = 40
    pdf.set_fill_color(248, 248, 250)
    pdf.set_font("Courier", "", 7.5)
    pdf.set_text_color(50, 50, 50)
    
    for i in range(0, len(lines), chunk_size):
        chunk = '\n'.join(lines[i:i+chunk_size])
        pdf.set_x(10)
        pdf.multi_cell(190, 3.5, chunk, border=1, fill=True)
        pdf.ln(1)

def generate_report():
    pdf = ProjectReportPDF()
    pdf.alias_nb_pages()
    
    # ----------------------------------------------------
    # COVER PAGE
    # ----------------------------------------------------
    pdf.add_page()
    pdf.set_y(60)
    
    pdf.set_x(10)
    pdf.set_font("Helvetica", "B", 24)
    pdf.set_text_color(63, 54, 150)
    pdf.multi_cell(190, 12, "SPLITWISE DEBT SIMPLIFIER", align="C")
    
    pdf.set_x(10)
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(100, 100, 120)
    pdf.multi_cell(190, 8, "Optimal Expense Settlement & Animated Simulator", align="C")
    pdf.ln(25)
    
    pdf.set_x(10)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(190, 6, "A hybrid C++ CLI and responsive Web Application designed to compute, minimize, and visualize peer-to-peer cash flows in groups using subset-sum Dynamic Programming and Greedy Priority Queue heuristics.", align="C")
    pdf.ln(40)
    
    pdf.set_x(10)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(60, 60, 60)
    pdf.cell(190, 6, "Developer: Tuba Mirza", ln=1, align="C")
    
    pdf.set_x(10)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(190, 6, "Contact: tubamirza822@gmail.com", ln=1, align="C")
    pdf.ln(5)
    
    pdf.set_x(10)
    pdf.cell(190, 6, "Project Type: Academic Term Project", ln=1, align="C")
    pdf.set_x(10)
    pdf.cell(190, 6, "Date: May 2026", ln=1, align="C")

    # ----------------------------------------------------
    # PAGE 2: PROJECT OVERVIEW & ALGORITHM DESIGN
    # ----------------------------------------------------
    pdf.add_page()
    pdf.page_title("1. Project Overview & Algorithm Design")
    
    pdf.heading_2("1.1 Introduction")
    pdf.paragraph(
        "Settle-up networks (like Splitwise) minimize the friction of transferring money among a group of people who share multiple mutual expenses. For example, if Roommate A pays for rent, Roommate B pays for groceries, and Roommate C pays for utilities, the resulting web of debts can be convoluted. Settle-up algorithms reduce these debts to a minimal set of transactions, where people only pay what is net-owed."
    )
    
    pdf.heading_2("1.2 The NP-Hard Problem & Subset Sum Optimality")
    pdf.paragraph(
        "Finding the absolute minimum number of transfers is an NP-hard optimization problem. While simple greedy approaches (repeatedly matching the largest creditor with the largest debtor) can settle all balances, they do not guarantee the minimum number of transactions. For example, if A owes B Rs. 50, B owes C Rs. 50, and D owes E Rs. 10, the net balances of A, B, C, D, and E are -50, 0, +50, -10, and +10 respectively. A simple greedy solver might match them arbitrarily, but the optimal solution requires partition-matching."
    )
    pdf.paragraph(
        "Mathematically, if a group of K participants has net balances that sum to exactly 0, they can settle their debts among themselves in at most K - 1 transactions. If the entire group of N people can be partitioned into M independent zero-sum subgroups, the total transactions required will be N - M. Thus, maximizing the number of zero-sum subgroups (M) yields the minimum number of transactions."
    )
    
    pdf.heading_2("1.3 Hybrid Algorithm Implementation")
    pdf.paragraph(
        "To achieve maximum correctness and efficiency, this project implements a hybrid solver:\n"
        "1. Optimal Solver (N <= 20): Uses a Dynamic Programming (DP) algorithm with bitmasks. It computes subset sums for all 2^N states, identifies zero-sum combinations, and uses a DP state-transition table to reconstruct the maximum number of disjoint zero-sum subgroups. The subgroups are then settled sequentially using K-1 transfers.\n"
        "2. Greedy Solver Fallback (N > 20): For larger groups where DP is computationally prohibitive (due to O(2^N) complexity), the solver falls back to a Greedy priority queue (Heap) solver. It matching the largest creditor with the largest debtor in O(N log N) time, which provides a fast and highly optimized settle plan."
    )

    # ----------------------------------------------------
    # PAGE 3: WEB UI & ANIMATED SETTLEMENT SIMULATOR
    # ----------------------------------------------------
    pdf.add_page()
    pdf.page_title("2. Web UI & Animated Simulator")
    
    pdf.heading_2("2.1 Web Application Architecture")
    pdf.paragraph(
        "The frontend is built using standard semantic HTML5, Vanilla CSS, and modern client-side JavaScript. Users can load preset demos (Basic Chain, Circular Debt, or Greedy vs DP Comparison) or enter custom transactions manually. The UI displays the original transactions, computed net balances, zero-sum subsets, and the final optimized transfers list."
    )
    
    pdf.heading_2("2.2 Interactive Payment Simulator")
    pdf.paragraph(
        "To help students and teachers visualize the minimization algorithm interactively, a live Payment Simulator is integrated into the dashboard:\n"
        " - Running Balance Grid: Dynamically displays cards for all active participants showing their current state of debt/credit. The cards update colors and status badges (Owes / Owed / Settled) in real time.\n"
        " - Flying Coin Animation: When clicking 'Next Step', the simulator uses JavaScript DOM bounding rect calculations to compute the exact positions of the debtor and creditor cards. A flying money bag (flying-coin) is spawned and transitioned from the debtor's card to the creditor's card.\n"
        " - Zero Balance Highlight: Once a transfer completes, the running balances update in-place. If a participant's balance reaches exactly 0 (fully settled), their card automatically transitions to a settled state with a 'Settled Checkmark' badge.\n"
        " - Lock State: The 'Next Step' button is disabled during coin flight to prevent click spamming and visual glitches."
    )
    
    # Add screenshot placeholders with space
    pdf.screenshot_placeholder("Dashboard Interface: Input Form & Net Balances Cards")
    pdf.screenshot_placeholder("Interactive Simulator: Live Grid showing Flying Coin and Settled Badges")

    # ----------------------------------------------------
    # PAGE 4: SOURCE CODE - C++ LIBRARY
    # ----------------------------------------------------
    pdf.add_page()
    pdf.page_title("3. Source Code: C++ Core Optimization Library")
    pdf.heading_2("3.1 Core Header File: include/minimize_cash_flow.h")
    
    # Read files
    try:
        with open("include/minimize_cash_flow.h", "r") as f:
            h_code = f.read()
    except Exception as e:
        h_code = f"// Error reading file: {e}"
        
    print_code_lines(pdf, h_code)
    pdf.ln(4)
    
    pdf.heading_2("3.2 Core Implementation File: src/minimize_cash_flow.cpp")
    try:
        with open("src/minimize_cash_flow.cpp", "r") as f:
            cpp_code = f.read()
    except Exception as e:
        cpp_code = f"// Error reading file: {e}"
        
    print_code_lines(pdf, cpp_code)

    # ----------------------------------------------------
    # PAGE 5: SOURCE CODE - CLI & WEB CONTROLLER
    # ----------------------------------------------------
    pdf.add_page()
    pdf.page_title("4. Source Code: CLI Wrapper & Web Controller")
    pdf.heading_2("4.1 Command Line Entrypoint: src/main.cpp")
    
    try:
        with open("src/main.cpp", "r") as f:
            main_code = f.read()
    except Exception as e:
        main_code = f"// Error reading file: {e}"
        
    print_code_lines(pdf, main_code)
    pdf.ln(4)
    
    pdf.heading_2("4.2 JavaScript Controller (Core Simulator section): app.js")
    try:
        with open("app.js", "r") as f:
            js_lines = f.readlines()
        # Extract starting from simplifyDebts to end
        start_idx = 0
        for i, line in enumerate(js_lines):
            if "function simplifyDebts" in line:
                start_idx = i
                break
        js_code = "".join(js_lines[start_idx:])
    except Exception as e:
        js_code = f"// Error reading file: {e}"
        
    print_code_lines(pdf, js_code)
    
    # Output to file
    pdf.output("Splitwise_Debt_Simplifier_Report.pdf")
    print("Report PDF generated successfully as 'Splitwise_Debt_Simplifier_Report.pdf'.")

if __name__ == "__main__":
    generate_report()