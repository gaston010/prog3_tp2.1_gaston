class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    toggleFlip() {
        this.isFlipped = !this.isFlipped;
        if (this.isFlipped) {
            this.#flip();
        } else {
            this.#unflip();
        }
    }

    matches(otherCard){
        return this.name === otherCard.name;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }
    suffleCars() {
        this.cards.sort(() => Math.random() - 0.5);
    }

    flipDownAllcards(){
        this.cards.forEach((card) => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
    }

    reset(){
        this.suffleCars();
        this.flipDownAllcards();
        this.render();
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }
    

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.points = 0;
        this.timer = 0;
        this.interval = null;
        this.pointsElement = document.getElementById("points");
        this.timerElement = document.getElementById("timer");
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.startTimer();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {
        const [firstCard, secondCard] = this.flippedCards;
        if (firstCard.matches(secondCard)) {
            this.matchedCards.push(firstCard, secondCard);
            this.flippedCards = [];
            this.updatePoints();

            if (this.matchedCards.length === this.board.cards.length) {
                setTimeout(() => {
                    alert("¡Has ganado!");
                    this.resetGame();
                }, this.flipDuration);
            }
        } else {
            this.flippedCards.forEach((card) => card.toggleFlip());
            this.flippedCards = [];
        }
    }
    updatePoints () {
        this.points += 1;
        this.pointsElement.textContent = this.points;
    }

    startTimer() {
        this.timer = 0;
        this.interval = setInterval(() => {
            this.timer += 1;
            this.timerElement.textContent = this.timer;
        }, 1000);
    }


    resetGame() {
        this.points = 0;
        this.timer = 0;
        this.pointsElement.textContent = this.points;
        this.timerElement.textContent = this.timer;
        this.matchedCards = [];
        this.startTimer();
        this.flippedCards = [];
        clearInterval(this.interval);
        this.board.reset();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];



    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    board.render();

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
