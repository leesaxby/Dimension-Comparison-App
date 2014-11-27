require.config({
  paths: {
    'jquery': 'lib/jquery',
    'underscore': 'lib/underscore',
    'backbone': 'lib/backbone',
    'localStorage': 'lib/backbone.localStorage',
    'text': 'lib/text',
    'json2': 'lib/json2',
    'jquery-ui': 'lib/jquery-ui'
  },
  shim: {
    'underscore': {
      deps: ['jquery'],
      exports: '_'
    },
    backbone: {
      deps: ['jquery','underscore'],
      exports: 'Backbone'
    },
    'jquery-ui': {
      deps: ['jquery']
    }
  }
})

require(['jquery', 'underscore','backbone', 'views/app'], function($, _, Backbone, AppView) {
  Backbone.emulateHTTP = true;
  Backbone.emulateJSON = true;


  function createApp() {
    $.get('api/get_dimension_names.asp', function(data) {
      _.each(data, function(obj) {
        $('#dimension_names').append('<option value="' + obj.table_name + '">' + obj.table_name + '</option>')
      })

      var appView = new AppView();
      appView.render();
      $('#dimensions-app').html( appView.render().el );
    });
  }

  createApp();


  $('#dimension_names').on('change', createApp);




})
