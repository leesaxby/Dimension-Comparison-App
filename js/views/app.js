define(['jquery',
        'underscore',
        'backbone',
        'collections/dimensions',
        'views/dimension',
        'views/explore',
        'text!templates/app-template.html',
        'text!templates/tbl-head-template.html',
        'data_service',
        'constants',
        'suggest',
        'fixedheader'],

  function($, _, Backbone, Dimensions, DimensionView, ExploreView, appTemp, tblHeadTemp, data_service, constants) {

    var AppView = Backbone.View.extend({

      template: _.template( appTemp ),
      tbl_head_template: _.template( tblHeadTemp ),

      events: {
        'click #dimension-names': 'dimensionChange',
        'click #main-search-button': 'search',
        'click #paginate-up': 'paginate',
        'click #paginate-down': 'paginate',
        'click #explore-tbl th, #fixed-header-clone th': 'filterColumnSelect',
        'click #blanks-filter': 'blankSearch',
        'click #blanks-clear': 'blanksClear',
        'click #edit-view': 'editToggle',
        'click #fix-header': 'fixHeader',
        'click #unfix-header': 'unfixHeader'
      },
      initialize: function() {
        var keyword = this.$('#main-search').val() || "";
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
      addHeads: function() {
        this.$('#explore-tbl, #edit-tbl').find('thead').remove();
        this.$('#explore-tbl, #edit-tbl').prepend( this.tbl_head_template({ collection: this.explore_collection }) );
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
      addExploreDimAll: function() {
        //create all table row views from collection models
        if( this.explore_collection.models.length > 0 ) {
          this.addHeads();
          this.explore_collection.each(function(dimension) {
            this.addExploreDim( dimension );
          }, this);
        }
      },
      //create row in edit view when model is added to edit collection
      addEditDim: function( dimension ) {
        //set property on model of associated dimension table
        var dimension_name = this.$('#dimension-names').val();

        dimension.set('assoc_dimension_name', dimension_name, {silent: true});
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
        this.$('#edit-list').toggleClass('edit-show, edit-hide');
        this.$('#edit-tbl, .show-arrow, .hide-arrow').toggle();
      },
      //show and hide blacks filtering optins when selecting column header
      filterColumnSelect: function( e ) {
        var head_class = $(e.target).prop('class');

        if( this.selected_column ) {
          $('#explore-tbl, #fixed-header-clone').find('.' + this.selected_column).css('background', '#2980b9');
          this.$('#blanks-filter, #blanks-clear').hide();
          this.selected_column = "";
        } else {
          this.selected_column = head_class;
          this.$('#blanks-clear').hide();
          this.$('#blanks-filter').show();
          $('#explore-tbl, #fixed-header-clone').find('.' + this.selected_column).css('background', '#1b557a');
        }
        this.explore_collection.visibleAll();
      },
      //filters to blank record for selected column
      blankSearch: function() {
        var self = this,
            keyword = this.keyword,
            selected_column = this.selected_column;
            dimension_name = this.$('#dimension-names').val();

        data_service.get_record_count({
          dimension_name: dimension_name,
          field_name: selected_column,
          keyword: keyword,
          blankSearch: 1,
          callback: function(data) {
            self.record_count = data;
            self.getSearchResults(1);
          }
        });

        this.$('#blanks-filter, #blanks-clear').toggle();
      },
      blanksClear: function() {
        this.$('#main-search').val('');
        this.getSearchResults();
        $('#blanks-filter, #blanks-clear').toggle();
      },
      dimensionChange: function(e) {
        var dimension_name = $('#dimension-names').val(),
            explore_collection = this.explore_collection,
            edit_collection_len = this.edit_collection.models.length;

        if( dimension_name && this.dimension_name !== dimension_name ) {

          this.explore_collection._minRec = 1;
          this.explore_collection._maxRec = constants.paginate_length;

          if( !edit_collection_len ) {
            var dimension_details = this.dimension_details,
                dimension = _.filter(dimension_details, function(details) {
                  return details.table_name === $('#dimension-names').val();
                });

            this.dimension_name = $('#dimension-names').val();

            this.unfixHeader();
            $('#wait-container').show();
            $('#blanks-filter, #blanks-clear').hide();
            this.record_count = dimension[0].record_count;
            this.selected_column = "";
            this.getSearchResults();
          } else {
            $('#dimension-names').val(this.dimension_name);
            alert("Please Remove edit records before changing dimensions");
          }
        }

      },
      search: function() {
        var self = this,
            keyword = this.keyword,
            selected_column = this.selected_column;
            dimension_name = this.$('#dimension-names').val();

        this.keyword = this.$('#main-search').val() || "";
        this.explore_collection._minRec = 1;
        this.explore_collection._maxRec = constants.paginate_length;

         data_service.get_record_count({
           dimension_name: dimension_name,
           field_name: selected_column,
           keyword: keyword,
           callback: function(data) {
             self.record_count = data;
             self.getSearchResults();
           }
         });

      },
      //fetches records from server based on provided seach word
      getSearchResults: function(blankSearch) {
        var explore_collection = this.explore_collection,
            record_count = this.record_count,
            keyword = this.keyword,
            selected_column = this.selected_column,
            dimension_name = $('#dimension-names').val();

        this.$('#wait-container, #fix-header').show();
        console.log(this.explore_collection);
        this.explore_collection.fetch({
           reset: true,
           data: {
             dimension_name: dimension_name,
             field_name: selected_column,
             keyword: keyword,
             blankSearch: blankSearch,
             minRec: explore_collection._minRec,
             maxRec: explore_collection._maxRec
           },
           success: function() {
             if( typeof(explore_collection.pluck("rid").len) !== 'undefined' ) {
               explore_collection._minRec = _.min( explore_collection.pluck("rid") ),
               explore_collection._maxRec = _.max( explore_collection.pluck("rid") );
             }
              $('#main-search-lbl').html(
                '<span class="page-info">' + explore_collection._minRec +' - '+
                explore_collection._maxRec +' of '+
                record_count + '</span>'
             );
             $('#wait-container').hide();
             $('#paginate-up, #paginate-down, #fix-header').show();
             if(selected_column) {
               $('#explore-tbl').find('.' + selected_column).css('background', '#1b557a');
             }
           }
         });
      },
      paginate: function(e) {
        var paginate_dir = e.target.id,
            paginate_len = constants.paginate_length;

        if(paginate_dir === 'paginate-up') {
          if(this.explore_collection._maxRec < this.record_count) {
            if( (this.record_count - this.explore_collection._maxRec) < paginate_len) {
              this.explore_collection._maxRec = this.record_count;
              this.explore_collection._minRec = this.record_count - paginate_len;
            } else {
              this.explore_collection._minRec += paginate_len;
              this.explore_collection._maxRec += paginate_len;
            }
            this.getSearchResults();
          }
        }

        if(paginate_dir === 'paginate-down') {
          if(this.explore_collection._minRec > 1) {
            if( this.explore_collection._minRec < paginate_len ) {
              this.explore_collection._maxRec = paginate_len;
              this.explore_collection._minRec = 1;
            } else {
              this.explore_collection._minRec -= paginate_len;
              this.explore_collection._maxRec -= paginate_len;
            }
            this.getSearchResults();
          }
        }

      },
      //gets array of dimension names and record counts from server to populate dimension names select
      getDimensionNames: function() {
        var i = 0,
            self = this,
            table_name_str;

        data_service.get_dimension_names(function(data) {
          var dimension_details_len = data.length;
          self.dimension_details = data;

          table_name_str += '<option value="">Select Dimension...</option>';
          while( dimension_details_len-- ) {
            table_name_str+= '<option value="' + data[dimension_details_len].table_name + '">' + data[dimension_details_len].table_name + '</option>';
          }
          $('#dimension-names').append(table_name_str);
        });
      },
      //gets suggested words entered into edit table inputs, then appends them to a list.
      createSuggest: function( $input ) {
        var showSuggest = this.showSuggest,
            dimension_name = $('#dimension-names').val(),
            keyword = $input.val(),
            suggest_arr = [],
            suggestLen = 0;

        if( typeof(this.timerId) !== 'undefined' ) {
          clearTimeout( this.timerId );
        }

        if( keyword.length > 2 ) {
          this.timerId = setTimeout(function() {
            var offset = $input.offset(),
                offsetTop = (offset.top + 20);

            data_service.get_suggestions({
              dimension_name: dimension_name,
              field_name: $input.prop('class'),
              keyword: keyword,
              callback: function(data) {
                if(data) {
                  suggest_arr = data.split('^'),
                  suggestLen = suggest_arr.length <= 10 ?  suggest_arr.length : 10;

                  $('#edit-list').suggest({
                    target_input: $input,
                    items: suggest_arr,
                    max_length: suggestLen,
                    posTop: offsetTop,
                    posLeft: offset.left
                  });

                }
              }

            });
          }, 1000);
        }
      },
      //add suggested term to the input
      fixHeader: function() {
        $('#explore-list').fixheader({
          target_tbl: $('#explore-tbl')
        });
        $('#fix-header, #unfix-header').toggle();
      },
      unfixHeader: function() {
        $('#fix-header').show();
        $('#unfix-header').hide();
      }
    });

    return AppView;

});
