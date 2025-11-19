# Blackjack Web Game

A modern, visually enhanced web-based implementation of the classic Blackjack card game, based on the original BASIC game from Creative Computing.

## Features

- **Beautiful UI**: Modern, gradient-based design with card animations
- **Full Blackjack Gameplay**:
  - Hit, Stand, Double Down actions
  - Insurance option when dealer shows Ace
  - Blackjack detection (pays 3:2)
  - Dealer follows standard casino rules (hit on 16, stand on 17)

- **Betting System**:
  - Starting bankroll of $1000
  - Quick bet buttons ($10, $25, $50, $100)
  - Custom bet option
  - Track your winnings and losses

- **Responsive Design**: Works on desktop, tablet, and mobile devices

- **Smooth Animations**: Cards deal with animated effects

## How to Play

1. **Open the game**: Simply open `index.html` in any modern web browser
2. **Place your bet**: Click on one of the bet amount buttons or enter a custom amount
3. **Deal**: Click the "Deal Cards" button to start the round
4. **Play your hand**:
   - **Hit**: Take another card
   - **Stand**: Keep your current hand
   - **Double Down**: Double your bet and receive exactly one more card
   - **Insurance**: Available when dealer shows an Ace (protects against dealer Blackjack)
5. **Win conditions**:
   - Get closer to 21 than the dealer without going over
   - Blackjack (Ace + 10-value card) pays 3:2
   - If you bust (go over 21), you lose immediately
   - If dealer busts and you don't, you win

## Game Rules

- **Card Values**:
  - Number cards (2-10): Face value
  - Face cards (J, Q, K): 10 points
  - Aces: 1 or 11 points (automatically adjusted)

- **Dealer Rules**:
  - Dealer must hit on 16 or less
  - Dealer must stand on 17 or more

- **Winning**:
  - Beat the dealer's hand without going over 21
  - Blackjack pays 3:2
  - Regular wins pay 1:1
  - Push (tie) returns your bet

## Files

- `index.html` - Main game structure
- `styles.css` - Visual styling and animations
- `game.js` - Game logic and functionality

## Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (no frameworks required)

## Credits

Based on the classic BASIC Blackjack game from Creative Computing, Morristown, New Jersey.
Enhanced and modernized for the web.

## Browser Compatibility

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements

Possible future additions:
- Multiple player support
- Split hand functionality
- Sound effects
- Statistics tracking
- Different difficulty levels
- Multiplayer mode

Enjoy playing!
