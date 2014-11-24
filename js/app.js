require.config({
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'localStorage': 'lib/backbone.localStorage',
    'text': 'lib/text',
    'json2': 'lib/json2',
    'zebra_datepicker': 'lib/zebra_datepicker'
  },
  shim: {
    'underscore': {
      deps: ['jquery'],
      exports: '_'
    },
    backbone: {
      deps: ['jquery','underscore'],
      exports: 'Backbone'
    }
  }
})

require(['jquery', 'backbone', 'views/app'], function($, Backbone, AppView) {
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true;

  var appView = new AppView();
  appView.render();
  $('#dimensions-app').html( appView.render().el );

})
