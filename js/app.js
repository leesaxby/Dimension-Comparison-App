require.config({
  //setup common paths to save from type full paths when referencing.
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'localStorage': 'lib/backbone.localStorage',
    'text': 'lib/text',
    'json2': 'lib/json2',
    'jquery-ui': 'lib/jquery-ui',
    'alphanum': 'lib/jquery.alphanum',
    'suggest': 'lib/suggest',
    'fixedheader': 'lib/fixedheader',
    'constants': 'constants',
    'data_service': 'data_service'
  },
  shim: {
    'suggest': {
      deps: ['jquery']
    },
    'fixedheader': {
      deps: ['jquery']
    },
    'alphanum': {
      deps:['jquery']
    }
  }

});

require(['views/app'], function(AppView) {
  //emulateHTTP: RESTful PUT/DELETE requests forbidden by server. this emulate by using post method.
  //emulateJSON: web server can't handle requests application/json, this will cause the JSON to be serialized
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true;
  //create appView and render it in the dimensions-app div.
  var appView = new AppView();
  $('#dimensions-app').html( appView.render().el );
});
