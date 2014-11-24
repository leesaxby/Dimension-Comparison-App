define(['backbone'], function(Backbone) {

  var Dimension = Backbone.Model.extend({
    defautls: {
      edit: false,
      visible: true,
      last_record: 0
    },
    stale: ['edit', 'visible', 'last_record','create_timestamp'],
    readOnlyFlds: ['id', 'start_date', 'end_date', 'system', 'system_key', 'system_description', 'create_timestamp','edit', 'visible', 'last_record'],
    methodToURL: {
    'create': 'api/create.php',
    'update': 'api/update.php',
    'delete': 'api/delete.php'
  },
  toJSON: function() {
    return _.omit(this.attributes, this.stale);
  },
  sync: function(method, model, options) {
    options = options || {};
    options.url = model.methodToURL[method.toLowerCase()];
    if ( method === 'delete' ) {
      options.data = { id: "id:" + model.attributes.id };
    }
    if ( method === 'create' ) {
      modelStr = JSON.stringify(model)
      options.data = { id: modelStr };
    }
    if ( method === 'update' ) {
      modelStr = JSON.stringify(model)
      options.data = { id: modelStr };
    }
    return Backbone.sync.apply(this, arguments);
  }
  })

  return Dimension;

})
