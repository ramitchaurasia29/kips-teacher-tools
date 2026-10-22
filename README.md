# KIPS Teacher Tools

Run locally: `npm start`, then open http://localhost:3000

## Folder structure

```
server.js                         zero-dependency static dev server
public/
  index.html                      app shell (sidebar + top header + #view)
  css/
    base.css                      design tokens, shell, buttons, inputs, modal, toast
    hub.css                       tools hub screen
    panel.css                     shared INPUT panel styles (every tool's input screen)
    tools/
      activity-designer/
        input.css                 INPUT screen  (form, summary, generating)
        output.css                OUTPUT screen (teacher view, student view, share, print)
  js/
    core/
      icons.js                    SVG icon set
      random.js                   seeded randomness + exact-total rounding for generation engines
      utils.js                    $, esc, toast, confirmModal, createStore
      panel.js                    shared INPUT panel: header, scrollable body, sticky footer, field helpers
      editor-toolbar.js           shared EDIT formatting bar (auto-shows under the header while any [contenteditable=true] is in #view)
      registry.js                 registerTool() - how a tool plugs into the shell
      hub.js                      central tools screen
      router.js                   sidebar + hash router (tools contribute routes)
    tools/
      coming-soon.js              placeholder cards for tools not built yet
      activity-designer/
        data.js                   catalogue, content, buildActivity(), validate(), feasibility()
        state.js                  form (input) + cur (output session) + persistence
        input.js                  INPUT  - form, validation, generating screen
        output.js                 OUTPUT - Teacher View A-I, Student View, edit/save/print/share
        index.js                  registerTool(...) + routes
      assessment-generator/       same five files: data, state, input, output, index
      assignment-generator/       same five files: data, state, input, output, index
      daily-lesson-planner/       same five files: data, state, input, output, index
      chapter-lesson-planner/     same five files; input.js also holds the period map review + progress screens
    main.js                       entry point (starts the router)
```

## Adding a new tool

1. Create `js/tools/<tool-name>/` with `data.js`, `state.js`, `input.js`, `output.js`, `index.js`.
2. Create `css/tools/<tool-name>/input.css` and `output.css`.
3. In `index.js` call `registerTool({ id, name, cat, icon, cost, desc, ready: true, base, matches, routes })`.
4. Add the `<link>` / `<script>` tags in `index.html` (before `core/hub.js`) and remove the tool from `js/tools/coming-soon.js`.

Editing: the formatting bar (undo/redo, block style, font, size, B/I/U/S, align, lists, colours, link/image/table/quote/divider/code/clear) is global. A new tool only needs to set `contenteditable="true"` on its editable content in Edit mode; do not build a separate toolbar.

Download: wherever a tool offers Student / Teacher view files, its Download button opens the shared `downloadModal()` (`js/core/download-modal.js`): View (Teacher/Student), Format (Word/PDF/Print), file name, Cancel + "Download". The tool supplies `file(view)` and `run(view, fmt)`, and `formats` (what its PRD allows; if the PRD gives only ONE format the modal is skipped and it downloads directly). Activity designer uses it; the other tools still use their own export UI until moved over.

Route handlers are `[pattern, fn]` pairs; return `'redirect'` from `fn` if it calls `navigate()`.

## Chapter Lesson Planner routes (PRD v2.0)

| Route | Screen |
|---|---|
| `#/chapter-lesson-planner` | INPUT: shared settings + chapters (one per line) become chapter cards |
| `#/chapter-lesson-planner/map` | INPUT: period map review per chapter (edit, lock, merge, add, remove; checks M1-M4, M6 block approval) |
| `#/chapter-lesson-planner/generating` | progress, "Writing period 3 of 7" |
| `#/chapter-lesson-planner/output` | OUTPUT: overview, periods A-J, Assess period, summary, term index; one-action Word + PDF (zip for several chapters); Expand to daily plan |
| `#/chapter-lesson-planner/sample` | OUTPUT with a sample Grade 5 Maths chapter |

## Activity Designer routes

| Route | Screen |
|---|---|
| `#/activity-designer` | INPUT form |
| `#/activity-designer/generating` | progress, then OUTPUT |
| `#/activity-designer/output` | OUTPUT (Teacher / Student view) |
| `#/activity-designer/sample` | OUTPUT with the PRD Filtration sample |
| `#/activity-designer/open/<id>` | reopen a saved activity |
| `#/s/<id>` | student-facing shared worksheet |
# Teacher-Side-Tool-Kips
