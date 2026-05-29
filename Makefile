CXX = clang++
CXXFLAGS = -std=c++17 -Wall -Wextra -O3 -Iinclude

SRC = src/minimize_cash_flow.cpp src/main.cpp
TEST_SRC = src/minimize_cash_flow.cpp tests/test_minimize_cash_flow.cpp

OBJ = $(SRC:.cpp=.o)
TEST_OBJ = $(TEST_SRC:.cpp=.o)

BIN = minimize_cash_flow
TEST_BIN = test_runner

.PHONY: all build test run clean

all: build test

build: $(BIN)

$(BIN): src/minimize_cash_flow.o src/main.o
	$(CXX) $(CXXFLAGS) -o $@ $^

test: $(TEST_BIN)
	./$(TEST_BIN)

$(TEST_BIN): src/minimize_cash_flow.o tests/test_minimize_cash_flow.o
	$(CXX) $(CXXFLAGS) -o $@ $^

run: build
	./$(BIN)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

clean:
	rm -f src/*.o tests/*.o $(BIN) $(TEST_BIN)
