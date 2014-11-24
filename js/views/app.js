define(['backbone', 'collections/dimensions', 'views/dimension', 'views/explore', 'text!templates/app-template.html', 'text!templates/explore-head-template.html'],
  function(Backbone, Dimensions, DimensionView, ExploreView, appTemp, headTemp) {

    var AppView = Backbone.View.extend({

      template: _.template( appTemp ),
      head_template: _.template( headTemp ),

      events: {
        'keyup #main-search': 'mainSearch',
        'click th': 'searchColSelect',
        'click #blanks-search': 'blankSearch',
        'click #blanks-clear': 'blanksClear',
        'click #edit-view': 'editToggle',
        'click #edit-list': 'hideSuggest',
        'click li': 'addSuggest'
      },
      initialize: function() {
        this.dimensions = new Dimensions();
        this.dimensions.fetch({reset: true});

        this.listenTo(this.dimensions, 'add', this.addExporeDim);
        this.listenTo(this.dimensions, 'reset', this.render);
        this.listenTo(this.dimensions, 'reset', this.addExploreHead);
        this.dimensions.on('change:edit', this.addEditDim, this);
      },
      render: function() {
        this.$el.html( this.template() );
        this.dimensions.each(function(dimension) {
          this.addExporeDim( dimension );
        }, this)
        return this;
      },
      addExploreHead: function() {
         this.$('#explore-tbl').prepend( this.head_template( {collection: this.dimensions} ) );
      },
      addExporeDim: function( dimension ) {
        var exploreView = new ExploreView( {model: dimension, parentView: this} );
        this.$('#explore-tbl').append( exploreView.render().el );
      },
      addEditDim: function( dimension ) {
        if( dimension.attributes.edit ) {
          var dimView = new DimensionView( {model: dimension, parentView: this} );
          this.$('#edit-tbl').append( dimView.render().el );
        }
      },
      editToggle: function() {
        var edit_list = this.$('#edit-list');
        if( edit_list.hasClass('edit-hide') ) {
          edit_list.addClass('edit-show').removeClass('edit-hide');
        } else {
          edit_list.addClass('edit-hide').removeClass('edit-show');
        }
        this.$('#edit-tbl').toggle();
        $('.show-arrow, hide-arrow').toggle()
      },
      searchColSelect: function( e ) {
        var $colHead = $(e.target);
        this.$el.find('th').css('background', '#2980b9');

        if( this.search_col === $colHead.prop('class') ) {
          this.search_col = null;
          this.$('#main-search-lbl').html('ALL');
          this.$('#blanks-search, #blanks-clear').css('display', 'none');
          this.dimensions.visibleAll();
        } else {
          this.search_col = $colHead.prop('class');
          this.$('#blanks-search').css('display', 'inline');
          this.$('#blanks-clear').css('display', 'none');
          $colHead.css({'background': '#1b557a'});
          this.$('#main-search-lbl').html(this.search_col);
          this.dimensions.visibleAll();
        }
      },
      blankSearch: function() {
        this.dimensions.blanksFilter(this.search_col);
        this.$('#blanks-search').css('display', 'none');
        this.$('#blanks-clear').css('display', 'inline');
      },
      blanksClear: function() {
        this.dimensions.visibleAll();
        $('#blanks-search, #blanks-clear').toggle();
      },
      mainSearch: function() {
        var keyword = this.$('#main-search').val();
        if( keyword ) {
          this.dimensions.searchFilter( keyword, this.search_col );
        } else {
          this.dimensions.visibleAll();
        }
      },
      getSuggest: function( input ) {
        var keyword = $(this.suggestInput).val(),
            keywordLen = keyword.length;

        if(keywordLen > 2) {
          var offset = this.suggestInput.offset(),
              height = this.suggestInput.css('height').replace('px', ''),
              width = this.suggestInput.css('width'),
              top = parseInt(offset.top) + parseInt(height) + 2,
              matches = this.dimensions.suggestFilter( keyword, this.suggestInput.prop('class') ),
              matchesLen = matches.length;

          matches.splice(10, matchesLen-10);
          if(matches.length) {
            this.$('.suggest-container').css({'display': 'block', 'min-width': width}).offset({'top': top, 'left': offset.left});
            this.$('.suggest-list').html('');
            _.each(matches, function(match) {
              this.$('.suggest-list').append('<li>'+ match +'</li>');
            })
          }
        } else {
          this.hideSuggest();
        }
      },
      addSuggest: function(e) {
        this.suggestInput.val(e.target.innerHTML);
        this.$('.suggest-list').html('');
        this.hideSuggest();
      },
      hideSuggest: function() {
        $('.suggest-container').css('display', 'none');
      }

    });

    return AppView;

})
