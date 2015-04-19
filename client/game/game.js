/**
 * Created by johnwayner on 4/18/15.
 */

function playerInGame(game) {
    var user = Meteor.user();
    if(!user) {
        return {};
    }
    
    var playerIndex = user.profile.games && user.profile.games[game._id];
    if(!(playerIndex >= 0)) {
        return {};
    }
    
    return game.players[playerIndex];
}

Template.game.helpers({
    'isPlaying': function() {
        return playerInGame(this).seatNumber >= 0;
    },
    'myTurn': function() {
        return this.currentPlayer>=0 && (playerInGame(this).seatNumber == this.currentPlayer);
    },
    'candidateScore': function() {
        return Session.get('candidateScore') || 0;
    },
    'validCandidate': function() {
        var word = Session.get('candidate');
        return word && (word.length >= 3) && Game.isSubset(playerInGame(this).hand, word);
    },
    'numPlayers' : function() {
        return _.size(_.filter(this.players, function(p) {
            return p.userId;
        }));
    },
    'numSeats' : function() {
        return _.size(this.players);
    },
    'options': function() {
        if(this.options && this.options.oath) {
            return "Using Unspellable Oath Option.";
        } else {
            return '';
        }
    }
});

Template.game.onRendered(function() {
    this.$('#word').focus();
});

Template.game.events({
    'submit #wordForm': function(event) {
        event.preventDefault();
    },
    'keyup #word': function(event, template) {
        var word = template.$('#word').val();
        Session.set('candidate', word);
        Session.set('candidateScore', Game.scoreWord(word));
    },
    'click #submitWord': function(event, template) {
        Meteor.call('submitWord', this._id, template.$('#word').val());
        Session.set('candidateScore', null);
        template.$('#word').val('');
    },
    'click #discardHand': function(event, template) {
        Meteor.call('discardHand', this._id);
        Session.set('candidateScore', null);
        template.$('#word').val('');
    }
});

Template.handLetters.helpers({
    'myHand': function() {
        return _.map(playerInGame(this).hand, function(letter) {
            return {
                letter: letter,
                value: Game.letterValue(letter)
            }  
        });
    }
});

Template.gamePlayer.helpers({
    'thisPlayersTurn': function() {
        var currentPlayer = Template.parentData().currentPlayer;
        return currentPlayer>=0 && (this.seatNumber == currentPlayer);
    },
    'isSittingHere': function() {
        return playerInGame(Template.parentData()).seatNumber == this.seatNumber;
    },
    'canSitHere': function() {
        return !this.userId && !(playerInGame(Template.parentData()).seatNumber >=0);
    },
    'totemIcons': function() {
        var player = this;
        return _.map(_.range(5), function(x) {
            return {
                id: this.seatNumber + 'totem' + x, 
                class: ((x >= player.totems) ? 'empty ' : '') + 'heart icon '
            };
        });
    }
});

Template.gamePlayer.events({
    'click #sitHere': function(event, template) {
        Meteor.call('sitInGame', Template.parentData()._id, this.seatNumber);
    },
    'click #leaveGame': function(event, template) {
        Meteor.call('leaveGame', Template.parentData()._id);
    }
});
