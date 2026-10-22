# PRD : AI Assessment Generator

<aside>
📝

**PRD v2.0** · Prompt Library · Output Format Specification v2.0 · October 16, 2026

Design principle: build and check the marks blueprint first, then write every question together with its answer and solution, so one generation gives the teacher a print-ready student paper and a fully solved teacher copy.

Format follows [PRD : Yolearn Chapter Lesson Planner · Prompt Library and Output Format](https://app.notion.com/p/PRD-Yolearn-Chapter-Lesson-Planner-Prompt-Library-and-Output-Format-3fa68fe80f0981849a09c5ed84451fc6?pvs=21) and [PRD : Yolearn Daily Lesson Planner · Prompt Library and Output Format v2.0](https://app.notion.com/p/PRD-Yolearn-Daily-Lesson-Planner-Prompt-Library-and-Output-Format-v2-0-3fa68fe80f09819a8249d78336e107f6?pvs=21). First version October 10, 2026 · @Ramesh YoLearn. Replaces v1.x of this page.

</aside>

# What changed in v2.0

| Area | v1.x | v2.0 | Section |
| --- | --- | --- | --- |
| Total marks | Typed by the teacher; generation blocked until it matched the question rows | Calculated automatically from the question rows (number of questions × marks each), read-only, updates live. No mismatch is possible | 5, 6 |
| Diagram-based questions | Only through Image/diagram-based rows | Optional input: Diagram-based questions (%) of all questions, with live count | 5, 7, 9 |
| Teacher copy | Separate answer key document with answers for objective questions and points for long answers | Teacher view: the same paper with Answer, Solution and Marking under every question | 10.4 |
| Quality section | Separate quality and coverage section | Removed. Checks run in the background; a failed check shows as a note on that question in the Teacher view | 10.4, 14 |
| Download | Choose paper or answer key to export | Student view / Teacher view toggle; download gives the view that is open | 10.5 |
| Images | Not specified | All images and diagrams on a white or transparent background | 10.6 |
| PRD format | Overview, inputs, logic, output, short prompt list | Full format shared with the lesson planners: users and jobs, option catalog, question types, data schema, generation architecture, full prompt library, validation table, rendering, quality guidelines, risks, test matrix, example prompt | 1 to 23 |

# 1. Document purpose and scope

This specification defines the product requirements, generation pipeline, prompt library, data schema and Word/PDF output for the Yolearn Assessment Generator. It is written for product, design, engineering, QA and the content/curriculum team, and follows the structure of the Chapter Lesson Planner PRD v2.0 so the tools share prompt patterns, renderer conventions and validation patterns.

**Problem.** Teachers spend hours per paper picking questions, balancing marks and formatting in Word. Papers are often unbalanced: too many recall questions, marks that do not add up, or topics that were never taught. Teachers then write the answer key separately, often without worked solutions.

**Solution.** The teacher selects grade, subject, assessment, chapters, topics and question types with counts and marks. Total marks are calculated automatically. The AI builds a balanced paper in the school's format (header, lettered sections, "5X1M=5M" marks notation, answer lines), and writes an answer, solution and marking guidance for every question. The teacher reviews it in Student view and Teacher view, edits or swaps questions, and downloads the view that is open in Word or PDF.

**In scope:** assessment configuration; chapter and topic selection; question-type blueprint with automatic total marks; difficulty, Bloom's and diagram-share distribution; question generation with answers and solutions; diagrams on white or transparent backgrounds; Student view and Teacher view review; edit, swap and regenerate; Word and PDF download of the open view; several subjects in one paper, each on a new page.

**Out of scope for v2.0:** online test-taking by students; automatic grading of student answer sheets; OMR sheets; sharing papers to students inside the app; school-maintained question banks; translation of a paper into another language.

**Relationship to other tools:** the Question Bank Generator (Headword) produces tagged question banks in a client's Excel format; the Chapter Lesson Planner's Assess period writes a short chapter test. Whether both should call this service so question writing, tagging and solutions are shared is an open decision (Section 22).

# 2. Users and jobs

| User | Job to be done |
| --- | --- |
| Teacher (Grades 1 to 10) | When a Formative, Summative or term exam is due, I want a balanced paper in my school's format with a solved teacher copy, so I can print and mark without spending evenings writing and formatting. |
| Academic coordinator | Before papers go for printing, I want to check marks, coverage and correctness quickly, so I can approve papers without rewriting them. |
| Client content editor (B2B publisher) | When I prepare assessment resources for a book, I want consistent papers and worked solutions for every chapter, in our template, to ship with the textbook. |

**Goals and success targets** (proposed starting points; confirm baselines with pilot schools):

| Goal | Metric | Target |
| --- | --- | --- |
| Save teacher time | Time from opening the tool to downloaded paper | Under 10 min |
| Papers usable as generated | Share of generated questions kept without edits | 80%+ |
| Correct paper structure | Papers whose printed marks equal the sum of question marks | 100% |
| Accurate content | Questions, answers or solutions flagged as wrong or out of syllabus by teachers | Under 2% |
| Adoption | Teachers who generate a second paper within 30 days | 60%+ |

# 3. Product requirements

- Create a print-ready paper from grade, subject, assessment name, chapters, topics and question-type rows.
- Calculate total marks automatically as the sum of (number of questions × marks each) across rows. The total is read-only and updates as rows change. It prints in the header and drives the section marks notation.
- Load a suggested blueprint for each assessment name; the teacher can edit, add or remove rows.
- Apply difficulty, Bloom's levels and diagram share across the whole paper, not per section.
- Write questions only from the selected textbook content. Never claim source alignment when content is unavailable; never invent page numbers, quotations or diagrams.
- Every question has an answer, a solution or explanation, and, for 2+ mark questions, marking points. These appear only in the Teacher view.
- Show the paper in two views of the same content: Student view (the paper students write on) and Teacher view (the same paper with answers and solutions under every question). There is no separate answer key or quality section.
- Download gives the view that is open, in Word (primary) or PDF, from the same validated JSON.
- Every image and diagram has a white or transparent background.
- The teacher can edit any question, swap it for another of the same type, marks, topic and difficulty, regenerate one question, or regenerate the paper while keeping edited questions.
- Match question types to subject and grade; use grade-appropriate language and answer space.

# 4. User flow

## 4.1 Create a paper

1. **Paper details.** School name (optional), grade, subject, assessment name, time.
2. **Chapters and topics.** Tick chapters from the textbook; all topics are included unless the teacher narrows them. A chapter without textbook content must be removed or have its pages uploaded before generation.
3. **Questions and marks.** The suggested blueprint for the assessment loads. The teacher edits rows (type, number of questions, marks each). Total marks update live in a read-only panel.
4. **Fine-tune (optional).** Difficulty, Bloom's levels, Diagram-based questions (%).
5. **Generate.** Visible progress through blueprint, allocation, questions with solutions, diagrams and checks.
6. **Review.** The paper opens in Student view. The Student view / Teacher view toggle switches between the plain paper and the solved paper. Hovering a question shows its topic, difficulty and Bloom's level with Edit and Swap.
7. **Download.** The button reads "Download student paper" or "Download teacher paper" according to the open view. Format: Word, PDF or both.

## 4.2 Edit and regenerate

1. **Edit** a question's text in either view. Its answer and solution are re-checked (and repaired if needed) and a note shows in the Teacher view.
2. **Swap** replaces a question with a new one of the same type, marks, topic and difficulty, with its own answer and solution.
3. **Regenerate paper** writes a new set for the same blueprint. "Keep my edited questions" is on by default.
4. **Change settings** returns to setup with all inputs kept.

## 4.3 Several subjects

When several subjects are generated together, each subject starts on a new page in both views, with its own header and its own automatic total.

# 5. Inputs and defaults

| # | Input | Required | Control | Default and behaviour |
| --- | --- | --- | --- | --- |
| 1 | School name | No | Text, max 80 characters | Saved from the teacher's last paper (later: set once by school admin). Printed at the top of the header when given. |
| 2 | Grade | Yes | Dropdown, 1 to 10 | Teacher's assigned grade. |
| 3 | Subject | Yes | Dropdown, filtered by grade | Teacher's assigned subject. Drives question types and subject adaptations (Section 16.2). |
| 4 | Assessment name | Yes | Dropdown: Monthly Test, Unit Test, FA 1, FA 2, SA 1, SA 2, Term 1, Term 2, Mid Term, Final Exam, Other | "Other" opens a text box (required, max 60 characters). Year appended automatically ("Formative Assessment 1 - 2026"). Changing it loads that assessment's suggested blueprint and time. |
| 5 | Chapters | Yes | Multi-select from the textbook table of contents | At least 1. Each shows whether textbook content is available. |
| 6 | Topics | No | Multi-select chips, grouped by chapter | All topics of the selected chapters; at least one per selected chapter. |
| 7 | Question types, number of questions, marks each | Yes | Rows: type, number (1 to 30), marks each (1 to 20); add and remove rows | Suggested blueprint for the assessment name (Section 6). Types filtered by subject (Section 8). |
| 8 | Total marks | Calculated | Read-only number with live update | Sum of (number × marks each) across rows. Not typed by the teacher. See Section 6. |
| 9 | Difficulty | No | Easy, Medium, Hard, Mixed | Mixed: 30% easy, 50% medium, 20% hard across the paper. |
| 10 | Bloom's levels | No | Multi-select: Remember, Understand, Apply, Analyse, Evaluate, Create | None chosen: grade default (Section 7). Chosen: only those levels are used. |
| 11 | Time | No | Minutes | Monthly/Unit 30, FA 40, SA 90, Term/Mid/Final 150, Other 40. Printed in the header as "Time". |
| 12 | Diagram-based questions (%) | No | Number, 0 to 50 in steps of 5, with live count ("15% = 3 of 19 questions") | Off (0%): only Image/diagram-based rows get diagrams. Rounded to the nearest whole question, at least 1 when above 0%. If Image/diagram-based rows already need more, the higher number is used and a note says so. |
| 13 | Template | Admin setting per school or client | Yolearn default or a client template | Same JSON, different layout (Section 15). |

# 6. Total marks logic

**Rule:** Total marks = the sum of (number of questions × marks each) for every question-type row. The teacher never types it.

- The total shows in a read-only panel beside the rows and updates on every change, with the question count ("25 marks · 19 questions").
- Each row shows its own subtotal; each lettered section in the paper prints its notation from the same numbers ("6X2M=12M").
- The paper header prints the calculated total as "Marks". The Teacher view and both downloads use the same value.
- Choosing an assessment name loads its suggested blueprint, whose total equals the usual total for that assessment. Editing rows changes the total; nothing is blocked.
- If the total differs from the usual total for that assessment, a non-blocking note shows: "FA papers are usually 25 marks. This paper is 27 marks." The teacher can continue or adjust rows.
- Validation is on rows only: at least one row; 1 to 30 questions per row; 1 to 20 marks each. An invalid row disables Generate and shows its reason on the row.
- The AI never changes counts or marks. Repairs, swaps and regeneration keep every question's marks, so the total cannot drift after generation.

**Suggested default blueprints** (editable):

| Assessment | Default rows | Calculated total | Time |
| --- | --- | --- | --- |
| Monthly Test / Unit Test | 5 MCQ × 1, 5 fill in the blanks × 1, 1 image/diagram-based × 2, 4 short answer × 2 | 20 | 30 min |
| FA 1 / FA 2 | 6 MCQ × 1, 4 fill in the blanks × 1, 3 match × 1, 6 short answer × 2 | 25 | 40 min |
| SA 1 / SA 2 | 6 MCQ × 1, 6 fill in the blanks × 1, 4 match × 1, 5 true/false × 1, 13 short answer × 2, 1 long answer × 3 | 50 | 90 min |
| Term / Mid Term / Final | 10 MCQ × 1, 5 fill in the blanks × 1, 5 match × 1, 5 true/false × 1, 10 short answer × 2, 5 short answer × 3, 4 long answer × 5 | 80 | 150 min |
| Other | Same as FA; teacher adjusts | 25 | 40 min |

# 7. Option catalog and precedence

Precedence when inputs conflict: (1) explicit teacher selections, rows and school format; (2) retrieved textbook content; (3) the blueprint (rows, counts, marks); (4) difficulty, Bloom's and diagram settings, reconciled; (5) assessment-type defaults; (6) grade-appropriate recommendations. If a setting cannot be met exactly (for example 20% hard with only 4 questions), apply the nearest fit and record it in generation notes; never change rows or marks to meet a mix.

| Field | Options | Effect |
| --- | --- | --- |
| Difficulty | Easy; Medium; Hard; Mixed (30/50/20) | Share of questions at each level across the paper. Hard questions go to higher-mark types first. |
| Bloom's levels | Remember; Understand; Apply; Analyse; Evaluate; Create | None chosen: Grades 1 to 3: 50% Remember, 35% Understand, 15% Apply. Grades 4 to 7: 30/35/25 plus 10% Analyse. Grades 8 to 10: 20/30/30/15 plus 5% Evaluate or Create. Chosen: only those levels, spread evenly. |
| Diagram-based questions (%) | 0 to 50 in steps of 5 | Number of questions that carry a diagram needed to answer them (Section 9). |
| Topics | All or selected per chapter | Questions spread in proportion to topic size (pages); every selected topic gets at least one question when the count allows. |

# 8. Question types

| Type | Subjects | Format in the paper | Teacher view adds |
| --- | --- | --- | --- |
| MCQ (tick the correct option) | All | (a) (b) (c) (d); 3 options for Grades 1 to 2, 4 from Grade 3; two per line when short | Correct option bold with ✓; why it is right and the distractors wrong |
| Fill in the blanks | All | Blank line; optional help box of words above | Answer word; short explanation |
| True/false | All | Statement with (True / False) or a box | Answer; correction of false statements |
| Match the following | All | Column A and Column B, B shuffled | All pairs; one-line reason per pair |
| One-word answer | All | Question with one answer line | Answer; acceptable alternatives |
| Short answer | All | Two lines for 2 marks, three for 3 | Model answer; step-by-step solution or explanation; marking points |
| Long answer | All | Four or more lines (about two per mark) | Model answer; expected points with marks; partial-credit rules |
| Picture-based | All | Picture above the questions (uploaded or library) | Answers; what in the picture leads to them |
| Image/diagram-based | All | Diagram above or beside the question; label lines or blanks | Answers on or beside the diagram; solution |
| Word skills | Languages only | Rhyming words, plurals, opposites, rewrite sentences | Answers; the rule used |
| Story sums / word problems | Maths only | Word problem with working space | Number sentence, step-by-step working, answer with unit; marking points |
| Creative writing | Languages only | Card, letter, paragraph or story with a prompt and lines | A model answer and a marking rubric (content, organisation, language, presentation) |

# 9. Blueprint rules and editing

- **Blueprint first.** Rows are normalised and the total calculated before any question text is written.
- **Topic coverage.** Questions spread across selected topics in proportion to topic size (pages). Every selected topic gets at least one question when the count allows.
- **Difficulty spread.** The chosen mix applies across the whole paper. Hard questions go to higher-mark types first.
- **Bloom's spread.** Grade default or chosen levels across the whole paper.
- **Diagram share.** Diagram count = round(% × total questions), at least 1 when above 0%; the higher of this and the Image/diagram-based row count. Diagram slots go to types that can carry them (MCQ, fill in the blanks, one-word, short and long answer, picture-based), spread across sections and topics, not all in one section. A diagram must be needed to answer its question.
- **Section order.** Objective types first (MCQ, fill in the blanks, true/false, match), then one-word and short answers, then long answers and creative writing. Optional named parts ("Section A: Reading", "Section B: Grammar and Writing", "Section C: Literature") for SA and term exams in languages.
- **Grounding.** Questions come only from the selected chapter content. Language level matches the grade.
- **Answers and solutions.** Written with each question, in the same call, so they agree.

**Review operations:** edit question text (either view); swap a question; regenerate one question; regenerate the paper keeping edited questions; return to settings. Every operation keeps type, marks, topic and difficulty, so the total never changes after generation.

# 10. Output format v2.0 (download format)

## 10.1 Document structure

| Part | Student view | Teacher view |
| --- | --- | --- |
| Header | School, title and year, name/roll number, class/section/time, subject/marks | Same, with "Teacher view: answers and solutions" under the title |
| Sections A, B, C… | Instruction, marks notation, questions, options, diagrams, answer lines | Same questions, options and diagrams; answer lines replaced by Answer, Solution, Marking |
| Closing line | "All the best!" | Same |
| Typical length (25 marks, Grade 2) | 2 pages | 4 pages |

Both views come from one paper JSON and keep the same section letters, question numbers and order.

## 10.2 Header (centred, bold)

```
St. Mary's Public School                      (only when School name is given)
Formative Assessment 1 - 2026
Teacher view: answers and solutions           (Teacher view only)

Name of the student: ___________________   Roll No. _______
Class: 2        Section: ______        Time: 40 min
Subject: Maths                          Marks: 25   (calculated total)
```

## 10.3 Question sections

- Each block is lettered A, B, C… with a bold instruction and the marks notation right-aligned on the same line: `A. Tick (✓) the correct option.    6X1M=6M`.
- Questions numbered 1, 2, 3… inside each block.
- MCQ options as (a) (b) (c) (d), two per line when short, one per line when long; 3 options for Grades 1 to 2, 4 from Grade 3.
- Answer lines (Student view): one line for 1-mark answers, two for 2 marks, three for 3, four or more for long answers.
- Fill in the blanks: optional help box of words above the questions.
- Match the following: "Column A" and "Column B", B shuffled, space between for drawing lines.
- Picture-based and image/diagram-based questions: the image above or beside its question, with label lines or blanks where students write.
- Optional named parts above lettered blocks for SA and term exams.
- Each subject starts on a new page when several subjects are generated together.

## 10.4 Teacher view: answers and solutions

Under every question, in place of the answer lines, a box with a left accent rule:

- **Answer:** the correct option, word, number, pairs or model answer. For MCQ, the correct option is also bold with ✓ in the options.
- **Solution:** step-by-step working (Maths, Science numericals, story sums) or a short explanation of why the answer is right (all other types).
- **Marking:** for 2+ mark questions, expected points with marks per point, partial-credit rules and acceptable alternatives. Creative writing and open questions get a short rubric.
- **Check note:** only when a background check failed or the teacher edited the question ("You edited this question. Answer and solution re-checked.").

Match the following gets one box after the table: all pairs, then a one-line solution per pair. There is no separate answer key document, answer key tab, paper summary or quality section.

## 10.5 Views and download

- The review screen has a Student view / Teacher view toggle. The paper opens in Student view.
- **Download exports the view that is open.** Student view gives the student paper, which never contains answers, solutions or tags. Teacher view gives the paper with answers, solutions and marking.
- Formats: Word (.docx, A4, editable; primary, because schools edit and print from Word today), PDF, or both.
- File names name the view: `Class2_Maths_FA1_Student.docx`, `Class2_Maths_FA1_Teacher.pdf`.
- On-screen tags (topic, difficulty, Bloom's) and Edit/Swap controls never print.

## 10.6 Images and diagrams

- **Background: white or transparent only.** No coloured, grey, gradient or photo backgrounds, so images print cleanly in black and white and blend with the page.
- Black or dark-grey line work, at least 1.5 pt at print size; labels in the paper font, at least 10 pt.
- Sources, in order: teacher upload; the textbook's diagram library; code-drawn diagrams from a spec for simple shapes, number lines, base-ten blocks, bundles, clocks, bar graphs and tables. AI image generation only where configured, and never for diagrams that must be exact.
- Width fits the text column (max 100%); placed above or beside its question and kept on the same page.
- Meaning never depends on colour alone. Each image has alt text in the JSON for accessibility.
- The same image appears in both views.

## 10.7 Visual tokens and files

Arial (or the licensed app sans); body 12 pt; school name 16 pt bold; title 14 pt bold; A4 portrait; 20 mm side margins. Marks notation on a right tab stop. Answer lines are mid-grey rules. Teacher boxes use a 3 pt left rule in accent #1E6B5C with labels in the accent colour; correct MCQ options are bold with a ✓. Footer: subject, class, title and view (left to right), Page X. File names: `Class{grade}_{Subject}_{Assessment}_{Student|Teacher}.docx` and `.pdf`.

# 11. Data schema (paper JSON v2.0) (Suggested)

```json
{
  "metadata": {"school": "", "title": "Formative Assessment 1 - 2026", "assessment_name": "FA 1",
    "grade": "2", "subject": "Maths", "time_minutes": 40,
    "total_marks": 25, "total_marks_source": "calculated",
    "question_count": 19, "difficulty": "mixed", "blooms_selected": [], "blooms_resolved": {"Remember": 9, "Understand": 6, "Apply": 4},
    "diagram_percent": 15, "diagram_count": 3,
    "source_status": "textbook | teacher_upload | unavailable",
    "template": "yolearn_default", "paper_version": "", "prompt_version": "", "renderer_version": ""},
  "chapters": [{"id": "C1", "title": "", "topics": [{"id": "T1", "title": "", "pages": 4}]}],
  "blueprint": [{"row": 1, "type": "mcq", "count": 6, "marks_each": 1, "subtotal": 6}],
  "allocation": [{"question_id": "A1", "topic_id": "T2", "difficulty": "easy", "bloom": "Remember", "diagram": false}],
  "sections": [{
    "letter": "A", "type": "mcq", "instruction": "Tick (✓) the correct option.",
    "count": 6, "marks_each": 1, "notation": "6X1M=6M",
    "help_box": null, "column_b": null, "part": null,
    "questions": [{
      "id": "A1", "number": 1, "text": "", "options": ["", "", ""], "lines": 0,
      "topic_id": "T2", "difficulty": "easy", "bloom": "Remember", "marks": 1,
      "diagram": {"kind": "number_line | base_ten | bundles | shape | bar_graph | upload | library",
        "spec": {}, "background": "white | transparent", "alt": "", "width_mm": 90, "file": ""},
      "answer": "", "answer_option": 1,
      "solution": "",
      "marking_points": [{"point": "", "marks": 1}], "partial_credit": "", "alternatives": [""],
      "edited_by_teacher": false, "check_note": null
    }]
  }],
  "validation": {"checks": [{"id": "B1", "status": "pass", "location": "", "note": ""}]},
  "generation_notes": {"assumptions": [""], "warnings": [""]}
}
```

Schema notes: `total_marks` and every `subtotal` and `notation` are computed by the backend from the blueprint, never by the LLM. `answer_option` is set for MCQ only. `lines` is set by the renderer from marks (Section 10.3) and is 0 for MCQ and match. `diagram` is null when the question has none; `background` must be white or transparent. `check_note` holds the note shown in the Teacher view. Version stamps are written by the backend. A multi-subject paper wraps papers as `{"batch_id": "", "papers": []}`.

# 12. Generation architecture (Suggested)

| Step | What happens | Owner |
| --- | --- | --- |
| A. Normalise | Validate inputs and rows; calculate total marks and subtotals; load chapter content and topic sizes; resolve source status | Backend |
| B. Allocate | Assign each question slot a topic, difficulty, Bloom's level and diagram flag (Section 9) | Backend |
| C. Write sections | One call per section: questions, options, answers, solutions and marking points together, from the allocation and the chapter content | LLM |
| D. Diagrams | For diagram slots: the LLM returns a diagram spec; code draws it on a white or transparent background, or the library or upload is used | LLM + Renderer |
| E. Validate and repair | B-, Q-, S-, D- and V-checks (Section 14); deterministic fixes first, then targeted repair of failed questions only | Backend + LLM |
| F. Review | Student view and Teacher view; edits and swaps trigger targeted checks on that question | Teacher |
| G. Render | DOCX for the open view from JSON; PDF converted from DOCX | Renderer |
| H. Confirm | Report which files exist | Backend |

One call per section keeps outputs within a reliable size and lets each section's answers be checked against its own questions. Sections can run in parallel; a failed section is retried once while the rest continue.

# 13. Prompt library (Suggested)

## 13.1 System prompt (shared)

```
You are Yolearn's expert school assessment designer. You write fair, accurate, grade-appropriate question papers that match a school's exact format, and for every question you write the answer and a clear solution a teacher can mark from.

CORE RULES
1. Respect the blueprint exactly: question types, counts and marks are fixed. Never add, remove or re-mark questions.
2. Use only the supplied chapter content and selected topics. Do not invent page numbers, quotations, textbook text or diagrams.
3. Every question has exactly one defensible answer (or clear marking points for open questions), an answer, and a solution or explanation that agrees with it.
4. Follow the allocation for each question: topic, difficulty, Bloom's level, diagram flag.
5. No duplicate or near-duplicate questions; no question may give away another question's answer.
6. Use simple, clear language for the grade. Use Indian contexts, names and money where a context is needed.
7. Diagrams are described as specs with a white or transparent background; never rely on colour alone.
8. Return valid JSON matching the schema in the developer message, with no prose or markdown outside the JSON.
```

## 13.2 Developer prompt: schema and constraints (Suggested)

```
Return JSON matching paper schema v2.0 (Section 11) for the section requested in the user message.
Question requirements:
- text: complete and unambiguous; one task per question unless the type requires more.
- MCQ: 3 options (Grades 1-2) or 4 (Grade 3+); one correct; distractors plausible and based on real errors; no "all of the above".
- fill_in_blanks: one blank; when a help box is used, every answer is in the box and the box has no extra words unless the instruction says so.
- match: Column A in order, Column B shuffled; one-to-one pairs.
- answer: the exact correct option, word, number, pairs or model answer.
- solution: step-by-step working for calculations (one step per line, each step correct), otherwise 1-3 sentences explaining why the answer is right.
- marking_points: for 2+ marks, points that sum exactly to the marks; partial_credit when partial answers are likely.
- diagram (only when the allocation flag is true): kind, spec, alt text, background "white" or "transparent".
Every list item is a non-empty string. Do not include tags, notes or answers inside question text.
```

## 13.3 Question type behaviour library

| Type | Required generation behaviour |
| --- | --- |
| MCQ | Stem complete without the options; options of similar length and form; distractors from common errors; correct position varied across the section. |
| Fill in the blanks | Blank tests the key term or result, not a minor word; with a help box, words are in mixed order. |
| True/false | Statements clearly true or false; no double negatives; solutions correct each false statement. |
| Match the following | Items from one topic family; Column B shuffled with no pair in the same row. |
| One-word answer | One correct word or number; alternatives listed. |
| Short answer | Answerable in the given lines; marking points match the marks. |
| Long answer | Needs explanation or reasoning; expected points with marks and partial credit. |
| Picture-based / image/diagram-based | The image is needed to answer; the question says what to look at; labels or blanks are clear. |
| Word skills | Words from the chapter; one rule per question; the rule stated in the solution. |
| Story sums / word problems | Realistic context, numbers within the grade's range; solution gives the number sentence, working and answer with unit. |
| Creative writing | Clear prompt and word or line guide; model answer and rubric (content, organisation, language, presentation). |

## 13.4 Bloom's behaviour library

| Level | Required generation behaviour |
| --- | --- |
| Remember | Recall a fact, term, number name or definition from the chapter. |
| Understand | Explain, compare, classify, read a diagram or rewrite in another form. |
| Apply | Use a method or rule in a new example or word problem. |
| Analyse | Find a pattern, error or relationship; break a problem into parts. |
| Evaluate | Judge a claim or method and justify with evidence. |
| Create | Produce something new: a problem, a short piece of writing, a plan. |

## 13.5 Difficulty behaviour library

| Level | Required generation behaviour |
| --- | --- |
| Easy | One step; direct from the chapter; familiar numbers and words. |
| Medium | Two steps or a small transfer to a new example. |
| Hard | Multi-step, regrouping/borrowing, reasoning, or combining two topics; still within the grade's syllabus. |

## 13.6 Combination rules

Each question slot gets exactly one type, one Bloom's level, one difficulty and a diagram flag from the allocation. Do not maintain prompts per combination. Type governs the format, Bloom's governs the thinking asked, difficulty governs the number of steps and familiarity. If a combination is unnatural (for example Create with true/false), the backend reallocates the level before generation and records it in generation notes.

## 13.7 Section generation prompt (one section per call) (Suggested)

```
Write section {{letter}} of the paper for {{grade}} {{subject}}, {{assessment_title}}.

SECTION: type {{type}}; instruction "{{instruction}}"; {{count}} questions × {{marks_each}} marks.
ALLOCATION (one row per question, keep the order): {{allocation_rows}}
TYPE BEHAVIOUR ({{type}}): {{type_snippet}}
BLOOM'S AND DIFFICULTY SNIPPETS: {{bloom_snippets}} {{difficulty_snippets}}
SUBJECT ADAPTATION: {{subject_adaptation}}
CHAPTER CONTENT FOR THESE TOPICS: {{topic_content}}
QUESTIONS ALREADY IN OTHER SECTIONS (avoid duplicates and give-aways): {{other_question_stems}}
GRADE RULES: {{option_count}} options per MCQ; language level {{grade_language}}.

For each question write text, options (if any), answer, solution, marking points (if 2+ marks) and a diagram spec when the allocation flag is true. Return {"section": {...}}.
```

## 13.8 Diagram spec prompt

```
For question {{id}} write a diagram spec the renderer can draw exactly. Kinds: number_line (start, end, step, marked values, missing positions), base_ten (tens, ones), bundles (bundle_size, bundles, loose, item), shape (name, sides or labelled parts), clock (hour, minute), bar_graph (categories, values, axis labels), table (headers, rows). Background must be "white" or "transparent". Give alt text that states what the diagram shows without giving the answer. Return {"diagram": {...}}.
```

## 13.9 Input normalization prompt

```
Normalise the setup payload before allocation. Do not write questions.
Return: normalised settings with missing optional values as null; blueprint rows with subtotals; the calculated total; the usual total for this assessment name and whether they differ (informational only); topics per chapter with size and source status; diagram count after rounding; and any conflicts (for example more diagram slots than diagram-capable questions). Never change rows or marks.
```

## 13.10 Source grounding prompt

```
Use the supplied chapter content as the only source for facts, terms, examples and numbers ranges. You may create new practice numbers and contexts consistent with the content. Do not invent text from missing pages, claim the textbook says something it does not, fabricate page numbers, quotations or diagrams, or replace textbook terminology where the distinction matters. If content for a topic is missing, return a warning instead of questions for it.
```

## 13.11 Validation prompt (LLM checks)

```
Review this section and return a JSON report with pass or fail, question ID and a one-line repair instruction for each check: (1) each question has exactly one defensible answer; (2) the answer is correct; (3) the solution is correct, complete and agrees with the answer; (4) marking points sum to the marks; (5) distractors are plausible and not also correct; (6) the question matches its topic, difficulty and Bloom's level; (7) language suits the grade; (8) no question gives away another's answer; (9) each diagram is needed and its alt text does not reveal the answer; (10) no invented textbook facts. Do not rewrite the section.
```

## 13.12 Targeted repair prompt

```
Repair only the questions and fields listed in the validation report for section {{letter}}. Keep every passing question, the order, types, marks, topics, difficulty, Bloom's levels and diagram flags. After repair the answer, solution and marking points must agree. Return the full corrected section object only.
```

## 13.13 Swap and single-question regeneration prompt

```
Write a new, different question to replace {{id}}. Keep its type, marks, topic, difficulty, Bloom's level and diagram flag. Avoid the stems already in the paper: {{all_stems}}. Include answer, solution, marking points and a diagram spec if flagged. Return {"question": {...}}.
```

## 13.14 Teacher edit re-check prompt

```
The teacher edited question {{id}}. New text: {{edited_text}}. Keep the teacher's text exactly. Check whether the existing answer, options, solution and marking points still fit. If not, rewrite only those fields so they fit the new text. Return {"question": {...}, "check_note": "..."}.
```

# 14. Validation checks (Suggested)

| ID | Check | Type | On failure |
| --- | --- | --- | --- |
| B1 | Total marks equals the sum of row subtotals; header, notation and files use it | Code | Recalculate (automatic) |
| B2 | Rows valid: at least one; 1 to 30 questions; 1 to 20 marks each; type allowed for the subject | Code | Disable Generate; show reason on the row |
| B3 | Total differs from the usual total for the assessment | Code | Informational note only |
| Q1 | Question count and marks per section match the blueprint | Code | Regenerate section |
| Q2 | Every selected topic has at least one question when the count allows | Code | Reallocate and repair |
| Q3 | Difficulty and Bloom's counts within one question of the target | Code | Repair |
| Q4 | No duplicate or near-duplicate stems (similarity threshold) | Code | Swap |
| Q5 | MCQ option count matches grade; one correct option; options unique | Code | Repair |
| Q6 | Section order and notation follow Section 10.3 | Code | Auto-fix |
| S1 | Every question has a non-empty answer and solution | Code | Repair |
| S2 | Marking points sum to the question's marks for 2+ mark questions | Code | Repair |
| S3 | Maths answers and working verified by calculation where possible | Code | Repair |
| S4 | Answer, solution and question agree; correctness; give-aways (Section 13.11) | LLM | Repair; note on question if still failing |
| D1 | Diagram count equals the rounded diagram share (or the row count, if higher) | Code | Reallocate |
| D2 | Every image has a white or transparent background (corner and edge pixel check, alpha check) | Code | Re-render or flatten onto white |
| D3 | Diagram spec renders; alt text present and does not reveal the answer | Code + LLM | Repair |
| V1 | Student view and its download contain no answers, solutions, tags or notes | Code | Block download |
| V2 | Download file matches the open view | Code | Block download |
| R1 | No question split across pages; images kept with their questions; headings never orphaned | Render | Re-render |
| R2 | Word and PDF match in text and page order | Render | Re-render |

Checks run in the background. There is no quality section in the product: a question that still fails after one repair shows a note in the Teacher view.

# 15. Rendering specification

- One canonical paper JSON renders both views. DOCX is built from JSON; PDF is converted from the DOCX (LibreOffice headless or equivalent) so content and layout match. The HTML preview uses the same layout rules.
- Header fields and the marks notation use right and centre tab stops, not spaces.
- Each question, its options, its image and (Teacher view) its answer box keep together on a page. Section headings keep with the first question.
- Help boxes and match tables are fixed-width tables; answer lines are paragraph bottom borders (alternating line styles so Word does not merge them).
- Images are embedded PNG or SVG on white or transparent backgrounds, sized in millimetres from the JSON.
- The template is configuration over the same JSON (Yolearn default, a school format, or a client template such as Headword).
- Implementation metadata stays in JSON and document properties, not on the pages.

# 16. Content quality guidelines

## 16.1 What "print-ready" means

- The paper prints without reformatting: header, sections, notation, options and answer space are all in place.
- Every question is answerable from what was taught, in the space given, within the time.
- Every question in the Teacher view has an answer and a solution a non-specialist teacher can mark from.
- Diagrams are clear in black and white, on white or transparent backgrounds, and needed to answer.
- Instructions are written to students ("Tick the correct option", "Look at the picture").

## 16.2 Subject adaptations

| Subject | Question mix to favour | Solutions should include |
| --- | --- | --- |
| English | Reading comprehension, vocabulary, grammar, word skills, creative writing; named parts for SA and term exams | Answers with the line or reason from the passage; grammar rule used; writing rubric and model answer |
| Mathematics | Objective items, computation, story sums, diagram items (number lines, blocks, shapes, clocks, graphs) | Step-by-step working, number sentence, answer with unit, common error to watch for |
| Science / EVS | Objective items, diagram labelling, reasons, observations, short and long answers | Correct labels; reason in one or two sentences; expected points for long answers |
| Social Science | Objective items, map work, source or picture questions, short and long answers | Expected points with marks; map answers marked on the teacher copy |
| Hindi and other languages | As English, adapted to the language's script and grammar | Answers in the target language; explanations in the teacher's language as configured |

## 16.3 Grade bands

| Grades | Language and layout |
| --- | --- |
| 1 to 2 | Very short sentences; 3 MCQ options; large answer space; picture and diagram support welcome |
| 3 to 5 | Short sentences; 4 options; some multi-step questions |
| 6 to 8 | Subject vocabulary; reasoning and application questions; long answers |
| 9 to 10 | Board-exam style wording; case-based and source-based questions where the syllabus uses them |

# 17. Dependencies and risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Topic extraction skips topics and has OCR errors | Missing or wrong topics; questions from bad text | Topics editable; source status shown per chapter; fix pipeline before client rollout |
| Wrong answers or solutions | Teachers mark incorrectly; loss of trust | Answers and solutions written with the question; S1 to S4 checks; calculation check for Maths; content team review of samples per subject |
| Diagrams inaccurate or unclear | Unanswerable questions | Code-drawn diagrams from specs for exact items; library and uploads; D-checks |
| Coloured or grey image backgrounds | Poor printing; images look pasted in | D2 background check; flatten onto white |
| Answers leaking into the student file | Paper unusable | Views rendered from separate templates over one JSON; V1 and V2 block download |
| School format variations | Schools reformat papers | Template as configuration; confirm formats with pilot schools |
| Generation time for large papers | Teacher waits for an 80-mark paper | Sections in parallel; visible progress |

# 18. Acceptance criteria

- Total marks are calculated automatically from the rows, cannot be typed, update live, and are the value printed in the header and used in both downloads.
- A total that differs from the assessment's usual total shows a non-blocking note; invalid rows disable Generate with a reason.
- Paper sections and notation follow the school format; question count and marks match the blueprint.
- Every question maps to selected content and has a consistent answer and mark value.
- No duplicates or answer give-aways remain after validation.
- The Teacher view shows an answer and a solution for every question, with marking points for 2+ mark questions.
- There is no separate answer key, paper summary or quality section; failed checks show as notes in the Teacher view.
- Download in Student view gives the student paper with no answers; download in Teacher view gives the teacher paper with answers and solutions.
- The number of diagram-based questions matches the Diagram-based questions (%) input after rounding.
- Every image and diagram has a white or transparent background.
- Word and PDF preserve layout, images and answer spaces, and match each other.
- Edit, swap and regenerate keep type, marks, topic and difficulty; edited questions survive paper regeneration when "Keep my edited questions" is on.

# 19. Test matrix

| Test case | Input | Expected result |
| --- | --- | --- |
| Presets | Each assessment name | Suggested blueprint loads; total calculated (20, 25, 50, 80); time set |
| Auto total | FA 1, change MCQ from 6 to 8 | Total updates from 25 to 27 immediately; note "FA papers are usually 25 marks"; Generate stays enabled |
| Add and remove rows | Add 2 true/false × 1, remove match | Total and question count update; section order correct in the paper |
| Invalid row | A row with 0 questions or 31 questions | Generate disabled; reason on the row |
| Diagram share | 0%, 15% of 19, 50% of 19 | 0, 3 and 10 diagram questions; spread across sections |
| Diagram rows exceed share | Monthly Test (1 diagram row) with 0% | 1 diagram question; note shown when share is set lower than rows |
| Image background | Upload with a grey background | D2 fails; image flattened onto white |
| Teacher view | Any paper | Answer and solution under every question; marking points for 2+ marks; MCQ correct option bold with ✓ |
| Student download | Student view, download Word and PDF | No answers, solutions, tags or notes in either file; file names end in _Student |
| Teacher download | Teacher view, download | Answers and solutions present; file names end in _Teacher |
| Source unavailable | Chapter with no textbook content | Generation blocked until removed or pages uploaded; no claim of textbook alignment |
| Grade bands | Grade 2 and Grade 7 Maths | 3 vs 4 MCQ options; language and difficulty fit the grade |
| Bloom's chosen | Only Apply and Analyse | Only those levels used |
| Edit question | Change A3 text | Answer and solution re-checked; note in Teacher view |
| Swap | Swap D4 | New question, same type, marks, topic, difficulty; new solution; total unchanged |
| Regenerate paper | Two edited questions, keep edits on | Edited questions unchanged; others new |
| Several subjects | Maths and EVS together | Each subject on a new page with its own header and total |
| Negative | Ambiguous MCQ, duplicate stems, missing solution, wrong Maths answer | Caught by Q5, Q4, S1, S3; repaired before display |
| Parity | Any download | Word and PDF match in text and page order |

# 20. Example assembled prompt: Grade 2 Maths FA 1, section D

```
Write section D of the paper for Grade 2 Maths, Formative Assessment 1 - 2026.

SECTION: type short_answer; instruction "Answer the following questions."; 6 questions × 2 marks.
ALLOCATION:
D1 T1 Place value (tens and ones) · medium · Understand · diagram: bundles
D2 T3 Comparing and ordering numbers · medium · Understand · no diagram
D3 T5 Addition with carrying · hard · Apply · no diagram
D4 T6 Subtraction with borrowing · hard · Apply · no diagram
D5 T7 Story sums (addition) · hard · Apply · no diagram
D6 T7 Story sums (subtraction) · hard · Apply · no diagram
TYPE BEHAVIOUR (short answer): answerable in two lines; marking points sum to 2.
SUBJECT ADAPTATION (Maths): step-by-step working, number sentence, answer with unit.
CHAPTER CONTENT: Numbers up to 100; Addition; Subtraction (supplied text).
QUESTIONS ALREADY IN OTHER SECTIONS: "The number just after 49 is", "Look at the blocks. Which number do they show?", ...
GRADE RULES: numbers up to 100; very short sentences.
Return {"section": {...}}.
```

The output for this section is in the reference files (Section 23): Student paper page 2, Teacher paper pages 3 to 4.

# 21. Success measures

- Share of generated papers downloaded, by view (Student, Teacher).
- Share of questions kept without edits or swaps (target 80%+).
- Swap and edit rate by question type and subject.
- Questions, answers or solutions flagged as wrong (target under 2%).
- Papers whose total differs from the usual total for the assessment (shows how often schools change blueprints).
- Content team quality score on a monthly sample (accuracy, solutions, format), by subject.

These can be tracked as simple event counts in the product until a fuller analytics setup exists.

# 22. Implementation notes and open decisions

- Use one canonical paper JSON; never ask the model to write DOCX or PDF directly.
- Totals, subtotals and notation are computed by code only.
- Version prompts, schema and renderer separately; persist allocation and resolved Bloom's and difficulty per question for debugging.
- Open: exact school-format templates from pilot schools (the attached Grade 2 FA 1 / FA 2 / SA 1 papers).
- Open: diagram sourcing for the textbook diagram library and whether AI image generation is allowed.
- Open: handling of unsupported question types for a subject.
- Open: whether teacher edits trigger targeted checks only (v2.0) or full paper validation.
- Open: whether the Chapter Lesson Planner Assess period and the Question Bank Generator call this service.
- Open: whether the Teacher view should also offer an "answers only" compact download for quick marking.

# 23. Reference artifacts

| Artifact | Purpose |
| --- | --- |
| Class2_Maths_FA1_Student.docx / .pdf | Student view reference: Grade 2 Maths FA 1, 25 marks, 19 questions, 3 diagram questions (15%), 2 pages |
| Class2_Maths_FA1_Teacher.docx / .pdf | Teacher view reference: same paper with answer, solution and marking under every question, 4 pages |
| Prototype: [claude.ai/artifact/FvHzVQhkHH65qFCNBnvY7c](https://claude.ai/artifact/FvHzVQhkHH65qFCNBnvY7c) | Setup, blueprint, diagram share, Student/Teacher views, swap, edit and view-specific download. Total marks field to be switched to calculated (read-only) to match v2.0 |
| [PRD : Yolearn Chapter Lesson Planner · Prompt Library and Output Format](https://app.notion.com/p/PRD-Yolearn-Chapter-Lesson-Planner-Prompt-Library-and-Output-Format-3fa68fe80f0981849a09c5ed84451fc6?pvs=21) | Shared PRD format, prompt library pattern and renderer conventions |
| [PRD : Yolearn Daily Lesson Planner · Prompt Library and Output Format v2.0](https://app.notion.com/p/PRD-Yolearn-Daily-Lesson-Planner-Prompt-Library-and-Output-Format-v2-0-3fa68fe80f09819a8249d78336e107f6?pvs=21) | Shared validation pattern and output conventions |