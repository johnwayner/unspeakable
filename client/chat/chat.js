/**
 * Created by johnwayner on 4/19/15.
 */

Template.chat.helpers({
    'ageClass': function() {
        var age = Date.now() - this.timestamp;
        
        if(age < 10000) {
            return 'highlight';
        }
        
        return '';
    }
});

Template.chat.events({
    'submit form': function(event) {
      event.preventDefault();  
    },
    'click #sendChat': function(event, template) {
        var chatInput = template.$('#chatInput');
        Meteor.call('sendChat', this._id, chatInput.val(), function() {
            chatInput.val('');
        });
    }
});

//Template.chat.onRendered(function() {
//    var template = this;
//    var container = template.find('.ui.comments');
//    container._uihooks = {
//        insertElement: function(node, next) {
//            $(node).insertBefore(next);
//            Meteor.setTimeout(function() {
//                var $comment = template.$('.comment.highlight');
//                console.log($comment);
//                $comment.effect('highlight', {}, 5000, null, false);
//            }, 500);
//        }
//    };
//});
