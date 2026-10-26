/* Assignment generator 2.0 - state. Own input form (so it never shares values with the original Assignment generator) and the current document. */
let asg2Form = asgDefaults();   // INPUT - kept if generation fails
let asg2Doc = null;             // OUTPUT - { id, doc, form }  (doc is the document shown on the output screen; edits are written straight into it on Save)

const asg2NewDoc = (doc, form) => ({ id: doc.id, doc, form: { ...form, formats: [...form.formats], blooms: [...(form.blooms || [])] } });
