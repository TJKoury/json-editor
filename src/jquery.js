/**
 * This is a small wrapper for using JSON Editor like a typical jQuery plugin.
 */
export default function (JSONEditor) {
  if (window.jQuery || window.Zepto) {
    var $ = window.jQuery || window.Zepto
    $.jsoneditor = JSONEditor.defaults

    $.fn.jsoneditor = function (options) {
      var self = this
      var editor = this.data('jsoneditor')
      if (options === 'value') {
        if (!editor) throw Error('Must initialize jsoneditor before getting/setting the value')

        // Set value
        if (arguments.length > 1) {
          editor.setValue(arguments[1])
        } else {
           // Get value
          return editor.getValue()
        }
      } else if (options === 'validate') {
        if (!editor) throw Error('Must initialize jsoneditor before validating')

        // Validate a specific value
        if (arguments.length > 1) {
          return editor.validate(arguments[1])
        } else {
           // Validate current value
          return editor.validate()
        }
      } else if (options === 'destroy') {
        if (editor) {
          editor.destroy()
          this.data('jsoneditor', null)
        }
      } else {
        // Destroy first
        if (editor) {
          editor.destroy()
        }

        // Create editor
        editor = new JSONEditor(this.get(0), options)
        this.data('jsoneditor', editor)

        // Setup event listeners
        editor.on('change', function () {
          self.trigger('change')
        })
        editor.on('ready', function () {
          self.trigger('ready')
        })
      }

      return this
    }
  }
}
