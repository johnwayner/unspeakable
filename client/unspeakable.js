
Dictionary = null;

Template.registerHelper('formatTime', function(timestamp) {
   return moment(timestamp).format('LLL'); 
});

Template.registerHelper('fromNow', function(timestamp) {
   return moment(timestamp).fromNow(); 
});

Package.blaze.UI.registerHelper('identicon', function(context, options) {
    if(context) {
        var identicon = new Identicon(SHA256(context), 256).toString();
        return "data:image/png;base64," + identicon.toString();
    }
});