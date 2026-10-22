# PRD : Yolearn Daily Lesson Planner · Prompt Library and Output Format v2.0

<aside>
📘

**Updated PRD v1.3** · Prompt Library · Output Format Specification v2.0 · 15 Oct 2026

Design principle: preserve the familiar Yolearn lesson-plan document structure while making teaching delivery and pedagogy meaningfully configurable.

Prototype: [Yolearn Daily Lesson Planner prototype](https://claude.ai/artifact/87UacEyqKVW81C95icREoF) · Sample output and reference renderer: see Section 22.

</aside>

# What changed in v1.3

| Area | Change | Section |
| --- | --- | --- |
| Download format | Output format v2.0 replaces the “existing-format” spec. Same section order, plus a metadata strip with resolved Teaching Style, Pedagogy, Bloom’s level and homework status; a proportional “Lesson at a glance” timeline; objective IDs (LO1…) carried through stages, activities and assessment; a per-stage “Check for learning” row; resources traced to stages. | 5, 17 |
| Defects fixed | The current PDF renders empty bullets (text detached from markers), places the metadata strip after the lesson content begins, and splits stage headings from their purpose/table across pages. v2.0 sets explicit rendering rules for each. | 5.2, 17 |
| Schema | Added metadata.duration_source, metadata.blooms_level, version stamps; teacher_guidance[].points; student_activities[].stage_number; homework.optional; teaching_resources as objects with used_in_stages. | 8 |
| Validation | Added check 15 (activities sit inside their stage’s time), check 16 (no empty list items), and a deterministic timing fix before falling back to the LLM repair prompt. | 14, 15 |
| Teacher control | Stage-level regeneration moved from “consider” to in scope for MVP, as shown in the prototype. | 21 |
| Reference artifacts | Prototype, sample lesson in v2.0 (DOCX and PDF), canonical lesson JSON and reference DOCX renderer. | 22 |

# 1. Document purpose and scope

This specification updates Yolearn Daily Lesson Planner so that its generated lesson plans preserve the familiar structure and visual language of the existing Yolearn lesson-plan PDF while making the teaching content more responsive to Teaching Style and Pedagogy Approach.

This document contains the product requirements, prompt architecture, reusable prompt templates, behavior rules for supported combinations, validation/repair prompts, and the Word/PDF output specification. It is intended for product, design, engineering, and LLM implementation teams.

Product boundary: this is the one-day Daily Lesson Planner. A separate chapter/period planner may be defined as a distinct tool and is outside this specification.

# 2. Product requirements

Product name: Yolearn Daily Lesson Planner.

Primary user: teacher or lesson planner preparing a structured one-day lesson plan for a school topic.

Primary outcome: a complete, classroom-usable lesson plan that follows the existing Yolearn document structure and can be exported as an editable Word document and a PDF.

The generated lesson plan is a structured teaching plan, not a separate word-for-word AI tutor script. Teacher-facing instructions should be clear and usable, but do not need to be a full lecture transcript.

- Preserve the current document's section order and familiar design: lesson heading/metadata; Learning Objectives; Key concepts; Prerequisites; Lesson Flow; Teacher Guidance; Student Activities; Questions to Ask; Common Misconceptions; Teaching Resources; Assessment; Homework; Differentiation; Lesson Closure.
- Lesson Flow uses numbered stages with time ranges, stage purpose, TEACHER and STUDENTS columns, and RESOURCES.
- Teaching Style and Pedagogy Approach must change the teaching design, not merely appear as labels.
- All form inputs are optional. Do not block generation because a non-essential field is blank.
- If the topic or curriculum context is too ambiguous to generate a reliable plan, ask one concise clarification or generate only when enough context exists. Do not fabricate a textbook chapter, standard, or source content.
- Use age-appropriate explanations, realistic activities, and materials that are commonly available unless the user has specified otherwise.
- When lesson duration is supplied, stage durations must add up exactly to it.
- Generate both DOCX and PDF from the same structured lesson-plan data in one user action.

# 3. Inputs and defaults

| **Input** | **Control / type** | **Default / behavior** |
| --- | --- | --- |
| Grade | Optional selector/text | Use selected grade; if absent, infer only when clearly provided in topic/context, otherwise use broadly age-neutral language or ask if grade is essential. |
| Topics | Optional multi-select | Use all selected topics. Organize them coherently within the available duration; do not silently drop a selected topic. |
| Teaching Style | Optional dropdown | Default: AI Recommended. |
| Pedagogy Approach | Optional dropdown | Default: AI Recommended. |
| Lesson Duration | Optional duration | If supplied, stage timings must sum exactly to duration. If absent, choose a reasonable duration and label it as an AI suggestion. |
| Bloom's Level | Optional selector | If absent, use a balanced progression appropriate to grade and topic. |
| Engagement Activity | Optional selector/text | If absent, choose a feasible activity aligned to lesson goals and pedagogy. |
| Homework | Optional selector/text | If absent, include only when useful and age-appropriate; otherwise state 'Optional homework' or omit the task while retaining the section if the template requires it. |
| Learning Objectives | Optional text/list | Honor user objectives. If absent, generate measurable objectives aligned to topic and grade. |
| Additional Details | Optional text | Treat as user constraints, not as instructions to violate safety, curriculum accuracy, or output requirements. |
| Upload Reference Document | Optional file | Use as the primary source when supplied. Distinguish source facts from general explanatory additions. Do not invent unreadable/missing content. |
| Advanced Settings & Parameters | Optional structured controls | Apply valid settings. If conflicts occur, follow the precedence rules in Section 4 and surface a brief note where appropriate. |

# 4. Option catalog and precedence

Precedence when inputs conflict: (1) explicit user-entered constraints and selected values; (2) supplied reference document/curriculum content; (3) selected Teaching Style and Pedagogy Approach reconciled together; (4) grade-appropriate pedagogical defaults; (5) AI suggestions.

AI Recommended is a valid choice, not a missing value. When either field is AI Recommended, choose an approach that best fits the topic, grade, duration, and other constraints. If both are manually selected, honor both by blending compatible techniques. Never silently replace a manual selection. If the combination is awkward, preserve both intentions and explain the practical compromise in an internal design note only when needed; do not add implementation commentary to the student-facing lesson.

| **Field** | **Supported options** | **Core behavioral effect** |
| --- | --- | --- |
| Teaching Style | AI Recommended; Lecture Mode; Socratic Method; Story Mode; Example First Approach; Step-by-Step Guided Learning; Demonstration-Based Teaching | Controls the lesson's instructional delivery pattern, sequencing, teacher language, examples, and question rhythm. |
| Pedagogy Approach | AI Recommended; Constructivist Approach; Collaborative Learning; Inquiry-Based Learning; Direct Instruction; Project-Based Learning | Controls how learners engage, build understanding, collaborate, investigate, practice, and demonstrate learning. |
| Bloom's Level | Optional selected level(s) / configured app options | Controls cognitive demand of objectives, tasks, and assessment; do not make the entire lesson higher-order if the selected level is lower-order. |
| Engagement Activity | App-configured choices / free text | Use the selected activity when feasible; adapt its scale and timing to grade and duration. |
| Homework | App-configured choices / free text | Honor the selection; ensure workload is age-appropriate and aligned to the lesson. |

# 5. Output format v2.0 (download format)

v2.0 keeps the familiar Yolearn lesson-plan structure and section order so teachers recognise the document, and changes the layout so the plan is faster to scan in class and easier to check against the selected settings. A rendered sample (Grade 3, Roots and Stems) is attached as Word and PDF; see Section 22.

## 5.1 Page structure, in order

| # | Block | What it shows | Change from current output |
| --- | --- | --- | --- |
| 1 | Heading | Eyebrow “LESSON PLAN | SUBJECT | GRADE”, lesson title, Chapter and Topic line | Unchanged content; fixed spacing so eyebrow and title never overlap |
| 2 | Metadata strip | Row 1: Grade, Subject, Duration, Format (stages). Row 2: Teaching style, Pedagogy, Bloom’s level, Homework | Moved directly under the title (currently appears after Lesson Flow starts). Row 2 is new and shows the resolved style and pedagogy. Duration shows “(suggested)” when AI-chosen |
| 3 | Lesson at a glance | A bar whose segment widths are proportional to stage minutes, start/end ticks, and a dotted-leader list of stage titles and time ranges | New. Lets a teacher see pacing in one look and makes timing errors visible |
| 4 | Learning objectives | Table: ID (LO1…), objective, Bloom’s level | Was a numbered list without IDs or Bloom level |
| 5 | Key concepts, Prerequisites | Bullets | Fix empty-bullet rendering |
| 6 | Lesson flow | One block per stage: dark header bar with number, title and time range; Purpose row; Teacher and Students columns; Resources row; Check for learning row with the objectives it serves | Header and time on one bar; “Check for learning” and objective tags are new; each block never splits across pages |
| 7 | Teacher guidance | Per concept: explanation, bullets, Real-life example and Analogy side by side, Ask questions | Callouts placed with their concept instead of floating beside other text |
| 8 | Student activities | Table: activity and type, stage and minutes, student-facing instructions, objectives served | Was free text; now traceable to a stage |
| 9 | Questions to ask | 2 x 2 grid: Warm-up, During the lesson, Concept check, Closure | Fix empty bullets |
| 10 | Common misconceptions | Table: Students may think / What to do (warm accent) | Table instead of stacked blocks |
| 11 | Teaching resources | Table: resource / used in stage | Stage traceability is new; list must match stage resources exactly |
| 12 | Assessment | Methods bullets + table: ID, objective, how to check | Adds IDs |
| 13 | Homework | Box with title, Optional label and minutes, instructions; or “No homework for this lesson” | Optional status is explicit |
| 14 | Differentiation | Three columns: Needs support / Standard / Advanced | Unchanged |
| 15 | Lesson closure | Key takeaways + highlighted final check question | Unchanged content |
| - | Footer | Lesson title | grade subject (left), Page X of Y (right) | Adds total pages; right-aligned |

## 5.2 Defects in the current output that v2.0 must fix

| Defect seen in current PDF | Rule in v2.0 |
| --- | --- |
| Bullets render with no text and the text appears elsewhere (Prerequisites, Teacher guidance, Questions, Differentiation) | Every list item is a single paragraph with its marker; the renderer never emits a bullet for an empty string; validator check 16 rejects empty strings |
| Metadata strip appears after Lesson Flow has started | Metadata strip is fixed directly below the title |
| Stage purpose and resources sit on one page, the Teacher/Students table on the next | Each stage is one keep-together block; only a stage longer than a page may split, and then the header row repeats |
| Teaching style and pedagogy are not visible anywhere | Resolved values shown in metadata row 2; selected values stored in JSON |
| Homework looks mandatory even when optional | Optional label in metadata and the homework box |
| Activities cannot be traced to stages or time | Activity table has a stage column; validator check 15 |

## 5.3 Visual tokens

A4 portrait, 19 mm side margins, Arial (or the app’s licensed sans) at 10 pt body and 9 pt tables, uppercase micro-labels at 7.5 pt. Colours: ink #1F2A37, primary #1F3A5F, accent #2A7F7A, muted #5B6470, rule #CBD5DF, fills #EAF1F6 (primary) / #E6F2F1 (accent) / #FDF3E7 (misconceptions). Body text never shrinks below 9 pt to fit a page. The palette works when printed in greyscale because every coloured block also has a label.

# 6. Prompt architecture (Suggested)

Recommended pipeline: (A) normalize inputs and source material; (B) choose/reconcile style and pedagogy; (C) draft structured lesson-plan data; (D) validate pedagogy, timing, source grounding, and section completeness; (E) repair only failed fields; (F) render the same validated data into DOCX and PDF; (G) confirm both files were created successfully.

Use structured JSON internally rather than asking the LLM to produce the final PDF or Word layout directly. Renderers should own typography, page breaks, tables, headers, and footers. This reduces layout drift between DOCX and PDF.

- Keep system-level requirements stable across all generations.
- Use one dynamic user prompt for the selected field values; do not create a separate hard-coded prompt for every possible combination.
- Use a behavior library/mapping table to insert the style and pedagogy instructions selected by the user.
- Use deterministic validation and a targeted repair prompt instead of regenerating the whole plan whenever a small issue is found.

# 7. System prompt — reusable base (Suggested)

```
You are Yolearn's expert school lesson-planning assistant. Create accurate, age-appropriate, practical one-day lesson plans for teachers. Follow the provided input values and source documents. The final result must use the Yolearn existing lesson-plan structure specified by the developer message.

CORE RULES
1. Treat every form field as optional. Use supplied values when present; do not invent missing user preferences.
2. If Teaching Style is AI Recommended, select a suitable style for the topic, grade, objectives, and duration. If Pedagogy Approach is AI Recommended, select a suitable pedagogy. If both are manually selected, reconcile both and preserve both intentions; never silently override a manual selection.
3. Teaching Style must affect the delivery pattern, sequencing, explanation style, examples, and questioning. Pedagogy Approach must affect learner participation, task design, collaboration/inquiry, scaffolding, and evidence of learning.
4. Keep the lesson feasible for the given grade, duration, classroom context, and available resources. Prefer low-cost, commonly available materials unless the user says otherwise.
5. If a reference document is supplied, prioritize its relevant content. Do not claim that unsupported details came from the source. Do not invent page references, curriculum standards, chapter names, or quotations.
6. Produce a complete structured lesson plan, not a word-for-word tutor script. Teacher directions should be specific enough to run the lesson.
7. Include every required section. If a section is not applicable, use a brief sensible entry rather than silently removing it.
8. If duration is given, lesson-stage minutes must sum exactly to that duration. Avoid double-counting overlapping activities.
9. Learning objectives must be observable and appropriate to the requested Bloom's level. Activities and assessment must map to objectives.
10. Use simple, clear language for the selected grade. Avoid vague instructions such as 'discuss the topic' without a question, task, or expected evidence.
11. Do not include multimedia as a required input or design dependency. Visuals or physical resources may be included only when useful and feasible. Do not include Flipped Classroom as an option or prescribed approach.
12. Return valid JSON matching the schema supplied by the developer. Do not include markdown fences or prose outside the JSON.
```

# 8. Developer prompt — output schema and constraints (Suggested)

Return a JSON object with this top-level structure (schema v1.3):

```json
{
  "metadata": {"title": "", "chapter": "", "topic": "", "grade": "", "subject": "",
    "duration_minutes": 45, "duration_source": "user | ai_suggested", "stage_count": 6,
    "blooms_level": "", "teaching_style_selected": "", "teaching_style_resolved": "",
    "pedagogy_selected": "", "pedagogy_resolved": "",
    "plan_version": "", "prompt_version": "", "renderer_version": ""},
  "learning_objectives": [{"id": "LO1", "text": "", "bloom_level": ""}],
  "key_concepts": [""],
  "prerequisites": [""],
  "lesson_flow": [{"stage_number": 1, "title": "", "start_minute": 0, "end_minute": 5,
    "duration_minutes": 5, "purpose": "", "teacher_actions": [""], "student_actions": [""],
    "resources": [""], "assessment_evidence": [""], "objective_ids": ["LO1"]}],
  "teacher_guidance": [{"concept": "", "explanation": "", "points": [""],
    "real_life_example": "", "analogy": "", "questions_to_ask": [""]}],
  "student_activities": [{"title": "", "type": "", "stage_number": 2, "duration_minutes": 5,
    "instructions": "", "serves_objective_ids": ["LO1"]}],
  "questions_to_ask": {"warm_up": [""], "during_lesson": [""], "concept_check": [""], "closure": [""]},
  "common_misconceptions": [{"misconception": "", "intervention": ""}],
  "teaching_resources": [{"item": "", "used_in_stages": [1]}],
  "assessment": {"methods": [""], "objective_checks": [{"objective_id": "LO1",
    "objective_text": "", "how_to_check": ""}]},
  "homework": {"included": true, "optional": true, "title": "", "estimated_minutes": 10, "instructions": ""},
  "differentiation": {"needs_support": [""], "standard": [""], "advanced": [""]},
  "lesson_closure": {"key_takeaways": [""], "final_question": ""},
  "generation_notes": {"assumptions": [""], "warnings": []}
}
```

Schema notes:

- This is a reference schema; engineering should convert it to a strict JSON Schema and enforce enums for style, pedagogy, Bloom levels and duration_source.
- New in v1.3: duration_source (drives the “(suggested)” label), blooms_level (metadata strip), version stamps (written by the backend, not the LLM), teacher_guidance[].points, student_activities[].stage_number, homework.optional, and teaching_resources as objects with used_in_stages.
- start_minute/end_minute are offsets from lesson start, not clock times. The first stage starts at 0, stages are contiguous with no gaps or overlaps, and the final end_minute equals duration_minutes.
- Every objective ID referenced elsewhere must exist.
- teaching_resources includes every resource used in stages and activities, each with the stages that use it, and nothing unused.
- Every list item must be a non-empty string.
- For an unrequested homework task, set included=false, or included=true with optional=true, according to product behaviour.
- Do not include a section for Flipped Classroom or a Multimedia input.
- Keep between 4 and 7 stages so the glance bar and stage blocks stay readable.

# 9. Teaching Style behavior library

| **Style** | **Required generation behavior** |
| --- | --- |
| AI Recommended | Choose the best fit from the topic, age, objectives, duration, and user constraints. Set resolved style; preserve selection value as AI Recommended. |
| Lecture Mode | Use a clear teacher-led explanation sequence with signposting, short checks for understanding, examples, and brief student responses. Avoid an uninterrupted monologue. |
| Socratic Method | Use a purposeful sequence of open and follow-up questions that elicits student reasoning. Do not withhold all explanations; synthesize correct understanding after discussion. |
| Story Mode | Introduce or organize the concept through an age-appropriate story, scenario, or narrative. Ensure story details support the learning objective and do not replace explicit teaching. |
| Example First Approach | Begin with a concrete example, worked case, object, or situation; ask students to notice patterns; then name and explain the concept. |
| Step-by-Step Guided Learning | Break the concept into small sequenced steps. Model one step, guide practice, check understanding, and gradually release responsibility. |
| Demonstration-Based Teaching | Use a safe, feasible demonstration or observable example. State what to observe, ask prediction questions, explain the result, and connect it to the concept. Provide a non-material alternative if the resource is unavailable. |

# 10. Pedagogy behavior library

| **Approach** | **Required generation behavior** |
| --- | --- |
| AI Recommended | Choose the best fit for learning goals, age, content, duration, and context. Set resolved approach. |
| Constructivist Approach | Elicit prior ideas, let students compare experiences or examples, build meaning through guided sense-making, and revisit initial ideas. |
| Collaborative Learning | Give students a shared task, clear roles or participation structure, individual accountability, a product/answer, and a short debrief. |
| Inquiry-Based Learning | Start from a meaningful question or puzzle; have students predict, observe/investigate, record evidence, explain, and reflect. Keep the investigation feasible and safe. |
| Direct Instruction | State the learning goal, model/explain explicitly, use guided practice with checks, then independent practice and feedback. |
| Project-Based Learning | Set a small, achievable driving question and concrete product or performance. Include milestones and assessment; scale project scope to the selected one-day duration rather than inventing multi-day work. |

# 11. Combination rules and variation coverage

There are 7 Teaching Style choices and 6 Pedagogy Approach choices including AI Recommended, giving 42 selectable combinations. Do not maintain 42 separate full prompts. Use the shared base prompts plus the two selected behavior snippets and conflict-resolution rules.

For every generation, include the selected Teaching Style behavior snippet and selected Pedagogy behavior snippet. When a field is AI Recommended, include the recommendation rule for that field. This creates coverage for all combinations without prompt duplication.

A style describes how the teacher delivers and sequences instruction; pedagogy describes how students learn and participate. They are complementary dimensions, not mutually exclusive categories.

| **Example combination** | **Expected blended behavior** |
| --- | --- |
| Example First + Inquiry-Based | Open with a concrete example; ask students to predict/notice; gather observations; guide students to derive the concept; conclude with explicit accurate explanation. |
| Lecture Mode + Collaborative Learning | Teacher gives short structured explanations; students then work on a shared task with roles/accountability and report evidence. |
| Socratic + Direct Instruction | Use questions to surface thinking, then provide concise explicit clarification/modeling and guided practice; do not let questioning replace necessary explanation. |
| Story Mode + Project-Based Learning | Use a story/scenario to introduce a driving question; students create a small product or solution tied to the concept within the time available. |
| Demonstration-Based + Constructivist | Ask students to predict, observe a demonstration, compare results with prior ideas, and revise their explanation. |
| Step-by-Step + Inquiry-Based | Scaffold the investigation in clear steps while preserving student prediction, evidence gathering, and explanation. |
| Any style + AI Recommended pedagogy | Keep the selected style fixed and choose a complementary pedagogy; do not replace the manual style. |
| AI Recommended style + any manual pedagogy | Keep the selected pedagogy fixed and choose a style that supports it; do not replace the manual pedagogy. |

# 12. Dynamic user prompt template

```
Create a one-day Yolearn lesson plan using the inputs below. Treat blank values as unspecified, not as errors. Follow the system and developer requirements. Return only valid JSON.

INPUTS
- Grade: {{grade_or_blank}}
- Subject: {{subject_or_blank}}
- Chapter: {{chapter_or_blank}}
- Selected topic(s): {{topics_array_or_blank}}
- Teaching Style selected: {{teaching_style | default: "AI Recommended"}}
- Pedagogy Approach selected: {{pedagogy_approach | default: "AI Recommended"}}
- Lesson duration in minutes: {{duration_or_blank}}
- Bloom's level: {{blooms_level_or_blank}}
- Engagement activity: {{engagement_activity_or_blank}}
- Homework preference: {{homework_or_blank}}
- User learning objectives: {{learning_objectives_or_blank}}
- Additional details/constraints: {{additional_details_or_blank}}
- Advanced settings: {{advanced_settings_or_blank}}
- Reference document text/extracted content: {{reference_content_or_blank}}

STYLE BEHAVIOR INSTRUCTION:
{{insert behavior text for selected Teaching Style; if AI Recommended, insert selection rule}}

PEDAGOGY BEHAVIOR INSTRUCTION:
{{insert behavior text for selected Pedagogy Approach; if AI Recommended, insert selection rule}}

Before drafting, reconcile constraints. Then create a complete plan with objectives, timed lesson stages, explicit teacher actions, student actions, resources, activities, assessment evidence, misconceptions, differentiation, homework behavior, and closure. Ensure that each stage contributes to one or more objectives and that the stage timings sum exactly to the supplied duration when present.
```

# 13. Input normalization prompt

```
Normalize the UI payload before lesson generation. Do not create lesson content yet.

Return:
- normalized fields with missing optional values represented as null,
- selected enum values validated against the configured option list,
- extracted reference content or a concise extraction warning,
- conflicting constraints, if any,
- whether a clarification is essential.

Rules:
- Default Teaching Style and Pedagogy Approach to AI Recommended only when absent or blank.
- Do not treat an explicit AI Recommended selection as a missing value.
- Do not infer an exact curriculum standard or textbook content without evidence.
- If the user supplies multiple topics, preserve all topics and flag only if the time available makes full coverage unrealistic.
- Ask a clarification only if essential to avoid making a materially unreliable lesson; otherwise proceed with a stated assumption.
```

# 14. Validation prompt

```
Review the generated lesson-plan JSON against the specification. Do not rewrite the whole lesson unless necessary. Return a JSON validation report with pass/fail per check, the exact location of each failure, and a minimal repair instruction.

Checks:
1. Required sections exist and have usable content.
2. Teaching Style and Pedagogy Approach are both reflected in the lesson flow and activity design.
3. Manually selected style/pedagogy are not silently overridden.
4. All selected topics and explicit objectives are represented.
5. Objectives are observable, age-appropriate, and aligned to selected Bloom's level.
6. Each objective has at least one activity or teaching step and at least one assessment check.
7. Stage intervals are contiguous, non-overlapping, and sum exactly to duration.
8. Stage instructions are actionable; teacher/student columns are distinct and not duplicates.
9. Resources are feasible and consistent across lesson flow and resource list.
10. Misconceptions have targeted interventions.
11. Homework follows the selected preference and is age-appropriate.
12. No Flipped Classroom option/section is present; no Multimedia input/requirement is present.
13. Output is valid JSON and matches the schema.
14. No unsupported source claims or invented textbook-specific facts appear.
15. Each student activity has a stage_number, and its duration fits inside that stage.
16. No list contains an empty string (empty strings render as blank bullets).
```

# 15. Targeted repair prompt

Deterministic first: if the only failure is timing (check 7) and stage durations are present, the backend recomputes start/end minutes and adjusts the longest stage to absorb any difference. The LLM repair prompt below runs only for content failures.

```
Repair only the fields listed in the validation report. Preserve all passing content, the user's selected settings, all selected topics, the established output schema, and the familiar Yolearn section structure. Do not introduce new resources unless needed. If timings fail, recalculate all stage intervals so they are contiguous and sum exactly to {{duration_minutes}}. Return the full corrected JSON only.
```

# 16. Source-document grounding prompt

```
Use the supplied reference document as the primary source for topic-specific facts. First identify the concepts, terminology, examples, objectives, and any sequence explicitly supported by the source. Then create the lesson plan in the required Yolearn format.

Do not:
- invent text from missing or unreadable pages,
- claim a source says something it does not say,
- fabricate page numbers, standards, or citations,
- silently replace source terminology with different terminology where the distinction matters.

You may add age-appropriate explanations, questions, activities, and examples as pedagogical scaffolding. Keep those additions consistent with the source and general subject accuracy. If source details conflict with a user instruction, flag the conflict rather than silently choosing an unsupported fact.
```

# 17. Output generation and file-rendering specification

- One click should generate both an editable .docx and a .pdf from the same validated JSON lesson object.
- The Word file is the editable master. The PDF should visually mirror the Word file as closely as possible.
- Use the same section order, titles, content, stage timings, tables, and metadata in both outputs. Differences should be limited to rendering constraints.
- Use A4 page size by default, readable margins, consistent heading hierarchy, a restrained education-oriented palette, and accessible contrast.
- Lesson Flow stage heading should show stage number/title and time range. Purpose appears directly beneath. Teacher and Students are side-by-side columns. Resources appear below the table.
- Avoid splitting a stage heading from its purpose/table where possible. Repeat table header rows across pages where supported.
- Use page numbers and a footer containing lesson title and grade/subject.
- Long text should wrap inside tables; do not shrink body text to unreadable sizes merely to fit a page.
- If file rendering fails for one format, retry that renderer and report which format failed; do not claim both were generated unless both files exist.
- Use deterministic templates and styles so repeated generations remain visually consistent.
- Reference implementation: render_docx.js with lesson_docx_core.js (docx npm package) renders the canonical JSON to DOCX; the PDF is produced by converting that DOCX (LibreOffice headless or equivalent) so both files are identical in content and layout. The same layout core runs in the browser for the preview.
- Keep-together rules: section headings keep with the next block; every Lesson Flow stage is one table whose rows cannot split and whose paragraphs keep with next; table header rows repeat when a table spans pages.
- Right-aligned elements (stage time on the header bar, footer page number, glance list times) use standard right tab stops, not positional tabs, because positional tabs are dropped by LibreOffice during PDF conversion.
- Glance bar segment widths are proportional to stage minutes and the last segment absorbs rounding, so the bar always fills the page width.
- File naming: Grade-Subject-Lesson-Title.docx and .pdf (non-alphanumeric characters replaced with hyphens, maximum 90 characters).
- Implementation metadata (assumptions, warnings, versions) stays in the JSON and the document properties, not in the teacher-facing pages.

# 18. Acceptance criteria

- Teaching Style defaults to AI Recommended; Pedagogy Approach defaults to AI Recommended.
- All current form fields remain optional and generation does not fail only because an optional field is blank.
- All 42 style/pedagogy combinations are supported through compositional prompt assembly and tested with representative pairwise coverage.
- A manual selection remains honored when the other field is AI Recommended.
- Changing Teaching Style produces a meaningful change in explanation/sequencing/question pattern.
- Changing Pedagogy Approach produces a meaningful change in student participation/task structure/learning evidence.
- When duration is supplied, stage durations sum exactly to the selected duration with no gaps or overlaps.
- All selected topics are covered or a transparent constraint warning is emitted.
- Assessment checks are mapped to objectives; activities are feasible for the grade and duration.
- The existing output sections and Lesson Flow table structure are preserved.
- No Flipped Classroom option or Multimedia input/requirement is introduced.
- DOCX and PDF are created in one action, use the same lesson data, and contain equivalent content.
- The output remains readable when a stage or table spans a page.
- Output follows format v2.0 (Section 5.1), with every defect in Section 5.2 fixed: no empty bullets, metadata strip under the title, and no stage block split across pages unless it is longer than one page.
- The metadata strip shows resolved Teaching Style and Pedagogy, Bloom’s level and homework status.
- Every objective ID appears in at least one stage, and every stage, activity and assessment row shows the IDs it serves.
- The glance bar totals exactly the lesson duration.
- A teacher can regenerate one stage without changing the other stages or the stage’s time window.

# 19. Test matrix

| **Test case** | **Input variation** | **Expected result** |
| --- | --- | --- |
| Defaults | No style/pedagogy chosen | Both normalize to AI Recommended; plan selects and records resolved values. |
| Manual style only | Socratic + AI Recommended pedagogy | Socratic questioning is evident; pedagogy complements without replacing style. |
| Manual pedagogy only | AI Recommended style + Collaborative Learning | Collaborative structures and accountability are evident; style complements pedagogy. |
| Manual/manual combination | Lecture Mode + Inquiry-Based Learning | Short explicit teaching plus meaningful inquiry; no silent override. |
| Short duration | 15 minutes, multiple topics | Prioritize coherent essentials, fit timing exactly, and flag scope limitation if necessary. |
| Long duration | 60 minutes | More practice/application while retaining pacing and lesson flow. |
| Missing grade | Topic only | Proceed with careful assumptions if safe, or ask concise clarification if grade is essential. |
| Reference document | PDF uploaded | Ground topic facts in source; preserve required output structure. |
| Explicit objectives | User supplies 3 objectives | All objectives retained and assessed; no silent omission. |
| Homework disabled | Homework field says none | No homework task assigned; section reflects none/optional according to template. |
| Resource unavailable | Demonstration requested but no materials | Offer feasible low-resource alternative; do not assume special equipment. |
| DOCX/PDF parity | Any successful generation | Same text and section sequence in both files. |
| Invalid timing | Draft stages sum to 43 for 45 min | Validator flags and repair recalculates intervals to total 45. |
| Misconception coverage | Topic with known confusion | At least one relevant misconception and actionable intervention where appropriate. |

# 20. Example assembled prompt — Grade 3 Science

```
This is an illustrative runtime payload. It demonstrates how the dynamic template and behavior snippets are combined; it is not a fixed configuration for every lesson.

INPUTS
- Grade: Grade 3
- Subject: General Science
- Chapter: Living Things Around Us
- Topics: Living and Non-living Things
- Teaching Style selected: Example First Approach
- Pedagogy Approach selected: Inquiry-Based Learning
- Duration: 45 minutes
- Bloom's level: Understand and Apply
- Engagement activity: Picture/card sort
- Homework: Optional observation task
- Learning objectives: Generate measurable objectives for the topic
- Additional details: Use low-cost, classroom-available materials
- Reference document: None supplied

STYLE SNIPPET — EXAMPLE FIRST:
Begin with concrete examples before naming the concept. Ask learners to observe and compare, then explain the pattern and introduce the formal concept.

PEDAGOGY SNIPPET — INQUIRY:
Begin with a meaningful question. Have learners predict, observe/compare examples, discuss evidence, explain their reasoning, and reflect. Keep the task feasible and safe.

TASK:
Create a complete structured lesson plan. Use the existing Yolearn section structure. Include a 45-minute sequence whose stage timings sum exactly to 45. Make sure students classify examples and explain why movement alone does not make an object living. Return only schema-valid JSON.
```

# 21. Implementation notes and open decisions

- The UI's exact available Bloom's Level, Engagement Activity, Homework, and Advanced Settings options should be treated as configuration data supplied by the application; this specification does not invent option values that were not confirmed.
- The renderer should use a single canonical JSON lesson object. Do not independently ask the LLM to write a DOCX version and a PDF version, because content can drift between formats.
- Persist both selected and resolved style/pedagogy values for debugging and explainability. The teacher-facing document need not prominently display implementation metadata unless product design requires it.
- In scope for MVP (v1.3): a preview before export and stage-level regeneration that keeps the stage’s time window and all other stages unchanged. Still open: inline text editing in the preview, and regeneration of other sections (misconceptions, differentiation).
- Open: whether the PDF is produced server-side from the DOCX (recommended, guarantees parity) or client-side from the HTML preview (the prototype does this for convenience only).
- Open: confirm the final option lists for Bloom’s Level, Engagement Activity, Homework and Advanced Settings; the prototype uses placeholder lists.
- Version the prompt templates and renderer separately so quality regressions can be traced.