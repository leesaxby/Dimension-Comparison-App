define(function() {

  var constants = {
    paginate_length: 400,
    stale_arr: ['id', 'edit', 'visible', 'last_record','create_timestamp', 'assoc_dimension_name', 'rid'],
    readonly_arr: ['id', 'start_date', 'end_date', 'system', 'system_key', 'system_description', 'edit', 'visible', 'last_record', 'create_timestamp', 'rid'],
    get_url: 'api/get_dimensions.asp',
    create_url: 'api/create.asp',
    update_url: 'api/update.asp',
    delete_url: 'api/delete.asp',
    enddate_default: '31/12/2999'
  }

  return constants

})
