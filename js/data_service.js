define(['jquery'], function($) {

  function get_record_count(params) {
    return $.post('api/record_count.asp', {
              dimension_name: params.dimension_name,
              field_name: params.field_name,
              keyword: params.keyword
            });
  }
  function get_dimension_names() {
    return $.get('api/get_dimension_names.asp')
  }


  function get_suggestions(params) {
    return $.post('api/suggestions.asp', {
              dataType: "json",
              dimension_name: params.dimension_name,
              field_name: params.field_name,
              keyword: params.keyword
            })
  }

  return {
    get_record_count: get_record_count,
    get_dimension_names: get_dimension_names,
    get_suggestions: get_suggestions
  }


})
