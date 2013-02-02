module.exports = function activeLinePlugin(editor) {
  /**
  Takes code-mirror editor and enables active-line highlighting
  **/

  var activeLine = editor.addLineClass(0, "background", "activeline")
  editor.on("cursorActivity", function onCursorActivity() {
    var line = editor.getLineHandle(editor.getCursor().line)
    if (line != activeLine) {
      editor.removeLineClass(activeLine, "background", "activeline")
      activeLine = editor.addLineClass(line, "background", "activeline")
    }
  })
}
