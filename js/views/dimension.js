define(['jquery',
        'underscore',
        'backbone',
        'text!templates/dimension-template.html',
        'constants',
        'jquery-ui',
        'alphanum'],
  function($, _, Backbone, DimTemp, constants) {

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
        'contextmenu td': 'showControls',
        'mouseleave .control-container': 'hideControls',
        'keyup input': 'suggest'
      },
      initialize: function( opt ) {
        this.parentView = opt.parentView;

        this.explore_collection = opt.explore_collection;
        this.edit_collection = opt.edit_collection;
        this.minRecord = opt.minRecord;
        this.maxRecord = opt.maxRecord;

        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.removeView);
        this.model.on('change:edit', this.editChk, this);
      },
      render: function() {
        this.$el.html( this.template( {model: this.model} ) );
        this.setInputValidation();
        this.setLocals();
        return this;
      },
      setLocals: function() {
        this.$mainControls = this.$('.main-controls');
        this.$editControls = this.$('.edit-controls');
        this.$dimensionNames = this.$('#dimension-names');
        this.$newDimensionLi = this.$('.new-dimension-li');
        this.$saveNewDimensionLi = this.$('.save-new-dimension-li');
      },
      editChk: function() {
        if(!this.model.get('edit')) {
          this.removeView();
        }
      },
      saveDimension: function() {
        //as input class names are the same as database field names, we build an object of input classnames and values.
        var saveData = {},
            inputVal = "";

        this.$el.find('input').each(function(i, input) {
          inputVal = $(input).val();
          saveData[ $(input).prop('class').split(' ')[0] ] = inputVal;
        });
        //set edit to false in the explore collection which explore views listen to and then remove highlighting
        var explore_model = this.explore_collection.get(this.model.get("id"));

        explore_model.set({edit: false});
        this.model.save(saveData);
        //remove model from edit collection and also remove the view (row)
        this.edit_collection.remove(this.model);
        this.removeView();
      },
      editControlsDisplay: function() {
        this.$mainControls.toggle();
        this.$editControls.toggle();
      },
      deleteDimension: function() {
        var self = this,
            explore_collection = this.explore_collection;
        //users can only delete last record
        if(this.model.get('last_record') == 1) {
          var explore_model = this.explore_collection.get(this.model.get("id"));
          explore_model.set({edit: false});
          //destroy model in both collections which explore view listens to and removes its view
          this.model.destroy();
          explore_collection.fetch({
              data: {
                dimension_name: self.$dimensionNames.val(),
                minRec: self.minRecord,
                maxRec: self.maxRecord
              }, reset: true
          });
        } else {
          alert('Only the last record can be deleted');
        }
      },
      removeDimension: function() {
        //get reference to model in explore collection with same id as this.model.
        var explore_model = this.explore_collection.get(this.model.get("id"));
        //if explore model exists and current dimension filter is the same as the model dimensin name property then remove highlighting
        if( typeof(explore_model) !== 'undefined' && this.model.get("assoc_dimension_name") === this.$dimensionNames.val() ) {
          explore_model.set({edit: false});
        }
        //remove model from edit collection and remove view (row)
        this.edit_collection.remove(this.model);
        this.removeView();
      },
      newDimension: function() {
        //check to ensure is last dimension record before creating new record
        if(this.model.get('last_record') === 1) {
          this.$newDimensionLi.toggle();
          this.$saveNewDimensionLi.toggle();
          this.$('.start_date').toggle();
          //default end date of new records to 31/12/2999 which indicates records are open
          this.$('.end_date').val(constants.enddate_default);
          //append start date input to the row for users to enter date
          this.$('.start_date_td').append('<input type="text" class="start_date datepicker">');
          this.setInputValidation();

        } else {
          alert("you can only create new from last record");
        }
      },
      saveNewDimension: function() {
        var self = this,
            explore_collection = this.explore_collection;
            //make clone of the models attributes
            saveData = _.clone(this.model.attributes),
            //call function to format dates
            curr_startdate = this.formatDate(this.model.get("start_date")),
            new_startdate = this.formatDate(this.$('input.start_date').val()),
            inputVal = "";

        //check if current start date is before the new records start date
        if(curr_startdate < new_startdate) {
          var self = this;
          //as class name is the same as database field names, loop through inputs and update saveDate obj with input values
          this.$el.find('input').each(function(i, input) {
            //as some inputs contain multiple classes we split on space to get the first class name
            inputVal = $(input).val();
            saveData[$(input).prop("class").split(' ')[0]] = inputVal;
          });
          //set edit to false for new model
          saveData.edit = false;
          //create new model in explore collection and re fetch model from server on success,
          //delete current model id property from saveData obj as new model hasn't yet been assigned an id
          this.explore_collection.create( _.omit(saveData, ['id'] ), {success: function() {
            explore_collection.fetch({
              reset: true,
              data: {
                dimension_name: self.$dimensionNames.val(),
                minRec: self.minRecord,
                maxRec: self.maxRecord
              },
              success: function() {
                self.model.set({edit: false});
                self.edit_collection.remove(self.model);
                self.removeView();
              },
              error: function() {
                alert('Error when saving dimension');
              },
              beforeSend: function() {
                $('#wait-container').show();
              },
              complete: function() {
                $('#wait-container').hide();
              }
            });
          }});

        } else {
          alert("New start date must be after previous start date");
        }
      },
      cancelNewDimension: function() {
        //remove added startdate field if it exists
        if( this.$('input.start_date').length !== 0 ) {
          this.$('input.start_date').remove();
          this.$('.end_date').val(this.model.get('end_date'));
          this.$newDimensionLi.toggle();
          this.$saveNewDimensionLi.toggle();
          this.$('.start_date').toggle();
        }
        this.$mainControls.toggle();
        this.$editControls.toggle();
      },
      showControls: function(e) {
        e.preventDefault()

        var inputOffset = $(e.target).offset();
        var inputOffsetTop = inputOffset.top + 10;
        var inputOffsetLeft = Math.floor(inputOffset.left);

        this.$('.show-controls, .control-container').css('display', 'block');
        this.$('.control-container').offset({top: (e.pageY-5), left: (e.pageX-5)})
      },
      hideControls: function(e) {
        this.$('.show-controls, .control-container').css('display', 'none');
      },
      suggest: function(e) {
        this.parentView.createSuggest( $(this.$(e.target)) );
      },
      removeView: function() {
        this.remove();
        this.unbind();
      },
      setInputValidation: function() {
        this.$('input.datepicker').datepicker({ dateFormat: 'dd/mm/yy' });
        this.$('.validate-me').alphanum({
          allow: '(){}#:;.,?/+=_-!&%*|'
        });

      },
      formatDate: function(date) {
       var dateParts = date.split("/");
       return new Date(dateParts[2], (dateParts[1] - 1), dateParts[0]);
      }
    });



    return DimensionView;


  });
