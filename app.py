from flask import Flask, render_template, jsonify, request
import random
import copy
import os

app = Flask(__name__)

def generate_sudoku(difficulty='medium'):
    # Simple backtracking Sudoku generator
    def is_valid(board, row, col, num):
        for i in range(9):
            if board[row][i] == num or board[i][col] == num:
                return False
        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if board[start_row + i][start_col + j] == num:
                    return False
        return True

    def fill_board(board):
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)
                    for num in nums:
                        if is_valid(board, row, col, num):
                            board[row][col] = num
                            if fill_board(board):
                                return True
                            board[row][col] = 0
                    return False
        return True

    board = [[0 for _ in range(9)] for _ in range(9)]
    fill_board(board)
    
    # Remove numbers based on difficulty
    puzzle = copy.deepcopy(board)
    cells_to_remove = {
        'easy': random.randint(30, 35),
        'medium': random.randint(40, 45),
        'hard': random.randint(50, 55)
    }
    
    cells_removed = 0
    while cells_removed < cells_to_remove[difficulty]:
        row, col = random.randint(0, 8), random.randint(0, 8)
        if puzzle[row][col] != 0:
            puzzle[row][col] = 0
            cells_removed += 1
    
    return puzzle, board

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/sudoku')
def sudoku():
    difficulty = request.args.get('difficulty', 'medium')
    puzzle, solution = generate_sudoku(difficulty)
    return jsonify({'puzzle': puzzle, 'solution': solution})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
