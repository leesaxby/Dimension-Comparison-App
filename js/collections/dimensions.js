define(['backbone', 'models/dimension', 'constants'], function(Backbone, Dimension, constants) {

  var Dimensions = Backbone.Collection.extend({
    url: constants.get_url,
    model: Dimension,

    //sets visible property to select blank records in provided column.
    blanksFilter: function(searchCol) {
      this.each(function(dim) {
        _.each( _.pick( dim.attributes, searchCol ), function(att) {
          if( att !== null ) {
            dim.set({ visible: false });
          }
        });
      });
    },
    //sets all models to visible true
    visibleAll: function() {
      this.each(function(dimension) {
        dimension.set({ visible: true });
      });
    },
    //returns array of terms based on the keyworkd and column provided.
    suggestFilter: function(keyword, searchCol) {
      var search_word = keyword.toLowerCase(),
          matches = [];

      this.each(function(dim) {
        _.each( _.pick(dim.attributes, searchCol ), function(att) {
          if( att !== null && typeof(att) !== 'undefined' ) {
            if(att.toLowerCase().search(search_word) > -1) {
              matches.push(att );
            }
          }
        });
      });

      return _.uniq(matches);
    }

  });

  return Dimensions;

});
