(function($) {

  $.fn.fixheader = function( options ) {

    var settings = $.extend({
          target_tbl: null
        }, options),
        fixedHeaderClone = settings.target_tbl.find('thead').clone(),
        tblColWidth = 0;

    if( !$('#fixed-header-clone').length ) {
      this.append('<table id="fixed-header-clone"></table>')
    }

    function fixed_header_scroll() {
      tblTop = settings.target_tbl.scrollTop() + ( settings.target_tbl.find('th').outerHeight() + 10 );
      if($(window).scrollTop() > tblTop ) {
        $('#fixed-header-clone').show()
      } else {
        $('#fixed-header-clone').hide()
      }
    }

    function unfix_header() {
      $('#fixed-header-clone').html('');
      $(window).off('scroll', fixed_header_scroll);
    }

    $('#fixed-header-clone').html( fixedHeaderClone )
    .find('th').each(function(i) {
      tblColWidth =  $(settings.target_tbl.find('th')[i]).outerWidth();
      $($('#fixed-header-clone').find('th')[i]).outerWidth( tblColWidth );
    })

    $(window).on('scroll', fixed_header_scroll)
    $('#unfix-header').on('click', unfix_header )

    return this;

  }

}(jQuery))
