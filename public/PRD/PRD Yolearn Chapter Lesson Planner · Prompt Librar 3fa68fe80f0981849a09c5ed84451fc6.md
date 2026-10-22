# PRD : Yolearn Chapter Lesson Planner · Prompt Library and Output Format

<aside>
📚

**PRD v2.0** · Prompt Library · Output Format Specification v2.0 · 15 Oct 2026

Design principle: plan a whole chapter as a connected sequence of periods, and give every period 3 to 4 pages of classroom-ready content, so a teacher can teach from the document without further preparation.

Companion to [PRD v1.3 · Yolearn Daily Lesson Planner](https://app.notion.com/p/PRD-Yolearn-Daily-Lesson-Planner-Prompt-Library-and-Output-Format-v2-0-3fa68fe80f09819a8249d78336e107f6?pvs=21). Replaces v1.0 of this page.

</aside>

# What changed in v2.0

| Area | v1.0 | v2.0 | Section |
| --- | --- | --- | --- |
| Depth per period | One third of a page per period; whole chapter in 3 to 4 pages | 3 to 4 pages per period, with teacher notes, a ready-to-use student activity, answer key, misconceptions, differentiation and exit ticket | 10 |
| Document size | 3 to 5 pages per chapter | 1 overview page + 3 to 4 pages per period + 1 summary page (for example 23 pages for 7 periods) | 10.1 |
| Assessment period | Marks summary and a pointer to the Assessment Generator | Full test paper, answer key, rubric, follow-up plan and a printable student copy | 10.4 |
| Period count input | Number field per chapter | Dropdown with AI Recommended (default) or 2 to 12, shared, with per-chapter override | 5, 6 |
| Chapter entry | Book field plus chapter cards | Chapters field (one per line) that creates chapter cards | 5 |
| Generation | Periods in groups of 3 per call with strict word limits | One period per call with content-depth guidance and the previous period’s summary | 12, 13 |
| Chapter-level toolkit | Misconceptions, resources and differentiation once at the end | Moved into each period where they are used; the closing page keeps the assessment grid and consolidated resources | 10.3, 10.5 |
| Prompt library | Map, periods, toolkit prompts | Full library in the Daily Lesson Planner pattern: system, developer, behaviour libraries, combination rules, map, period, assess, summary, normalization, grounding, validation, repair, regeneration | 13 |

# 1. Document purpose and scope

This specification defines the product requirements, generation pipeline, prompt library, data schema and Word/PDF output for the Yolearn Chapter Lesson Planner. It is written for product, design, engineering, QA and the content/curriculum team, and mirrors the structure of the Daily Lesson Planner PRD v1.3 so both tools share prompts, behaviour libraries, renderer conventions and validation patterns.

**In scope:** planning one chapter or several chapters into periods; reviewing and editing the period map; generating detailed period plans; generating the assessment period with a test paper; exporting Word and PDF; regenerating one period; expanding a period into the Daily Lesson Planner.

**Out of scope for v2.0:** mapping periods to dates, timetables or holidays; multi-teacher collaboration; cross-chapter projects; inline rich-text editing inside the preview (regeneration only).

**Relationship to the Daily Lesson Planner:** the Daily Lesson Planner produces one standalone lesson of about 7 pages. The Chapter Lesson Planner produces a connected sequence in which each period is 3 to 4 pages because chapter-level information (objectives, prerequisites, period map, assessment plan, consolidated resources) is written once, and each period adds recap and bridge lines that a standalone lesson does not need.

# 2. Users and jobs

| User | Job to be done |
| --- | --- |
| Teacher | When I start a chapter, I want a period-by-period plan with everything I need for each class, so I can teach without spending evenings preparing. |
| Head of department / coordinator | When the term begins, I want plans for several chapters at once, so I can check pacing and coverage before teachers start. |
| Client content editor (B2B publisher) | When I prepare teacher resources for a book, I want consistent, high-quality chapter plans for every chapter, in our template, to ship with the textbook. |

# 3. Product requirements

- Plan one chapter, or several chapters in one action.
- Split each chapter into a number of periods. The number is AI Recommended by default or set by the teacher, shared across chapters with a per-chapter override.
- Show the period map for review before writing any period plan. The teacher can move and place topics, merge, split, add and remove periods, change types and styles, and lock periods.
- Each period plan is 3 to 4 A4 pages and is classroom-ready: timed stages with teacher and student actions, questions, checks for learning, subject notes for the teacher, a ready-to-use student activity with answer key, likely misconceptions with interventions, differentiation, exit ticket, homework and a bridge to the next period.
- Teaching Style and Pedagogy Approach must change the teaching design of each period, using the shared behaviour libraries (Sections 13.3 and 13.4).
- Periods connect: period 2 onward opens with a recap; every period except the last ends with a bridge.
- An Assess period contains the full test paper, answer key, rubric for open answers, follow-up plan and a printable student copy.
- Generate Word and PDF from the same validated chapter JSON in one action. Multiple chapters export as a zip with a term index.
- Any period can be regenerated alone, or expanded into a full Daily Lesson Planner document.
- All inputs are optional except at least one chapter with topics, objectives or reference text. Do not invent textbook content, page numbers or curriculum standards.

# 4. User flow

## 4.1 One chapter

1. **Set up.** Shared settings (grade, subject, period length, number of periods, style, pedagogy, special periods, homework, Bloom’s range, details). Chapters entered one per line; each becomes a chapter card where topics, optional objectives, reference text and a per-chapter period override are added.
2. **Period map (pass 1).** The tool proposes the map with a one-line reason when the period count is AI Recommended.
3. **Edit and approve.** The teacher edits the map; live checks block approval until every topic is placed and every objective is taught.
4. **Generate (pass 2).** Periods are generated one by one with visible progress (for example “Writing period 3 of 7”). Already finished periods can be previewed while the rest generate.
5. **Preview.** A paged preview of the full document. Each period offers Regenerate and Expand to daily plan.
6. **Export.** Word and PDF in one action.

## 4.2 Several chapters

1. Enter several chapters at once. Shared settings apply to all; each chapter can override the period count.
2. Maps for all chapters appear on one review screen as tabs, with a total period count.
3. Approve chapter by chapter, or approve all maps that pass checks.
4. Pass 2 runs per chapter with a concurrency limit; a failed chapter shows retry and does not block others.
5. Export produces a zip: one Word and one PDF per chapter, plus the term index.

# 5. Inputs and defaults

| Input | Control | Default and behaviour |
| --- | --- | --- |
| Grade | Selector | Required for quality; if absent, infer from the book or ask. |
| Subject | Selector / text | Drives subject adaptations (Section 16.2). |
| Chapters | Multi-line text: one chapter per line, number and title (“2 Parts of a Plant”, “Ch 4: The Lion and the Mouse”) | Each line creates a chapter card; duplicates are ignored; chapters sort by number. |
| Topics per chapter | Editable list on the chapter card | Loaded from the topic extraction pipeline when available; else reference text; else typed. |
| Learning objectives | Optional list per chapter | Honoured and given IDs LO1, LO2…; generated from topics if blank. |
| Reference text | Optional file or pasted text per chapter | Primary source for facts. |
| Period length | Minutes | Default 40. Same for all periods of a chapter. |
| Number of periods | Dropdown: AI Recommended (default), 2 to 12. Per-chapter override: As shared setting, AI Recommended, or a number | Section 6. |
| Teaching style | Mode (one for the chapter / AI varies by period) + dropdown | Default: one style, AI Recommended. |
| Pedagogy approach | Mode + dropdown | Default: one approach, AI Recommended. |
| Revision period | Toggle | On by default when 5 or more periods. |
| Assessment period | Toggle | Off by default; when on, the last period is Assess with a full test. |
| Homework | Selector: optional on selected periods, none, after every period | Default: optional, selected periods. |
| Bloom’s range | Optional | Default: lower to higher order across the chapter. |
| Additional details | Text | Class size, resources, language level and other constraints. |
| Template | Admin setting per client | Yolearn default or a client template (for example Headword) over the same JSON. |

# 6. Period count logic

Precedence, highest first: (1) a number set on the chapter card; (2) a number set in shared settings, when the chapter uses the shared setting; (3) client syllabus pacing for that book, when configured; (4) AI Recommended.

AI Recommended estimates teaching load from topic count, subtopic depth, conceptual difficulty for the grade, and the skills the subject needs. In English, reading, vocabulary, grammar, speaking and writing each usually need time. In Science, practical work does. The AI chooses 2 to 12 periods and shows one line of reasoning on the map. If a teacher-set count is too small for the topics, the tool keeps it, compresses coverage and shows a warning on the map and in the term index. Changing the number of periods on the map updates a teacher-set number.

# 7. Option catalog and precedence

Precedence when inputs conflict: (1) explicit teacher inputs and map edits; (2) reference document content; (3) selected style and pedagogy, reconciled; (4) grade-appropriate defaults; (5) AI suggestions.

| Field | Options | Effect |
| --- | --- | --- |
| Teaching Style | AI Recommended; Lecture Mode; Socratic Method; Story Mode; Example First Approach; Step-by-Step Guided Learning; Demonstration-Based Teaching | Delivery, sequencing, explanation, questioning within each period |
| Pedagogy Approach | AI Recommended; Constructivist Approach; Collaborative Learning; Inquiry-Based Learning; Direct Instruction; Project-Based Learning | Student participation, task design, evidence of learning |
| Style / pedagogy mode | One for the chapter; AI varies by period | With “varies”, pass 1 assigns per period and the teacher can override on the map |

When a style is AI Recommended in “one” mode, the resolved style applies to every period. In “varies” mode the AI should vary styles to suit each period type (for example Story Mode for an Introduce period, Socratic Method for inference questions, Step-by-Step for grammar or writing) and must not repeat one style for every period unless the content demands it. Manual choices are never silently replaced.

# 8. Period types

| Type | Purpose | Typical 40-minute pattern | Page content emphasis |
| --- | --- | --- | --- |
| Introduce | Open the chapter; spark interest; surface prior knowledge | Warm-up 5 · Predict 7 · Teach/read 15 · Practise 9 · Close 4 | Strong hook, chapter context in teacher notes |
| Explore | Build understanding through investigation, reading or discussion | Recap 5 · Investigate 12 · Discuss 15 · Share 8 | Questions with evidence, model answers |
| Practice | Apply and consolidate a skill | Recap 5 · Model 10 · Practise 15 · Check 10 | Worked examples, practice items, answer key |
| Lab / Activity | Hands-on, performance or group task | Brief 8 · Activity 22 · Debrief 10 | Safety or classroom management notes, roles, success criteria |
| Revise | Consolidate the chapter; fix misconceptions | Recall 10 · Fix-up 20 · Check 10 | Mixed review items across objectives |
| Assess | Measure chapter objectives | Instructions 5 · Test 30 · Review 5 | Full paper, answer key, rubric, follow-up, student copy |

Patterns guide the model; stage minutes must still sum exactly to the period length.

# 9. Period map rules and editing

- Every selected topic appears in at least one period; a topic may span consecutive periods.
- Every chapter objective is taught in at least one period and checked in at least one period or in the Assess period.
- Topics follow book order unless a prerequisite requires otherwise; the reason is recorded in generation notes.
- The first period is Introduce. Revision comes just before Assess, or last if there is no Assess period. Assess is always last.
- Load is balanced: no teaching period carries more than about twice the content of the lightest.
- Each map row has a period title (3 to 6 words, student-friendly) used as the period’s heading.

Editing operations: change type; move a topic; place an unplaced topic; edit objectives, main activity, checkpoint, homework; change style or pedagogy for a period (varies mode); lock; merge with next; remove; add; regenerate unlocked rows. Live checks: topics placed, objectives taught, first and last period types, requested count.

# 10. Output format v2.0 (download format)

## 10.1 Document structure and page budget

| Part | Pages | Starts on |
| --- | --- | --- |
| Chapter overview | 1 | Page 1 |
| Each teaching period | 3 to 4 | New page |
| Assess period (if on) | 3 to 4, including a 1-page student copy | New page |
| Chapter summary | 1 | New page |

Total pages ≈ 2 + (3.5 × number of periods). Examples: 5 periods ≈ 17 to 22 pages; 7 periods ≈ 23 to 30 pages. A period shorter than 3 pages fails check R1 and is sent back for enrichment; longer than 4 pages is sent back for tightening. A4 portrait, body text 10 pt, tables 9 to 10 pt, never below 9 pt.

## 10.2 Chapter overview (page 1)

- Eyebrow “CHAPTER LESSON PLAN | SUBJECT | GRADE”, chapter number and title, book name if known.
- Metadata strip: Grade, Subject, Periods × length, Total time; Teaching style (or “Varies by period”), Pedagogy, Bloom’s range, Homework.
- Chapter objectives table: ID, objective, Bloom’s level.
- Prerequisites and key concepts side by side, up to 4 each.
- Period map table: period, type and style, period title with topics, objectives, main activity, checkpoint.

## 10.3 Period section, in order

| # | Block | Content | Length guidance |
| --- | --- | --- | --- |
| A | Header bar | “Period 3 of 7 · Practice · 40 min”, period title, style · pedagogy | Fixed |
| B | At a glance | Aim; objectives with full text; recap of previous period; key words with meanings; materials; before-class preparation | 6 to 10 lines |
| C | Time bar | One segment per stage, width proportional to minutes | Fixed |
| D | Lesson flow | 4 to 5 stages. Each: time and title; purpose; Teacher (2 to 3 actions) and Students (1 to 3 actions) side by side; Ask (1 to 2 questions); Check (one observable sign) | 1.5 to 2 pages |
| E | Teacher notes | Subject explanation the teacher needs (80 to 150 words); 3 teaching points; board plan | Half a page |
| F | Student activity | Title, type, minutes; student-facing instructions; the actual items (questions, cards, word lists, problems, sorting sets, planners); answer key or success criteria | Half to one page |
| G | Watch out for | 1 to 2 misconceptions likely in this period, with a specific intervention | Short table |
| H | Differentiation | Needs support (2 to 3) and Ready for more (2) | Short table |
| I | Exit ticket | 2 to 3 questions with expected answers | Short table |
| J | Homework and next period | Homework (or None, marked Optional when optional) and the bridge line | One row |

Each stage block and each small table keeps together on a page. Section headings never sit alone at the bottom of a page.

## 10.4 Assess period

- Blocks A to C as above; “Running the period” with the three timed steps.
- Test paper (teacher copy): sections by objective with marks per question; total marks and time.
- Answer key and marking guide.
- Rubric for open-ended answers (criteria × four levels with marks).
- Follow-up plan: “If results show… then plan…” rows that tell the teacher what to reteach.
- Differentiation for test conditions (for example reading questions aloud).
- Student copy on its own page: name, class, date, time, marks, and questions with answer lines sized to the marks. Printed one per student.

## 10.5 Chapter summary (last page)

- Assessment plan grid: objectives × periods, ticked where each objective is checked.
- All teaching resources with the periods that use them, including prepare-ahead items.

## 10.6 What a period keeps and drops compared with a daily plan

| Daily Lesson Planner section | In a chapter period |
| --- | --- |
| Heading, metadata strip | Replaced by the period header bar; metadata is on the chapter overview |
| Learning objectives, key concepts, prerequisites | Objectives listed in “At a glance” with full text; chapter-level key concepts and prerequisites on page 1; recap replaces prerequisites |
| Lesson flow | Kept, 4 to 5 stages, with Ask and Check inside each stage |
| Teacher guidance | Kept as Teacher notes, focused on this period’s content |
| Student activities | Kept, now with the actual items and answer key |
| Questions to ask (separate section) | Moved into each stage |
| Common misconceptions | Kept as “Watch out for”, only those likely in this period |
| Teaching resources (consolidated) | Materials in “At a glance”; consolidated list on the summary page |
| Assessment table | Replaced by stage checks and the exit ticket; chapter grid on the summary page |
| Homework, differentiation, closure | Kept; closure becomes the last stage plus the bridge |

## 10.7 Visual tokens and files

Same tokens as the Daily Lesson Planner output format v2.0: ink #1F2A37, primary #1F3A5F, accent #2A7F7A, muted #5B6470, rule #CBD5DF, fills #EAF1F6 / #E6F2F1 / #FDF3E7; Arial (or the licensed app sans); A4; 19 mm side margins. Stage bars alternate primary and accent. Student-facing activity content sits in a dashed accent box so teachers can photocopy it. Footer: chapter title | grade subject (left), Page X of Y (right).

File names: Grade-Subject-ChNN-Chapter-Title.docx and .pdf. Batch zip: [Grade-Subject-Chapter-Plans-YYYY-MM-DD.zip](http://Grade-Subject-Chapter-Plans-YYYY-MM-DD.zip) with a Term-index.docx and .pdf listing chapters, periods, period types, total periods, teaching hours and warnings.

## 10.8 Expand to full daily plan

Expanding a period calls the Daily Lesson Planner with grade, subject, chapter, the period’s topics, its objectives with chapter IDs, type, length, style, pedagogy and a context note containing the recap and bridge. The result is a separate document; the chapter plan is not changed.

# 11. Data schema (chapter plan JSON v2.0) (Suggested)

```json
{
  "metadata": {"book": "", "chapter_number": 4, "chapter_title": "", "grade": "", "subject": "",
    "period_count": 7, "period_count_source": "chapter | shared | pacing | ai_recommended",
    "period_count_reason": "", "period_minutes": 40,
    "style_mode": "single | varies", "teaching_style_selected": "", "teaching_style_resolved": "",
    "pedagogy_mode": "single | varies", "pedagogy_selected": "", "pedagogy_resolved": "",
    "blooms_range": "", "homework_policy": "", "template": "yolearn_detailed_period",
    "plan_version": "", "prompt_version": "", "renderer_version": ""},
  "chapter_objectives": [{"id": "LO1", "text": "", "bloom_level": ""}],
  "prerequisites": [""],
  "key_concepts": [""],
  "period_map": [{"period": 1, "type": "introduce", "title": "", "topics": [""],
    "objective_ids": ["LO1"], "main_activity": "", "checkpoint": "", "homework": "",
    "teaching_style": "", "pedagogy": "", "locked": false}],
  "periods": [{
    "period": 1, "title": "", "aim": "", "objective_ids": ["LO1"], "recap": "",
    "key_vocabulary": [{"term": "", "meaning": ""}],
    "materials": [""], "preparation": [""],
    "stages": [{"start_minute": 0, "end_minute": 5, "title": "", "purpose": "",
      "teacher": [""], "students": [""], "questions": [""], "check": ""}],
    "teacher_notes": {"explanation": "", "points": [""], "board_plan": [""]},
    "activity": {"title": "", "type": "", "duration_minutes": 10, "instructions": "",
      "items": [""], "answer_key": [""]},
    "misconceptions": [{"misconception": "", "intervention": ""}],
    "differentiation": {"needs_support": [""], "advanced": [""]},
    "exit_ticket": [{"question": "", "answer": ""}],
    "homework": {"optional": true, "text": ""},
    "bridge": "",
    "assessment": {"duration_minutes": 30, "total_marks": 30, "instructions": "",
      "sections": [{"title": "", "objective_ids": ["LO2"], "marks": 8,
        "questions": [{"q": "", "marks": 1, "lines": 1}]}],
      "answer_key": [""],
      "rubric": [{"criterion": "", "levels": ["", "", "", ""]}],
      "follow_up": [{"if": "", "then": ""}]}
  }],
  "toolkit": {"resources": [{"item": "", "periods": [1]}],
    "assessment_plan": [{"objective_id": "LO1", "checked_in_periods": [1, 7]}]},
  "generation_notes": {"assumptions": [""], "warnings": [""]}
}
```

Schema notes: `assessment` appears only in Assess periods, where `activity`, `misconceptions` and `exit_ticket` may be empty. `homework` is null when there is none. `lines` controls answer space in the student copy (default by marks: 1 for 1 mark, 2 for 2 to 4 marks, 6 for 5 or more). `toolkit` is computed by the backend from the periods where possible (resources, assessment plan) and only filled by the LLM when it cannot be derived. Version stamps are written by the backend. A batch wraps chapters as `{"batch_id": "", "shared_inputs": {}, "chapters": [], "term_index": {}}`.

# 12. Generation architecture (Suggested)

| Step | What happens | Owner |
| --- | --- | --- |
| A. Normalise | Validate inputs, resolve period count source, load topics and pacing | Backend |
| B. Map (pass 1) | One call per chapter: objectives, prerequisites, key concepts, period map with titles | LLM |
| C. Map checks | M-checks (Section 14) live in the UI; targeted repair if needed | Backend + LLM |
| D. Teacher review | Edit, lock, approve | Teacher |
| E. Periods (pass 2) | One call per period, in order. Input: approved map, objectives, the previous period’s aim, last stage and bridge, the style and pedagogy snippets for that period, subject adaptation, reference text | LLM |
| F. Assess period | One call with all period summaries and the objectives assigned to Assess | LLM |
| G. Summary | Resources and assessment plan computed from periods | Backend |
| H. Validate and repair | P- and A-checks; deterministic fixes first, then targeted repair per period | Backend + LLM |
| I. Render and page check | DOCX from JSON, PDF from DOCX; count pages per period (R1) and send short or long periods back once | Renderer + Backend |
| J. Confirm | Report which files exist | Backend |

One call per period keeps each response within a reliable output size and allows progressive preview. Periods are generated in order so each recap can use the previous period’s real content. A period that fails generation is retried once; the rest continue.

# 13. Prompt library (Suggested)

## 13.1 System prompt (shared)

```
You are Yolearn’s expert school curriculum and lesson planner. You plan whole chapters as a connected sequence of class periods, and you write each period in enough detail that a teacher can teach it without further preparation. Plans must be accurate, age-appropriate, practical and engaging.

CORE RULES
1. Treat every input as optional. Use supplied values; do not invent missing preferences.
2. Use only the chapter’s supplied topics and reference content. Do not invent page numbers, standards, quotations or textbook text. General subject knowledge used for explanations must be accurate for the grade.
3. Respect the period count and length exactly. Stage minutes in every period sum exactly to the period length.
4. Periods build on each other. From period 2 onward open with a recap of the previous period; every period except the last ends with a bridge to the next.
5. Write content, not placeholders: real questions, real word lists, real examples, real answers. Never write “teacher asks questions” without the questions.
6. Teaching Style shapes delivery, sequencing, explanation and questioning. Pedagogy Approach shapes student participation, task design and evidence of learning. Honour both, or the per-period assignments in the map. Never silently replace a manual selection.
7. Use simple, clear language for the grade. Prefer low-cost, commonly available materials unless told otherwise. No multimedia dependency; no Flipped Classroom.
8. Return valid JSON matching the schema in the developer message, with no prose or markdown outside the JSON.
```

## 13.2 Developer prompt: schema and constraints (Suggested)

```
Return JSON matching chapter plan schema v2.0 (Section 11) for the part requested in the user message.
Period content requirements:
- aim: one sentence, observable.
- key_vocabulary: 3 to 5 terms with grade-appropriate meanings (may be empty for Assess).
- materials: everything used in stages and the activity; preparation: what to do before class.
- stages: 4 to 5 stages; each with purpose, 2 to 3 teacher actions, 1 to 3 student actions, 1 to 2 questions the teacher actually asks, and one observable check.
- teacher_notes.explanation: 80 to 150 words of accurate subject knowledge for this period; 3 points; a 2 to 3 line board plan.
- activity: student-facing instructions and the complete items students work on, plus a complete answer key or success criteria.
- misconceptions: 1 to 2 likely in this period, each with a specific intervention.
- differentiation: 2 to 3 needs-support ideas and 2 ready-for-more ideas specific to this period.
- exit_ticket: 2 to 3 questions with expected answers.
- Total length for a teaching period: roughly 700 to 1,000 words, which renders as 3 to 4 pages.
Every list item is a non-empty string. Stage times are contiguous from 0 to the period length.
```

## 13.3 Teaching Style behaviour library

| Style | Required generation behaviour |
| --- | --- |
| AI Recommended | Choose the best fit for the topic, grade, objectives and period type; record the resolved style. |
| Lecture Mode | Clear teacher-led explanation with signposting, short checks for understanding, examples and brief student responses; no uninterrupted monologue. |
| Socratic Method | A purposeful sequence of open and follow-up questions that elicits reasoning; synthesise correct understanding after discussion. |
| Story Mode | Introduce or organise the concept through an age-appropriate story or scenario that supports, not replaces, explicit teaching. |
| Example First Approach | Begin with a concrete example, object or case; students notice patterns; then name and explain the concept. |
| Step-by-Step Guided Learning | Small sequenced steps: model one step, guided practice, check, then gradual release. |
| Demonstration-Based Teaching | A safe, feasible demonstration: what to observe, predictions, explanation, link to the concept; give a no-material alternative. |

## 13.4 Pedagogy behaviour library

| Approach | Required generation behaviour |
| --- | --- |
| AI Recommended | Choose the best fit for goals, age, content and period type; record the resolved approach. |
| Constructivist Approach | Elicit prior ideas, compare examples, guided sense-making, revisit initial ideas. |
| Collaborative Learning | Shared task, clear roles, individual accountability, a product, short debrief. |
| Inquiry-Based Learning | A question or puzzle; predict, observe or investigate, record evidence, explain, reflect. |
| Direct Instruction | State the goal, model explicitly, guided practice with checks, independent practice, feedback. |
| Project-Based Learning | A small driving question and concrete product scaled to the period, with milestones across periods where useful. |

## 13.5 Combination rules

There are 7 styles and 6 approaches (42 combinations) and two modes. Do not maintain separate prompts per combination. Every period call inserts exactly one style snippet and one pedagogy snippet (the chapter’s resolved values, or the period’s values in “varies” mode). Style governs how the teacher delivers and sequences; pedagogy governs how students participate. Blend them; never let one cancel the other. Examples: Story Mode + Collaborative Learning: the story opens the period, then groups use it in a role task. Step-by-Step + Inquiry: scaffold the investigation in steps but keep prediction and evidence. Socratic + Direct Instruction: questions surface thinking, then concise explicit teaching and guided practice.

## 13.6 Pass 1: period map prompt (Suggested)

```
Plan the structure of this chapter. Do not write period plans yet.

INPUTS
- Grade, subject, book, chapter: {{grade}}, {{subject}}, {{book}}, Ch. {{chapter_number}} {{chapter_title}}
- Topics in book order: {{topics}}
- Number of periods: {{period_count}} (source: {{source}}) or “AI Recommended: choose 2 to 12 from content weight and give a one-line reason”
- Period length: {{minutes}} minutes
- Style mode and selection: {{style_mode}}, {{teaching_style}}; pedagogy mode and selection: {{pedagogy_mode}}, {{pedagogy}}
- Revision period: {{revision}}; assessment period: {{assessment}}
- Bloom’s range: {{blooms}}; homework policy: {{homework}}
- Teacher objectives: {{objectives_or_blank}}; additional details: {{details_or_blank}}
- Reference text: {{reference_or_blank}}
- Locked periods (keep exactly, same position): {{locked_rows_or_none}}

TASK
Write measurable chapter objectives with IDs. Build the period map following the period map rules. For each period give type, a 3 to 6 word student-friendly title, topics (exact topic strings), objective IDs, main activity (up to 15 words), checkpoint (up to 18 words), homework or “None”, and style and pedagogy for that period. Return metadata, chapter_objectives, prerequisites (up to 4), key_concepts (up to 4) and period_map.
```

## 13.7 Pass 2: period prompt (one period per call) (Suggested)

```
Write period {{n}} of {{total}} for Ch. {{chapter_number}} {{chapter_title}} ({{grade}} {{subject}}), following the approved map exactly.

APPROVED MAP: {{map_json}}
CHAPTER OBJECTIVES: {{objectives_json}}
PREVIOUS PERIOD SUMMARY: {{previous_title}}; aim: {{previous_aim}}; last stage: {{previous_last_stage}}; bridge: {{previous_bridge}} (or “none: this is period 1”)
STYLE FOR THIS PERIOD ({{style}}): {{style_snippet}}
PEDAGOGY FOR THIS PERIOD ({{pedagogy}}): {{pedagogy_snippet}}
PERIOD TYPE ({{type}}): {{type_pattern}}
SUBJECT ADAPTATION: {{subject_adaptation}}
REFERENCE TEXT: {{reference_or_none}}

Write the full period object as specified in the developer message. The recap must refer to what actually happened in the previous period. The activity must contain the real items students work on and a complete answer key. Use the map’s main activity and checkpoint as the core of the period. Do not change topics, objectives or type. Return {"period": {...}}.
```

## 13.8 Assess period prompt

```
Write period {{n}} as the chapter assessment. Objectives to assess: {{assess_objective_ids}} with their text. Taught content summary per period: {{period_summaries}}.
Return a period object with aim, objectives, recap, materials, preparation, three stages (instructions, test, review) and an assessment object: duration {{test_minutes}} minutes, total marks between 20 and 40, sections grouped by objective with marks per question, questions drawn only from what was taught, a mix of recall, understanding, application and one open task where objectives include writing or reasoning. Include a complete answer key, a four-level rubric for open answers with marks, 3 to 4 follow-up rows (“if results show… then plan…”), and differentiation for test conditions. Set `lines` for each question to fit the expected answer.
```

## 13.9 Input normalization prompt

```
Normalise the setup payload before mapping. Do not create lesson content.
Return: normalised shared settings and chapters with missing optional values as null; the resolved period count source per chapter; topics per chapter with their source (extraction, reference, teacher); conflicts (for example 2 periods for 8 topics); and whether a clarification is essential (no topics, objectives or reference for a chapter). Treat AI Recommended as a valid choice, not a missing value. Do not infer curriculum standards or textbook content without evidence.
```

## 13.10 Source grounding prompt

```
Use the supplied reference text as the primary source for topic facts, vocabulary, examples and sequence. Add age-appropriate explanations, questions and activities as scaffolding consistent with the source. Do not invent text from missing pages, claim the source says something it does not, fabricate page numbers or quotations, or replace source terminology where the distinction matters. Flag conflicts with teacher instructions in generation_notes.warnings.
```

## 13.11 Validation prompt (LLM checks)

```
Review this period against the specification and return a JSON report with pass or fail, location and a one-line repair instruction for each check: (1) the selected style is visible in the delivery and questioning; (2) the selected pedagogy is visible in student tasks and evidence; (3) the activity items and answer key are complete, correct and match each other; (4) teacher notes are accurate for the grade; (5) the recap matches the previous period’s actual content; (6) language suits the grade; (7) no invented textbook facts. Do not rewrite the period.
```

## 13.12 Targeted repair prompt

```
Repair only the fields listed in the validation report for period {{n}}. Preserve all passing content, the map, objectives, type, style, pedagogy and stage times. For “too short” failures, enrich teacher notes, activity items and stage detail until the period meets the content requirements. For “too long” failures, tighten wording without removing activity items or answers. Return the full corrected period object only.
```

## 13.13 Single-period regeneration prompt

```
Rewrite period {{n}} as a fresh, different version. Keep its topics, objectives, type, length and stage count range. Keep the recap consistent with period {{n-1}} and the bridge consistent with period {{n+1}}: {{neighbour_summaries}}. Use the same style and pedagogy snippets. Use only materials already in the chapter resource list unless essential. Return {"period": {...}}.
```

# 14. Validation checks (Suggested)

| ID | Check | Type | On failure |
| --- | --- | --- | --- |
| M1 | Period count matches the request, or 2 to 12 with a reason when AI Recommended | Code | Block approval |
| M2 | Every topic placed in a period | Code | Block approval |
| M3 | Every objective taught; all objective IDs exist | Code | Block approval |
| M4 | First period Introduce; Revise before Assess; Assess last | Code | Block approval |
| M5 | Locked rows unchanged after regeneration | Code | Restore rows |
| M6 | Manual style and pedagogy not overridden | Code | Repair |
| P1 | Every map period has a plan with matching title, topics, objectives and type | Code | Regenerate period |
| P2 | Stages contiguous and summing to the period length | Code | Auto-fix intervals |
| P3 | Recap from period 2; bridge until the last period | Code | Repair |
| P4 | 4 to 5 stages, each with teacher, students, questions and check | Code | Repair |
| P5 | Activity has items and an answer key; key length matches items | Code | Repair |
| P6 | Teacher notes explanation 80 to 150 words; exit ticket 2 to 3 items with answers | Code | Repair |
| P7 | No empty list items or placeholders (“TBD”, “teacher asks questions”) | Code | Repair |
| P8 | Style, pedagogy, accuracy and recap consistency (Section 13.11) | LLM | Repair |
| A1 | Assess marks total equals the sum of question marks; every assigned objective has questions | Code | Repair |
| A2 | Answer key covers every question; rubric present when an open task exists | Code | Repair |
| R1 | Each teaching period renders 3 to 4 pages; overview and summary 1 page each | Render | One enrich or tighten pass, then warn |
| R2 | No stage block or small table split across pages; headings never orphaned | Render | Re-render |

# 15. Rendering specification

- One canonical chapter JSON renders to DOCX with the reference layout core; the PDF is converted from the DOCX (LibreOffice headless or equivalent) so content and layout match. The HTML preview uses the same layout rules.
- Each period starts on a new page. Stage blocks are single tables with rows that cannot split and paragraphs that keep with next. Section headings keep with the next block.
- The student activity sits in a dashed box; the Assess student copy is a separate page.
- Right-aligned items use right tab stops. Tables have fixed column widths; header rows repeat on page breaks.
- After rendering, the backend reads page starts per period (by the period header text) to run R1.
- Implementation metadata stays in JSON and document properties, not on the pages.

# 16. Content quality guidelines

## 16.1 What “classroom-ready” means

- Every question a teacher should ask is written out. Every activity has its real content: the cards, sentences, problems or word lists.
- Every activity and exit ticket has answers, or success criteria for open tasks.
- Teacher notes contain the subject knowledge a non-specialist teacher would need for this period, accurate for the grade.
- Each stage has one observable check that tells the teacher whether to move on.
- Instructions for students are written to students (“Look at…”, “With your partner…”).

## 16.2 Subject adaptations

| Subject | Period mix to favour | Activity content to include |
| --- | --- | --- |
| English | Reading, vocabulary, grammar, speaking, writing; an Assess period with reading, vocabulary, grammar and writing sections | Comprehension questions with answers; word-meaning sets; grammar items from the chapter text; role-play or discussion structure; writing planner and success criteria |
| Science | Introduce, Explore with observation or demonstration, Lab, Revise | Predictions, observation tables, safe procedures with a no-material alternative, labelled diagrams described in words |
| Mathematics | Introduce with concrete examples, Practice periods with worked examples, Revise | Worked examples step by step, graded practice items, full solutions, common error patterns |
| Social Science | Explore with sources, maps or case stories, discussion, Revise | Source or map questions, timelines, compare-and-contrast tables, discussion prompts with expected points |
| Languages (Hindi and others) | As English, adapted to script and grammar of the language | Content in the target language with teacher notes in the teacher’s language as configured |

# 17. Dependencies and risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Topic extraction skips topics and has OCR errors | Wrong maps; poor trust in the first screen | Topics always editable; show topic source; fix pipeline before client rollout |
| Factual errors in teacher notes or answer keys | Teachers teach errors | Grounding prompt; LLM check P8; content team review of samples per subject before launch |
| Long generation time (one call per period) | Teacher waits several minutes for a chapter | Progressive preview; per-period progress; batch runs in background with notification |
| Cost of detailed output in batches | High cost for full books | Map pass first; pass 2 only on approved maps; cache by chapter and settings |
| Page budget drift | Periods of 2 or 5 pages | Content requirements in developer prompt; R1 with one enrich or tighten pass |
| Inconsistent recaps | Recap mentions things not taught | Sequential generation with previous period summary; P3 and P8 checks |
| Client templates | Headword and others need their own layout | Template is configuration over the same JSON |

# 18. Acceptance criteria

- Teachers can plan one chapter or many in one action; chapters can be entered one per line.
- Number of periods supports AI Recommended (default) and 2 to 12, shared with per-chapter override; AI Recommended shows a reason.
- The map is editable and must pass M-checks before generation; locked periods survive regeneration.
- Each teaching period renders 3 to 4 pages and contains every block in Section 10.3 with real content.
- Every activity and exit ticket has answers; every period has a recap (from period 2) and a bridge (except the last).
- The Assess period contains a test paper, answer key, rubric where needed, follow-up plan and a one-page student copy.
- Style and pedagogy produce visibly different stage designs; manual choices are not overridden.
- Word and PDF are generated from the same JSON with matching content; batch export includes a term index.
- Any period can be regenerated without changing other periods, or expanded into the Daily Lesson Planner.

# 19. Test matrix

| Test case | Input | Expected result |
| --- | --- | --- |
| Defaults | One chapter, topics only, AI Recommended periods | Reasoned count; 40-minute periods; 3 to 4 pages per period |
| Shared count | Shared 5, chapter “As shared setting” | Exactly 5 periods |
| Chapter override | Shared AI Recommended, chapter set to 3 | Exactly 3 periods for that chapter |
| Too few periods | 2 periods, 8 topics | Compressed coverage; warning on map and term index |
| English chapter | Grade 4 fable, assessment on | Reading, vocabulary, grammar, speaking, writing periods; Assess with student copy |
| Science chapter | Grade 3 plants | Demonstration and observation activities with no-material alternatives |
| Maths chapter | Grade 5 fractions | Worked examples and full solutions in practice periods |
| Style varies | Varies mode | Different styles across periods, shown in headers |
| Manual style | Socratic for the chapter | Socratic questioning visible in every period |
| Locked period | Lock P3, regenerate map | P3 unchanged |
| Short period | Model returns 500 words | R1 fails; enrich pass brings it to 3 pages |
| Batch failure | 5 chapters, one fails | 4 delivered; retry offered; term index notes it |
| Regenerate period | Regenerate P4 | Only P4 changes; recap and bridge stay consistent |
| Parity | Any export | Word and PDF match in text and page order |

# 20. Example assembled prompt: Grade 4 English, period 4

```
Write period 4 of 7 for Ch. 4 The Lion and the Mouse (Grade 4 English), following the approved map exactly.
APPROVED MAP: P1 Introduce “Meet the story”; P2 Explore “Read and find the answers”; P3 Practice “Words that make the story”; P4 Practice “Telling what happened” (topic: Grammar, simple past tense; LO4; main activity: verb hunt in the story, then sort; checkpoint: correct past forms in an 8-verb quiz); P5 Lab “Act it out”; P6 Practice “Write your own fable”; P7 Assess.
PREVIOUS PERIOD SUMMARY: “Words that make the story”; aim: understand and use five new words; last stage: students wrote two sentences with new words; bridge: “Next period: we find out how the story tells us what already happened.”
STYLE (Step-by-Step Guided Learning): small sequenced steps: model, guided practice, check, release.
PEDAGOGY (Collaborative Learning): shared task, roles, individual accountability, product, debrief.
PERIOD TYPE (Practice): Recap 5 · Model 10 · Practise 15 · Check 10.
SUBJECT ADAPTATION (English): grammar items drawn from the chapter text, with answers.
Return {"period": {...}}.
```

The sample output for this period is in the reference chapter plan (Section 23), pages 11 to 13.

# 21. Success measures

- Share of generated chapter plans exported.
- Map edit rate before approval (very high means pass 1 needs work).
- Period regeneration rate and expand-to-daily rate, by subject.
- Pages per period distribution (target 3 to 4).
- Content team quality score on a monthly sample (accuracy, completeness, usability), by subject.

These can be tracked as simple event counts in the product until a fuller analytics setup exists.

# 22. Implementation notes and open decisions

- Use one canonical chapter JSON; never ask the model to write DOCX or PDF directly.
- Persist selected and resolved style and pedagogy per period for debugging.
- Version prompts, schema and renderer separately.
- Open: whether syllabus pacing data is available from clients, and its format.
- Open: whether a period can be a double period (for example an 80-minute lab). v2.0 assumes one length per chapter.
- Open: whether Headword’s template follows this period layout or its own.
- Open: whether teachers can edit text in the preview (v2.0: regenerate only).
- Open: batch size limit per action (suggested: one book, up to 20 chapters) and whether batches run in the background with a notification.
- Open: whether the Assess period should call the Assessment Generator service so question banks and difficulty tagging are shared.

# 23. Reference artifacts

| Artifact | Purpose |
| --- | --- |
| Grade-4-English-Ch04-The-Lion-and-the-Mouse-Detailed.docx / .pdf | Reference output in format v2.0: 7 periods, 23 pages (1 overview, 7 × 3 pages, 1 summary) |
| chapter-plan-english-detailed.json | The chapter JSON in schema v2.0 that produced both files |
| chapter_docx_core_v2.js + render_chapter_docx_v2.js | Reference renderer for format v2.0 |
| Prototype: [claude.ai/artifact/Aethr2Vu5vEbatjytyHDX3](https://claude.ai/artifact/Aethr2Vu5vEbatjytyHDX3) | Setup, period map review and multi-chapter flow; preview and generation currently follow v1.0 and will be updated to v2.0 |
| Daily Lesson Planner PRD v1.3 | Shared behaviour libraries, renderer conventions and validation pattern |