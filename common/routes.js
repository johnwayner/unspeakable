/**
 * Created by johnwayner on 4/18/15.
 */

Router.route('/', function () {
    this.render('gameList');
});

Router.route('/createGame', function () {
    this.render('createGame');
});

Router.route('/game/:_id', function () {
    var game = Games.findOne({_id: this.params._id});
    this.render('game', {data: game});
});
