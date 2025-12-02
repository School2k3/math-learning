# Excel Import Guide for Questions

## Overview
This guide explains how to import multiple questions into the Math Learning system using Excel files.

## Quick Start

1. **Download the template**: `GET /api/questions/import/template`
2. **Fill in your questions** following the format below
3. **Upload the file**: `POST /api/questions/import`

## Excel File Format

### Required Columns (Cannot be blank)

| Column Name | Type | Required | Validation | Description | Example |
|------------|------|----------|------------|-------------|---------|
| `questionText` | string | ✅ Yes | Not blank | The question text | "What is 2 + 2?" |
| `grade` | number | ✅ Yes | 1-5 | Grade level (must be 1, 2, 3, 4, or 5) | 1 |
| `type` | string | ✅ Yes | "practice" or "exam" | Question type | "practice" |
| `answerType` | string | ✅ Yes | Not blank | Answer type: "choice", "text", "combobox" | "choice" |
| `answer1` | string | ✅ Yes | Not blank | First answer option | "3" |
| `answer2` | string | ✅ Yes | Not blank | Second answer option | "4" |
| `correctAnswer` | string | ✅ Yes | Must match answer1-4 value | The correct answer (must exactly match one of answer1-4) | "4" |

### Optional Columns

| Column Name | Type | Required | Validation | Description | Example |
|------------|------|----------|------------|-------------|---------|
| `imageUrl` | string | ❌ No | - | URL to question image | "https://example.com/img.jpg" |
| `audioUrl` | string | ❌ No | - | URL to question audio | "https://example.com/audio.mp3" |
| `explanationText` | string | ❌ No | - | Text explaining the answer | "When you add 2 and 2..." |
| `explanationImg` | string | ❌ No | - | URL to explanation image | "https://example.com/explain.jpg" |
| `lessonId` | number | ❌ No | Must exist in database | ID of related lesson | 1 |
| `answer3` | string | ❌ No | - | Third answer option | "5" |
| `answer4` | string | ❌ No | - | Fourth answer option | "6" |

## Validation Rules

### ✅ Required Field Validation
All these fields **cannot be blank or empty**:
- `questionText`
- `grade`
- `type`
- `answerType`
- `answer1`
- `answer2`
- `correctAnswer`

### 📊 Grade Validation
- **Must be a number between 1 and 5**
- Valid values: `1`, `2`, `3`, `4`, `5`
- ❌ Invalid: `0`, `6`, `1.5`, `"one"`

### 📝 Type Validation
- **Must be exactly** `"practice"` **or** `"exam"` (case-insensitive)
- Valid values: `practice`, `exam`, `PRACTICE`, `EXAM`
- ❌ Invalid: `test`, `quiz`, `both`, `practice/exam`

### 🔗 LessonId Validation
- If provided, **must exist in the database**
- Leave empty if not linking to a lesson
- ❌ Error: "Lesson with ID 999 does not exist"

### ✔️ CorrectAnswer Validation
- **Must exactly match one of the answer values** (answer1, answer2, answer3, or answer4)
- This is a **text match**, not an index number
- ✅ Correct: If answer2 = "4", then correctAnswer = "4"
- ❌ Wrong: If answer2 = "4", then correctAnswer = "2" (don't use the answer number!)

## Answer Format

- You **must provide** at least `answer1` and `answer2`
- You can optionally provide `answer3` and `answer4`
- The `correctAnswer` must be the **exact text** of one of these answers

### Examples

**Example 1: Multiple Choice with 4 answers**
```
questionText: "What is the capital of France?"
grade: 3
type: "practice"
answerType: "choice"
answer1: "London"
answer2: "Paris"
answer3: "Berlin"
answer4: "Madrid"
correctAnswer: "Paris"  ← Must match answer2 value exactly
```

**Example 2: True/False (2 answers)**
```
questionText: "Is 5 > 3?"
grade: 1
type: "exam"
answerType: "choice"
answer1: "True"
answer2: "False"
answer3: (empty)
answer4: (empty)
correctAnswer: "True"  ← Must match answer1 value exactly
```

**Example 3: Math problem with explanation**
```
questionText: "Calculate: 15 ÷ 3"
grade: 2
type: "practice"
answerType: "choice"
answer1: "3"
answer2: "5"
answer3: "6"
answer4: "45"
correctAnswer: "5"  ← Must match answer2 value exactly
explanationText: "When you divide 15 by 3, you're splitting 15 into 3 equal groups, which gives you 5 in each group."
```

## API Endpoints

### Download Template
```http
GET /api/questions/import/template
```

**Response**: Excel file download with sample data

### Import Questions
```http
POST /api/questions/import
Content-Type: multipart/form-data

file: [Excel file]
```

**Response**:
```json
{
  "success": true,
  "message": "Import completed: 10 succeeded, 2 failed",
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
        "error": "Missing required fields (questionText, grade, type)",
        "data": { ... }
      }
    ],
    "total": 12
  }
}
```

## Import Results

The import API will process all rows and return:
- **success**: Array of successfully imported questions with their new IDs
- **failed**: Array of rows that failed with error messages
- **total**: Total number of rows processed

Even if some rows fail, the successful ones will still be imported.

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields: ..." | One or more required fields are blank/empty | Fill in all required fields: questionText, grade, type, answerType, answer1, answer2, correctAnswer |
| "Grade must be a number between 1 and 5" | Grade is not 1-5 | Use only 1, 2, 3, 4, or 5 |
| "Type must be either 'practice' or 'exam'" | Type field has invalid value | Use exactly "practice" or "exam" |
| "Lesson with ID X does not exist" | LessonId references non-existent lesson | Verify lesson exists in database or leave field empty |
| "correctAnswer must match one of the answer values" | correctAnswer doesn't match answer1-4 text | Make sure correctAnswer is the exact text from one of your answers |
| "No answers provided" | No answer1, answer2, etc. columns filled | Provide at least answer1 and answer2 |
| "Invalid file type" | File is not .xlsx or .xls | Use Excel format |
| "Excel file is empty" | No data rows in file | Add question data |
| "Only Excel files are allowed" | Wrong file format | Upload .xlsx or .xls file |

## Validation Error Examples

### ❌ Missing Required Fields
```excel
questionText: "What is 2+2?"
grade: 1
type: "practice"
answerType: (empty)  ← ERROR: Required field is blank
answer1: "3"
answer2: "4"
correctAnswer: "4"
```
**Error**: "Missing required fields: answerType"

### ❌ Invalid Grade
```excel
grade: 6  ← ERROR: Grade must be 1-5
```
**Error**: "Grade must be a number between 1 and 5"

### ❌ Invalid Type
```excel
type: "quiz"  ← ERROR: Must be "practice" or "exam"
```
**Error**: "Type must be either 'practice' or 'exam'"

### ❌ Invalid CorrectAnswer
```excel
answer1: "London"
answer2: "Paris"
answer3: "Berlin"
correctAnswer: "France"  ← ERROR: Doesn't match any answer
```
**Error**: "correctAnswer 'France' must match one of the answer values (answer1, answer2, answer3, or answer4)"

### ❌ Non-existent Lesson
```excel
lessonId: 9999  ← ERROR: Lesson doesn't exist
```
**Error**: "Lesson with ID 9999 does not exist"

### ✅ Correct Example
```excel
questionText: "What is 2 + 2?"
grade: 1
type: "practice"
answerType: "choice"
answer1: "3"
answer2: "4"
answer3: "5"
answer4: "6"
correctAnswer: "4"  ← Matches answer2 exactly
lessonId: 5  ← Lesson exists in database
```
**Result**: ✅ Successfully imported

## Best Practices

1. **Download the template first** - It has the correct column headers and examples
2. **Test with a few rows** - Import 2-3 questions first to verify format
3. **Use consistent formatting** - Keep grade as numbers, type as lowercase text
4. **Validate your data** - Check all required fields are filled before import
5. **Review failed imports** - The API tells you exactly which rows failed and why
6. **Keep backups** - Save your Excel file before importing

## Tips

- The template includes 2 example rows - delete these and add your own questions
- Column order doesn't matter, but column names must be exact (case-sensitive)
- You can add extra columns for your own notes - they'll be ignored during import
- Large files (1000+ questions) may take a few seconds to process
- Maximum file size is 5MB

## Example Excel Structure

| questionText | imageUrl | audioUrl | explanationText | grade | type | answerType | lessonId | answer1 | answer2 | answer3 | answer4 | correctAnswer |
|-------------|----------|----------|-----------------|-------|------|------------|----------|---------|---------|---------|---------|---------------|
| What is 2 + 2? | | | Addition example | 1 | practice | choice | 1 | 3 | 4 | 5 | 6 | 2 |
| What is 10 - 5? | | | Subtraction example | 1 | exam | choice | 1 | 3 | 4 | 5 | 6 | 3 |

## Support

If you encounter issues:
1. Check the error message in the API response
2. Verify your Excel file matches the template format
3. Ensure all required fields are filled
4. Check that grade is 1-5 and type is "practice" or "exam"
