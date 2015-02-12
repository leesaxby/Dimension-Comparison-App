define(['jquery', 'underscore', 'backbone', 'text!templates/explore-template.html'],
  function($, _, Backbone, exploreTemp) {

    var ExploreView = Backbone.View.extend({

      tagName: 'tr',
      template: _.template( exploreTemp ),

      events: {
        'click td': 'setEditDim'
      },
      initialize: function(opt) {
        //create array of editable fields to dynamically add listners
        var editFlds = _.keys(_.omit(this.model.attributes, this.model.readOnlyFlds)),
            editFldsLen = 0;
        //manually add start and end date as these are not always editable
        editFlds.push('start_date', 'end_date');

        this.parentView = opt.parentView;

        this.explore_collection = opt.explore_collection;
        this.edit_collection = opt.edit_collection;

        this.listenTo(this.model, 'destroy', this.removeView);
        this.listenTo(this.explore_collection, 'reset', this.removeView);
        this.model.on('change:visible', this.visible, this);
        this.model.on('change:edit', this.highlight, this);

        //dynamically add listeners to editable fields. editable fields will vary by dataset
        editFldsLen = editFlds.length;
        for ( ; editFldsLen-- > 0; ) {
          this.model.on('change:'+editFlds[editFldsLen] , this.render, this);
        }

      },
      render: function() {
        this.$el.html( this.template( { model: this.model } ) );
        return this;
      },
      //add model to edit to collection. app view listens to models added and renders a view
      setEditDim: function() {

        if(this.model.get('edit')) {
          this.model.set({edit: false});
          this.edit_collection.remove(this.model);
        } else {
          this.model.set({edit: true});
          this.edit_collection.add(this.model);
        }
      },
      highlight: function() {
        if(this.model.get('edit')) {
          this.$el.find('td').css({'background': '#ffad34', 'color': '#ffffff', 'border': 'solid 1px #ffad34'});
        } else {
          this.$el.find('td').css({'background': '#ffffff', 'color': '#000000', 'border': 'solid 1px #f0f0f0'});
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
