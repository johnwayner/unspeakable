/**
 * Created by johnwayner on 4/18/15.
 */

Meteor.startup(function() {
    SyncedCron.start();
});

SyncedCron.add({
    name: 'Hourly Game Clean Up',
    schedule: function(parser) {
        // parser is a later.parse object
        return parser.text('every 1 hours');
        //return parser.text('at 6:00 am');
    },
    job: function() {
        var oneDayAgo = moment().subtract(1, 'day').unix() * 1000;
        Games.remove({'log.0.timestamp': {$lt: oneDayAgo}})
    }
});