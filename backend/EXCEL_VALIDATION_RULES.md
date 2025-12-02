# Excel Import Validation Rules

## Summary of All Validation Rules

### 1️⃣ Required Fields (No Blank Values Allowed)

These fields **MUST** be filled in every row:

```
✅ questionText  - Cannot be empty
✅ grade         - Cannot be empty  
✅ type          - Cannot be empty
✅ answerType    - Cannot be empty
✅ answer1       - Cannot be empty
✅ answer2       - Cannot be empty
✅ correctAnswer - Cannot be empty
```

**Error Message**: `"Missing required fields: [field names]"`

---

### 2️⃣ Grade Validation

**Rule**: Grade must be a number from 1 to 5

```
✅ Valid:   1, 2, 3, 4, 5
❌ Invalid: 0, 6, 7, 1.5, "one", (blank)
```

**Error Message**: `"Grade must be a number between 1 and 5"`

---

### 3️⃣ Type Validation

**Rule**: Type must be exactly "practice" or "exam" (case-insensitive)

```
✅ Valid:   "practice", "exam", "PRACTICE", "EXAM", "Practice", "Exam"
❌ Invalid: "test", "quiz", "both", "practice/exam", (blank)
```

**Error Message**: `"Type must be either 'practice' or 'exam'"`

---

### 4️⃣ LessonId Validation (Optional Field)

**Rule**: If provided, must reference an existing lesson in the database

```
✅ Valid:   (empty), 1 (if lesson 1 exists), 5 (if lesson 5 exists)
❌ Invalid: 9999 (if lesson doesn't exist), "abc", -1
```

**Error Message**: `"Lesson with ID [X] does not exist"`

**Note**: This field is optional - you can leave it blank

---

### 5️⃣ CorrectAnswer Validation

**Rule**: Must EXACTLY match the text of one of the answer columns (answer1, answer2, answer3, or answer4)

**Important**: This is a TEXT MATCH, not a number!

```excel
Example 1 - ✅ CORRECT:
answer1: "London"
answer2: "Paris"
answer3: "Berlin"
answer4: "Madrid"
correctAnswer: "Paris"  ← Matches answer2 text exactly

Example 2 - ❌ WRONG:
answer1: "London"
answer2: "Paris"
answer3: "Berlin"
answer4: "Madrid"
correctAnswer: "2"  ← Wrong! This is the answer NUMBER, not the TEXT

Example 3 - ❌ WRONG:
answer1: "London"
answer2: "Paris"
answer3: "Berlin"
answer4: "Madrid"
correctAnswer: "paris"  ← Wrong! Case must match exactly (P vs p)

Example 4 - ✅ CORRECT:
answer1: "5"
answer2: "10"
answer3: "15"
answer4: "20"
correctAnswer: "10"  ← Matches answer2 text exactly
```

**Error Message**: `"correctAnswer '[value]' must match one of the answer values (answer1, answer2, answer3, or answer4)"`

---

## Complete Valid Example

```excel
┌─────────────────┬───────┬──────────┬────────────┬─────────┬─────────┬─────────┬─────────┬───────────────┐
│ questionText    │ grade │ type     │ answerType │ answer1 │ answer2 │ answer3 │ answer4 │ correctAnswer │
├─────────────────┼───────┼──────────┼────────────┼─────────┼─────────┼─────────┼─────────┼───────────────┤
│ What is 2 + 2?  │   1   │ practice │   choice   │    3    │    4    │    5    │    6    │      4        │
│ What is 10 - 5? │   2   │ exam     │   choice   │    3    │    4    │    5    │    6    │      5        │
│ Is 7 > 5?       │   1   │ practice │   choice   │  True   │  False  │         │         │     True      │
└─────────────────┴───────┴──────────┴────────────┴─────────┴─────────┴─────────┴─────────┴───────────────┘
```

All three rows are valid! ✅

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Answer Number Instead of Text
```excel
correctAnswer: "2"  ← WRONG (unless answer2 literally is "2")
correctAnswer: "Paris"  ← CORRECT (the actual text from answer2)
```

### ❌ Mistake 2: Leaving Required Fields Blank
```excel
answerType: (blank)  ← WRONG - Required field
answerType: "choice"  ← CORRECT
```

### ❌ Mistake 3: Invalid Grade
```excel
grade: 6  ← WRONG - Must be 1-5
grade: 3  ← CORRECT
```

### ❌ Mistake 4: Wrong Type Value
```excel
type: "test"  ← WRONG - Must be practice or exam
type: "practice"  ← CORRECT
```

### ❌ Mistake 5: Non-existent Lesson
```excel
lessonId: 9999  ← WRONG if lesson 9999 doesn't exist
lessonId: 5  ← CORRECT if lesson 5 exists
lessonId: (blank)  ← CORRECT (optional field)
```

---

## Validation Flow

When you upload an Excel file, each row is validated in this order:

1. ✅ Check all required fields are not blank
2. ✅ Validate grade is 1-5
3. ✅ Validate type is "practice" or "exam"
4. ✅ If lessonId provided, check lesson exists
5. ✅ Check at least answer1 and answer2 are provided
6. ✅ Validate correctAnswer matches one of the answer texts

If ANY validation fails, that row is skipped and added to the "failed" array with a detailed error message.

---

## Import Results Format

```json
{
  "success": true,
  "message": "Import completed: 8 succeeded, 2 failed",
  "data": {
    "success": [
      {
        "row": 2,
        "questionId": 101,
        "questionText": "What is 2 + 2?"
      }
    ],
    "failed": [
      {
        "row": 5,
        "error": "Missing required fields: answerType",
        "data": { /* original row data */ }
      },
      {
        "row": 7,
        "error": "correctAnswer 'Paris' must match one of the answer values",
        "data": { /* original row data */ }
      }
    ],
    "total": 10
  }
}
```

The response tells you:
- ✅ Which rows succeeded (with new question IDs)
- ❌ Which rows failed (with specific error messages)
- 📊 Total rows processed

---

## Quick Checklist Before Import

- [ ] All required fields filled (questionText, grade, type, answerType, answer1, answer2, correctAnswer)
- [ ] Grade is 1, 2, 3, 4, or 5
- [ ] Type is "practice" or "exam"
- [ ] AnswerType is filled (e.g., "choice")
- [ ] correctAnswer is the EXACT TEXT from one of your answers
- [ ] If using lessonId, verify the lesson exists
- [ ] File is .xlsx or .xls format
- [ ] Downloaded latest template from API

---

## Need Help?

1. Download the template: `GET /api/questions/import/template`
2. The template has working examples
3. Check error messages - they tell you exactly what's wrong
4. Test with 1-2 rows first before importing hundreds
