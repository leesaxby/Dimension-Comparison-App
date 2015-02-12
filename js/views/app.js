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
        'fixedheader',
        'alphanum'],

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
        'mousedown #edit-view': 'editMouseToggle',
        'mouseup': 'editMouseUp'
      },
      initialize: function() {
        var self = this;

        this.$window = $(window);
        this.selectedDimension = "",
        this.mouseDown = false;
        this.minRecord = 1;
        this.maxRecord = constants.paginate_length;
        //get and populate dimension names select

        this.exploreColl = new Dimensions();
        this.editColl = new Dimensions();

        this.listenTo(this.exploreColl, 'reset', this.addExploreDimAll);
        this.listenTo(this.editColl, 'add', this.addEditDim);
        this.listenTo(this.editColl, 'add', this.columnFit);

        $(document).on('mousemove', function(e) { self.editListResize(e) });
        this.$window.scroll( function() { self.scrollEditFormat.call(self) } ) ;
        this.$window.resize( function() { self.resizeEditFormat.call(self) } );

        // ajax call to populate select with dimension names
        this.getDimensionNames();

      },
      render: function() {
        this.$el.html( this.template() );
        this.$('.validate-me').alphanum({ allow: '(){}#:;.,?/+=_-!&%*|' })
        this.setLocals();
        return this;
      },
      setLocals: function() {
        this.$editList = this.$('#edit-list');
        this.$exploreTbl = this.$('#explore-tbl');
        this.$editView = this.$('#edit-view');
        this.$dimensionNames = this.$('#dimension-names');
        this.$blanksFilter = this.$('#blanks-filter');
        this.$blanksClear = this.$('#blanks-clear');
        this.$mainSearch = this.$('#main-search');
        this.$waitContainer = this.$('#wait-container');
      },
      // Add table headers to expore table
      addHeads: function() {
        this.$exploreTbl.find('thead').remove();
        this.$exploreTbl.prepend( this.tbl_head_template({ collection: this.exploreColl }) );
      },
      // Create all table row views from collection models
      addExploreDimAll: function() {
        var exploreCollLen = this.exploreColl.models.length;
        if( exploreCollLen ) {
          this.addHeads();
          this.exploreColl.each(function( dimension ) {
            this.addExploreDim( dimension );
          }, this);
        }
      },
      // Add individual rows to explore table if model matches currently selected dimension table
      addExploreDim: function( dimension ) {
        var dimension_name = dimension.get("assoc_dimension_name");

        if( typeof( dimension_name) === 'undefined' || dimension_name === this.$dimensionNames.val() ) {
          var exploreView = new ExploreView({
            model: dimension,
            parentView: this,
            explore_collection: this.exploreColl,
            edit_collection: this.editColl
          });
          this.$exploreTbl.append( exploreView.render().el );
        }
      },
      //create row in edit view when model is added to edit collection
      addEditDim: function( dimension ) {
        var minRecord = this.minRecord,
            maxRecord = this.maxRecord;
        //set property on model of associated dimension table
        dimension.set('assoc_dimension_name', this.selectedDimension, {silent: true});
       if( dimension.attributes.edit ) {
          var dimView = new DimensionView({
            model: dimension,
            parentView: this,
            explore_collection: this.exploreColl,
            edit_collection: this.editColl,
            minRecord: minRecord,
            maxRecord: maxRecord
          });
          this.$('#edit-tbl').append( dimView.render().el );
        }
      },
      //toggle the visibility of the edit table panel
      editMouseToggle: function() {
        this.mouseDown = !this.mouseDown;
      },
      editMouseUp: function() {
        this.mouseDown = false;
      },
      //show and hide blacks filtering optins when selecting column header
      filterColumnSelect: function( e ) {
        var headClass = $(e.target).prop('class');

        if( this.selectedCol ) {
          this.$exploreTbl.find( '.' + this.selectedCol ).css({ 'background': '#2980b9' });
          this.$('#fixed-header-clone').find( '.' + this.selectedCol ).css({ 'background': '#2980b9' });
          this.$blanksFilter.hide();
          this.$blanksClear.hide();
          this.selectedCol = "";
        } else {
          this.selectedCol = headClass;
          this.$blanksClear.hide();
          this.$blanksFilter.show();
          this.$exploreTbl.find( '.' + this.selectedCol ).css({ 'background': '#1b557a' });
          this.$('#fixed-header-clone').find( '.' + this.selectedCol ).css({ 'background': '#1b557a' });
        }
      },
      //filters to blank record for selected column
      blankSearch: function() {
        this.mainSearch(1);
        this.$blanksFilter.toggle();
        this.$blanksClear.toggle();
      },
      blanksClear: function() {
        this.$mainSearch.val('');
        this.mainSearch('', '');
        this.$blanksFilter.toggle();
        this.$blanksClear.toggle();
      },
      dimensionChange: function(e) {
        var exploreColl = this.exploreColl,
            editCollLen = this.editColl.models.length;

      if( this.$dimensionNames.val() && this.selectedDimension !== this.$dimensionNames.val() ) {
          if( !editCollLen ) {
            var self = this;

            this.selectedDimension = this.$dimensionNames.val();
            this.record_count = this.dimensionDetails[ this.$dimensionNames.val() ];
            this.selectedCol = "";
            this.minRecord = 1;
            this.maxRecord = constants.paginate_length;

            exploreColl.fetch({
              reset: true,
              data: {
                dimension_name: this.selectedDimension,
                minRec: this.minRecord,
                maxRec: this.maxRecord
              },
              success: function() {
                self.minRecord = _.min(exploreColl.pluck("rid")) || 0;
                self.maxRecord = _.max(exploreColl.pluck("rid")) || 0;

                $('#paginate-up, #paginate-down').show();
                $('#main-search-lbl').html(
                  '<span class="page-info">' + self.minRecord +' - '+
                  self.maxRecord + ' of ' + self.record_count + '</span>'
                );
                self.$editList.css('width', self.$exploreTbl.width());
                self.fixHeader();
              },
              error: function(err) {
               alert("Error getting dimensions");
              },
              beforeSend: function() {
                self.$waitContainer.show();
                self.$blanksFilter.hide();
                self.$blanksClear.hide();
              },
              complete: function() {
                self.$waitContainer.hide();
              }
            });
          } else {
            this.$dimensionNames.val(this.selectedDimension);
            alert("Please Remove edit records before changing dimensions");
          }
        }
      },
      search: function() {
        var self = this;
        this.keyword = this.$mainSearch.val() || "";
        this.minRecord = 1;
        this.maxRecord = constants.paginate_length;

        var searchResults = data_service.get_record_count({
                              dimension_name: self.$dimensionNames.val(),
                              field_name: self.selectedCol,
                              keyword: self.keyword
                            });

        $.when( searchResults ).done(function(data) {
          self.record_count = data;
          self.mainSearch();
        });

      },
      //fetches records from server based on provided seach word
      mainSearch: function(blankSearch) {

        var self = this,
            exploreColl = this.exploreColl,
            record_count = this.record_count,
            keyword = this.keyword,
            selectedCol = this.selectedCol;

         exploreColl.fetch({
            reset: true,
            data: {
              dimension_name: self.$dimensionNames.val(),
              field_name: selectedCol,
              keyword: keyword,
              blankSearch: blankSearch,
              minRec: this.minRecord + "",
              maxRec: this.maxRecord + ""
            },
            success: function() {
              if( typeof(exploreColl.pluck("rid").len) !== 'undefined' ) {
                self.minRecord = _.min(exploreColl.pluck("rid"));
                self.maxRecord = _.max(exploreColl.pluck("rid"));
              }
              if(record_count <= self.maxRecord) {
                self.maxRecord = record_count;
              }

              var records = $('<span class="page-info">'+self.minRecord+' - '+self.maxRecord+' of '+record_count+'</span>');
              $('#main-search-lbl').html( records );
              self.$editList.css('width', self.$exploreTbl.width());
              self.fixHeader();
             // self.columnFit();
              if(selectedCol) {
                self.$exploreTbl.find('.' + selectedCol).css('background', '#1b557a');
              }
            },
            error: function() {
              alert("Error when getting dimensions");
            },
            beforeSend: function() {
              self.$waitContainer.show();
            },
            complete: function() {
              self.$waitContainer.hide();
            }
          });
      },
      paginate: function(e) {
        var paginateDirect = e.target.id,
            paginateLen = constants.paginate_length,
            recordCount = this.record_count,
            maxRecord = this.maxRecord,
            minRecord = this.minRecord,
            exploreColl = this.exploreColl;

        if( paginateDirect === 'paginate-up') {
          if( maxRecord < recordCount ) {
            if( ( recordCount - maxRecord ) < paginateLen ) {
              this.maxRecord = recordCount;
              this.minRecord = ( recordCount - paginateLen );
            } else {
              this.minRecord += paginateLen;
              this.maxRecord += paginateLen;
            }
            this.mainSearch();
          }
        }

        if( paginateDirect === 'paginate-down' ) {
          if(minRecord > 1 ) {
            if( minRecord < paginateLen ) {
              this.maxRecord = paginateLen;
              this.minRecord = 1;
            } else {
              this.minRecord -= paginateLen;
              this.maxRecord -= paginateLen;
            }
            this.mainSearch();
          }
        }

      },
      //gets array of dimension names and record counts from server to populate dimension names select
      getDimensionNames: function() {
        var i = 0,
            self = this;

        var getDims = data_service.get_dimension_names();

        $.when( getDims ).done(function(data) {
          var dataLen = data.length,
              dimensionDetails = {};

          for(;i < dataLen; i++) {
            dimensionDetails[data[i].table_name] = data[i].record_count
          }
          self.dimensionDetails = dimensionDetails;

          self.$dimensionNames.detach()
                              .append( $('<option value="">Select Dimension...</option>') )

          _.each(dimensionDetails, function(recCount, tableName) {
            self.$dimensionNames.append( $('<option value="' + tableName + '">' + tableName + '</option>') );
          })

          self.$('#paginate-conatainer').prepend( self.$dimensionNames )
        });

      },
      //gets suggested words entered into edit table inputs, then appends them to a list.
      createSuggest: function( $input ) {
        var self = this,
            showSuggest = this.showSuggest,
            keyword = $input.val(),
            suggest_arr = [];

        if( typeof(this.timerId) !== 'undefined' ) {
          clearTimeout( this.timerId );
        }

        if( keyword.length > 2 ) {
          this.timerId = setTimeout(function() {
            var suggestions = data_service.get_suggestions({
                                dimension_name: self.$dimensionNames.val(),
                                field_name: $input.prop('class').split(' ')[0],
                                keyword: keyword
                              })

            $.when( suggestions ).done(function(data) {
              if(data) {
                suggest_arr = data.split('^');
                $('.suggest').suggest({
                  target_input: $input,
                    items:  suggest_arr
                  });
                }
            })

          }, 1000);
        }
      },
      //add suggested term to the input
      fixHeader: function() {
        $('#explore-list').fixheader({ target_tbl: this.$exploreTbl });
      },
      columnFit: function() {
        var exploreTr = $($('#explore-tbl tbody').find('tr')[0]),
            editTr = $($('#edit-tbl tbody').find('tr')),
            exploreTd = null;

        $(editTr).each(function(i, tr) {
          $(tr).find('td').each(function(i, td) {
            exploreTd = $(exploreTr).find('td');
            $(td).css({ 'width': $(exploreTd[i]).width() + 'px' });
          });
        });
      },
      scrollEditFormat: function() {
        var scrollLeft = this.$window.scrollLeft(),
            scrollTop = this.$window.scrollTop(),
            windowHeight = this.$window.height(),
            editHeight = this.$editList.height(),
            horizontalScroll = 0,
            absoluteEditPosition = 0,
            fixedEditPosition = 0;

        if( this.$window.scrollLeft() !== horizontalScroll) {
          horizontalScroll = scrollLeft;
          absoluteEditPosition = ( scrollTop + windowHeight ) - editHeight;
          this.$editView.css({'position': 'absolute', 'left': '0px'});
          this.$editList.css({'position': 'absolute', 'left': '0px'});
          this.$editList.css({'top': absoluteEditPosition});
         } else {
          fixedEditPosition = ( windowHeight - editHeight );
          this.$editList.css({ 'position': 'fixed', 'top': fixedEditPosition, 'left': - scrollLeft });
          this.$editView.css({' position': 'fixed' });
        }
      },
      resizeEditFormat: function() {
        var absolutePos = (this.$window.scrollTop() + this.$window.height()) - this.$editList.height();

        this.$editList.css({'position': 'absolute', 'top': absolutePos});
        this.$editView.css({'position': 'absolute'});
        this.$editList.css('width', this.$exploreTbl.width());
        this.columnFit();
      },
      editListResize: function(e) {
        if( this.mouseDown ) {
          var mouseY = e.pageY,
              windowHeight = this.$window.height(),
              windowTop = this.$window.scrollTop();
        //if(mouseY < (windowHeight-50)) {
            this.$editList.height( (windowHeight + 20) - (mouseY - windowTop) )
                          .offset({ top: ( mouseY - 10 ) });
        //}
        }
      },
    });

    return AppView;

});
