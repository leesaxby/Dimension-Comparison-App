define(['jquery', 'underscore', 'backbone', 'text!templates/dimension-template.html'],
  function($, _, Backbone, DimTemp) {

    var DimensionView = Backbone.View.extend({

      tagName: 'tr',
      template: _.template( DimTemp ),

      events: {
        'click .edit-dim': 'edit',
        'click .remove-dim': 'removeEdit',
        'mouseover td': 'showControls',
        'mouseleave td': 'hideControls',
        'keyup input': 'suggest'
      },
      initialize: function( opt ) {
        this.parentView = opt.parentView;

        this.listenTo(this.model, 'destroy', this.removeView);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model} ) );
        return this;
      },
      edit: function() {
        this.parentView.createSaveView( this.model );
      },
      removeEdit: function() {
        this.model.set({edit: false});
        this.removeView();
      },
      showControls: function(e) {
        this.$('.edit-dim, .remove-dim').css('visibility', 'visible');
      },
      hideControls: function(e) {
        this.$('.edit-dim, .remove-dim').css('visibility', 'hidden');
      },
      suggest: function(e) {
        this.parentView.suggestInput = $(this.$(e.target));
        this.parentView.getSuggest();
      },
      removeView: function() {
        this.remove();
        this.unbind();
      }
    });



    return DimensionView;


  });
