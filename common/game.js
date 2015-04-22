/**
 * Created by johnwayner on 4/3/15.
 */

//[Name, Quantity, PointValue]
var deckInfo = {
    'A': {quantity: 10, value: 5},
    'B': {quantity: 10, value: 5},
    'C': {quantity:  2, value: 0},
    'D': {quantity:  3, value: 2},
    'E': {quantity: 10, value: 4},
    'F': {quantity:  2, value: 3},
    'G': {quantity:  2, value: 2},
    'H': {quantity:  3, value: 4},
    'I': {quantity:  9, value: 4},
    'J': {quantity:  1, value: 2},
    'K': {quantity:  1, value: 3},
    'L': {quantity:  5, value: 1},
    'M': {quantity:  3, value: 3},
    'N': {quantity:  5, value: 2},
    'O': {quantity:  8, value: 0},
    'P': {quantity:  2, value: 3},
    'Q': {quantity:  1, value: 2},
    'R': {quantity:  5, value: 4},
    'S': {quantity:  5, value: 0},
    'T': {quantity:  5, value: 2},
    'U': {quantity:  4, value: 0},
    'V': {quantity:  2, value: 1},
    'W': {quantity:  2, value: 3},
    'X': {quantity:  1, value: 4},
    'Y': {quantity:  2, value: 3},
    'Z': {quantity:  1, value: 2}
};

Game = {
    newDeck: function() {
        var deck = [];
        
        for(var letter in deckInfo) {
            var letterInfo = deckInfo[letter];
            for(var i=0; i < letterInfo.quantity; i++) {
                deck.push(letter);
            }
        }
        
        return _.shuffle(deck);
    },
    
    newPlayer: function(playerIndex, cards) {
        return {
            seatNumber: playerIndex,
            totems: 5,
            hand: cards,
            score: 0,
            rollCount: 0,
            rollTotal: 0,
            plays: [] //{word: '', value: 10, roll: 15}
        }
        
    },
    
    drawCards: function(deck, replenishDeck, count) {
        var drawn = [];
        
        if(deck.length < count) {
            count -= deck.length;
            drawn = deck.concat();
            deck = _.shuffle(replenishDeck);
        }
        
        for(var i=0; i<count; i++) {
            drawn.push(deck.shift());
        }
        
        return drawn;
    },
    
    wordMode: {
        HONOR: 'Any played word is allowed.  Players expected to follow the rules.',
        DICTIONARY: 'Only words in the built in dictionary are allowed.',
        VOTE: 'Played words will be voted on.  Word must have the support of a majority of other players to be allowed.'
    },
    
    log: function(game, message) {
        game.log.unshift({
            timestamp: Date.now(),
            message: message
        });
        
        return game;
    },
    
    newGame: function(numPlayers) {
        if(!numPlayers) {
            numPlayers = 2;
            
        }
        
        var game = {
            options: {
                wordMode: Game.wordMode.DICTIONARY,
                oath: false,
                psychotherapy: false,
                lastWords: false
            },
            drawPile: Game.newDeck(),
            discardPile: [],
            players: [],
            currentPlayer: 0,
            candidate: {
                word: null,
                timestamp: null,
                votesFor: [],
                votesAgainst: []
            },
            usedWords: [],
            log: [],
            chat: []
        };
        
        Game.log(game, 'Game created.');
        Game.log(game, 'It is player #' + game.currentPlayer + '\'s turn.');

        for(var playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
            game.players.push(Game.newPlayer(playerIndex, Game.drawCards(game.drawPile, [], 7)));
        }
        
        return game;
    },
    
    isSubset: function(hand, word) {
        var wordLetters = _.countBy(word.toUpperCase().split(''));
        var handLetters = _.countBy(hand);
        
        var invalidLetter = _.find(wordLetters, function(count, letter) {
            return (handLetters[letter] || 0) < count;
        });
        
        return !invalidLetter;
    },
    
    rollDie: function(sides) {
        if(!sides) {
            sides = 20;
        }
        
        return Math.floor(Math.random() * sides) + 1;
    },
    
    letterValue: function(letter) {
        return deckInfo[letter].value;
    },
    
    scoreWord: function(word) {
        var wordLetters = word.toUpperCase().split('');
        return _.reduce(
            wordLetters,
            function(score, letter) {
                return score + deckInfo[letter].value;
            },
            0);  
    },
    
    playWord: function(game, playerIndex, word) {
        if(!word) {
            Game.log(game, 'Player #' + playerIndex + ' attempted to play an empty word???');
            return game;
        }
        word = word.toUpperCase();
        
        Game.log(game, 'Player #' + playerIndex + ' is attempting to play \'' + word + '\'.');
        
        if(game.currentPlayer != playerIndex) {
            Game.log(game, 'Player #' + playerIndex + ' is not the current player.');
            return game;
        }

        var player = game.players[game.currentPlayer];
        var oathInvoked = false;
        
        if(player.totems == 1 && game.options.oath) {
            oathInvoked = true;
        }
        
        if(!oathInvoked && _.contains(game.usedWords, word)) {
            Game.log(game, 'Word \'' + word + '\' has already been played.');
            return game;
        }
        
        if(!oathInvoked && word.length < 3) {
            Game.log(game, 'Word \'' + word + '\' is too short');
            return game;
        }
        
        if(!Game.isSubset(player.hand, word)) {
            Game.log(game, 'Word \'' + word + '\' is not possible with hand: ' + JSON.stringify(player.hand));
            return game;
        }
        
        if(!oathInvoked && (Dictionary && game.options.wordMode == Game.wordMode.DICTIONARY && !Dictionary[word])) {
            Game.log(game, '\'' + word + '\' is not a word');
            return game;
        }
        
        var wordLetters = word.split('');
        var score = Game.scoreWord(word);
        
        _.each(wordLetters, function(letter) {
            var index = _.indexOf(player.hand, letter);
            player.hand.splice(index, 1);
            game.discardPile.push(letter);
        });

        player.hand = player.hand.concat(Game.drawCards(game.drawPile, game.discardPile, wordLetters.length));
        player.plays.push(word);
        game.usedWords.push(word);
        
        Game.log(game, 'Word \'' + word + '\' played for score: ' + score + '.');
        
        var sanityRoll = Game.rollDie(20);
        Game.log(game, 'Player rolled ' + sanityRoll + ' for sanity.');
        
        player.rollCount++;
        player.rollTotal += sanityRoll;
        
        if(sanityRoll < score && sanityRoll != 20) {
            player.totems--;
            Game.log(game, 'Sanity roll failed.  Player has ' + player.totems + ' remaining.');
            
            if(!player.totems) {
                Game.log(game, 'Player is out of the game.');
            }
            
            if(player.score + score < 100) {
                player.score += score;
            }
        } else {
            player.score += score;
            
            if(player.score >= 100) {
                Game.log(game, 'Game is over.  Winner is #' + player.seatNumber);
                game.currentPlayer = null;
                return game;
            }
        }

        var remainingPlayers = _.filter(game.players, function (player) {
            return player.totems;
        });
        
        if(remainingPlayers.length == 1) {
            Game.log(game, 'Game is over.  Winner is #' + remainingPlayers[0].seatNumber);
            game.currentPlayer = null;
        } else {
            game.currentPlayer = (game.currentPlayer+1) % game.players.length;
            while(!game.players[game.currentPlayer].totems) {
                game.currentPlayer = (game.currentPlayer+1) % game.players.length;
            }
            Game.log(game, 'It is player #' + game.currentPlayer + '\'s turn.');
        }
        
        return game;
    },
    
    discardHand: function(game, playerIndex) {
        if(game.currentPlayer != playerIndex) {
            Game.log(game, 'Player #' + playerIndex + ' is not the current player.');
            return game;
        }
        
        var player = game.players[game.currentPlayer];
        game.discardPile.concat(player.hand);
        player.hand = Game.drawCards(game.drawPile, game.discardPile, 7);

        Game.log(game, 'Player #' + playerIndex + ' discarded their hand.');

        var remainingPlayers = _.filter(game.players, function (player) {
            return player.totems;
        });

        game.currentPlayer = (game.currentPlayer+1) % game.players.length;
        while(!game.players[game.currentPlayer].totems) {
            game.currentPlayer = (game.currentPlayer+1) % game.players.length;
        }
        Game.log(game, 'It is player #' + game.currentPlayer + '\'s turn.');

        return game;
    }
};
