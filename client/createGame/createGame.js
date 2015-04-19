/**
 * Created by johnwayner on 4/19/15.
 */

Template.createGame.events({
    'click #createGame': function(event, template) {
        Meteor.call('createGame', template.$('#numPlayers').val(), template.$('#oathOption').prop('checked'), function(error, result) {
            if(!error) {
                Router.go('/game/' + result);
            }
        });
    }
});

Template.createGame.onRendered(function() {
    this.$('.ui.dropdown').dropdown();
    this.$('.ui.checkbox').checkbox();
});
