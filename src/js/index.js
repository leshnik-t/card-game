import '../css/style.css';
import importAllCards from './helpers/importAssets.js';
import LoadingBar from './components/loading-bar/loadingBar.js';
import CardGame from './components/card-game/cardGame.js';
let cardGame = null;

window.addEventListener('DOMContentLoaded', (event) => {
    const imageUrls = importAllCards(require.context('../assets/images/cards', false, /\.(png|svg|jpg|jpeg|gif)$/)); 
    
    let loadingBarImages = new LoadingBar('#tarot-game');
    loadingBarImages.preloadImages(imageUrls)
        .then( (resolvedElements) => {
            loadingBarImages = undefined;
            cardGame = new CardGame(resolvedElements.imageElements, resolvedElements.target, {
                numberOfCards: resolvedElements.imageElements.length - 1,
                numberOfEmptySlots: 5,
                cardAnimationType: "flip-direct",
                btnNewGameExists: true
            });
        });
    
    document.querySelector('#tarot-game').addEventListener('click', (event) => {
        if (event.target.classList.contains('btnSubmit')) {
            console.log(cardGame.chosenCards);
        }
        if (event.target.classList.contains('btnShuffle')) {
            cardGame.newGame();
        }
    })
});
window.addEventListener('resize', (event) => {
    if (!(cardGame instanceof CardGame)) return;
        
    cardGame.updateCardGameView();
});
   

