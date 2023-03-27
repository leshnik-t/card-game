import './cardGame.css';
import shuffle from '../../helpers/shuffle.js';

class CardGame {
    constructor( 
        cardsImageElements,
        appendToElement,
        {
            numberOfCards = 22,
            numberOfEmptySlots = 5,
            cardAnimationType = 'flip-direct',
            btnNewGameExists = true,
        } = {}) 
    {
        this.cardImageElements = cardsImageElements;
        this.appendToElement = appendToElement;
        this.numberOfCards = numberOfCards;
        this.numberOfEmptySlots = numberOfEmptySlots;
        this.cardAnimationType = cardAnimationType;
        this.btnNewGameExists = btnNewGameExists;
        this._emptySlots = Array(this.numberOfEmptySlots).fill(false);

        this._animationInProgress = false;
        this.chosenCards = [];

        //-> begin adding DOM elements
        const parentElement = document.querySelector(appendToElement);

        const tarotGameContainer = document.createElement('div');
        tarotGameContainer.className = 'tarot-game-container';

        const headingCardBlock = document.createElement('h3');
        headingCardBlock.textContent = `Choose ${this.numberOfEmptySlots} cards`;
        tarotGameContainer.appendChild(headingCardBlock);

        const cardsContainer = document.createElement('div');
        cardsContainer.id = 'cards-container';

        tarotGameContainer.appendChild(cardsContainer);
        this._createCardsIntoContainer(cardsContainer);

        const headingEmptySlotsBlock = document.createElement('h3');
        headingEmptySlotsBlock.textContent = 'Your result';
        tarotGameContainer.appendChild(headingEmptySlotsBlock);

        const chosenCardsContainer = document.createElement('div');
        chosenCardsContainer.id = 'chosen-cards-container';
        tarotGameContainer.appendChild(chosenCardsContainer);

        for (let i = 0; i < numberOfEmptySlots; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'empty-slot';
            emptySlot.setAttribute('data-order', i);

            chosenCardsContainer.appendChild(emptySlot);
        }

        parentElement.prepend(tarotGameContainer);
        //<- end adding DOM elements
        
        this.updateCardGameView().then(() => {
            this._addEventListeners();
        });
    }

    _createCardsIntoContainer(container) {
        const cardsValueArray = this._createRandomizedValueArray(this.numberOfCards);

        for (let i = 0; i < this.numberOfCards; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-order', i);
            card.setAttribute('data-value', cardsValueArray[i]);
            container.appendChild(card);
            
            const clone = this.cardImageElements[0]['image'].cloneNode();
            card.appendChild(clone);
            card.firstChild.className = 'image-responsive';
        }
    }
    
    _addEventListeners() {
        const tarotGameContainer = document.querySelector(this.appendToElement + ' .tarot-game-container');
        const cardsCollection = document.querySelectorAll(this.appendToElement + ' .card');
        const emptySlotsCollection = document.querySelectorAll(this.appendToElement + ' .empty-slot');
        
        for (const slot of emptySlotsCollection) {
            slot.style.cursor = "pointer";
        }
        for (const card of cardsCollection) {
            card.style.cursor = "pointer";
        }

        this.numberOfEmptySlots = emptySlotsCollection.length;
        tarotGameContainer.addEventListener('click', this._clickCardHandler);
        tarotGameContainer.addEventListener('dblclick', this._clickCardHandler);
    }

    async updateCardGameView() {
        const cardsCollection = document.querySelectorAll(this.appendToElement + ' .card'); 
        const emptySlotCollection = document.querySelectorAll(this.appendToElement + ' .empty-slot');

        await this._drawHorizontalCollectedElements(emptySlotCollection);
        return await this._drawHorizontalCollectedElements(cardsCollection, true);
        
    }

    _createRandomizedValueArray(arrayLength) {
        const valueArray = [];
        for (let i = 0; i < arrayLength; i++) {
            valueArray.push(i);
        }
        shuffle(valueArray);
        return valueArray;
    }

    async _checkAnimationEnd(element, keyframes, timing, targetElement) {
        element.animate(keyframes, timing);
       
        const values = await Promise.all(
            element.getAnimations({ subtree: true }).map((animation) => animation.finished)
        );

        return await Promise.resolve({ element: values[0].effect.target, target: targetElement });
    }
    
    _clickCardHandler = (event) => {
        if (this._animationInProgress || 
            !(
                event.target.className === 'card' || 
                event.target.tagName === 'IMG' && event.target.parentElement.className === 'card' || 
                event.target.className === 'empty-slot' && event.target.children.length === 0
            )) 
        return;

        if (this.numberOfEmptySlots === 0) return;

        let element;
        let targetElement;

        switch (true) {
            case (event.target.className === 'card') : 
            case (event.target.tagName === 'IMG') :
                element = this._getElementNode(event.target);
                targetElement = this._getTargetNode();
                break;
            case (event.target.className === 'empty-slot') :
                element = this._getRandomCard();
                targetElement = this._getTargetNode(event.target);
                break;
        }

        if (element === undefined || targetElement === undefined) return;
        
        this.numberOfEmptySlots--;
        this._emptySlots[targetElement.dataset.order] = true;
        this._animateCard(element, targetElement)
            .then((resolvedElement) => {
                this._checkForEndGame();
                return Promise.resolve(resolvedElement);
            });
    }

    _checkForEndGame() {
        if (this.numberOfEmptySlots === 0) {
            this._showButtons();
        }
    }

    _getElementNode(node) {
        if (node.tagName === 'IMG') {
            return node.parentElement;
        } 

        return node;
    }

    _getTargetNode(node = undefined) {
        const emptySlotCollection = document.querySelectorAll(this.appendToElement + ' .empty-slot');

        if (node === undefined) {
            for (let i = 0; i < this._emptySlots.length; i++) {
                if (!this._emptySlots[i]) {
                    return emptySlotCollection[i]
                }
            }    
        } 

        if (this._emptySlots[node.dataset.order]) {
           return undefined;
        } 

        return node;
    }

    _getRandomCard() {
        const cardsCollection = document.querySelectorAll(this.appendToElement + ' .card');
        const randomCard = Math.floor(Math.random() * (cardsCollection.length + 1));

        return cardsCollection[randomCard];
    }

    async _animateCard(element, targetElement, cardAnimationType = this.cardAnimationType) {
        switch(cardAnimationType) {
            case 'flip-direct' :
                element.classList.remove('card');
                element.classList.add('chosen-card');
                element.style.cursor = "default";
                this.chosenCards.push(element.dataset.value);
                targetElement.style.zIndex = 1;
                targetElement.style.cursor = "default";
                return await this._animationMoveToTarget(element, targetElement)
                    .then(async (resolvedElement) => {
                        const resolvedElement_1 = await this._animationFlipCard(resolvedElement.element, resolvedElement.target);
                        resolvedElement_1.element.parentElement.style.zIndex = 0;
                        return await Promise.resolve(resolvedElement_1.element);
                    });
                break;
            case 'flip-center' :
                element.classList.remove('card');
                element.classList.add('chosen-card');
                element.style.cursor = "default";
                this.chosenCards.push(element.dataset.value);
                targetElement.style.zIndex = 1;
                targetElement.style.cursor = "default";
                return await this._animationMoveToCenter(element, targetElement)
                    .then(async (resolvedElement) => {
                        const resolvedElement_1 = await this._animationFlipCard(resolvedElement.element, resolvedElement.target);
                        const resolvedElement_2 = await this._animationMoveToTarget(resolvedElement_1.element, resolvedElement_1.target);
                        resolvedElement_2.element.parentElement.style.zIndex = 0;
                        return await Promise.resolve(resolvedElement_2.element);
                    })
                break;
            case 'move-to-deck' :
                return await this._animationMoveToDeck(element, targetElement);
                break;
            default:
                break;
        }

    }
    async _animationMoveToCenter(element, lastTargetElement) {
        const targetElement = document.querySelector(this.appendToElement + ' .tarot-game-container');
        const elementComputed = element.getBoundingClientRect();
        const targetElementComputed = targetElement.getBoundingClientRect();
        
        const targetElementLeft = targetElementComputed.width/2 - elementComputed.width/2;
        const targetElementTop = targetElementComputed.height/2 - elementComputed.height/2;

        const keyframes = [
            { left: element.style.left, top: element.style.top }, 
            { left: targetElementLeft + "px", top: targetElementTop + "px" },
        ];
        
        const timing = {
            easing: "cubic-bezier(0, 1, 1, 1)",
            duration: 500, 
            fill: "forwards"
        }

        targetElement.appendChild(element);

        const resolvedElement = await this._checkAnimationEnd(element, keyframes, timing, lastTargetElement);
        return await Promise.resolve({ element: resolvedElement.element, target: resolvedElement.target });
    }

    async _animationMoveToTarget(element, targetElement) {
        const elementComputed = element.getBoundingClientRect();
        const targetElementComputed = targetElement.getBoundingClientRect();
        const targetElementComputedStyle = window.getComputedStyle(targetElement);

        const elementLeft = elementComputed.left - targetElementComputed.left;
        const elementTop =  elementComputed.top - targetElementComputed.top;
        
        const targetElementLeft = 0 - parseInt(targetElementComputedStyle.getPropertyValue('border-left-width'));
        const targetElementTop = 0 - parseInt(targetElementComputedStyle.getPropertyValue('border-top-width'));

        const keyframes = [
            { left: elementLeft + "px", top: elementTop + "px" }, 
            { left: targetElementLeft + "px", top: targetElementTop + "px" },
        ];
        
        const timing = {
            easing: "cubic-bezier(0, 1, 1, 1)",
            duration: 500, 
            fill: "forwards"
        }
        
        targetElement.appendChild(element);

        const resolvedElement = await this._checkAnimationEnd(element, keyframes, timing, targetElement);
        return await Promise.resolve({ element: resolvedElement.element, target: resolvedElement.target });
    }

    async _animationFlipCard(element, targetElement) {
        const keyframes = [
            { transform: "rotateY(0deg)"}, 
            { transform: "rotateY(90deg)"},
        ];
        
        const timing = {
            easing: "cubic-bezier(0, 1, 1, 1)",
            duration: 300, 
            fill: "forwards"
        }

        const resolvedElement = await this._checkAnimationEnd(element, keyframes, timing, targetElement);
        const clone = this.cardImageElements[parseInt(element.dataset.value) + 1]['image'].cloneNode();

        resolvedElement.element.children[0].remove();
        resolvedElement.element.appendChild(clone);
        resolvedElement.element.firstChild.className = 'image-responsive';

        const keyframesOut = [
            { transform: "rotateY(90deg)" },
            { transform: "rotateY(0deg)" },
        ];

        const resolvedElement_1 = await this._checkAnimationEnd(resolvedElement.element, keyframesOut, timing, resolvedElement.target);

        return await Promise.resolve({ element: resolvedElement_1.element, target: resolvedElement_1.target });
    }

    async _animationFlipCardReverse(element, targetElement) {
        const keyframes = [
            { transform: "rotateY(0deg)"}, 
            { transform: "rotateY(90deg)"},
        ];
        
        const timing = {
            easing: "cubic-bezier(0, 1, 1, 1)",
            duration: 300, 
            fill: "forwards"
        }

        const resolvedElement = await this._checkAnimationEnd(element, keyframes, timing, targetElement);
        const clone = this.cardImageElements[0]['image'].cloneNode();

        resolvedElement.element.children[0].remove();
        resolvedElement.element.appendChild(clone);
        resolvedElement.element.firstChild.className = 'image-responsive';

        const keyframesOut = [
            { transform: "rotateY(90deg)" },
            { transform: "rotateY(0deg)" },
        ];

        const resolvedElement_1 = await this._checkAnimationEnd(resolvedElement.element, keyframesOut, timing, resolvedElement.target);

        return await Promise.resolve({ element: resolvedElement_1.element, target: resolvedElement_1.target });
    }

    async _animationMoveToDeck(element, targetElement) {
        const elementLeft = element.getBoundingClientRect().left - targetElement.getBoundingClientRect().left;
        const elementTop =  element.getBoundingClientRect().top - targetElement.getBoundingClientRect().top;
        const targetElementLeft = elementLeft;
        const targetElementTop = 0 - parseInt(window.getComputedStyle(targetElement).getPropertyValue('border-top-width'));

        const keyframes = [
            { left: elementLeft + "px", top: elementTop + "px" }, 
            { left: targetElementLeft + "px", top: targetElementTop + "px" },
        ];
        
        const timing = {
            easing: "cubic-bezier(0, 1, 1, 1)",
            duration: 500, 
            fill: "forwards"
        }

        element.classList.remove('chosen-card');
        element.classList.add('card');
        this.chosenCards.pop();

        targetElement.style.zIndex = 1;
        targetElement.appendChild(element);

        const resolvedElement = await this._checkAnimationEnd(element, keyframes, timing, targetElement);

        return await Promise.resolve({ element: resolvedElement.element, target: resolvedElement.target });
    }

    async _drawHorizontalCollectedElements(collection, animated = false) {
        this._animationInProgress = true;

        const parentNode = collection[0].parentElement;
        parentNode.style.width = '100%';

        let parentWidth = parentNode.offsetWidth;
        const gap = 15;
        const childElementWidth = collection[0].offsetWidth;
        const expectedWidth = childElementWidth * collection.length + gap * (collection.length - 1);

        if (expectedWidth <= parentWidth) {
            parentWidth = expectedWidth;
            parentNode.style.width = expectedWidth + "px";
            parentNode.style.marginLeft = 'auto';
            parentNode.style.marginRight = 'auto';
        } else {
            parentNode.style.width = parentWidth + "px";
        }

        if (!animated) {
            for (let i = 0; i < collection.length; i++) {
                const leftPosition = ((parentWidth - childElementWidth) / (collection.length - 1)) * i;
                collection[i].style.left = leftPosition + "px";
            }
            return Promise.resolve(1);
        }
        
        await Promise.all(Array.from(collection).map((card, index) => {
            const leftPosition_1 = ((parentWidth - childElementWidth) / (collection.length - 1)) * index;
            const keyframes = [
                { left: "0px" },
                { left: leftPosition_1 + "px" }
            ];

            const timing = {
                easing: "cubic-bezier(0, 1, 1, 1)",
                duration: 50 * index,
                fill: "forwards"
            };

            return this._checkAnimationEnd(card, keyframes, timing);
        }));
        
        this._animationInProgress = false;
    }

    _showButtons() {
        document.querySelector(this.appendToElement + ' .end-game').style.display = "block";
        if (this.btnNewGameExists) {
            document.querySelector(this.appendToElement + ' .begin-new-game').style.display = "block";
        }
    }

    newGame() {
        document.querySelector(this.appendToElement + ' .end-game').style.display = "none";
        document.querySelector(this.appendToElement + ' .begin-new-game').style.display = "none";

        const cardsContainer = document.querySelector(this.appendToElement + ' #cards-container'); 
        const chosenCardsCollection = document.querySelectorAll(this.appendToElement + ' .empty-slot .chosen-card');

        Promise.all(Array.from(chosenCardsCollection).map((card) => {
            return this._animateCard(card, cardsContainer, 'move-to-deck');
        }))
        .then((resolvedArray) => {
            Promise.all(resolvedArray.map((card) => {
                return this._animationFlipCardReverse(card.element, card.target);
            }))
            .then(async (resolvedArray) => {
                const cardsContainer =  document.querySelector(this.appendToElement).children[0].children[1];
                cardsContainer.innerHTML = '';
                this._createCardsIntoContainer(cardsContainer);

                const cardsCollection = document.querySelectorAll(this.appendToElement + ' .card');

                await this._drawHorizontalCollectedElements(cardsCollection, true);

                const cardsCollection_1 = document.querySelectorAll(this.appendToElement + ' .card');
                const emptySlotsCollection = document.querySelectorAll(this.appendToElement + ' .empty-slot');

                for (const slot of emptySlotsCollection) {
                    slot.style.cursor = "pointer";
                }
                for (const card of cardsCollection_1) {
                    card.style.cursor = "pointer";
                }
                
                cardsCollection_1[0].parentElement.style.zIndex = 0;
                this.numberOfEmptySlots = emptySlotsCollection.length;
                this._emptySlots = Array(this.numberOfEmptySlots).fill(false);
            })
        });
    }

}

export default CardGame;