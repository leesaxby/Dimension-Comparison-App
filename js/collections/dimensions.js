define(['jquery','backbone', 'models/dimension', 'localStorage'], function($, Backbone, Dimension, localStorage) {

  var Dimensions = Backbone.Collection.extend({
    url: "api/dimensions.json",
    parse: function(response) {
      return response;
    },
    model: Dimension,

    searchFilter: function(keyword, searchCol) {
      var field_value = "",
          search = keyword.toLowerCase(),
          values = "";

      if(searchCol) {
        this.each(function(dim) {
          if(dim.get(searchCol) !== null && typeof(dim.get(searchCol)) !== 'undefined' ) {
            field_value = dim.get(searchCol).toLowerCase();
            if(field_value.search(search) === -1) {
              dim.set({visible: false});
            } else {
              dim.set({visible: true});
            }
          } else {
            dim.set({visible: false});
          }
        })
      } else {
        this.each(function(dim) {
          values = _.values(dim.attributes).toString().toLowerCase();
          if(values.search(search) === -1) {
            dim.set({visible: false});
          } else {
            dim.set({visible: true});
          }
        })
      }
    },
    blanksFilter: function(searchCol) {
      this.each(function(dim) {
        _.each( _.pick(dim.attributes, searchCol ), function(att) {
          if(att !== null) {
            dim.set({visible: false})
          }
        })
      })
    },
    visibleAll: function(keyword) {
      this.each(function(dimension) {
        dimension.set({visible: true});
      })
    },
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
        })
      })

      return _.uniq(matches)
    }

  });

  return Dimensions;

})
