define(['backbone', 'models/dimension', 'constants'], function(Backbone, Dimension, constants) {

  var Dimensions = Backbone.Collection.extend({
    url: constants.get_url,
    model: Dimension
  });

  return Dimensions;

});
