
(function( $ ) {

  $.fn.suggest = function(options) {

    var i = 0
        list_html = "",

        settings = $.extend({
          max_length: 50,
          posTop: 0,
          posLeft: 0
        }, options);

    if(!$('.suggest-container').length) {
      this.append('<div class="suggest-container scroll"><ul class="suggest-list"></ul></div>')
    }

    while(i < settings.max_length) {
      list_html += '<li>'+ settings.items[i] +'</li>';
      i++;
    }

    $('.suggest-list').html( list_html );
    $('.suggest-container').on('click', 'li', function() {
      settings.target_input.val( $(this).html() );
      $(this).hide()
    })
    .show()
    .offset({ 'top': settings.posTop, 'left': settings.posLeft });

    $('html').on('click', function() {
      $('.suggest-container').off().hide()
    });

    return this;
  }

}( jQuery ))
