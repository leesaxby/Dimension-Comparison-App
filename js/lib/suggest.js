(function( $ ) {

  $.fn.suggest = function(options) {

    var settings = $.extend({
          posTop: 0,
          posLeft: 0
        }, options);

    var offset =  settings.target_input.offset(),
        offsetTop = (offset.top + 20),
        container = $('<div class="suggest-container"></div>'),
        list = $('<ul></ul>')

    var setValue = function() {
      settings.target_input.val( $(this).text() ).focus();
    }

    $.each(settings.items, function(i, val) {
      list.append($('<li>'+ val +'</li>'));
    })

    if($('.suggest-container').length) {
      $('.suggest-container').html(list);
    } else {
      container.append(list);
      $('body').append(container);
    }

    $('.suggest-container').on('click.setvalue', 'li', setValue)
                           .show()
                           .offset({ 'top': offsetTop, 'left': offset.left });

    $('html').on('click', function() {
      $('.suggest-container').off('.setvalue').hide();
    });

    return this;
  }

}( jQuery ))
