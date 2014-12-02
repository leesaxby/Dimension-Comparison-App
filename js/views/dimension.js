define(['jquery', 'underscore', 'backbone', 'text!templates/dimension-template.html', 'jquery-ui'],
  function($, _, Backbone, DimTemp) {

    var DimensionView = Backbone.View.extend({

      tagName: 'tr',
      template: _.template( DimTemp ),

      events: {
        'click .save': 'saveDimension',
        'click .delete': 'deleteDimension',
        'click .remove': 'removeDimension',
        'click .edit': 'editControlsDisplay',
        'click .new-dimension' : 'newDimension',
        'click .save-new-dimension' : 'saveNewDimension',
        'click .cancel-new-dimension' : 'cancelNewDimension',
        'mouseover td': 'showControls',
        'mouseleave td': 'hideControls',
        'keyup input': 'suggest'
      },
      initialize: function( opt ) {
        this.parentView = opt.parentView;

        this.explore_collection = opt.explore_collection;
        this.edit_collection = opt.edit_collection;

        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.removeView);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model} ) );
        this.setDatePicker();
        return this;
      },
      saveDimension: function() {
        //as input class names are the same as database field names, we build an object of input classnames and values.
        var saveData = {};
        this.$el.find('input').each(function(i, input) {
          saveData[ $(input).prop('class').split(' ')[0] ] = $(input).val();
        });
        //set edit to false in the explore collection which explore views listen to and then remove highlighting
        this.explore_collection.set({id: this.model.get("id"), edit: false});
        this.model.save(saveData);
        //remove model from edit collection and also remove the view (row)
        this.edit_collection.remove(this.model);
        this.removeView();
      },
      editControlsDisplay: function() {
        this.$('.main-controls, .edit-controls').toggle();
      },
      deleteDimension: function() {
        //users can only delete last record
        if(this.model.get('last_record') == 1) {
          this.explore_collection.set({id: this.model.get("id"), edit: false});
          //destroy model in both collections which explore view listens to and removes its view
          this.model.destroy();
        } else {
          alert('Only the last record can be deleted');
        }
      },
      removeDimension: function() {
        //get reference to model in explore collection with same id as this.model.
        var explore_model = this.explore_collection.get(this.model.get("id"));
        //if explore model exists and current dimension filter is the same as the model dimensin name property then remove highlighting
        if( typeof(explore_model) !== 'undefined' && this.model.get("assoc_dimension_name") === $('#dimension-names').val() ) {
          explore_model.set({edit: false});
        }
        //remove model from edit collection and remove view (row)
        this.edit_collection.remove(this.model);
        this.removeView();
      },
      newDimension: function() {
        //check to ensure is last dimension record before creating new record
        if(this.model.get('last_record') === 1) {
          this.$('.new-dimension, .save-new-dimension').toggle();
          this.$('.start_date').toggle();
          //default end date of new records to 31/12/2999 which indicates records are open
          this.$('.end_date').val('31/12/2999');
          //append start date input to the row for users to enter date
          this.$('.start_date_td').append('<input type="text" class="start_date datepicker">');
          this.setDatePicker();

        } else {
          alert("you can only create new from last record");
        }
      },
      saveNewDimension: function() {
        var self = this,
            //make clone of the models attributes
            saveData = _.clone(this.model.attributes),
            //call function to format dates
            curr_startdate = this.formatDate(this.model.get("start_date")),
            new_startdate = this.formatDate(this.$('input.start_date').val());

        //check if current start date is before the new records start date
        if(curr_startdate < new_startdate) {
          //as class name is the same as database field names, loop through inputs and update saveDate obj with input values
          this.$el.find('input').each(function(i, input) {
            //as some inputs contain multiple classes we split on space to get the first class name
            saveData[$(input).prop("class").split(' ')[0]] = $(input).val();
          });
          //set edit to false for new model
          saveData.edit = false;
          //delete current model id property from saveData obj as new model hasn't yet been assigned an id
          delete saveData.id;
          //create new model in explore collection and re fetch model from server on success
          this.explore_collection.create(saveData,{success: function() {
            self.explore_collection.fetch({ data: {dimension_name: $('#dimension-names').val() }});
          }});
          this.model.set({edit: false});
          this.edit_collection.remove(this.model);
          this.removeView();
        } else {
          alert("New start date must be after previous start date");
        }
      },
      cancelNewDimension: function() {
        //remove added startdate field if it exists
        if(this.$('input.start_date').length !== 0) {
          this.$('input.start_date').remove();
          this.$('.end_date').val(this.model.get('end_date'));
          this.$('.new-dimension, .save-new-dimension, .start_date').toggle();
        }
        this.$('.main-controls, .edit-controls').toggle();
      },
      showControls: function(e) {
        this.$('.save, .edit, .remove').css('visibility', 'visible');
      },
      hideControls: function(e) {
        this.$('.save, .edit, .remove').css('visibility', 'hidden');
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
       var dateParts = date.split("/");
       return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);

      }
    });



    return DimensionView;


  });
