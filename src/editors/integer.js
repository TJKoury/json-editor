 /* eslint-disable */ 
export default {
  sanitize: function (value) {
    value = value + ''
    return value.replace(/[^0-9\-]/g, '')
  },
  getNumColumns: function () {
    return 2
  }
}
