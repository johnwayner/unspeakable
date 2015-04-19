/**
 * Created by johnwayner on 4/18/15.
 */


Meteor.methods({
   'sitInGame': function(gameId, playerNumber) {
       var game = Games.findOne(gameId);
       var player = game.players[playerNumber];
       var user = Meteor.user();
       
       var usersGames = user.profile.games || {};
       
       if(!player || player.userId) {
           console.log("Seat already taken or doesn't exist.");
       } else if(usersGames[gameId] >= 0) {
           console.log("This user is already playing in this game.");
       } else {
           player.userId = user._id;
           Game.log(game, 'User ' + player.userId + ' sat at position ' + player.seatNumber);
           Games.update({_id: game._id}, game);
           usersGames[gameId] = playerNumber; 
           Meteor.users.update({_id: user._id}, {$set: {'profile.games': usersGames}})
       }
   },
    
    'leaveGame': function(gameId) {
        var game = Games.findOne(gameId);
        var user = Meteor.user();
        var player = game && game.players[user.profile.games[gameId]];
        
        if(player && player.userId == user._id) {
            Game.log(game, 'User ' + player.userId + ' has left position ' + player.seatNumber);
            
            delete player.userId;
            delete user.profile.games[gameId];
            
            Games.update({_id: game._id}, game);
            Meteor.users.update({_id: user._id}, {$set: {'profile.games': user.profile.games}})
        }
    },
    
    'submitWord': function(gameId, word) {
        var game = Games.findOne(gameId);
        var user = Meteor.user();
        var player = game && game.players[user.profile.games[gameId]];
        
        game = Game.playWord(game, player.seatNumber, word);
        Games.update({_id: game._id}, game);
    },
    
    'discardHand': function(gameId) {
        var game = Games.findOne(gameId);
        var user = Meteor.user();
        var player = game && game.players[user.profile.games[gameId]];

        game = Game.discardHand(game, player.seatNumber);
        Games.update({_id: game._id}, game);
    },
    
    'createGame': function(numPlayers, oathOption) {
        var game = Game.newGame(numPlayers);
        if(oathOption) {
            game.options.oath = true;
        }
        return Games.insert(game);
    },
    
    'sendChat': function(gameId, message) {
        var game = Games.findOne(gameId);
        if(!game.chat) {
            game.chat = [];
        }
        game.chat.unshift({timestamp: Date.now(), userId: Meteor.userId(), message: message});
        Games.update({_id: game._id}, game);
    }
});