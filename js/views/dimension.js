define(['jquery', 'underscore', 'backbone', 'text!templates/dimension-template.html', 'zebra_datepicker'],
  function($, _, Backbone, DimTemp) {

    var DimensionView = Backbone.View.extend({

      tagName: 'tr',
      template: _.template( DimTemp ),

      events: {
        'click .save-dim': 'saveDim',
        'click .new-dim': 'newControls',
        'click .delete-dim': 'deleteDim',
        'click .remove-dim': 'removeEdit',
        'click .create-new-dim' : 'createNew',
        'click .cancel-new-dim' : 'cancelNew',
        'mouseover td': 'showControls',
        'mouseleave td': 'hideControls',
        'keyup input': 'suggest'
      },
      initialize: function( opt ) {
        this.parentView = opt.parentView;
        this.listenTo(this.model, 'change', this.render)
        this.listenTo(this.model, 'destroy', this.removeView);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model} ) );
        return this;
      },
      saveDim: function() {
        var saveData = {};
        this.$el.find('input').each(function(i, input) {
          saveData[$(input).prop('class')] = $(input).val();
        })
        this.model.save(saveData)
      },
      newControls: function() {
        this.$('.dim-controls, .edit-controls').toggle();


      },
      deleteDim: function() {
        if(this.model.get('last_record') == 1) {
          this.model.destroy();
        } else {
          console.log('Only the last record can be deleted')
        }
      },
      removeEdit: function() {
        this.model.set({edit: false});
        this.removeView();
      },
      createNew: function() {
        this.$('.create-new-dim, .save-new-dim').toggle();
        this.$('.start_date').toggle();
        this.$('.start_date_td').append('<input type="text" class="datepicker start_date_new">');
        this.$('input.datepicker').Zebra_DatePicker();

      },
      cancelNew: function() {
        if(this.$('.start_date_new').length !== 0) {
          console.log(this.$('.start_date_new').length)
          this.$('input.datepicker').data('Zebra_DatePicker').destroy();
          this.$('.start_date_new').remove();
          this.$('.create-new-dim, .save-new-dim, .start_date').toggle();
        }
        this.$('.dim-controls, .edit-controls').toggle();
      },
      showControls: function(e) {
        this.$('.save-dim, .new-dim, .remove-dim').css('visibility', 'visible');
      },
      hideControls: function(e) {
        this.$('.save-dim, .new-dim, .remove-dim').css('visibility', 'hidden');
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
