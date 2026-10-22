/* =========================================================
   Tool registry – every tool plugs into the shell through this.

   registerTool({
     id, name, cat, icon, cost, desc, isNew,
     ready:   true when the tool is usable (false = "Coming soon" card),
     base:    hash path that opens the tool, e.g. '/activity-designer',
     matches: r => boolean, keeps the sidebar highlighted on tool routes,
     recent:  (limit) => html, optional "saved items" row on the hub,
     routes:  [[string | RegExp, (match) => void | 'redirect'], ...]
   })

   Every tool opens on the shared BOOK PICKER (core/book-picker.js); choosing a book opens the tool's input panel as a modal.
   Also pass:
     pickerDesc: optional one-line description shown on the picker page,
     books:      () => [{ id, grade, subject, title, board? }]  books this tool can work from,
     pickBook:   book => void   copy the chosen book into the tool's form state (reset chapter/topic if the book changed),
     form, bind: () => html / () => void   the input panel; its ipanel() call passes tool: id.
     route '/<base>' => bpEnter(id).
   Input panel rules: title only in the header (no icon, sub-text or extra buttons); chapters and topics use the shared
   searchable dropdown idrField()/idropHTML() in core/panel.js - multi or single as the tool's PRD says; picking chapters
   refreshes the topic dropdown with every topic pre-selected and a "Select all" row on top.

   Convention per tool (see tools/activity-designer/):
     data.js   catalogue + content + generation/validation logic
     state.js  tool state + persistence
     input.js  INPUT screen(s)
     output.js OUTPUT screen(s)
     index.js  registerTool(...) wiring the routes
   ========================================================= */
const TOOLS = [];
function registerTool(t) { TOOLS.push(t); }
