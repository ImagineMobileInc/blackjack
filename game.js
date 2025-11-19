// Blackjack Game - Enhanced Web Version
// Based on the classic BASIC game

class BlackjackGame {
    constructor() {
        this.deck = [];
        this.dealerHand = [];
        this.playerHand = [];
        this.splitHand = null;  // For split hands
        this.splitBet = 0;      // Bet for split hand
        this.bankroll = 1000;
        this.currentBet = 0;
        this.gameInProgress = false;
        this.dealerTurn = false;
        this.canDoubleDown = false;
        this.canSplit = false;
        this.playingSplitHand = false;

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Get all DOM elements
        this.elements = {
            dealerHand: document.getElementById('dealer-hand'),
            playerHand: document.getElementById('player-hand'),
            bankroll: document.getElementById('bankroll'),
            currentBet: document.getElementById('current-bet'),
            message: document.getElementById('message'),

            bettingControls: document.getElementById('betting-controls'),
            actionControls: document.getElementById('action-controls'),
            insuranceControls: document.getElementById('insurance-controls'),

            betButtons: document.querySelectorAll('.bet-btn'),
            customBetDiv: document.getElementById('custom-bet'),
            customBetInput: document.getElementById('custom-bet-input'),
            confirmCustomBet: document.getElementById('confirm-custom-bet'),

            dealBtn: document.getElementById('deal-btn'),
            hitBtn: document.getElementById('hit-btn'),
            standBtn: document.getElementById('stand-btn'),
            doubleBtn: document.getElementById('double-btn'),
            splitBtn: document.getElementById('split-btn'),

            insuranceYes: document.getElementById('insurance-yes'),
            insuranceNo: document.getElementById('insurance-no'),

            newGameBtn: document.getElementById('new-game-btn')
        };
    }

    attachEventListeners() {
        // Betting buttons
        this.elements.betButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBetClick(e));
        });

        this.elements.confirmCustomBet.addEventListener('click', () => this.handleCustomBet());

        // Action buttons
        this.elements.dealBtn.addEventListener('click', () => this.dealCards());
        this.elements.hitBtn.addEventListener('click', () => this.hit());
        this.elements.standBtn.addEventListener('click', () => this.stand());
        this.elements.doubleBtn.addEventListener('click', () => this.doubleDown());
        this.elements.splitBtn.addEventListener('click', () => this.split());

        // Insurance buttons
        this.elements.insuranceYes.addEventListener('click', () => this.handleInsurance(true));
        this.elements.insuranceNo.addEventListener('click', () => this.handleInsurance(false));

        // New game button
        this.elements.newGameBtn.addEventListener('click', () => this.resetGame());

        // Enter key for custom bet
        this.elements.customBetInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleCustomBet();
        });
    }

    createDeck() {
        this.deck = [];
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        // Create 1 deck (can be changed to multiple decks)
        for (let i = 0; i < 1; i++) {
            for (let suit of suits) {
                for (let value of values) {
                    this.deck.push({
                        suit: suit,
                        value: value,
                        numValue: this.getCardValue(value)
                    });
                }
            }
        }

        this.shuffleDeck();
    }

    shuffleDeck() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getCardValue(value) {
        if (value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(value)) return 10;
        return parseInt(value);
    }

    handleBetClick(e) {
        const amount = e.target.dataset.amount;

        // Remove selection from all buttons
        this.elements.betButtons.forEach(btn => btn.classList.remove('selected'));

        if (amount === 'custom') {
            this.elements.customBetDiv.style.display = 'block';
            e.target.classList.add('selected');
        } else {
            this.elements.customBetDiv.style.display = 'none';
            const betAmount = parseInt(amount);
            if (betAmount <= this.bankroll) {
                this.currentBet = betAmount;
                this.updateDisplay();
                e.target.classList.add('selected');
            } else {
                this.showMessage('Insufficient funds!', 'lose');
            }
        }
    }

    handleCustomBet() {
        const amount = parseInt(this.elements.customBetInput.value);
        if (amount > 0 && amount <= this.bankroll) {
            this.currentBet = amount;
            this.updateDisplay();
            this.elements.customBetDiv.style.display = 'none';
            this.elements.customBetInput.value = '';
        } else if (amount > this.bankroll) {
            this.showMessage('Insufficient funds!', 'lose');
        } else {
            this.showMessage('Please enter a valid bet amount', 'lose');
        }
    }

    dealCards() {
        if (this.currentBet <= 0) {
            this.showMessage('Please place a bet first!', 'lose');
            return;
        }

        this.gameInProgress = true;
        this.dealerTurn = false;
        this.dealerHand = [];
        this.playerHand = [];

        // Deduct bet from bankroll
        this.bankroll -= this.currentBet;

        // Create and shuffle deck
        this.createDeck();

        // Deal initial cards
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        this.playerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());

        this.renderHands(false); // Don't show dealer's second card
        this.updateDisplay();

        // Check for player blackjack
        if (this.calculateScore(this.playerHand) === 21) {
            // Check for dealer blackjack
            if (this.calculateScore(this.dealerHand) === 21) {
                this.renderHands(true);
                this.showMessage('Push! Both have Blackjack!', 'push');
                this.bankroll += this.currentBet; // Return bet
                this.endGame();
            } else {
                this.showMessage('BLACKJACK! You win!', 'blackjack');
                this.bankroll += this.currentBet * 2.5; // Blackjack pays 3:2
                this.endGame();
            }
            return;
        }

        // Check for dealer ace (insurance)
        if (this.dealerHand[0].value === 'A') {
            this.showInsuranceOption();
        } else {
            this.showActionControls();
        }

        // Check if player can double down (first two cards only)
        this.canDoubleDown = true;

        // Check if player can split
        this.checkSplitOption();
    }

    showInsuranceOption() {
        this.elements.bettingControls.style.display = 'none';
        this.elements.insuranceControls.style.display = 'block';
    }

    handleInsurance(takeInsurance) {
        this.elements.insuranceControls.style.display = 'none';

        if (takeInsurance) {
            const insuranceBet = this.currentBet / 2;

            // Check for dealer blackjack
            if (this.calculateScore(this.dealerHand) === 21) {
                this.renderHands(true);
                this.showMessage('Dealer has Blackjack! Insurance pays 2:1', 'push');
                this.bankroll += insuranceBet * 3; // Insurance pays 2:1 plus original insurance bet
                this.endGame();
                return;
            } else {
                this.showMessage('No dealer Blackjack. Insurance bet lost.', 'lose');
                this.bankroll -= insuranceBet;
                this.updateDisplay();
            }
        }

        // Check for dealer blackjack even if no insurance
        if (this.calculateScore(this.dealerHand) === 21) {
            this.renderHands(true);
            this.showMessage('Dealer has Blackjack! You lose.', 'lose');
            this.endGame();
            return;
        }

        this.showActionControls();
    }

    showActionControls() {
        this.elements.bettingControls.style.display = 'none';
        this.elements.actionControls.style.display = 'block';

        // Enable/disable buttons based on game state
        this.elements.doubleBtn.disabled = !this.canDoubleDown || this.currentBet > this.bankroll;

        // Only show split button if can split AND has enough money
        if (this.canSplit && this.currentBet <= this.bankroll) {
            this.elements.splitBtn.style.display = 'inline-block';
            this.elements.splitBtn.disabled = false;
        } else {
            this.elements.splitBtn.style.display = 'none';
        }
    }

    checkSplitOption() {
        // Can split if both cards have the same value
        if (this.playerHand.length === 2) {
            const card1Value = this.playerHand[0].value;
            const card2Value = this.playerHand[1].value;

            // Check if same rank or both face cards
            if (card1Value === card2Value ||
                (['J', 'Q', 'K'].includes(card1Value) && ['J', 'Q', 'K'].includes(card2Value))) {
                this.canSplit = true;
                return;
            }
        }
        this.canSplit = false;
    }

    hit() {
        this.canDoubleDown = false;
        this.canSplit = false;
        this.elements.doubleBtn.disabled = true;
        this.elements.splitBtn.style.display = 'none';

        const card = this.deck.pop();

        if (this.playingSplitHand) {
            this.splitHand.push(card);
        } else {
            this.playerHand.push(card);
        }

        this.renderHands(false);
        this.updateDisplay();

        const currentHand = this.playingSplitHand ? this.splitHand : this.playerHand;
        const score = this.calculateScore(currentHand);

        if (score > 21) {
            const handName = this.playingSplitHand ? 'Second hand' : (this.splitHand ? 'First hand' : 'Hand');
            this.showMessage(`${handName} BUST!`, 'lose');

            // If we were playing first hand and have a split hand, switch to second hand
            if (!this.playingSplitHand && this.splitHand) {
                setTimeout(() => this.switchToSplitHand(), 1500);
            } else {
                this.stand();
            }
        } else if (score === 21) {
            // Automatically stand on 21
            setTimeout(() => this.stand(), 500);
        }
    }

    stand() {
        // If we have a split hand and haven't played it yet, switch to it
        if (this.splitHand && !this.playingSplitHand) {
            setTimeout(() => this.switchToSplitHand(), 1000);
            return;
        }

        // All hands have been played, now dealer plays
        this.dealerTurn = true;
        this.elements.actionControls.style.display = 'none';
        this.renderHands(true); // Show dealer's hidden card
        this.updateDisplay();

        // Dealer plays
        this.playDealerHand();
    }

    switchToSplitHand() {
        this.playingSplitHand = true;
        this.showMessage('Playing second hand...', 'push');
        this.renderHands(false);
        this.elements.actionControls.style.display = 'block';
        this.elements.doubleBtn.disabled = true;
        this.elements.splitBtn.style.display = 'none';
    }

    doubleDown() {
        if (this.currentBet > this.bankroll) {
            this.showMessage('Insufficient funds to double down!', 'lose');
            return;
        }

        this.bankroll -= this.currentBet;
        this.currentBet *= 2;
        this.updateDisplay();

        // Get exactly one more card
        const card = this.deck.pop();
        this.playerHand.push(card);
        this.renderHands(false);
        this.updateDisplay();

        const score = this.calculateScore(this.playerHand);
        if (score > 21) {
            this.showMessage('BUST! You lose.', 'lose');
            this.endGame();
        } else {
            // Automatically stand after doubling down
            setTimeout(() => this.stand(), 1000);
        }
    }

    split() {
        // Check if player has enough money to match the bet
        if (this.currentBet > this.bankroll) {
            this.showMessage('Insufficient funds to split!', 'lose');
            return;
        }

        // Deduct the additional bet for the split hand
        this.bankroll -= this.currentBet;
        this.splitBet = this.currentBet;
        this.updateDisplay();

        // Create the split hand with the second card
        this.splitHand = [this.playerHand.pop()];

        // Deal one card to each hand
        const card1 = this.deck.pop();
        const card2 = this.deck.pop();

        this.playerHand.push(card1);
        this.splitHand.push(card2);

        this.showMessage('Playing first hand...', 'push');
        this.renderHands(false);
        this.updateDisplay();

        // Can no longer split or double down after splitting
        this.canSplit = false;
        this.canDoubleDown = false;
        this.elements.splitBtn.style.display = 'none';
        this.elements.doubleBtn.disabled = true;
    }

    async playDealerHand() {
        // Dealer must hit on 16 and below, stand on 17 and above
        while (this.calculateScore(this.dealerHand) < 17) {
            await this.sleep(1000); // Pause for effect
            const card = this.deck.pop();
            this.dealerHand.push(card);
            this.renderHands(true);
            this.updateDisplay();
        }

        await this.sleep(500);
        this.determineWinner();
    }

    determineWinner() {
        const dealerScore = this.calculateScore(this.dealerHand);
        let resultMessage = '';
        let totalWinnings = 0;

        // Evaluate first hand
        const hand1Score = this.calculateScore(this.playerHand);
        const hand1Result = this.evaluateHand(hand1Score, dealerScore, this.currentBet);
        totalWinnings += hand1Result.winnings;

        if (this.splitHand) {
            // Evaluate second hand
            const hand2Score = this.calculateScore(this.splitHand);
            const hand2Result = this.evaluateHand(hand2Score, dealerScore, this.splitBet);
            totalWinnings += hand2Result.winnings;

            // Build message for both hands
            resultMessage = `Dealer: ${dealerScore}\n`;
            resultMessage += `Hand 1 (${hand1Score}): ${hand1Result.message}\n`;
            resultMessage += `Hand 2 (${hand2Score}): ${hand2Result.message}\n`;
            resultMessage += `Total: `;

            if (totalWinnings > this.currentBet + this.splitBet) {
                resultMessage += `Win $${totalWinnings - (this.currentBet + this.splitBet)}`;
                this.showMessage(resultMessage, 'win');
            } else if (totalWinnings < this.currentBet + this.splitBet) {
                resultMessage += `Lose $${(this.currentBet + this.splitBet) - totalWinnings}`;
                this.showMessage(resultMessage, 'lose');
            } else {
                resultMessage += 'Push';
                this.showMessage(resultMessage, 'push');
            }
        } else {
            // Single hand result
            if (dealerScore > 21) {
                this.showMessage(`Dealer busts with ${dealerScore}! You win!`, 'win');
            } else if (hand1Score > 21) {
                this.showMessage(`You bust with ${hand1Score}. You lose.`, 'lose');
            } else if (hand1Score > dealerScore) {
                this.showMessage(`You win! ${hand1Score} vs ${dealerScore}`, 'win');
            } else if (hand1Score < dealerScore) {
                this.showMessage(`You lose. ${hand1Score} vs ${dealerScore}`, 'lose');
            } else {
                this.showMessage(`Push! Both have ${hand1Score}`, 'push');
            }
        }

        this.bankroll += totalWinnings;
        this.endGame();
    }

    evaluateHand(playerScore, dealerScore, bet) {
        let winnings = 0;
        let message = '';

        if (playerScore > 21) {
            message = 'Bust - Lose';
            winnings = 0;
        } else if (dealerScore > 21) {
            message = 'Dealer Bust - Win';
            winnings = bet * 2;
        } else if (playerScore > dealerScore) {
            message = 'Win';
            winnings = bet * 2;
        } else if (playerScore < dealerScore) {
            message = 'Lose';
            winnings = 0;
        } else {
            message = 'Push';
            winnings = bet;
        }

        return { winnings, message };
    }

    calculateScore(hand) {
        let score = 0;
        let aces = 0;

        // Add up all cards
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
                score += 11;
            } else {
                score += card.numValue;
            }
        }

        // Adjust for aces if busted
        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    renderHands(showDealerCard) {
        // Clear hands
        this.elements.dealerHand.innerHTML = '';
        this.elements.playerHand.innerHTML = '';

        // Render dealer hand
        this.dealerHand.forEach((card, index) => {
            if (index === 1 && !showDealerCard) {
                // Show card back for hidden card
                this.elements.dealerHand.appendChild(this.createCardBack());
            } else {
                this.elements.dealerHand.appendChild(this.createCard(card));
            }
        });

        // Render player hand(s)
        if (this.splitHand) {
            // Show both hands with labels
            const hand1Label = document.createElement('div');
            hand1Label.className = 'hand-label';
            hand1Label.textContent = this.playingSplitHand ? 'Hand 1 (played)' : 'Hand 1 (playing)';
            hand1Label.style.cssText = 'width: 100%; text-align: center; font-weight: bold; margin-bottom: 10px; color: ' + (this.playingSplitHand ? '#888' : '#ffd700');
            this.elements.playerHand.appendChild(hand1Label);

            // Render first hand
            const hand1Container = document.createElement('div');
            hand1Container.style.cssText = 'display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; opacity: ' + (this.playingSplitHand ? '0.5' : '1');
            this.playerHand.forEach(card => {
                hand1Container.appendChild(this.createCard(card));
            });
            this.elements.playerHand.appendChild(hand1Container);

            // Show score for first hand
            const score1 = document.createElement('div');
            score1.textContent = `Score: ${this.calculateScore(this.playerHand)}`;
            score1.style.cssText = 'width: 100%; text-align: center; margin-bottom: 15px; color: ' + (this.playingSplitHand ? '#888' : '#fff');
            this.elements.playerHand.appendChild(score1);

            // Render second hand
            const hand2Label = document.createElement('div');
            hand2Label.className = 'hand-label';
            hand2Label.textContent = this.playingSplitHand ? 'Hand 2 (playing)' : 'Hand 2';
            hand2Label.style.cssText = 'width: 100%; text-align: center; font-weight: bold; margin-bottom: 10px; color: ' + (this.playingSplitHand ? '#ffd700' : '#888');
            this.elements.playerHand.appendChild(hand2Label);

            const hand2Container = document.createElement('div');
            hand2Container.style.cssText = 'display: flex; gap: 10px; justify-content: center; opacity: ' + (this.playingSplitHand ? '1' : '0.5');
            this.splitHand.forEach(card => {
                hand2Container.appendChild(this.createCard(card));
            });
            this.elements.playerHand.appendChild(hand2Container);

            // Show score for second hand
            const score2 = document.createElement('div');
            score2.textContent = `Score: ${this.calculateScore(this.splitHand)}`;
            score2.style.cssText = 'width: 100%; text-align: center; color: ' + (this.playingSplitHand ? '#fff' : '#888');
            this.elements.playerHand.appendChild(score2);
        } else {
            // Render single hand normally with score
            const handContainer = document.createElement('div');
            handContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';
            this.playerHand.forEach(card => {
                handContainer.appendChild(this.createCard(card));
            });
            this.elements.playerHand.appendChild(handContainer);

            // Show score
            const scoreDiv = document.createElement('div');
            scoreDiv.textContent = `Score: ${this.calculateScore(this.playerHand)}`;
            scoreDiv.style.cssText = 'width: 100%; text-align: center; margin-top: 15px; font-size: 1.3em; color: #ffd700;';
            this.elements.playerHand.appendChild(scoreDiv);
        }

        // Add dealer score if showing
        if (showDealerCard && this.dealerHand.length > 0) {
            const dealerScoreDiv = document.createElement('div');
            dealerScoreDiv.textContent = `Score: ${this.calculateScore(this.dealerHand)}`;
            dealerScoreDiv.style.cssText = 'width: 100%; text-align: center; margin-top: 15px; font-size: 1.3em; color: #ffd700;';
            this.elements.dealerHand.appendChild(dealerScoreDiv);
        }
    }

    createCard(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';

        // Determine color based on suit
        const isRed = card.suit === '♥' || card.suit === '♦';
        cardDiv.classList.add(isRed ? 'red' : 'black');

        cardDiv.innerHTML = `
            <div class="card-top">
                <div>${card.value}</div>
                <div>${card.suit}</div>
            </div>
            <div class="card-middle">${card.suit}</div>
            <div class="card-bottom">
                <div>${card.value}</div>
                <div>${card.suit}</div>
            </div>
        `;

        return cardDiv;
    }

    createCardBack() {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-back';
        cardDiv.innerHTML = '🂠';
        return cardDiv;
    }

    updateDisplay() {
        // Update bankroll and bet
        this.elements.bankroll.textContent = `$${this.bankroll}`;
        this.elements.currentBet.textContent = `$${this.currentBet}`;
    }

    showMessage(text, type = '') {
        this.elements.message.textContent = text;
        this.elements.message.className = 'message';
        if (type) {
            this.elements.message.classList.add(type);
        }
    }

    endGame() {
        this.gameInProgress = false;
        this.canDoubleDown = false;
        this.canSplit = false;
        this.elements.actionControls.style.display = 'none';
        this.elements.bettingControls.style.display = 'none';
        this.elements.newGameBtn.style.display = 'block';
        this.updateDisplay();

        // Check if player is out of money
        if (this.bankroll <= 0) {
            this.showMessage('Game Over! You\'re out of money. Click to restart.', 'lose');
            this.elements.newGameBtn.textContent = 'Restart Game';
        }
    }

    resetGame() {
        // Check if player is out of money
        if (this.bankroll <= 0) {
            this.bankroll = 1000;
        }

        this.currentBet = 0;
        this.dealerHand = [];
        this.playerHand = [];
        this.splitHand = null;
        this.splitBet = 0;
        this.gameInProgress = false;
        this.dealerTurn = false;
        this.playingSplitHand = false;

        this.elements.dealerHand.innerHTML = '';
        this.elements.playerHand.innerHTML = '';
        this.elements.message.textContent = '';
        this.elements.message.className = 'message';
        this.elements.newGameBtn.style.display = 'none';
        this.elements.newGameBtn.textContent = 'New Game';
        this.elements.bettingControls.style.display = 'block';
        this.elements.customBetDiv.style.display = 'none';

        // Remove selected class from bet buttons
        this.elements.betButtons.forEach(btn => btn.classList.remove('selected'));

        this.updateDisplay();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new BlackjackGame();
});
