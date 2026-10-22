# PRD : AI Activity Designer

October 15, 2026 @Sarthak Srivastava 

## 1. Problem Statement

Teachers spend significant time creating classroom activities from textbook content. They must independently plan learning objectives, materials, instructions, student worksheets, and assessment questions.

Generic AI-generated activities may not align with the selected textbook, may be difficult to conduct in a real classroom, and often require teachers to rewrite the output before sharing it with students.

Teachers also need two different formats: a detailed guide to conduct the activity and a simple set of instructions for students.

**Problem to solve:** How might YoLearn.ai help teachers convert a selected textbook topic into a complete, curriculum-aligned, classroom-ready activity that they can review, customize, and share with students?

## 2. Proposed Solution

Build Activity Designer as a **standalone tool** within Teacher AI Tool Helper ecosystem.

Teachers select a book from the existing grade-wise book catalogue, select a topic or subtopic, configure the activity, and generate a structured activity package.

The system generates two connected outputs:

1. **Teacher View:** Preparation instructions, learning objectives, materials, activity steps, expected outcomes, answer keys, and assessment rubrics.
2. **Student View:** Student-friendly instructions, materials checklist, tasks, questions, observation tables, and reflection activities.

Teachers can edit, save, preview, print, export, and share the student-facing activity.

The AI must use the actual content of the selected topic wherever available, rather than generating an activity from the topic title alone.

## 3. User Flow

**Step 1: Open Activity Designer**

Teacher opens the standalone tool from the Teacher AI Tool Helper dashboard.

**Step 2: Select Book**

Teacher selects a book from the existing grade-wise book catalogue. Grade and subject should be derived from the selected book wherever available.

**Step 3: Select Topic**

Teacher selects a topic or subtopic from the book's existing content hierarchy.

**Step 4: Configure Activity**

Teacher selects the activity type, duration, grouping, available materials, and learning level.

**Step 5: Generate Activity**

The system retrieves the selected topic's learning content and generates the activity package.

**Step 6: Review and Edit**

Teacher reviews the generated Teacher View, edits any section, and previews the Student View.

**Step 7: Save and Share**

Teacher saves the activity and chooses how to deliver it:

- Share the student-facing activity link, where supported.
- Print the student worksheet.
- Export the student worksheet as PDF.
- Print or export the teacher guide separately.

**Step 8: Student Access**

Students receive the shared student-facing content or printed worksheet. They follow the instructions and complete the activity.

Digital student responses and submission tracking are outside the initial scope unless existing platform capabilities are reused.

## 4. Input Fields and Requirements

| Field | Example value | Required? | Purpose |
| --- | --- | --- | --- |
| Book | Class 6 Science textbook | Yes | Identifies the source book |
| Topic | Methods of Separation | Yes | Defines the content to teach |
| Activity type | Hands-on experiment | Yes | Determines the activity format |
| Duration | 30 minutes | Yes | Controls activity timing |
| Grouping | Groups | Yes | Determines how students participate |
| Group size | 4–5 students | No | Helps allocate tasks and materials |
| Materials | Low-cost household materials | Yes | Keeps the activity practical |
| Learning level | Mixed ability | Yes | Guides difficulty and differentiation |
| Learning objective | Understand separation methods | No | Allows teacher customization; AI can suggest objectives |
| Additional instructions | Avoid heating or special equipment | No | Adds teacher-specific constraints |
| Upload | Teacher can upload their content  | No | Teacher can create own activity by uploading the document |

**Field behavior**

- Book options must come from the existing catalogue.
- Topics and subtopics must come from the selected book's content hierarchy.
- Do not ask the teacher to reselect grade, subject, board, or chapter when this information is already available.
- Use sensible defaults for optional configuration fields where possible.
- Allow the teacher to change configuration before generating the activity.

## 5. Content-Level Generation Requirements

The AI generation process must follow this sequence:

1. Retrieve the selected topic or subtopic's actual learning content.
2. Identify the relevant concepts, definitions, examples, and learning objectives.
3. Plan an activity that teaches or reinforces those concepts.
4. Generate the teacher instructions and student tasks.
5. Generate expected outcomes, questions, answers, and assessment criteria.
6. Validate content relevance, timing, answer consistency, materials, and safety.
7. Render Teacher View and Student View from the same activity package.

If the selected topic's source content is unavailable, the system should inform the teacher and allow them to provide content or proceed with explicitly unverified general knowledge-based generation.

The system must not fabricate textbook references or claim that unverified content is textbook-aligned.

## 6. Generated Output — Teacher View

Teacher View is the complete instructional document used to prepare and conduct the activity.

### Required output format

**A. Activity Overview**

- Activity title.
- Selected book and topic.
- Activity type.
- Duration.
- Grouping and learning level.
- Short description.

**B. Learning Objectives**

- What students should learn.
- What students should be able to demonstrate.

**C. Materials and Preparation**

- Materials with quantities.
- Teacher preparation steps.
- Classroom setup.
- Material alternatives, where appropriate.

**D. Step-by-Step Instructions**

Each step must contain:

- Step number and title.
- Time required.
- Teacher instructions.
- Student actions.
- Questions to ask.
- Expected observations.

**E. Student Task Sheet**

- Student-facing instructions.
- Questions.
- Observation tables.
- Response spaces.
- Reflection questions.

**F. Expected Outcomes**

- Expected student observations.
- Correct concepts or results.
- Learning evidence.

**G. Answer Key**

- Model answers.
- Acceptable alternatives.
- Explanations for assessment questions.

**H. Assessment Rubric**

- Assessment criteria.
- Performance descriptions.
- Marks and total score, where applicable.

**I. Differentiation and Safety**

- Additional support for students who need it.
- Standard task.
- Extension task.
- Relevant safety and accessibility guidance.

### Teacher View actions

The teacher must be able to:

- Edit individual sections.
- Regenerate individual sections.
- Regenerate the full activity.
- Preview Student View.
- Save the activity.
- Print or export the teacher guide.
- Print or export the student worksheet separately.
- Share the student-facing activity.

Teacher-only answers and internal guidance must never appear in the student-facing version by default.

## 7. Generated Output — Student View

Student View is a simplified, classroom-ready activity that the teacher can share directly with students.

It must not contain teacher preparation notes, hidden answers, or internal assessment guidance.

### Required output format

**A. Activity Title**

A clear, engaging title suitable for the selected grade.

**B. What You Will Learn**

A short, student-friendly explanation of the learning objective.

**C. What You Need**

A checklist of materials required for the activity.

**D. Your Task**

A simple explanation of what students must complete or discover.

**E. Step-by-Step Instructions**

Numbered instructions written in age-appropriate language.

**F. Record Your Observations**

Appropriate response formats, such as:

- Short-answer questions.
- Multiple-choice questions.
- Observation tables.
- Drawing or reflection tasks, where applicable.

**G. Think and Explain**

Questions that test understanding and application of the selected topic.

**H. Reflection or Exit Ticket**

One or more questions to help students demonstrate what they learned.

**I. Safety Instructions**

Relevant precautions in language students can understand.

### Student View actions

Depending on the delivery method, students should be able to:

- Read the activity.
- Follow the instructions.
- Complete the printed worksheet.
- Access a shared student-facing link.
- Print the activity, where supported.

Digital answer submission is not required for the MVP.

## 8. Sample Outputs

### Sample Input

| Field | Selected Value |
| --- | --- |
| Book | Class 6 Science – NCERT |
| Topic | Separation of Substances |
| Subtopic | Filtration |
| Activity Type | Hands-on Experiment |
| Duration | 15 minutes |
| Grouping | Groups of 4 students |
| Materials | Household materials |
| Learning Level | Grade-level |
| Learning Objective | Understand how filtration separates insoluble solids from liquids |

### A. Teacher View — Activity Guide

**Activity Title:** Separate It! A Filtration Experiment

**Objective:** Students will understand filtration and identify how it separates an insoluble solid from a liquid.

**Expected Learning Outcome:** Students will be able to explain filtration, perform a basic filtration experiment, and identify the role of the filter and residue.

**Materials Required (per group):**

- Muddy water
- Transparent glass or container
- Funnel
- Filter paper or clean cotton cloth
- Empty glass to collect filtered water
- Spoon

**Preparation Before Class:**

1. Prepare a small quantity of muddy water.
2. Arrange materials for each group.
3. Explain that the filtered water is for observation only and must not be consumed.

**Step-by-Step Instructions**

| Time | Teacher Instructions | Expected Student Action |
| --- | --- | --- |
| 2 min | Show students muddy water and ask how they could separate the mud. | Suggest possible methods. |
| 3 min | Demonstrate placing filter paper or cloth inside the funnel. | Observe the setup. |
| 5 min | Ask each group to slowly pour muddy water through the filter. | Perform the experiment and observe the result. |
| 3 min | Ask students to identify what remains on the filter and what passes through. | Identify the residue and filtered liquid. |
| 2 min | Review the concept and ask students to explain why filtration worked. | Explain their observations. |

**Student Task:** Perform the experiment and record the observations in the worksheet.

**Expected Observations:**

- Mud particles remain on the filter.
- Water passes through the filter.
- The collected liquid may still contain dissolved substances or microorganisms.

**Answer Key:**

1. **What is filtration?** A method used to separate insoluble solid particles from a liquid using a filter.
2. **What remains on the filter?** The residue, such as mud particles.
3. **What passes through the filter?** The filtrate, or the liquid that passes through.
4. **Can filtration make muddy water safe to drink?** No. It does not necessarily remove dissolved substances or microorganisms.

**Assessment Rubric (4 points)**

| Criterion | 1 Point |
| --- | --- |
| Setup | Uses the materials correctly. |
| Procedure | Performs filtration carefully. |
| Observation | Correctly identifies residue and filtrate. |
| Explanation | Explains how filtration separates the mixture. |

**Differentiation:**

- **Needs support:** Provide a labelled diagram of the funnel, filter, residue and filtrate.
- **Grade-level:** Ask students to explain the separation process.
- **Advanced:** Ask students whether filtration can separate salt dissolved in water and why.

**Safety:** Do not drink the experiment's water. Handle glass containers carefully and clean up spills.

---

### B. Student View — Printable Worksheet

# Activity: Separate It! A Filtration Experiment

**Name:** __

**Class/Section:** __

**Date:** __

**Time Required:** 15 minutes

### What Will You Learn?

You will learn how filtration separates insoluble solid particles from a liquid.

### Materials Required

Muddy water, funnel, filter paper or clean cloth, two containers and a spoon.

### Your Task

Work in a group of four to separate mud from water using filtration.

### Follow These Steps

1. Observe the muddy water carefully.
2. Place the filter paper or clean cloth inside the funnel.
3. Keep the funnel over an empty container.
4. Slowly pour the muddy water through the filter.
5. Observe what remains on the filter and what collects in the container.
6. Record your observations below.

### Observation Table

| What to Observe | Your Observation |
| --- | --- |
| What did the muddy water look like before filtration? | __ |
| What remained on the filter? | __ |
| What passed through the filter? | __ |
| Did the filtered water become completely safe to drink? | __ |

### Think and Answer

1. What is filtration?
2. What do we call the solid left on the filter?
3. What do we call the liquid that passes through the filter?
4. Can filtration separate dissolved salt from water? Explain your answer.

### Reflection

Complete these sentences:

- Today, I learned that filtration .
- One thing I observed was .
- One question I still have is .

**Safety Reminder:** Do not drink the water used in this experiment.

---

### C. Output Rules

The Teacher View and Student View must be generated from the **same activity plan and selected source content**.

- The Teacher View contains instructions, expected observations, answer keys, assessment criteria, differentiation and safety guidance.
- The Student View contains only student-facing instructions, tasks, questions and worksheets.
- Teacher-only answers, internal notes and assessment guidance must never appear in the Student View.
- The teacher must be able to edit each view, regenerate a section and preview the student worksheet before sharing or exporting.
- Any textbook-specific explanation must be grounded in the selected book's retrieved content. If the source content cannot be retrieved, the system must disclose that limitation rather than claim verified NCERT alignment.

## 9. Save, Share, and Export

### Save

Teachers can save an activity as a draft and reopen it later. Saved content must preserve teacher edits.

### Share

Provide a dedicated **Share Student Activity** action.

The teacher should be able to share the student-facing activity without exposing the Teacher View or answer key.

Where supported, the shared link must:

- Open the correct activity version.
- Display only student-facing content.
- Respect access permissions.
- Allow the teacher to revoke access.

### Print and export

Provide two separate formats:

| Format | Included content |
| --- | --- |
| Teacher Guide | Overview, objectives, materials, preparation, steps, expected outcomes, answer key, rubric, safety |
| Student Worksheet | Title, learning purpose, materials, instructions, questions, observation tables, answer spaces, reflection |

The teacher must be able to export the student worksheet without the answer key.

### Version behavior

If a teacher edits an activity after sharing it, the previously shared version should remain unchanged until the teacher intentionally publishes the updated version.

## 10. Key Acceptance Criteria

The feature is ready for release when:

1. Teachers can select an existing book and topic without re-entering known curriculum information.
2. The system uses the selected topic's content wherever available.
3. The teacher can configure and generate an activity.
4. Teacher View and Student View contain the required sections.
5. The student version does not expose teacher-only answers.
6. Teachers can edit, save, and reopen activities.
7. Regeneration does not silently overwrite approved teacher edits.
8. Teacher guides and student worksheets can be printed or exported separately.
9. Shared student content respects access permissions.
10. Generation errors preserve teacher inputs.
11. Content, answer keys, assessment criteria, timing, and safety guidance are validated before teacher review.

## 11. Success Metrics

Track the following metrics:

- Activity generation success rate.
- Median generation time.
- Percentage of generated activities saved.
- Percentage of saved activities shared or exported.
- Teacher satisfaction.
- Activity reuse rate.
- Critical content or safety defects.

**Primary success metric:** Weekly active teachers who save and subsequently use an activity through sharing or export.

Targets should be established after initial usage data is available.

## 12. Out of Scope for the MVP

- Assigning activities to classes through a class-management workflow.
- Student submission tracking.
- Automated grading of student responses.
- Live classroom performance analytics.
- Interactive game-building functionality.
- Cross-teacher activity marketplace.
- Advanced learning-outcome analytics.

## 13. Key Dependencies

- Existing grade-wise book catalogue.
- Topic-level curriculum content and retrieval.
- AI generation and validation service.
- Activity persistence and version management.
- Teacher authentication and content permissions.
- Print and PDF rendering.
- Secure student-facing sharing capability.

## 14. Product purpose and scope

Activity Designer converts a selected textbook topic into a feasible, classroom-ready activity package with a private Teacher View and a student-facing worksheet/instruction set.

**In scope:** book/topic selection; activity type, duration, grouping, materials and learning level; source-grounded activity design; teacher preparation guide; student task sheet; expected outcomes and assessment; section editing/regeneration; save, preview, print, export and share.

**Out of scope for MVP:** digital student response submission and tracking unless existing platform capabilities are reused.

## 15. Product requirements and rules

- Use actual selected-topic content when available; do not generate from title alone if source content exists.
- Activities must be feasible within the duration, grouping, materials and classroom constraints selected by the teacher.
- Teacher View and Student View are generated from one activity structure but must remain properly separated.
- Include relevant safety, accessibility and classroom-management guidance. Avoid activities that require unavailable specialist equipment unless specified and supported.
- Do not fabricate textbook references or claim verified alignment if retrieval fails.
- Permit section-level editing/regeneration and separate teacher-guide versus student-worksheet export.

## 16. Input normalization and precedence

Precedence: teacher constraints and selected settings → retrieved source content → learning objective → feasibility and safety → grade-appropriate defaults → AI suggestions. If a requested activity cannot safely or realistically be completed with the available materials/time, explain the limitation and offer a feasible adjustment rather than silently ignoring the constraint.

## 17. Generation pipeline

1. Resolve book/topic/subtopic and retrieve source content.
2. Identify concepts and measurable learning outcomes.
3. Select an activity design compatible with type, duration, grouping, materials and learning level.
4. Plan steps and allocate time; total step duration must match the configured activity duration.
5. Generate teacher preparation instructions and student-facing tasks.
6. Generate expected observations/outcomes, questions, answer guidance and rubric where applicable.
7. Validate source grounding, feasibility, safety, materials, timing and answer consistency.
8. Render Teacher View and Student View from one canonical activity package.

## 18. Canonical output structure

**Teacher View:** activity overview; objectives; materials with quantities; preparation and classroom setup; timed steps with teacher actions, student actions, questions and expected observations; student task sheet; expected outcomes; answer key/model responses; assessment rubric; differentiation and safety.

**Student View:** title; what you will learn; materials checklist; task purpose; numbered instructions; observation/response tables; think-and-explain questions; reflection/exit ticket; relevant student-friendly safety instructions. Exclude teacher notes, hidden answers and internal assessment guidance.

## 19. Prompt library ( Suggested )

### 19.1 System prompt — role and boundaries

You are a classroom activity designer. Design curriculum-aligned, practical, safe, age-appropriate activities that teachers can run using the specified time, materials and grouping. Keep teacher guidance and student-facing instructions separate.

### 19.2 Developer prompt — structured output

Return an activity object with metadata, source status, objectives, materials, preparation, classroom setup, timed steps, teacher actions, student actions, questions, expected observations, student worksheet, expected outcomes, answer guidance, rubric, differentiation, safety, teacher_view, student_view and validation results. Each step must include duration; step durations must sum to the configured total.

### 19.3 Dynamic user prompt

Use selected book/topic, activity type, duration, grouping, group size, available materials, learning level, learning objective and additional instructions. Derive grade, subject, board and chapter from book metadata when available; do not ask for duplicate inputs.

### 19.4 Grounding prompt

Base the activity on retrieved textbook concepts. If content is unavailable, inform the teacher and allow supplied source material or explicitly unverified general-knowledge generation. Never fabricate textbook references or claim verified alignment without evidence.

### 19.5 Validation and repair prompts

Check objective alignment; feasibility of materials; step timing total; clear teacher/student actions; expected outcomes; correct answer guidance; age appropriateness; safety and accessibility; no duplicated or contradictory steps; source status; no teacher-only answers in Student View. Repair only the failed step or field and rerun the relevant checks.

## 20. Acceptance criteria

- Teacher can configure and generate a complete activity package.
- Step durations add up exactly to the configured activity duration.
- Materials, group size and instructions are practical and consistent.
- Teacher View contains preparation and answer guidance; Student View excludes private content.
- Relevant safety precautions are included.
- Source status is transparent when textbook content is unavailable.
- Teacher can preview, edit and export teacher and student materials separately.

## 21. Test matrix

Test hands-on, discussion, collaborative and other supported activity types; varying durations and group sizes; low-cost versus constrained materials; source available/unavailable; safety-sensitive tasks; section regeneration; and separate export/privacy checks.

## 22. Open implementation decisions

Confirm supported activity-type catalogue, export formats, sharing permissions, asset/worksheet rendering and whether student response collection remains excluded from MVP. Existing detailed requirements in this PRD remain authoritative where more specific.

## Final Product Principle

Activity Designer must transform selected textbook content into a complete, practical classroom activity that teachers can review and customize.

**One topic → One complete activity → Teacher View + Student View → Save, print, or share.**