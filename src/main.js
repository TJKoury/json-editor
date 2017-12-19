/*! JSON Editor v0.7.28 - JSON Schema -> HTML Editor
 * By Jeremy Dorn - https://github.com/jdorn/json-editor/
 * Released under the MIT license
 *
 * Date: 2016-08-07
 */

/**
 * See README.md for requirements and usage info
 */

import _core from './core'
import LZString from 'lz-string'
window.JSONEditor = _core
window.LZString = LZString
let _themes = ['barebones', 'bootstrap2', 'bootstrap3', 'foundation', 'html', 'jqueryui']
_themes.forEach(theme => {
  window.JSONEditor.addTheme(theme, require('./themes/' + theme + '.js'))
})
let _editors = ['arraySelectize',
  'array',
  'base64',
  'checkbox',
  'enum',
  'integer',
  'multiple',
  'multiselect',
  'null',
  'number',
  'object',
  'select',
  'selectize',
  'string',
  'table',
  'upload']
_editors.forEach(editor => {
  if (editor === 'arraySelectize') {
    window.JSONEditor.addEditor(editor, require('./editors/array/selectize.js'))
  } else {
    window.JSONEditor.addEditor(editor, require('./editors/' + editor + '.js'))
  }
})

let _templates = [ 'default',
  'ejs',
  'handlebars',
  'hogan',
  'markup',
  'mustache',
  'swig',
  'underscore' ]

_templates.forEach(template => {
  window.JSONEditor.defaults.templates[template] = require('./templates/' + template + '.js')
})

let _iconlibs = [ 'bootstrap2',
  'bootstrap3',
  'fontawesome3',
  'fontawesome4',
  'foundation2',
  'foundation3',
  'jqueryui' ]

_iconlibs.forEach(iconlib => {
  window.JSONEditor.addIconLib(iconlib, require('./iconlibs/' + iconlib + '.js'))
})
