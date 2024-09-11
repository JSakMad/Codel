document.addEventListener('DOMContentLoaded', () => {
    const board = document.querySelector('.board');
    const submitGuess = document.getElementById('submit-guess');
    const result = document.querySelector('.result');
    const restartGame = document.getElementById('restart-game');

    let answer = generateAnswer();
    let guessCount = 0;
    const maxGuesses = 5; // Change to 5 guesses

    function generateAnswer() {
        let arr = [];
        while (arr.length < 4) {
            let num = Math.floor(Math.random() * 8) + 1;
            if (!arr.includes(num)) {
                arr.push(num);
            }
        }
        console.log('Generated Answer:', arr); // Debug statement
        return arr;
    }

    function createGuessRow() {
        const row = document.createElement('div');
        row.classList.add('guess-row');
        for (let i = 0; i < 4; i++) {
            const box = document.createElement('div');
            box.classList.add('guess-box');
            box.setAttribute('contenteditable', 'true');
            box.setAttribute('maxlength', '1');
            box.addEventListener('input', handleInput);
            box.addEventListener('keydown', handleKeyDown);
            row.appendChild(box);
        }
        board.appendChild(row);
        row.firstChild.focus(); // Focus on the first box of the new row
    }

    function handleInput(event) {
        const box = event.target;
        if (box.textContent.length > 1) {
            box.textContent = box.textContent.slice(0, 1);
        }
        const nextBox = box.nextElementSibling;
        if (nextBox && box.textContent.length === 1) {
            nextBox.focus();
        }
    }

    function handleKeyDown(event) {
        const box = event.target;
        if (event.key === 'Backspace' && box.textContent.length === 0) {
            const prevBox = box.previousElementSibling;
            if (prevBox) {
                prevBox.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(prevBox, 1);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                event.preventDefault();
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            const currentRow = box.parentElement;
            const guess = getGuessFromRow(currentRow);
            if (guess.length === 4) {
                submitGuessHandler();
            }
        }
    }

    function getGuessFromRow(row) {
        const boxes = row.querySelectorAll('.guess-box');
        let guess = '';
        boxes.forEach(box => {
            guess += box.textContent.trim();
        });
        return guess;
    }

    function checkGuess(guess) {
        let exactMatches = 0;
        let partialMatches = 0;
        let guessArr = guess.split('').map(Number);

        guessArr.forEach((num, index) => {
            if (num === answer[index]) {
                exactMatches++;
            } else if (answer.includes(num)) {
                partialMatches++;
            }
        });

        return { exactMatches, partialMatches };
    }

    function disableRow(row) {
        const boxes = row.querySelectorAll('.guess-box');
        boxes.forEach(box => {
            box.setAttribute('contenteditable', 'false');
        });
    }

    function disableAllBoxes() {
        const allBoxes = document.querySelectorAll('.guess-box');
        allBoxes.forEach(box => {
            box.setAttribute('contenteditable', 'false');
        });
    }

    function resetGame() {
        board.innerHTML = '';
        result.textContent = '';
        submitGuess.disabled = false;
        restartGame.style.display = 'none';
        answer = generateAnswer();
        guessCount = 0;
        createGuessRow();
    }

    function submitGuessHandler() {
        const currentRow = board.lastElementChild;
        let guess = getGuessFromRow(currentRow);
        if (guess.length === 4 && /^[1-8]+$/.test(guess)) {
            guessCount++;
            let { exactMatches, partialMatches } = checkGuess(guess);
            result.textContent = `Exact: ${exactMatches}, Partial: ${partialMatches}`;

            // Update box colors for exact and partial matches
            const boxes = currentRow.querySelectorAll('.guess-box');
            guess.split('').forEach((num, index) => {
                if (parseInt(num) === answer[index]) {
                    boxes[index].style.backgroundColor = '#90EE90'; // Lighter green
                } else if (answer.includes(parseInt(num))) {
                    boxes[index].style.backgroundColor = '#FFD700'; // Darker yellow
                }
            });

            disableRow(currentRow); // Disable the current row after guessing

            if (exactMatches === 4) {
                result.textContent = `Congratulations! You won in ${guessCount} guesses!`;
                submitGuess.disabled = true;
                disableAllBoxes(); // Disable all boxes after winning
                restartGame.style.display = 'block'; // Show restart button
            } else if (guessCount >= maxGuesses) {
                result.textContent = `You lose. The right code was: ${answer.join('')}`;
                submitGuess.disabled = true;
                disableAllBoxes(); // Disable all boxes after losing
                restartGame.style.display = 'block'; // Show restart button
            } else {
                createGuessRow(); // Create a new row for the next guess
            }
        } else {
            result.textContent = 'Invalid input. Please enter exactly 4 numbers between 1 and 8.';
        }
    }

    submitGuess.addEventListener('click', submitGuessHandler);
    restartGame.addEventListener('click', resetGame);

    // Initialize the first guess row
    createGuessRow();
});
