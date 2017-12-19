import { $each, $extend } from './../utilities'

export default {
  setValue: function (value, initial) {
    value = this.typecast(value || '')

    // Sanitize value before setting it
    var sanitized = value
    if (this.enum_values.indexOf(sanitized) < 0) {
      sanitized = this.enum_values[0]
    }

    if (this.value === sanitized) {
      return
    }

    this.input.value = this.enum_options[this.enum_values.indexOf(sanitized)]

    if (this.selectize) {
      this.selectize[0].selectize.addItem(sanitized)
    }

    this.value = sanitized
    this.onChange()
  },
  register: function () {
    this._super()
    if (!this.input) return
    this.input.setAttribute('name', this.formname)
  },
  unregister: function () {
    this._super()
    if (!this.input) return
    this.input.removeAttribute('name')
  },
  getNumColumns: function () {
    if (!this.enum_options) return 3
    var longestText = this.getTitle().length
    for (var i = 0; i < this.enum_options.length; i++) {
      longestText = Math.max(longestText, this.enum_options[i].length + 4)
    }
    return Math.min(12, Math.max(longestText / 7, 2))
  },
  typecast: function (value) {
    if (this.schema.type === 'boolean') {
      return !!value
    } else if (this.schema.type === 'number') {
      return 1 * value
    } else if (this.schema.type === 'integer') {
      return Math.floor(value * 1)
    } else {
      return '' + value
    }
  },
  getValue: function () {
    return this.value
  },
  preBuild: function () {
    var self = this
    this.input_type = 'select'
    this.enum_options = []
    this.enum_values = []
    this.enum_display = []
    var i

    // Enum options enumerated
    if (this.schema.enum) {
      var display = (this.schema.options && this.schema.options.enum_titles) || []

      $each(this.schema.enum, function (i, option) {
        self.enum_options[i] = '' + option
        self.enum_display[i] = '' + (display[i] || option)
        self.enum_values[i] = self.typecast(option)
      })
    } else if (this.schema.type === 'boolean') {
      // Boolean
      self.enum_display = (this.schema.options && this.schema.options.enum_titles) || ['true', 'false']
      self.enum_options = ['1', '0']
      self.enum_values = [true, false]
    } else if (this.schema.enumSource) {
      // Dynamic Enum
      this.enumSource = []
      this.enum_display = []
      this.enum_options = []
      this.enum_values = []

      // Shortcut declaration for using a single array
      if (!(Array.isArray(this.schema.enumSource))) {
        if (this.schema.enumValue) {
          this.enumSource = [
            {
              source: this.schema.enumSource,
              value: this.schema.enumValue
            }
          ]
        } else {
          this.enumSource = [
            {
              source: this.schema.enumSource
            }
          ]
        }
      } else {
        for (i = 0; i < this.schema.enumSource.length; i++) {
          // Shorthand for watched variable
          if (typeof this.schema.enumSource[i] === 'string') {
            this.enumSource[i] = {
              source: this.schema.enumSource[i]
            }
          } else if (!(Array.isArray(this.schema.enumSource[i]))) {
            // Make a copy of the schema
            this.enumSource[i] = $extend({}, this.schema.enumSource[i])
          } else {
            this.enumSource[i] = this.schema.enumSource[i]
          }
        }
      }

      // Now, enumSource is an array of sources
      // Walk through this array and fix up the values
      for (i = 0; i < this.enumSource.length; i++) {
        if (this.enumSource[i].value) {
          this.enumSource[i].value = this.jsoneditor.compileTemplate(this.enumSource[i].value, this.template_engine)
        }
        if (this.enumSource[i].title) {
          this.enumSource[i].title = this.jsoneditor.compileTemplate(this.enumSource[i].title, this.template_engine)
        }
        if (this.enumSource[i].filter) {
          this.enumSource[i].filter = this.jsoneditor.compileTemplate(this.enumSource[i].filter, this.template_engine)
        }
      }
    } else {
      // Other, not supported
      throw Error("'select' editor requires the enum property to be set.")
    }
  },
  build: function () {
    var self = this
    if (!this.options.compact) this.header = this.label = this.theme.getFormInputLabel(this.getTitle())
    if (this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description)

    if (this.options.compact) this.container.className += ' compact'

    this.input = this.theme.getSelectInput(this.enum_options)
    this.theme.setSelectOptions(this.input, this.enum_options, this.enum_display)

    if (this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true
      this.input.disabled = true
    }

    this.input.addEventListener('change', function (e) {
      e.preventDefault()
      e.stopPropagation()
      self.onInputChange()
    })

    this.control = this.theme.getFormControl(this.label, this.input, this.description)
    this.container.appendChild(this.control)

    this.value = this.enum_values[0]
  },
  onInputChange: function () {
    var val = this.input.value

    var sanitized = val
    if (this.enum_options.indexOf(val) === -1) {
      sanitized = this.enum_options[0]
    }
    if (sanitized) { }
    this.value = this.enum_values[this.enum_options.indexOf(val)]
    this.onChange(true)
  },
  setupSelectize: function () {
    // If the Selectize library is loaded use it when we have lots of items
    var self = this
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.selectize && (this.enum_options.length >= 2 || (this.enum_options.length && this.enumSource))) {
      var options = $extend({}, this.jsoneditor.plugins.selectize)
      if (this.schema.options && this.schema.options.selectize_options) options = $extend(options, this.schema.options.selectize_options)
      this.selectize = window.jQuery(this.input).selectize($extend(options,
        {
          create: true,
          onChange: function () {
            self.onInputChange()
          }
        }))
    } else {
      this.selectize = null
    }
  },
  postBuild: function () {
    this._super()
    this.theme.afterInputReady(this.input)
    this.setupSelectize()
  },
  onWatchedFieldChange: function () {
    var vars
    var j

    // If this editor uses a dynamic select box
    if (this.enumSource) {
      vars = this.getWatchedFieldValues()
      var selectOptions = []
      var selectTitles = []

      for (var i = 0; i < this.enumSource.length; i++) {
        // Constant values
        if (Array.isArray(this.enumSource[i])) {
          selectOptions = selectOptions.concat(this.enumSource[i])
          selectTitles = selectTitles.concat(this.enumSource[i])
        } else if (vars[this.enumSource[i].source]) {
          // A watched field
          var items = vars[this.enumSource[i].source]

          // Only use a predefined part of the array
          if (this.enumSource[i].slice) {
            items = Array.prototype.slice.apply(items, this.enumSource[i].slice)
          }
          // Filter the items
          if (this.enumSource[i].filter) {
            var newItems = []
            for (j = 0; j < items.length; j++) {
              if (this.enumSource[i].filter({ i: j, item: items[j] })) newItems.push(items[j])
            }
            items = newItems
          }

          var itemTitles = []
          var itemValues = []
          for (j = 0; j < items.length; j++) {
            var item = items[j]

            // Rendered value
            if (this.enumSource[i].value) {
              itemValues[j] = this.enumSource[i].value({
                i: j,
                item: item
              })
            } else {
              // Use value directly
              itemValues[j] = items[j]
            }

            // Rendered title
            if (this.enumSource[i].title) {
              itemTitles[j] = this.enumSource[i].title({
                i: j,
                item: item
              })
            } else {
              // Use value as the title also
              itemTitles[j] = itemValues[j]
            }
          }

          // TODO: sort

          selectOptions = selectOptions.concat(itemValues)
          selectTitles = selectTitles.concat(itemTitles)
        }
      }

      var prevValue = this.value

      this.theme.setSelectOptions(this.input, selectOptions, selectTitles)
      this.enum_options = selectOptions
      this.enum_display = selectTitles
      this.enum_values = selectOptions

      // If the previous value is still in the new select options, stick with it
      if (selectOptions.indexOf(prevValue) !== -1) {
        this.input.value = prevValue
        this.value = prevValue
      } else {
        // Otherwise, set the value to the first select option
        this.input.value = selectOptions[0]
        this.value = selectOptions[0] || ''
        if (this.parent) this.parent.onChildEditorChange(this)
        else this.jsoneditor.onChange()
        this.jsoneditor.notifyWatchers(this.path)
      }

      if (this.selectize) {
        // Update the Selectize options
        this.updateSelectizeOptions(selectOptions)
      } else {
        this.setupSelectize()
      }

      this._super()
    }
  },
  updateSelectizeOptions: function (selectOptions) {
    var selectized = this.selectize[0].selectize
    var self = this

    selectized.off()
    selectized.clearOptions()
    for (var n in selectOptions) {
      selectized.addOption({ value: selectOptions[n], text: selectOptions[n] })
    }
    selectized.addItem(this.value)
    selectized.on('change', function () {
      self.onInputChange()
    })
  },
  enable: function () {
    if (!this.always_disabled) {
      this.input.disabled = false
      if (this.selectize) {
        this.selectize[0].selectize.unlock()
      }
    }
    this._super()
  },
  disable: function () {
    this.input.disabled = true
    if (this.selectize) {
      this.selectize[0].selectize.lock()
    }
    this._super()
  },
  destroy: function () {
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label)
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description)
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input)
    if (this.selectize) {
      this.selectize[0].selectize.destroy()
      this.selectize = null
    }
    this._super()
  }
}
