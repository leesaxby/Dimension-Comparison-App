define(['jquery', 'underscore', 'backbone', 'text!templates/dimension-template.html', 'jquery-ui'],
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
        'click .save-new-dim' : 'saveNewDim',
        'click .cancel-new-dim' : 'cancelNew',
        'mouseover td': 'showControls',
        'mouseleave td': 'hideControls',
        'keyup input': 'suggest'
      },
      initialize: function( opt ) {
        this.parentView = opt.parentView;
        this.dim_collection = opt.dim_collection
        this.listenTo(this.model, 'change', this.render)
        this.listenTo(this.model, 'destroy', this.removeView);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model} ) );
        this.setDatePicker();
        return this;
      },
      saveDim: function() {
        var saveData = {};
        this.$el.find('input').each(function(i, input) {
          saveData[$(input).prop('class').split(' ')[0]] = $(input).val();
        })
        this.model.save(saveData);
      },
      newControls: function() {
        this.$('.dim-controls, .edit-controls').toggle();
      },
      deleteDim: function() {
        if(this.model.get('last_record') == 1) {
          this.model.destroy();
        } else {
          alert('Only the last record can be deleted')
        }
      },
      removeEdit: function() {
        this.model.set({edit: false});
        this.removeView();
      },
      createNew: function() {
        if(this.model.get('last_record') === 1) {
          this.$('.create-new-dim, .save-new-dim').toggle();
          this.$('.start_date').toggle();
          this.$('.end_date').val('31/12/2999');
          this.$('.start_date_td').append('<input type="text" class="start_date datepicker">');
          this.setDatePicker();

        } else {
          alert("You can only create a new instance from the latest record")
        }
      },
      saveNewDim: function() {
        var self = this,
            saveData = _.clone(this.model.attributes),
            curr_startdate = this.formatDate(this.model.get("start_date")),
            new_startdate = this.formatDate(this.$('input.start_date').val());

        if(curr_startdate < new_startdate) {
          this.$el.find('input').each(function(i, input) {
            saveData[$(input).prop("class").split(' ')[0]] = $(input).val();
          })

          saveData.edit = false;
          delete saveData.id;

          this.dim_collection.create(saveData,{success: function() {
            self.dim_collection.fetch({ data: {dimension_name: $('#dimension_names').val() }});
          }});
        } else {
          alert("New start date must be after previous start date")
        }
      },
      cancelNew: function() {
        if(this.$('input.start_date').length !== 0) {
          this.$('input.start_date').remove();
          this.$('.end_date').val(this.model.get('end_date'));
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
      },
      setDatePicker: function() {
        this.$('input.datepicker').datepicker({ dateFormat: 'dd/mm/yy' });
      },
      formatDate: function(date) {
       var dateSplit = date.split("/");
       return new Date(dateSplit[2], (dateSplit[1] - 1), dateSplit[0]);
      }
    });



    return DimensionView;


  });
