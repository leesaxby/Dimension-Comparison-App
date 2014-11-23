define(['jquery', 'underscore', 'backbone', 'text!templates/explore-template.html'],
  function($, _, Backbone, exploreTemp) {

    var ExploreView = Backbone.View.extend({

      tagName: 'tr',
      template: _.template( exploreTemp ),

      events: {
        'click td': 'setEditDim'
      },
      initialize: function(opt) {
        this.parentView = opt.parentView;
        this.listenTo(this.model, 'destroy', this.removeView)
        this.model.on('change:visible', this.visible, this);
        this.model.on('change:edit', this.highlight, this);
      },
      render: function() {
        this.$el.html( this.template( { model: this.model } ) );
        return this;
      },
      setEditDim: function() {
        this.model.set({edit: true});
      },
      highlight: function() {
        if(this.model.attributes.edit) {
          this.$el.css({'background': '#ffb13b', 'color': '#ffffff'});
        } else {
          this.$el.css({'background': '', 'color': '#000000'});
        }
      },
      visible: function() {
        var visible = this.model.attributes.visible;
        if(visible) {
          this.$el.show();
        } else {
          this.$el.hide();
        }
      },
      removeView: function() {
        this.remove();
        this.unbind();
      }

    });

    return ExploreView;

});
