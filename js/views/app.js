define(['jquery', 'underscore', 'backbone', 'collections/dimensions', 'views/dimension', 'views/explore', 'text!templates/app-template.html', 'text!templates/explore-head-template.html'],
  function($, _, Backbone, Dimensions, DimensionView, ExploreView, appTemp, headTemp) {

    var AppView = Backbone.View.extend({

      template: _.template( appTemp ),
      head_template: _.template( headTemp ),

      events: {
        'change #dimension-names': 'mainSearch',
        'click #main-search-button': 'mainSearch',
        'click th': 'filterColumnSelect',
        'click #blanks-filter': 'blankSearch',
        'click #blanks-clear': 'blanksClear',
        'click #edit-view': 'editToggle',
        'click #edit-list': 'hideSuggest',
        'click li': 'addSuggest'
      },
      initialize: function() {
        var self = this,
            keyword = this.$('#main-search').val() || "";

        //get and populate dimension names select
        this.getDimensionNames();
        this.explore_collection = new Dimensions();
        this.edit_collection = new Dimensions();
        this.listenTo(this.explore_collection, 'reset', this.addExploreDimAll);
        this.listenTo(this.explore_collection, 'add', this.addExploreDim);
        this.listenTo(this.edit_collection, 'add', this.addEditDim);
      },
      render: function() {
        this.$el.html( this.template() );
        return this;
      },
      //add table headers to expore table
      addExploreHead: function() {
        this.$('#explore-tbl').find('thead').remove();
        this.$('#explore-tbl').prepend( this.head_template({ collection: this.explore_collection }) );
      },
      addExploreDimAll: function() {
        //create all table row views from collection models
        if( this.explore_collection.models.length > 0 ) {
          this.addExploreHead();
          this.explore_collection.each(function(dimension) {
            this.addExploreDim( dimension );
          }, this);
        }
      },
      //add individual rows to explore table if model matches currently selected dimension table
      addExploreDim: function( dimension ) {
        var dimension_name = dimension.get("assoc_dimension_name");

        if( typeof(dimension_name) === 'undefined' || dimension_name === $('#dimension-names').val() ) {
          var exploreView = new ExploreView({
            model: dimension,
            parentView: this,
            explore_collection: this.explore_collection,
            edit_collection: this.edit_collection
          });
          this.$('#explore-tbl').append( exploreView.render().el );
        }
      },
      //create row in edit view when model is added to edit collection
      addEditDim: function( dimension ) {
        //set property on model of associated dimension table
        dimension.set('assoc_dimension_name', this.$('#dimension-names').val(), {silent: true});
        if( dimension.attributes.edit ) {
          var dimView = new DimensionView({
            model: dimension,
            parentView: this,
            explore_collection: this.explore_collection,
            edit_collection: this.edit_collection
          });
          this.$('#edit-tbl').append( dimView.render().el );
        }
      },
      //toggle the visibility of the edit table panel
      editToggle: function() {
        var edit_list = this.$('#edit-list');

        if( edit_list.hasClass('edit-hide') ) {
          edit_list.addClass('edit-show').removeClass('edit-hide');
        } else {
          edit_list.addClass('edit-hide').removeClass('edit-show');
        }
        this.$('#edit-tbl').toggle();
        $('.show-arrow, hide-arrow').toggle();
      },
      //show and hide blacks filtering optins when selecting column header
      filterColumnSelect: function( e ) {
        var $colHead = $(e.target);
        this.$el.find('th').css('background', '#2980b9');

        if( this.selected_column === $colHead.prop('class') ) {
          this.selected_column = null;
          this.$('#blanks-filter, #blanks-clear').css('display', 'none');
          this.explore_collection.visibleAll();
        } else {
          this.selected_column = $colHead.prop('class');
          this.$('#blanks-filter').css('display', 'inline');
          this.$('#blanks-clear').css('display', 'none');
          $colHead.css({'background': '#1b557a'});
          this.explore_collection.visibleAll();
        }
      },
      //filters to blank record for selected column
      blankSearch: function() {
        this.explore_collection.blanksFilter( this.selected_column );
        this.$('#blanks-filter').css('display', 'none');
        this.$('#blanks-clear').css('display', 'inline');
      },
      blanksClear: function() {
        this.explore_collection.visibleAll();
        $('#blanks-filter, #blanks-clear').toggle();
      },
      //fetches records from server based on provided seach word
      mainSearch: function() {
        var self = this,
            keyword = this.$('#main-search').val() || "",
            dimension_details = this.dimension_details;

        var dimension = _.filter(dimension_details, function(details) {
            return details.table_name === $('#dimension-names').val();
        });

        this.selected_column = null;
        $('#blanks-filter, #blanks-clear').hide();

        this.explore_collection.fetch({
          reset: true,
          data: {
            dimension_name: $('#dimension-names').val(),
            keyword: keyword
          },
          success: function() {
            $('#main-search-lbl').html('Showing ' + self.explore_collection.models.length + ' of ' + dimension[0].record_count);
          }
        });
      },
      //gets array of dimension names and record counts from server to populate dimension names select
      getDimensionNames: function() {
        var self = this;
        $.get('api/get_dimension_names.asp', function(data) {
          self.dimension_details = data;
          $('#dimension-names').append('<option value="">Select Dimension...</option>');
          _.each(data, function(obj) {
            $('#dimension-names').append('<option value="' + obj.table_name + '">' + obj.table_name + '</option>');
          });
        });
      },
      //gets suggested words entered into edit table inputs, then appends them to a list.
      getSuggest: function( input ) {
        var keyword = $(this.suggestInput).val();

        if( keyword.length > 2 ) {
          var offset = this.suggestInput.offset(),
              height = this.suggestInput.css('height').replace('px', ''),
              width = this.suggestInput.css('width'),
              top = parseInt(offset.top) + parseInt(height) + 2,
              matches = this.explore_collection.suggestFilter( keyword, this.suggestInput.prop('class') ),
              matchesLen = matches.length;

          matches.splice(10, matchesLen-10);
          if( matches.length ) {
            this.$('.suggest-container').css({'display': 'block', 'min-width': width}).offset({'top': top, 'left': offset.left});
            this.$('.suggest-list').html('');
            _.each(matches, function(match) {
              this.$('.suggest-list').append('<li>'+ match +'</li>');
            });
          }
        } else {
          this.hideSuggest();
        }
      },
      //add suggested term to the input
      addSuggest: function(e) {
        this.suggestInput.val( e.target.innerHTML );
        this.$('.suggest-list').html('');
        this.hideSuggest();
      },
      //hide suggest div
      hideSuggest: function() {
        $('.suggest-container').css('display', 'none');
      }

    });

    return AppView;

});
