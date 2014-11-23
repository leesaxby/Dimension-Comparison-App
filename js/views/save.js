define(['jquery','underscore', 'backbone', 'text!templates/save-template.html'],
  function($, _, Backbone, saveTemp) {

    var SaveView = Backbone.View.extend({

      className: 'save-container',
      template: _.template( saveTemp ),

      events: {
        'click #delete': 'delete',
        'click #cancel': 'removeView'
      },
      initialize: function() {
        this.listenTo(this.model, 'destroy', this.removeView);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model}) );
        return this;
      },
      delete: function() {
        if(!this.model.get('last_record')) {
          this.model.destroy();
        } else {
          this.$('#delete-msg').html('The last record cannot be deleted')
        }
      },
      removeView: function() {
        this.remove();
        this.unbind();
      }


    });

    return SaveView;

})
