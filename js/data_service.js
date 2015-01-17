define(['jquery'], function($) {


  function get_record_count(params) {
    $.post('api/record_count.asp',
    {
      dimension_name: params.dimension_name,
      field_name: params.field_name,
      keyword: params.keyword
    },
    function(data) {
      params.callback(data);
    });
  }
  function get_dimension_names(callback) {
    $.get('api/get_dimension_names.asp',
    function(data) {
      callback(data)
    });
  }
  function get_suggestions(params) {
    $.post('api/suggestions.asp',
    {
      dataType: "json",
      dimension_name: params.dimension_name,
      field_name: params.field_name,
      keyword: params.keyword
    },
    function(data) {
      params.callback(data)
    })
  }

  return {
    get_record_count: get_record_count,
    get_dimension_names: get_dimension_names,
    get_suggestions: get_suggestions
  }


})
