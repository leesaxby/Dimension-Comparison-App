define(['backbone', 'json2'], function(Backbone) {

  var Dimension = Backbone.Model.extend({
    defautls: {
      edit: false,
      visible: true,
      last_record: 0
    },
    stale: ['id', 'edit', 'visible', 'last_record','create_timestamp'],
    readOnlyFlds: ['id', 'start_date', 'end_date', 'system', 'system_key', 'system_description', 'edit', 'visible', 'last_record', 'create_timestamp'],
    methodToURL: {
    'create': 'api/create.asp',
    'update': 'api/update.asp',
    'delete': 'api/delete.asp'
  },
  toJSON: function() {
    console.log(_.omit(this.attributes, this.stale))
    return _.omit(this.attributes, this.stale);
  },
  sync: function(method, model, options) {
    options = options || {};
    options.url = model.methodToURL[method.toLowerCase()];
    if ( method === 'delete' ) {
      options.data = { id: model.attributes.id, dimension_name: $('#dimension_names').val() };
    }
    if ( method === 'create' ) {
      var updFlds = _.omit(model.attributes,  this.stale),
          updStr = JSON.stringify(updFlds);
      options.data = { dimension_name: $('#dimension_names').val(), data: updStr };
    }
    if ( method === 'update' ) {
      var updFlds = _.omit(model.attributes,  this.stale),
          updStr = JSON.stringify(updFlds);
      options.data = { id: model.attributes.id, dimension_name: $('#dimension_names').val(), data: updStr };
    }
    return Backbone.sync.apply(this, arguments);
  }
  })

  return Dimension;

})
