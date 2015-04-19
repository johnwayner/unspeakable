/**
 * Created by johnwayner on 4/18/15.
 */

Template.gameList.helpers({
   'games' : function() {
       return Games.find({});
   } 
});

Template.gameSummary.helpers({
    'numPlayers' : function() {
        return _.size(_.filter(this.players, function(p) {
            return p.userId;
        }));
    },
    'numSeats' : function() {
        return _.size(this.players);
    },
    'options': function() {
        if(this.options.oath) {
            return "Using Unspellable Oath Option.";
        } else {
            return '';
        }
    }
});
