define(['backbone', 'constants', 'json2'], function(Backbone, constants) {

  var Dimension = Backbone.Model.extend({
    //edit: if true, model is added to the edit_collection and a view is rendered in the edit table.
    //visible: determines if a view is visible in the explore table by changing display value (not removing model/view).
    defautls: {
      edit: false,
      visible: true,
      last_record: 0
    },
    //values not to be sent to server when persisting.
    stale: constants.stale_arr,
    //array of properties not to be editable in the app. these fields will always be present in the data.
    readOnlyFlds: constants.readonly_arr,
    //paths for non RESTful CRUD
    methodToURL: {
      'create': constants.create_url,
      'update': constants.update_url,
      'delete': constants.delete_url
    },
    //omit stale fields from data sent to server.
    toJSON: function() {
      return _.omit(this.attributes, this.stale);
    },
    //sends model id, dimension name and model values to server for each request method.
    sync: function(method, model, options) {
      var dimension_name = model.attributes.assoc_dimension_name,
          updFlds = _.omit(model.attributes,  this.stale);

      for(var i in updFlds) {
        if(updFlds[i]) {
          updFlds[i] = updFlds[i].replace(/,/g , "^");
        }
      }

      var updStr = JSON.stringify(updFlds);

      options = options || {};
      options.url = model.methodToURL[method.toLowerCase()];

      if ( method === 'create' ) {
        options.data = { dimension_name: dimension_name, data: updStr };
      }
      if ( method === 'update' ) {
        options.data = { id: model.attributes.id, dimension_name: dimension_name, data: updStr };
      }
      if ( method === 'delete' ) {
        options.data = { id: model.attributes.id, dimension_name: dimension_name };
      }

      return Backbone.sync.apply(this, arguments);
    }
  });

  return Dimension;

});
