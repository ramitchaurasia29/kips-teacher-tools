# PRD : Assignment Generator

<aside>
📘

**PRD v2.0** · Prompt Library · Output Format Specification v2.0 · October 16, 2026

Design principle: one topic, one assignment type, one canonical assignment that renders a clean Student View and a complete Teacher View, so a teacher can review, share and mark without rewriting anything.

</aside>

# What changed in v2.0

| Area | v1.0 | v2.0 | Section |
| --- | --- | --- | --- |
| Assignment types | Homework, written assignment, essay, research task, project-based, application-based, chapter revision | Six types based on what the student produces: Practice worksheet, Real-life application, Research task, Project, Essay / creative writing, Chapter revision | 6 |
| What goes in each type | Not defined; "conditional sections" listed generally | Each type defines its default formats, task count, time, marks and rubric defaults, and the exact sections in both views | 6.1 to 6.3 |
| Difficulty | Needs support, grade-level, advanced, mixed ability | Easy, Medium (default), Hard, Mixed (about 30/50/20). Support and stretch ideas stay in Teacher notes | 5, 7 |
| Assignment length | Short, medium, detailed, custom | Removed. Task count comes from the type and completion time, or the teacher sets a number | 5, 9 |
| Question numbering | Restarted per section in the Student View sample | Numbered continuously (Q1, Q2…) in both views so answer guidance matches | 10 |
| Sharing | "Teacher must review before sharing" | Explicit "I've reviewed the Student View" step before the first link; edits after sharing need "Publish updated version" | 4, 10.5 |
| PRD format | Problem, solution, flow, inputs, outputs, short prompt list | Full format shared with the lesson planners: users and jobs, type catalogue, option catalog, data schema, generation architecture, full prompt library, validation table, rendering, quality guidelines, risks, test matrix, example prompt | 1 to 23 |

# 1. Document purpose and scope

This specification defines the product requirements, assignment types, generation pipeline, prompt library, data schema and Word/PDF output for the Yolearn Assignment Generator inside Teacher AI Tool Helper. It is written for product, design, engineering, QA and the content/curriculum team, and follows the structure of the Chapter Lesson Planner PRD v2.0.

**Problem.** Teachers need assignments that help students practise concepts, show understanding and apply what they learned. Making one by hand means deciding what students should show, writing clear instructions and tasks, setting the answer format and deliverables, deciding marks and criteria, preparing a student-friendly sheet, and writing answer guidance. The earlier generator produced one formal academic format for everything (for example an essay-style "Exploring Living and Non-Living Things"), but teachers need different kinds of work for different goals.

**Solution.** The teacher selects a book and topic, chooses one of six assignment types, sets difficulty, time, due date and optional marks, and generates one assignment. It renders as a Student View (the sheet students complete) and a Teacher View (the same tasks plus answer guidance, evaluation and teacher notes). The teacher reviews, edits or regenerates parts, saves, shares the Student View, and exports either view in Word or PDF.

**Core principle:** an assignment tells a student **what to do, what to produce and how the work will be evaluated**, based on the selected curriculum content, not only the topic title.

**In scope:** book and topic selection; six assignment types with type-specific content; difficulty, time, due date, task formats, task count, marks, rubric and student-marks settings; source-grounded tasks; answer guidance and rubrics; Teacher View and Student View; section and question regeneration; edit; save, reopen, duplicate; share a student link with versions; Word and PDF export of each view.

**Out of scope for v2.0:** assigning work to classes or students; student login and digital submission; automated grading; plagiarism detection; class dashboards and analytics; parent notifications and reminders; a marketplace for sharing assignments between teachers; unsupervised external research workflows.

**Relationship to other tools:** the Assessment Generator makes timed question papers in a school's exam format; the Activity Designer makes in-class activities run by the teacher. The Assignment Generator makes work students complete on their own, at home or in class, with a deadline.

# 2. Users and jobs

| User | Job to be done |
| --- | --- |
| Teacher (Grades 1 to 10) | When I finish a topic, I want a ready assignment of the right kind (practice, real-life, research, project, writing or revision), so students can practise and I can mark it quickly. |
| Academic coordinator | When teachers set assignments, I want them clear, curriculum-aligned and fairly marked, so I can approve them without rewriting. |
| Student | When I get an assignment, I want to know exactly what to do, what to hand in, by when and how it will be marked. |

**Primary success metric:** weekly active teachers who save an assignment and then share or export it.

# 3. Product requirements

- Select a book from the catalogue and a topic (optional subtopic); derive board, grade, subject and chapter from the book. Chapter revision covers the whole chapter.
- Offer six assignment types. Each type decides the task design, default formats, task count, marks and rubric defaults, and the sections in both views (Section 6).
- Difficulty: Easy, Medium, Hard or Mixed. No length setting: task count comes from the type and completion time unless the teacher sets a number.
- Use the selected topic's actual content. Never invent page numbers, diagrams, quotations or facts. If content is unavailable, say so and offer "Add topic content" or "Continue unverified" with a visible label.
- Generate one canonical assignment that renders a Teacher View and a Student View. Teacher-only answers, notes and checks never appear in the Student View or its exports.
- Every task has clear instructions and an expected deliverable; every question has answer guidance or evaluation criteria; marks add up to the configured total.
- Edit any section; regenerate a section or a single question without changing other content; regenerating never silently overwrites teacher edits.
- Save, reopen and duplicate assignments. Share the Student View as a link after review; later edits reach students only when the teacher publishes them.
- Export the Teacher View and Student View separately as Word (.docx) or PDF, from the same validated JSON. If sharing is unavailable, the teacher downloads and shares the file.

# 4. User flow

1. Open **Teacher AI Tool Helper → Assignment Generator**.
2. **Book.** Choose from the catalogue (grade filter). Board, grade, subject and chapter come from the book.
3. **Topic.** Choose a topic and, optionally, a subtopic. Topics without textbook content show a notice with "Add topic content" or "Continue unverified".
4. **Set up.** Assignment type (with a one-line description of what students produce), submission date, learning objective (typed or AI suggestion), difficulty, completion time. More options: task formats (AI recommends from the type), number of tasks, marks or no marks, include rubric, show marks in Student View, additional instructions.
5. **Generate.** Visible progress: resolve book and topic, retrieve content, map concepts to the objective, plan for the type, write tasks and deliverables, write answer guidance and marks, build both views, run checks.
6. **Review and edit.** Teacher View / Student View toggle. Each section has Edit and Regenerate; each question has Regenerate. A one-line check summary sits at the top of the Teacher View.
7. **Save.** Saved assignments appear in My assignments, where they can be reopened or duplicated.
8. **Share or export.** Share student version: tick "I've reviewed the Student View", create the link, revoke any time, publish updates. Export: Teacher View or Student View, Word, PDF or print.

# 5. Inputs and defaults

| # | Input | Required | Control | Default and behaviour |
| --- | --- | --- | --- | --- |
| 1 | Book | Yes | Catalogue cards with grade filter | Board, grade, subject and chapter derived from the book; never asked again. |
| 2 | Topic / subtopic | Topic yes; subtopic no | Chapter tree with topics; subtopic chips | Shows content availability. Chapter revision uses all topics of the chapter. |
| 3 | Assignment type | Yes | Dropdown with description | Practice worksheet. Six types (Section 6). |
| 4 | Submission date | Yes | Date picker | No default; printed on the Student View as "Submit by". Project milestones are spread back from this date. |
| 5 | Learning objective | No | Text with AI suggestion chips | AI writes one from the topic if blank. |
| 6 | Difficulty | No | Easy, Medium, Hard, Mixed | Medium. Mixed: about 30% easy, 50% medium, 20% hard across tasks. |
| 7 | Expected completion time | Yes | 15, 30, 45, 60 minutes or custom | Type default (Section 6.1). For Project, this is total working time across days. |
| 8 | Task formats | No | Multi-select: short answer, long answer, MCQ, case study, diagram-based, open-ended, practical task, mixed format | AI recommends from the type; the hint shows the recommendation. |
| 9 | Number of questions / tasks | No | AI recommends, or a number (1 to 40) | From type and time (Section 9). |
| 10 | Marks | No | Custom marks (number) or No marks | Type default (Section 6.1). With No marks, rubric and student-marks settings hide. |
| 11 | Include rubric | No | Toggle | Type default: on for Research, Project, Essay / creative writing; optional for Real-life application; off for Practice worksheet and Chapter revision. |
| 12 | Show marks in Student View | No | Toggle | On when marks are enabled. |
| 13 | Additional instructions | No | Text | Word limit, formatting, examples, restrictions, research rules, materials. Treated as constraints. |

Keep the main form short: inputs 1 to 7 are visible; 8 to 13 sit under More options.

# 6. Assignment types: what goes in each

## 6.1 Type catalogue and defaults

| Type | What the student produces | Default formats | Default time | Default task count | Marks and rubric default |
| --- | --- | --- | --- | --- | --- |
| Practice worksheet | Answers to questions that practise one topic | MCQ, fill in the blanks, short answer, 1 to 2 long answers, a table or diagram item where useful | 30 min | About 1 per 3 minutes (8 to 12 for 30 min), in 2 to 3 sections | Marks on (20); rubric off |
| Real-life application | Answers to questions about a real-life situation, case or data | Case study with short and long answers; data table or picture when the topic needs it | 30 min | 1 to 2 cases with 4 to 6 questions each | Marks on (20); rubric optional |
| Research task | A short report that answers a research question, with sources | Open-ended guiding questions, source fields, report planner | 60 min (can span 2 to 3 days) | 1 research question with 3 to 5 guiding questions | Marks on (20); rubric on |
| Project | A model, chart, poster, booklet or presentation made over several days | Practical task, milestones, final product, short reflection | Total working time 2 to 4 hours over 3 to 7 days | 1 project with 3 to 4 milestones | Marks on (25); rubric on |
| Essay / creative writing | A paragraph, essay, story, letter, diary entry or poem on a prompt | One prompt (or a choice of two), planner, word limit | 45 min | 1 main task (plus an optional short pre-writing task) | Marks on (10 to 20); rubric on |
| Chapter revision | Answers to mixed questions covering the whole chapter | Mixed: MCQ, fill in the blanks, short answer, long answer, one application question | 45 min | 12 to 20, at least one per chapter topic | Marks on (25 to 30); rubric off |

Subject fit: all six types are offered for every subject. The type description and format recommendations adapt to the subject (Section 16.2). Research task is recommended from Grade 5; below Grade 5 it becomes "Ask and find out" with family or book sources only. Essay / creative writing in Science, Maths or Social Science becomes a short explanatory or descriptive piece (for example "A day in the life of a seed").

## 6.2 Teacher View sections by type

Required in every type: 1. Assignment overview · 2. Student instructions · 3. Detailed tasks · 4. Expected deliverable · 5. Answer guidance · 6. Evaluation (when marks are on) · 7. Teacher notes.

| Type | What goes inside the sections | Extra Teacher View content |
| --- | --- | --- |
| Practice worksheet | Tasks in sections by format (A objective, B explain, C apply). Answer guidance per question: answer, accept also, marking points. Evaluation: marks distribution. | Common errors per section; quick fixes |
| Real-life application | Case text, data or picture, then questions. Answer guidance with model answers and acceptable alternatives. Evaluation: marks distribution; rubric for long answers if on. | Why the case fits the topic; real-life discussion points; how to adapt the case to local context |
| Research task | Research question, guiding questions, allowed sources, report format. Answer guidance: expected key findings and points to look for. Evaluation: rubric (content and accuracy, use of sources, organisation, presentation). | Suggested sources by type (textbook pages are never invented; "chapter on X" only); safety note for internet use; time plan over days |
| Project | Driving question, product brief, materials, steps, milestones with dates, group roles if any. Answer guidance: what a strong product shows; key concepts it must include. Evaluation: rubric (concept accuracy, process and milestones, creativity, presentation). | Materials (low-cost, home-available) and safety; milestone check dates worked back from the due date; a sample product description |
| Essay / creative writing | Prompt (or two prompts to choose from), form, audience, word limit, planner. Answer guidance: a model response and key ideas to look for. Evaluation: rubric (content and ideas, organisation, language and vocabulary, grammar and spelling). | Common writing errors; vocabulary bank for support; extension prompt |
| Chapter revision | Sections by format covering all chapter topics. Answer guidance per question. Evaluation: marks distribution. | Topic map (question to topic) so the teacher sees which topics need reteaching; revision tips |

Teacher notes in every type include preparation (if any), likely misconceptions with how to address them, and differentiation (needs support, ready for more).

## 6.3 Student View sections by type

Required in every type: title; name, class/section and date fields; total marks (if shown), time and submit-by date; What will you learn?; Instructions; What to hand in; tasks; Submission line; Before you submit checklist.

| Type | Tasks and response space | Extra Student View content |
| --- | --- | --- |
| Practice worksheet | Questions by section with answer lines sized to marks; tables or diagrams to fill where used | Word and length guide (how much to write) |
| Real-life application | Case in a shaded box, then numbered questions with answer lines | Data table or picture inside the case box |
| Research task | Research question, guiding questions with space for notes | Source record table (source, what I found); report planner (headings); word limit; "Ask an adult before using the internet" |
| Project | Project brief and steps | Materials list; milestone checklist with dates; final product checklist; short reflection questions; how it will be marked (rubric, when shown) |
| Essay / creative writing | Prompt, form and audience; writing lines to the word limit | Planner (beginning/middle/end or introduction/body/conclusion); success criteria checklist; word-count box |
| Chapter revision | Mixed sections with answer lines | "Topics covered" line at the top; self-check box (I found this easy / hard) per section |

The system must not add sections a type does not need, and must not force any type into an essay format.

# 7. Option catalog and precedence

Precedence when inputs conflict: (1) explicit teacher selections and additional instructions; (2) retrieved textbook content; (3) assignment-type requirements (Section 6); (4) difficulty and format settings; (5) grade-appropriate defaults; (6) AI recommendations. If a constraint cannot be met (for example a Project in 15 minutes), keep the teacher's setting, adapt the design (a mini-project) and say so in a note; never silently drop a constraint.

| Field | Options | Effect |
| --- | --- | --- |
| Difficulty | Easy; Medium (default); Hard; Mixed | Easy: recall and one-step tasks. Medium: recall plus explanation at grade level. Hard: more explain, apply and reasoning tasks. Mixed: about 30% easy, 50% medium, 20% hard across tasks. |
| Task formats | Short answer; long answer; MCQ; case study; diagram-based; open-ended; practical task; mixed format | Chosen formats are used; blank means the type's defaults. |
| Marks | Custom number; No marks | Custom: marks per task add up exactly to the number. No marks: answer guidance becomes a checklist; no marks anywhere. |
| Include rubric | On; Off | On: criteria × levels (full, partial, not yet) with marks that total the assignment marks. |
| Show marks in Student View | On; Off | Off hides marks per task, section and total from students; the rubric is also hidden. |

# 8. Task formats

| Format | In the Student View | In the Teacher View |
| --- | --- | --- |
| Short answer | Question with 1 to 2 lines (1 to 2 marks) | Answer, accept also, marking points |
| Long answer | Question with about two lines per mark | Model answer, key points with marks, partial credit |
| MCQ | 3 options (Grades 1 to 2) or 4 (Grade 3+) | Correct option and why |
| Case study | Case box and linked questions | Model answers tied to the case |
| Diagram-based | Diagram (white or transparent background) with label lines | Correct labels and explanation |
| Open-ended | Prompt with space or planner | Points to look for; acceptable range of answers |
| Practical task | Steps, materials, recording table | Expected observations or product; safety |
| Mixed format | Sections by format | Guidance per format |

# 9. Blueprint rules and editing

- **Blueprint first.** Before writing tasks, build a blueprint: sections, tasks per section, format, difficulty, objective and marks per task.
- **Task count.** If the teacher sets a number, use it. Otherwise use the type default and completion time: Practice worksheet about one question per 3 minutes; Real-life application 4 to 6 questions per case; Chapter revision at least one question per topic, 12 to 20 in total; Research, Project and Essay use their structure in Section 6.1.
- **Marks.** Marks per task are whole numbers that add up exactly to the configured total. Higher-mark tasks are the harder and longer ones. With a rubric, rubric marks also total the configured marks, and each criterion lists the tasks it covers.
- **Difficulty.** Applied across the whole assignment; Mixed follows about 30/50/20.
- **Coverage.** Every task maps to at least one objective and concept from the retrieved content; Chapter revision covers every topic of the chapter.
- **Numbering.** Questions are numbered continuously across sections (Q1, Q2…), so answer guidance matches the Student View.
- **Additional instructions** (word limit, examples, restrictions) apply to every relevant task.

**Editing operations:** edit any section's text in either view; regenerate a section; regenerate a single question (updates both views and its answer guidance); regenerate the whole assignment with "Keep my edited sections" on by default; change settings and return.

# 10. Output format v2.0 (download format)

## 10.1 Document structure

| Part | Teacher View | Student View |
| --- | --- | --- |
| Header | "[YoLearn.ai](http://YoLearn.ai) | Assignment Generator", "TEACHER VIEW (not for students)", title, book › topic, source status strip | "[YoLearn.ai](http://YoLearn.ai) | Assignment Generator", "STUDENT VIEW", title, book › topic |
| Body | Sections 1 to 7 (Section 6.2) | Fields strip, then sections in Section 6.3 |
| Footer | "Teacher View | title | Page X" | "Student View | title | Page X" |
| Typical length (Practice worksheet, 9 questions) | 4 to 5 pages | 2 to 3 pages |

## 10.2 Teacher View

1. **Assignment overview:** title, book and topic, type, objective, difficulty, questions or tasks, completion time, submission date, total marks; expected learning outcomes.
2. **Student instructions:** numbered steps.
3. **Detailed tasks:** sections with marks; each question with its marks.
4. **Expected deliverable:** what students hand in; word and length guide.
5. **Answer guidance:** per question, a table with expected answer or key points, accept also, and marking points that sum to the question's marks.
6. **Evaluation:** marks distribution (section, questions, marks, total); rubric when on (criterion, questions covered, marks, full, partial, not yet).
7. **Teacher notes:** preparation, common misconceptions with how to address them, differentiation (needs support, ready for more), plus type-specific content from Section 6.2.

A one-line check summary sits under the header on screen only; it is not exported.

## 10.3 Student View

Fields strip (name, class/section, date; total marks if shown, time, submit by); What will you learn?; Instructions; What to hand in (with the length guide); tasks with answer spaces sized to marks; type-specific blocks (Section 6.3); Submission line; Before you submit checklist in a highlighted box.

**Never in the Student View:** answers, model responses, marking points, accept-also notes, teacher notes, the check summary, source-status notes. The rubric appears only when "Show marks in Student View" is on and the type uses a rubric.

## 10.4 Answer spaces

1-mark question: one line; 2 marks: two lines; 3 marks: four lines; paragraphs: about one line per 12 words of the word limit. Tables have empty rows to fill. Essay writing lines match the word limit. Research and project planners use labelled boxes.

## 10.5 Save, share, versions and export

- Save keeps teacher edits; My assignments lists saved items with Open and Duplicate.
- Share student version: first time, the teacher ticks "I've reviewed the Student View"; a link is created; the link can be turned off (revoked) at any time.
- Edits after sharing do not change what students see until the teacher clicks "Publish updated version". The version badge shows the draft and shared versions.
- Export: choose Teacher View or Student View; Word (.docx, A4, editable), PDF or print. The export dialog opens on the view currently on screen.
- If sharing infrastructure is unavailable, the teacher exports the Student View and shares the file.

## 10.6 Visual tokens and files

Calibri (or the licensed app sans); body 11 pt; title 20 pt bold; section headings 13 pt in accent #1E6B5C with a marigold number #B9771A; tables with a teal header row and light tint #E8F1EE label column; Student View checklist box in warm #FFF4DE with border #E8A33D; A4 portrait; 20 mm margins. All images and diagrams on a white or transparent background. File names: `{Topic}_Assignment_Teacher_View.docx` / `.pdf` and `{Topic}_Assignment_Student_View.docx` / `.pdf`.

# 11. Data schema (assignment JSON v2.0) (Suggested)

```json
{
  "metadata": {"book": "", "board": "", "grade": "", "subject": "", "chapter": "", "topic": "", "subtopic": null,
    "assignment_type": "practice_worksheet | real_life_application | research_task | project | essay_creative_writing | chapter_revision",
    "objective": "", "difficulty": "easy | medium | hard | mixed", "completion_minutes": 30, "due_date": "2026-10-23",
    "task_formats": [], "task_count": 9, "task_count_source": "teacher | ai",
    "marks_enabled": true, "total_marks": 20, "rubric": false, "marks_in_student_view": true,
    "additional_instructions": "", "source_status": "textbook | teacher_content | unverified",
    "assignment_version": 1, "shared_version": null, "prompt_version": "", "renderer_version": ""},
  "outcomes": [""],
  "instructions": [""],
  "deliverable": {"text": "", "length_guide": [{"item": "", "length": ""}]},
  "student_intro": "",
  "sections": [{"id": "A", "teacher_title": "", "student_title": "", "marks": 5,
    "tasks": [{"n": 1, "text": "", "format": "short_answer", "difficulty": "easy", "objective_id": "LO1", "concepts": [""],
      "marks": 1, "answer_lines": 1, "options": null, "table": null, "diagram": null,
      "answer": "", "accept_also": "", "marking_points": [{"point": "", "marks": 1}], "partial_credit": ""}]}],
  "type_blocks": {
    "case": {"title": "", "text": "", "data_table": null, "picture": null},
    "research": {"question": "", "guiding_questions": [""], "allowed_sources": [""], "report_headings": [""], "word_limit": 300, "safety": ""},
    "project": {"driving_question": "", "product": "", "materials": [""], "steps": [""], "milestones": [{"title": "", "date": ""}], "roles": [""], "reflection": [""], "sample_product": ""},
    "writing": {"prompts": [""], "form": "", "audience": "", "word_limit": 150, "planner": [""], "success_criteria": [""], "model_response": ""},
    "revision": {"topic_map": [{"task": 1, "topic": ""}]}
  },
  "evaluation": {"distribution": [{"section": "A", "tasks": [1, 2, 3, 4], "marks": 5}],
    "rubric": [{"criterion": "", "tasks": [1, 2], "marks": 8, "full": "", "partial": "", "not_yet": ""}]},
  "teacher_notes": {"preparation": "", "misconceptions": [{"misconception": "", "address": ""}],
    "needs_support": "", "ready_for_more": "", "type_notes": [""]},
  "student_checklist": [""],
  "validation": {"checks": [{"id": "", "status": "pass", "location": "", "note": ""}]},
  "generation_notes": {"assumptions": [""], "warnings": [""]}
}
```

Schema notes: only the `type_blocks` entry for the chosen type is filled; others are null. `answer_lines` is set by the renderer from marks (Section 10.4). Totals, section marks and rubric sums are checked by code. Teacher-only fields (`answer`, `accept_also`, `marking_points`, `partial_credit`, `teacher_notes`, `model_response`, `sample_product`, `validation`, `generation_notes`) are never passed to the Student View renderer.

# 12. Generation architecture (Suggested)

| Step | What happens | Owner |
| --- | --- | --- |
| A. Normalise | Resolve book, topic and metadata; validate required inputs; load type defaults; resolve task count and marks | Backend |
| B. Retrieve | Retrieve and normalise topic content (whole chapter for Chapter revision); keep provenance; set source status | Backend |
| C. Blueprint | Concepts and objectives; sections, tasks, formats, difficulty and marks per task (Section 9) | LLM + Backend |
| D. Write | One call for the whole assignment (two for Chapter revision): tasks, type block, deliverable, answer guidance, evaluation and teacher notes together, so they agree | LLM |
| E. Validate and repair | C-, T-, A-, M- and V-checks (Section 14); deterministic fixes first, then targeted repair of failed fields | Backend + LLM |
| F. Review | Teacher View and Student View; edits, section and question regeneration with targeted re-checks | Teacher |
| G. Render | DOCX per view from JSON; PDF converted from DOCX; HTML preview with the same rules | Renderer |
| H. Save, share, version | Persist drafts and edits; publish student versions; revoke links | Backend |

# 13. Prompt library (Suggested)

## 13.1 System prompt (shared)

```
You are Yolearn's expert school assignment designer. You create clear, age-appropriate, curriculum-aligned assignments that students can complete on their own, and the guidance a teacher needs to mark them.

CORE RULES
1. Follow the selected assignment type exactly. Each type has its own task design, sections and deliverable. Never force an assignment into an essay format.
2. Use only the supplied topic content. Do not invent page numbers, quotations, diagrams or textbook facts. General knowledge used in explanations must be accurate for the grade.
3. Every task tells the student what to do and what to produce. Every question has answer guidance or evaluation criteria.
4. When marks are enabled, task marks are whole numbers that add up exactly to the total. Rubric marks, when used, also add up to the total.
5. Keep teacher-only content (answers, accept-also notes, marking points, model responses, teacher notes) in teacher fields only.
6. Use simple language for the grade, Indian contexts and low-cost, home-available materials. Respect every additional instruction.
7. Return valid JSON matching the schema in the developer message, with no prose or markdown outside the JSON.
```

## 13.2 Developer prompt: schema and constraints (Suggested)

```
Return JSON matching assignment schema v2.0 (Section 11).
Requirements:
- instructions: 4 to 6 short steps written to students.
- deliverable.text: exactly what students hand in; length_guide rows for each answer length used.
- tasks: number continuously across sections; each has format, difficulty, objective_id, marks (if enabled), answer, accept_also and marking_points that sum to its marks.
- type_blocks: fill only the block for the selected type, completely (case text, research question and sources, project steps and milestones with dates before the due date, writing prompt and planner).
- evaluation: distribution totals; rubric only if requested, with criteria that list the tasks they cover.
- teacher_notes: preparation, 2 to 3 misconceptions with how to address them, needs_support and ready_for_more, plus type_notes from the type library.
- student_checklist: 3 to 5 items specific to this assignment.
Every list item is a non-empty string; no placeholders such as "TBD".
```

## 13.3 Assignment type behaviour library

| Type | Required generation behaviour |
| --- | --- |
| Practice worksheet | 2 to 3 sections moving from recall to explanation to application; mostly short items; one table or diagram item when the topic suits it; common errors in teacher notes. |
| Real-life application | 1 to 2 realistic, local cases (market, home, school, farm, travel) that need the topic to solve; questions that refer to the case; model answers tied to the case details. |
| Research task | One clear research question; 3 to 5 guiding questions; allowed sources suited to the grade (textbook chapter, family, library, supervised internet); report headings and word limit; key findings to look for; internet safety note. |
| Project | A driving question and a concrete product; low-cost materials; 4 to 6 steps; 3 to 4 milestones dated back from the due date; optional group roles; short reflection; rubric with process and product criteria. |
| Essay / creative writing | One prompt or a choice of two, with form, audience and word limit; a planner; success criteria; a model response at the grade's level; language-focused rubric. |
| Chapter revision | Mixed sections covering every chapter topic; at least one application question; topic map for the teacher; revision tips. |

## 13.4 Difficulty behaviour library

| Level | Required generation behaviour |
| --- | --- |
| Easy | Recall and one-step tasks; familiar examples; short responses. |
| Medium | Recall plus explanation at grade level; one transfer to a new example. |
| Hard | More explain, apply and reasoning tasks; multi-step or comparison; justification required. |
| Mixed | About 30% easy, 50% medium, 20% hard across tasks; harder tasks carry more marks. |

## 13.5 Combination rules

Every assignment inserts exactly one type snippet and one difficulty snippet. Type governs structure, sections and deliverable; difficulty governs the thinking and steps within tasks. Chosen task formats are used inside the type's structure (for example MCQ inside a Real-life application case). If a format does not fit a type (for example MCQ as the main task of an Essay), use it only as a short pre-task and note it in generation notes.

## 13.6 Blueprint prompt

```
Plan the assignment structure. Do not write tasks yet.
INPUTS: {{grade}} {{subject}}, {{book}}, topic {{topic}} {{subtopic}}; type {{assignment_type}}; objective {{objective_or_blank}}; difficulty {{difficulty}}; completion time {{minutes}}; due {{due_date}}; formats {{formats_or_type_default}}; task count {{count_or_ai}}; marks {{marks_or_none}}; rubric {{rubric}}; additional instructions {{extra_or_none}}.
CONTENT: {{topic_content}}
TYPE RULES: {{type_snippet}}
Return: objectives with IDs, concepts, sections (titles for teacher and student), and for each task its format, difficulty, objective ID, concepts and marks. Marks must add up exactly to {{marks}}. For Project, milestone dates must fall before {{due_date}}.
```

## 13.7 Assignment writing prompt

```
Write the full assignment for this approved blueprint: {{blueprint_json}}.
Type {{assignment_type}}: {{type_snippet}}
Difficulty {{difficulty}}: {{difficulty_snippet}}
Subject adaptation: {{subject_adaptation}}
Content: {{topic_content}}
Additional instructions: {{extra_or_none}}
Write every task with its answer, accept_also and marking points; the type block; deliverable and length guide; evaluation (and rubric if requested); teacher notes; student checklist. Return the assignment object only.
```

## 13.8 Input normalization prompt

```
Normalise the setup payload. Do not write tasks.
Return normalised inputs with optional values as null; the type defaults applied; the resolved task count and source; whether marks, rubric and student marks are on; conflicts (for example Project with 15 minutes, or a due date before today) with a suggested adaptation; and whether content is available. Never change teacher-set values.
```

## 13.9 Source grounding prompt

```
Use the retrieved topic content as the primary source for facts, terms, examples and diagrams. Map each task to supported concepts and objectives. Do not invent textbook text, page numbers, quotations or diagrams, or claim the textbook says something it does not. If content is missing, return a warning; generate only if the teacher chose "Continue unverified", and set source_status to unverified.
```

## 13.10 Validation prompt (LLM checks)

```
Review the assignment and return a JSON report with pass or fail, location and a one-line repair instruction for: (1) tasks match the topic, objective and type; (2) instructions and deliverables are clear to a student of this grade; (3) answers and model responses are correct and match each task; (4) marking points fit the task; (5) rubric criteria are assessable and cover the right tasks; (6) difficulty matches the setting; (7) type block is complete and realistic (materials, dates, sources); (8) no duplicate tasks; (9) no invented textbook facts. Do not rewrite the assignment.
```

## 13.11 Targeted repair prompt

```
Repair only the fields listed in the validation report. Keep every passing field, the blueprint, numbering, marks and teacher edits. After repair, answers, marking points and rubric must agree with the tasks. Return the full corrected assignment object.
```

## 13.12 Section and question regeneration prompts

```
Section: Rewrite section {{section_id}} as a fresh, different version. Keep its role in the type, its marks and its tasks' formats and difficulty. Keep consistency with other sections: {{other_sections_summary}}. Return {"section": {...}}.
Question: Write a new, different task to replace Q{{n}}. Keep its format, marks, difficulty, objective and section. Avoid existing tasks: {{all_task_texts}}. Include answer, accept_also and marking points. Return {"task": {...}}.
```

## 13.13 Teacher edit re-check prompt

```
The teacher edited {{location}}. Keep the teacher's text exactly. Check whether linked answer guidance, marks and rubric still fit. If not, update only the linked teacher fields and return them with a one-line note for the teacher.
```

# 14. Validation checks (Suggested)

| ID | Check | Type | On failure |
| --- | --- | --- | --- |
| C1 | Required inputs present: book, topic, type, submission date, completion time | Code | Disable Generate with reason |
| C2 | Source status resolved (available, teacher content, or unverified chosen) | Code | Block generation |
| T1 | Task count matches the setting or the type default | Code | Repair |
| T2 | Type block filled for the selected type and only that type | Code | Repair |
| T3 | Every task has instructions, a format and maps to an objective | Code | Repair |
| T4 | No duplicate or near-duplicate tasks | Code | Regenerate task |
| T5 | Chapter revision covers every chapter topic | Code | Repair |
| T6 | Project milestone dates before the due date; due date not in the past | Code | Auto-fix dates; warn |
| A1 | Every task has answer guidance (or criteria for open tasks) | Code | Repair |
| A2 | Answers correct and consistent with tasks (Section 13.10) | LLM | Repair |
| M1 | Task marks add up to section marks and to the total | Code | Repair |
| M2 | Marking points sum to each task's marks | Code | Repair |
| M3 | Rubric marks total the assignment marks; each criterion lists tasks | Code | Repair |
| V1 | Student View and its exports contain no teacher-only fields | Code | Block share and export |
| V2 | Student marks and rubric follow the "Show marks in Student View" setting | Code | Re-render |
| V3 | Shared link shows the published version only | Code | Block publish |
| R1 | No task, table or checklist split across pages; headings never orphaned | Render | Re-render |
| R2 | Word and PDF match in text and page order | Render | Re-render |

Checks run in the background. The Teacher View shows only a one-line summary on screen; failed checks after one repair show as a note on the affected section.

# 15. Rendering specification

- One canonical assignment JSON renders both views. DOCX is built from JSON; PDF is converted from the DOCX so content and layout match. The HTML preview uses the same rules.
- The Student View renderer receives a filtered copy without teacher-only fields.
- Each task with its answer space, each table and each checklist keeps together on a page; section headings keep with the next block.
- Tables use fixed column widths; header rows repeat on page breaks. Answer lines are paragraph bottom borders.
- Right-aligned marks use right tab stops.
- Implementation metadata stays in JSON and document properties, not on the pages.

# 16. Content quality guidelines

## 16.1 What "ready to share" means

- A student can complete the assignment without asking the teacher what to do.
- Every task says what to produce and how much to write.
- Every question has an answer or clear criteria a non-specialist teacher can mark from.
- Materials are low-cost and available at home; research sources are safe and suitable for the grade.
- Instructions are written to students ("Look at…", "Write…", "Ask an adult…").

## 16.2 Subject adaptations

| Subject | Type emphasis | Content to include |
| --- | --- | --- |
| Science / EVS | Practice worksheet, Real-life application, Project (models, observation), Research | Observation tables, labelled diagrams on white backgrounds, safe home experiments with an adult note |
| Mathematics | Practice worksheet, Real-life application (shopping, measuring, time), Chapter revision | Worked solutions in answer guidance, number ranges for the grade, units |
| English and languages | Essay / creative writing, Practice worksheet (grammar, vocabulary), Chapter revision | Planners, success criteria, model responses, vocabulary banks; content in the target language |
| Social Science | Research task, Project (maps, timelines), Real-life application (civic situations) | Source records, map and timeline tasks, expected points |

## 16.3 Grade bands

| Grades | Language and design |
| --- | --- |
| 1 to 3 | Very short sentences; picture and table support; family-supported tasks; Research becomes "Ask and find out" |
| 4 to 6 | Short sentences; simple research with given sources; projects with clear steps |
| 7 to 10 | Subject vocabulary; reasoning and justification; independent research with citation; longer writing |

# 17. Dependencies and risks

| Risk or dependency | Impact | Mitigation |
| --- | --- | --- |
| Book catalogue and topic content retrieval | No grounding; generic tasks | Source status shown; "Add topic content" and "Continue unverified" paths |
| Topic extraction skips topics and has OCR errors | Wrong or missing topics; weak Chapter revision coverage | Topics editable; fix pipeline before client rollout |
| Incorrect answer guidance | Teachers mark wrongly | Answers written with tasks; A1 and A2 checks; content team samples per subject |
| Answer leakage into the Student View | Assignment unusable | Filtered Student View renderer; V1 blocks share and export |
| Unsafe or unrealistic tasks (materials, internet) | Parent complaints; students cannot complete | Type library rules; materials and safety notes; adult-supervision lines |
| Sharing infrastructure, persistence and versions | Students see wrong version | Published version pinned to the link; V3; export fallback |
| Authentication and permissions; document rendering | Access or export failures | Shared platform services; inputs preserved on failure |

# 18. Acceptance criteria

- Teachers select a book and topic from the catalogue without re-entering board, grade, subject or chapter.
- The six assignment types are available, each producing the sections and content defined in Section 6, and no unneeded sections.
- Difficulty offers Easy, Medium, Hard and Mixed; there is no assignment length setting; task count follows Section 9.
- The system retrieves topic content before generation and shows source status truthfully; unverified assignments are labelled.
- Teacher View contains the seven sections; Student View contains the required and type-specific sections.
- Teacher-only content never appears in the Student View, its link or its exports.
- Questions, answer guidance, marks and rubric stay aligned; marks add up to the configured total.
- Teachers can edit, regenerate a section or a question, regenerate the whole assignment keeping edits, save, reopen and duplicate.
- Sharing requires reviewing the Student View; edits after sharing need "Publish updated version"; links can be revoked.
- Teacher View and Student View export separately in Word and PDF with matching content.
- If source retrieval or generation fails, the system explains the issue and keeps the teacher's inputs.

# 19. Test matrix

| Test case | Input | Expected result |
| --- | --- | --- |
| Practice worksheet | Class 6 Science, Living and Non-Living Things, 30 min, 20 marks | 9 to 10 questions in 3 sections; marks total 20; answer guidance for every question |
| Real-life application | Class 5 Maths, money, 30 min | 1 to 2 local cases with linked questions; model answers tied to the case |
| Research task | Class 7 Science, nutrition in plants | Research question, guiding questions, source table, report headings, safety line, rubric |
| Research task, low grade | Class 3 EVS | "Ask and find out" with family and book sources only |
| Project | Class 6 Science, due in 7 days | Materials, steps, 3 to 4 milestones dated before the due date, rubric, reflection |
| Essay / creative writing | Class 8 English, 150 words | Prompt, planner, success criteria, writing lines for about 150 words, model response, language rubric |
| Chapter revision | Whole chapter with 5 topics | Every topic covered; topic map in Teacher View |
| Difficulty | Easy, Medium, Hard, Mixed | Visible change in task demand; Mixed about 30/50/20 |
| Task count | AI recommends vs set to 6 | Count from type and time vs exactly 6 |
| Marks off | No marks | No marks anywhere; rubric and student-marks options hidden; guidance as checklist |
| Student marks off | Marks on, show marks off | Teacher View has marks; Student View has none |
| Source unavailable | Topic without content | Notice; generation only after adding content or choosing unverified; label shown |
| Regenerate question | Regenerate Q4 | Q4 changes in both views with new guidance; other questions unchanged |
| Regenerate with edits | Edited Instructions, regenerate assignment | Instructions kept when "Keep my edited sections" is on |
| Share and versions | Share, edit, then open link | Link shows v1 until "Publish updated version"; revoke stops access |
| Export | Teacher View and Student View, Word and PDF | Four files; Student files have no answers; Word and PDF match |
| Negative | Fabricated page references, duplicate tasks, mismatched marks, answer leakage | Caught by grounding, T4, M1 to M3 and V1 |

# 20. Example assembled prompt: Class 6 Science, Practice worksheet

```
Write the full assignment for this approved blueprint.
Grade 6 Science, Class 6 Science – NCERT, topic: Living and Non-Living Things.
Type: Practice worksheet. 2 to 3 sections from recall to explanation to application; mostly short items; one table item; common errors in teacher notes.
Difficulty: Medium. Recall plus explanation at grade level; one transfer to a new example.
Objective: Explain the differences between living and non-living things.
Completion time: 30 minutes. Due: 23 October 2026. Marks: 20, rubric on, marks shown to students.
Additional instructions: Include examples from everyday life.
Blueprint: A Short answers Q1-Q4 (1,1,2,1 = 5); B Understanding and application Q5-Q7 (3,3,3 = 9); C Everyday-life application Q8 table task (4), Q9 paragraph (2) = 6. Total 20.
Content: {{retrieved topic content}}
Return the assignment object only.
```

The output of this prompt is the reference Teacher View and Student View in Section 23.

# 21. Success measures

- Primary: weekly active teachers who save an assignment and then share or export it.
- Generation success rate and average time to generate.
- Generation-to-save and save-to-share/export conversion.
- Share of assignments edited before sharing; section and question regeneration rate, by type.
- Usage by assignment type and subject.
- Reuse rate (reopen and duplicate).
- Teacher satisfaction; critical content errors, incorrect answer guidance and Student View leakage (target zero).

These can be tracked as simple event counts until a fuller analytics setup exists.

# 22. Implementation notes and open decisions

- Use one canonical assignment JSON; never ask the model to write DOCX or PDF directly.
- Totals, section marks, rubric sums and dates are checked by code.
- Version prompts, schema and renderer separately; persist type defaults applied and teacher overrides.
- Open: a "Where it's done" setting (Homework / In class) to adjust instructions. Not in v2.0.
- Open: whether Research and Essay should be filtered by grade or only adapted (v2.0 adapts).
- Open: share-link permissions (school only vs anyone with link) and link expiry.
- Open: whether Chapter revision should call the Assessment Generator service for question writing.
- Open: catalogue and source-retrieval fallback when a book has no topic content.

# 23. Reference artifacts

| Artifact | Purpose |
| --- | --- |
| Living_NonLiving_Assignment_Teacher_View.docx / .pdf | Teacher View reference: Practice worksheet, Class 6 Science, Living and Non-Living Things, Medium, 30 min, 20 marks with rubric, 9 questions in 3 sections, 5 pages |
| Living_NonLiving_Assignment_Student_View.docx / .pdf | Student View reference for the same assignment, 3 pages |
| Prototype: [claude.ai/artifact/65GuD1b4wfT5qLfutcJagu](https://claude.ai/artifact/65GuD1b4wfT5qLfutcJagu) | Setup with six types, Easy/Medium/Hard/Mixed, no length setting; generation; Teacher/Student View; section and question regeneration; save, duplicate, share with review and versions; export. Shows the Practice worksheet sample for every type |
| [PRD : Yolearn Chapter Lesson Planner · Prompt Library and Output Format](https://app.notion.com/p/PRD-Yolearn-Chapter-Lesson-Planner-Prompt-Library-and-Output-Format-3fa68fe80f0981849a09c5ed84451fc6?pvs=21) | Shared PRD format and prompt library pattern |
| [PRD : AI Assessment Generator](https://app.notion.com/p/PRD-AI-Assessment-Generator-3f568fe80f0981ffb130e5905cd94e87?pvs=21) | Related tool: timed question papers; possible shared question-writing service |