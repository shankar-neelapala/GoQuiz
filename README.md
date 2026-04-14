# GoQuiz — Online Examination Platform

GoQuiz is a full-stack, role-based online examination platform supporting both **MCQ-based quizzes** and **coding lab exams**. It uses a microservices architecture with event-driven communication via Apache Kafka, JWT-based security, Monaco Editor for coding, and Judge0 for sandboxed code execution.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Running the Project](#running-the-project)
  - [1. Start Infrastructure (Kafka + Zookeeper)](#1-start-infrastructure-kafka--zookeeper)
  - [2. Start Judge0 (Code Execution Engine)](#2-start-judge0-code-execution-engine)
  - [3. Start GoQuiz Backend (Port 8080)](#3-start-goquiz-backend-port-8080)
  - [4. Start Compiler Backend (Port 8081)](#4-start-compiler-backend-port-8081)
  - [5. Start the Frontend (Port 3000)](#5-start-the-frontend-port-3000)
- [Roles and Access](#roles-and-access)
- [Features by Role](#features-by-role)
  - [Student](#student)
  - [Faculty (Teacher)](#faculty-teacher)
  - [HOD](#hod)
  - [Admin](#admin)
- [API Reference](#api-reference)
  - [No Auth (Public)](#no-auth-public)
  - [Student Endpoints (Port 8080)](#student-endpoints-port-8080)
  - [Teacher / HOD Endpoints (Port 8080)](#teacher--hod-endpoints-port-8080)
  - [Admin / HOD Endpoints (Port 8080)](#admin--hod-endpoints-port-8080)
  - [Common Endpoints (Port 8080)](#common-endpoints-port-8080)
  - [Super Admin Endpoints (Port 8080)](#super-admin-endpoints-port-8080)
  - [Compiler Backend Endpoints (Port 8081)](#compiler-backend-endpoints-port-8081)
- [Kafka Topics](#kafka-topics)
  - [GoQuiz Backend Topics](#goquiz-backend-topics)
  - [Compiler Backend Topics](#compiler-backend-topics)
- [Database Collections](#database-collections)
- [Frontend Routes](#frontend-routes)
- [Security](#security)
- [Exam Flow](#exam-flow)
  - [MCQ Exam Flow](#mcq-exam-flow)
  - [Lab / Coding Exam Flow](#lab--coding-exam-flow)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                           │
│                     (Vite · Port 3000)                          │
└────────────┬───────────────────────────┬────────────────────────┘
             │ REST (JWT)                │ REST (no auth)
             ▼                           ▼
┌────────────────────────┐   ┌──────────────────────────────────┐
│   GoQuiz Backend       │   │      Compiler Backend            │
│   Spring Boot · 8080   │   │      Spring Boot · 8081          │
│   JWT + Spring Security│   │      (no auth / open)            │
└────────────┬───────────┘   └──────────────┬───────────────────┘
             │ Kafka                         │ Kafka + REST
             ▼                              ▼
┌─────────────────────┐        ┌────────────────────────────────┐
│  Apache Kafka        │        │   Judge0 (Port 2358)           │
│  + Zookeeper         │        │   Docker · Code Execution      │
│  (docker-compose)    │        │   Postgres + Redis             │
└─────────────────────┘        └────────────────────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MongoDB Atlas                               │
│  Collections: students, teachers, questions, results,          │
│  schedules, regulations, subjects, progress, submissions,      │
│  coding_results, coding_questions, lab_schedules               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 7, React Router v7, Axios |
| UI / Editor | Monaco Editor (`@monaco-editor/react`), Bootstrap 5 |
| Export | xlsx-js-style, file-saver |
| Main Backend | Spring Boot 3.5, Spring Security, Spring Kafka, Spring Data MongoDB |
| Auth | JWT (jjwt 0.11.5), stateless sessions |
| Compiler Backend | Spring Boot 3.5, Spring Kafka, Spring Data MongoDB |
| Code Execution | Judge0 (self-hosted via Docker), supports C, C++, Java, Python |
| Message Broker | Apache Kafka 7.2.1 + Zookeeper 3.8 (docker-compose) |
| Database | MongoDB Atlas |
| AI Assistant | Groq API (ChatBoard feature) |

---

## Project Structure

```
GoQuiz-main/
├── docker-compose.yml          # Kafka + Zookeeper
├── Frontend/
│   ├── src/
│   │   ├── App.jsx             # Route definitions
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── Login.jsx
│   │       ├── Student.jsx
│   │       ├── StudentDashBoard.jsx
│   │       ├── StuProfile.jsx
│   │       ├── Instructions.jsx
│   │       ├── Exam.jsx                # MCQ exam engine
│   │       ├── Compiler.jsx            # Lab coding exam
│   │       ├── LabExam.jsx
│   │       ├── Employee.jsx            # Faculty/HOD dashboard
│   │       ├── Admin.jsx               # Admin dashboard
│   │       ├── ExamSchedule.jsx
│   │       ├── ConductExam.jsx
│   │       ├── UpdateExamSchedule.jsx
│   │       ├── ViewQuestions.jsx
│   │       ├── ViewResults.jsx         # MCQ results (faculty)
│   │       ├── ViewProgress.jsx        # Per-student answer review
│   │       ├── ViewLabResults.jsx      # Coding results (faculty)
│   │       ├── ViewCode.jsx            # Student code viewer + runner
│   │       ├── CodingQuestions.jsx
│   │       ├── MyCodeEditor.jsx
│   │       ├── CreateStudent.jsx
│   │       ├── CreateFaculty.jsx
│   │       ├── ViewStudents.jsx
│   │       ├── ViewFaculties.jsx
│   │       ├── Form.jsx                # Shared filter form
│   │       ├── Toast.jsx               # Toast notification system
│   │       └── GrokChatDirect.jsx      # AI chatboard (Groq)
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── GoQuiz-Backend/             # Main backend (port 8080)
│   └── src/main/java/com/project/Backend/
│       ├── controller/
│       │   ├── AdminController.java
│       │   ├── CommonFuncController.java
│       │   ├── EmployeeController.java
│       │   ├── StudentController.java
│       │   ├── SuperAdminController.java
│       │   └── CodeExecutionController.java
│       ├── service/
│       │   ├── AdminServiceConsumer.java
│       │   ├── CommonFuncServicesConsumer.java
│       │   ├── EmployeeServicesConsumer.java
│       │   ├── StudentServicesConsumer.java
│       │   └── SuperAdminService.java
│       ├── model/
│       │   ├── Students.java
│       │   ├── Teachers.java
│       │   ├── Questions.java
│       │   ├── Result.java
│       │   ├── Schedule.java
│       │   ├── Subjects.java
│       │   ├── Regulation.java
│       │   ├── QuesAndAnsProgress.java
│       │   └── ExamSession.java
│       ├── kafka/
│       │   ├── KafkaTopicConfig.java
│       │   ├── KafkaProducerService.java
│       │   └── KafkaConsumerService.java
│       ├── security/
│       │   ├── SecurityConfig.java
│       │   ├── JwtUtil.java
│       │   └── JwtRequestFilter.java
│       └── repository/
│
├── Compiler-Backend/           # Compiler/coding backend (port 8081)
│   └── src/main/java/com/example/compilers/
│       ├── controller/
│       │   ├── FacultyController.java
│       │   ├── RunController.java
│       │   ├── StudentController.java
│       │   └── SubmitController.java
│       ├── service/
│       │   ├── FacultyService.java
│       │   ├── StudentService.java
│       │   ├── SubmissionConsumer.java  # Handles /run via Kafka
│       │   └── SubmitConsumer.java      # Handles /submit-code via Kafka
│       ├── model/
│       │   ├── CodingQuestion.java
│       │   ├── LabSchedule.java
│       │   ├── Result.java              # Includes language field
│       │   └── Submission.java
│       ├── config/
│       │   └── KafkaConfiguration.java
│       └── repository/
│
└── judge0/                     # Judge0 self-hosted code executor
    ├── docker-compose.yml
    └── judge0.conf
```

---

## Prerequisites

Make sure the following are installed before running the project:

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Frontend |
| npm | 9+ | Frontend package manager |
| Java JDK | 21 | Spring Boot backends |
| Maven | 3.8+ | Build GoQuiz & Compiler backends |
| Docker & Docker Compose | Latest | Kafka, Zookeeper, Judge0 |
| MongoDB Atlas account | — | Database (cloud-hosted) |

---

## Environment Configuration

### Frontend — `Frontend/.env`

```env
VITE_HOST=localhost


### GoQuiz Backend — `GoQuiz-Backend/src/main/resources/application.properties`

```properties
spring.application.name=Backend

spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority&tls=true
spring.data.mongodb.auto-index-creation=true

imgbb.api.key=your-imgbb-api-key

spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=quiz-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.admin.auto-create=true
```

### Compiler Backend — `Compiler-Backend/src/main/resources/application.properties`

```properties
server.port=8081

spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority&tls=true
spring.data.mongodb.auto-index-creation=true

spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=compilers-group
spring.kafka.consumer.auto-offset-reset=earliest
```

---

## Running the Project

### 1. Start Infrastructure (Kafka + Zookeeper)

From the project root (where `docker-compose.yml` is):

```bash
docker-compose up -d
```

This starts:
- **Zookeeper** on port `2181`
- **Kafka** on port `9092`

Verify Kafka is running:

```bash
docker ps
```

### 2. Start Judge0 (Code Execution Engine)

Judge0 is a separate Docker stack for sandboxed code execution. Navigate to the `judge0/` folder:

```bash
cd judge0
docker-compose up -d
```

This starts:
- **Judge0 API server** on port `2358`
- **Judge0 worker** (processes submissions)
- **PostgreSQL** (Judge0 database)
- **Redis** (Judge0 queue)

Verify Judge0 is ready:

```bash
curl http://localhost:2358/system_info
```

> **Note:** Judge0 requires a privileged Docker environment (`privileged: true`). Make sure Docker is configured accordingly. First startup may take 1–2 minutes.

### 3. Start GoQuiz Backend (Port 8080)

```bash
cd GoQuiz-Backend
./mvnw spring-boot:run
```

Or build and run the JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The backend starts on **http://localhost:8080**.

### 4. Start Compiler Backend (Port 8081)

```bash
cd Compiler-Backend
./mvnw spring-boot:run
```

Or build and run the JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/Compiler-Backend-0.0.1-SNAPSHOT.jar
```

The compiler backend starts on **http://localhost:8081**.

### 5. Start the Frontend (Port 3000)

```bash
cd Frontend
npm install
npm run dev
```

The app is available at **http://localhost:3000**.

---

## Roles and Access

GoQuiz uses JWT-based Role-Based Access Control (RBAC). Four roles are supported:

| Role | Login Via | Dashboard |
|---|---|---|
| `STUDENT` | Student login form | Student dashboard, exams, results |
| `TEACHER` | Employee login form | Exam schedule, conduct exam, view results |
| `HOD` | Employee login form | All teacher features + update schedule |
| `ADMIN` | Employee login form | Create students/faculty, manage schedules |

> **Security mapping (Spring Security):**
> - `/noauth/**` — public (login endpoints)
> - `/student/**` — `ROLE_STUDENT` only
> - `/teacher/**` — `ROLE_TEACHER` or `ROLE_HOD`
> - `/admin/**` — `ROLE_HOD` only
> - `/super-admin/**` — `ROLE_ADMIN` only
> - `/common/**` — any authenticated role

---

## Features by Role

### Student

- View today's exam schedule filtered by branch and semester
- Read exam instructions before starting
- Sit MCQ exams (MID-1, MID-2) — 20 questions, 20 minutes, anti-cheat fullscreen enforcement
- Sit coding lab exams (EXTERNAL, LAB exams) — Monaco Editor with language selection (C, C++, Java, Python)
- Answers auto-saved per question via `PUT /student/updateprogress`
- Auto-submit on timer expiry or 5 security violations (tab switch / fullscreen exit)
- View personal exam results after submission
- AI ChatBoard via Groq API

### Faculty (Teacher)

- Dashboard showing upcoming exam schedule for their branch
- **Conduct Exam** — Set regulation, upload MCQ questions per subject/exam type
- **View Question Paper** — Review uploaded questions, edit them inline
- **View Quiz Results** — Filter by batch/branch/semester/section/subject, see per-student marks
  - Click **View** on any student to open their full answered question paper in a new tab (correct answers highlighted green, wrong answers red)
  - Download results as Excel
- **View Lab Results** — Filter coding exam results, see marks and status (ACCEPTED / PARTIAL)
  - Click **View Code** to open the student's submitted code in Monaco Editor in a new tab with a **Run** button to execute it live
- AI ChatBoard via Groq API

### HOD

All Faculty features, plus:

- **Update Exam Schedule** — Modify existing scheduled exams

### Admin

- **Create Student** — Register new students with profile photo upload (imgbb)
- **Create Faculty** — Register new teachers/HODs
- **View Students** — Browse, search, update student records
- **View Faculties** — Browse faculty records
- **Create Schedule** — Schedule new exams via `POST /teacher/addschedule`

---

## API Reference

All protected endpoints require the header:
```
Authorization: <jwt-token>
```

### No Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/noauth/loginstu` | Student login. Params: `username`, `password` |
| `POST` | `/noauth/loginemp` | Employee/faculty/admin login. Params: `username`, `password` |

Both return `{ details: [...], token: "jwt..." }`.

---

### Student Endpoints (Port 8080)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/student/getexams` | Get today's scheduled exams. Params: `branch`, `semester`, `date` |
| `GET` | `/student/examquestions` | Get exam questions with saved progress. Params: `username`, `batch`, `branch`, `coursecode`, `examtype` |
| `PUT` | `/student/updateprogress` | Save selected answer for a question. Body: `QuesAndAnsProgress` |

**`QuesAndAnsProgress` body:**
```json
{
  "id": "question-id",
  "username": "22A91A0501",
  "batch": "2022",
  "exam_type": "MID-1",
  "branch": "CSE",
  "semester": "III",
  "coursecode": "CS301",
  "question_no": 3,
  "question": "What is polymorphism?",
  "options": ["Overloading", "Inheritance", "Encapsulation", "Both A and B"],
  "answer": "Both A and B",
  "selectedopt": "Overloading"
}
```

---

### Teacher / HOD Endpoints (Port 8080)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/teacher/setregulation` | Set batch-branch regulation mapping |
| `GET` | `/teacher/getregulation` | Get regulation. Params: `batch`, `branch` |
| `POST` | `/teacher/postsubjects` | Add subjects for a regulation |
| `GET` | `/teacher/getsubjects` | Get subjects. Params: `regulation`, `branch`, `semester` |
| `GET` | `/teacher/checkeligibility` | Check if teacher can manage subject. Params: `username`, `coursecode` |
| `POST` | `/teacher/addquestions` | Add MCQ question |
| `GET` | `/teacher/getquestions` | Get questions. Params: `batch`, `exam_type`, `branch`, `coursecode` |
| `GET` | `/teacher/getnumofqueposted` | Count posted questions. Params: `batch`, `branch`, `coursecode`, `exam_type` |
| `PUT` | `/teacher/updatequestion` | Update an existing question |
| `DELETE` | `/teacher/deletequestion` | Delete a question. Param: `id` |
| `POST` | `/teacher/addschedule` | Create exam schedule |
| `GET` | `/teacher/getresultslist` | Get all student results. Params: `batch`, `branch`, `coursecode`, `exam_type`, `semester`, `section` |
| `GET` | `/teacher/getstudentanswers` | Get a student's answered question paper. Params: `username`, `batch`, `branch`, `coursecode`, `examtype` |

**`addschedule` body:**
```json
{
  "examtype": "MID-1",
  "branch": "CSE",
  "semester": "III",
  "coursecode": "CS301",
  "subject": "Data Structures",
  "date": "2025-04-15",
  "startTime": "09:00",
  "endTime": "10:00"
}
```

---

### Admin / HOD Endpoints (Port 8080)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/getschedule` | Get schedule. Params: `branch`, `semester`, `coursecode`, `subject`, `exam_type` |
| `POST` | `/admin/updateschedule` | Update schedule. Body: `Schedule` |
| `POST` | `/admin/addschedule` | Create schedule (Admin role). Body: same as `addschedule` |

---

### Common Endpoints (Port 8080)

Accessible to all authenticated roles (student, teacher, HOD):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/common/getschedule` | Get exam schedule. Params: `branch`, `semester` |
| `GET` | `/common/getresults` | Get student's own results. Params: `batch`, `branch`, `coursecode`, `exam_type`, `semester`, `section`, `username` |
| `POST` | `/common/uploadresults` | Submit MCQ exam results. Body: `Result` |

**`uploadresults` body:**
```json
{
  "batch": "2022",
  "branch": "CSE",
  "semester": "III",
  "coursecode": "CS301",
  "examType": "MID-1",
  "section": "A",
  "username": "22A91A0501",
  "originalans": ["A", "B", "C", ...],
  "attemptedans": ["A", "D", "C", ...],
  "status": "submitted"
}
```

---

### Super Admin Endpoints (Port 8080)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create-student` | Create student with photo upload |
| `POST` | `/create-teacher` | Create teacher with photo upload |
| `GET` | `/get-students` | List students. Params: `batch`, `branch`, `semester`, `section` |
| `GET` | `/get-teachers` | List teachers. Param: `branch` |
| `PUT` | `/update-student` | Update student record. Body: `Students` |

---

### Compiler Backend Endpoints (Port 8081)

> These endpoints do **not** require JWT auth. All code execution routes go through Kafka.

#### Run Code (Faculty / Test)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/run` | Submit code for execution (fire-and-forget via Kafka). Returns `submissionId` |
| `GET` | `/result/{id}` | Poll for run result by submission ID |

**`/run` body:**
```json
{
  "language": "python",
  "source_code": "print('Hello World')",
  "stdin": "",
  "expectedoutput": ""
}
```

**`/result/{id}` response:**
```json
{
  "id": "abc123",
  "status": "DONE",
  "resultJson": "{ \"stdout\": \"Hello World\\n\", \"stderr\": null, ... }"
}
```

Status values: `PENDING` → `RUNNING` → `DONE` / `ERROR`

#### Submit Code (Student Exam)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/submit-code` | Submit exam code, runs against all test cases via Kafka |
| `GET` | `/submit-result/{id}` | Poll for submission result |

**`/submit-code` body:**
```json
{
  "questionId": "question-mongo-id",
  "language": "python",
  "source_code": "n = int(input())\nprint(n * 2)",
  "stdin": "",
  "expectedoutput": "",
  "username": "22A91A0501",
  "batch": "2022",
  "branch": "CSE",
  "semester": "III",
  "coursecode": "CS404",
  "examType": "LAB-MID-1",
  "section": "A",
  "question_title": "Double the Input"
}
```

#### Faculty / Lab Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/emp/create-question` | Create a coding question with test cases |
| `POST` | `/emp/create-schedule` | Create a lab exam schedule |
| `GET` | `/emp/view-coding-results` | Get coding results. Params: `batch`, `branch`, `coursecode`, `exam_type`, `semester`, `section` |

#### Student — Lab Exam

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/compiler/stu/get-questions` | Get one random coding question for the exam. Params: `batch`, `branch`, `exam_type`, `coursecode` |

---

## Kafka Topics

### GoQuiz Backend Topics

All topics use 3 partitions, 1 replica. Request/response pairs use a `UUID` as the Kafka message key for correlation.

| Topic | Direction | Purpose |
|---|---|---|
| `stulogin-request-topic` | Producer | Student login request |
| `student-login-response` | Consumer | Student login response with JWT |
| `emplogin-request-topic` | Producer | Employee login request |
| `employee-login-response` | Consumer | Employee login response with JWT |
| `student-create-topic` | Producer | Create new student |
| `employee-create-topic` | Producer | Create new employee/teacher |
| `add-question-topic` | Producer | Add MCQ question |
| `delete-question-topic` | Producer | Delete MCQ question |
| `update-question-topic` | Producer | Update MCQ question |
| `update-question-topic-response` | Consumer | Update confirmation |
| `get-examsque-topic` | Producer | Fetch exam questions for a student |
| `get-examque-response` | Consumer | Question list with student progress |
| `update-progress-topic` | Producer | Save student's selected answer |
| `upload-result-topic` | Producer | Upload final exam results |
| `get-exams-topic` | Producer | Get scheduled exams for a student |
| `get-exam-response` | Consumer | Scheduled exam list |
| `get-sturesult-topic` | Producer | Get student's own results |
| `get-sturesult-response` | Consumer | Result data |
| `all-sturesults-topic` | Producer | Get all students' results (teacher view) |
| `all-sturesults-response` | Consumer | Result list |
| `add-schedule-topic` | Producer | Create exam schedule |
| `get-schedule-topic` | Producer | Get exam schedule |
| `get-schedule-response` | Consumer | Schedule list |
| `admin-getschedule-topic` | Producer | Admin: get schedule |
| `admin-getschedule-response` | Consumer | Admin: schedule data |
| `admin-updateschedule-topic` | Producer | Admin: update schedule |
| `admin-updateschedule-response` | Consumer | Update confirmation |
| `post-subjects-topic` | Producer | Add subjects |
| `get-subjects-topic` | Producer | Get subjects list |
| `get-subject-topic-response` | Consumer | Subjects data |
| `get-regulation-topic` | Producer | Get regulation mapping |
| `get-regulation-topic-response` | Consumer | Regulation data |
| `check-eligible-topic` | Producer | Check teacher eligibility for subject |
| `check-eligible-topic-response` | Consumer | Eligibility result |
| `get-noofqueposted-topic` | Producer | Count questions posted |
| `get-noofqueposted-response` | Consumer | Question count |

### Compiler Backend Topics

| Topic | Group | Purpose |
|---|---|---|
| `run-submissions` | `run-group` | Code run requests (fire-and-forget) → `SubmissionConsumer` |
| `submit-submissions` | `submit-group` | Exam code submissions → `SubmitConsumer` (runs all test cases, saves `Result`) |

---

## Database Collections

Both backends connect to the same **MongoDB Atlas** cluster.

| Collection | Backend | Description |
|---|---|---|
| `students` | GoQuiz | Student profiles (name, username, batch, branch, semester, section, role, image) |
| `teachers` | GoQuiz | Teacher profiles (name, username, branch, taught subjects, role) |
| `questions` | GoQuiz | MCQ questions (question text, 4 options, answer, batch, branch, exam type) |
| `results` | GoQuiz | MCQ exam results (username, marks, original answers, attempted answers, status) |
| `schedules` | GoQuiz | Exam schedules (subject, coursecode, date, start/end time, branch, semester) |
| `regulations` | GoQuiz | Batch-branch-regulation mappings with sections |
| `subjects` | GoQuiz | Subject list per regulation and semester |
| `progress` | GoQuiz | Per-question answer progress saved during exam |
| `exam_sessions` | GoQuiz | Active exam session tracking |
| `submissions` | Compiler | Code run/submit submissions (status: PENDING→RUNNING→DONE/ERROR) |
| `coding_results` | Compiler | Final coding exam results with source code, language, marks, status |
| `coding_questions` | Compiler | Coding problems with test cases and expected outputs |
| `lab_schedules` | Compiler | Lab exam schedules |

---

## Frontend Routes

| Path | Component | Access |
|---|---|---|
| `/` | `Login` | Public |
| `/student` | `Student` | Student |
| `/instructions` | `Instructions` | Student |
| `/exam` | `Exam` | Student (MCQ exam engine) |
| `/compiler` | `Compiler` | Student (coding exam engine) |
| `/labexam` | `LabExam` | Student |
| `/employee` | `Employee` | Teacher / HOD |
| `/admin` | `Admin` | Admin |
| `/create-student` | `CreateStudent` | Admin |
| `/create-faculty` | `CreateFaculty` | Admin |
| `/add-coding-question` | `CodingQuestions` | Teacher |
| `/view-progress?key=` | `ViewProgress` | Teacher — opens in new tab |
| `/view-code?key=` | `ViewCode` | Teacher — opens in new tab |
| `/chat` | `GrokChatDirect` | All authenticated |

> **`/view-progress` and `/view-code`** receive data via `sessionStorage` using a `?key=` query parameter (written before `window.open`) so state survives across tabs without needing React Router `location.state`.

---

## Security

- **Authentication:** JWT tokens issued on login, sent with every request as `Authorization: <token>` header.
- **Stateless sessions:** `SessionCreationPolicy.STATELESS` — no server-side session storage.
- **CORS:** All origins allowed (`allowedOriginPatterns: *`) with credentials enabled.
- **Exam anti-cheat:**
  - Fullscreen is enforced when the exam starts via the Fullscreen API.
  - Tab switches and fullscreen exits are detected and counted.
  - After **5 violations** the exam is auto-submitted with status `auto-submitted-security` or `auto-submitted-tab-switch`.
  - Keyboard shortcuts (Ctrl+C, Ctrl+V, F12, PrintScreen, etc.) and context menus are blocked during exams.
  - Page reload detection via `sessionStorage`.

---

## Exam Flow

### MCQ Exam Flow

```
Student Dashboard
      │
      ▼
  GET /student/getexams  ──► Schedule list
      │
      ▼
  Instructions page  ──► Student checks checkbox and clicks Start
      │
      ▼
  GET /student/examquestions  ──► 20 questions loaded with prior progress
      │
      ▼
  Student selects option  ──► onChange: currentSelectionRef updated immediately
      │
      ▼
  "Save & Next" button
      │
      ├──► PUT /student/updateprogress  (answer saved to MongoDB via Kafka)
      ├──► Navigator button turns green (answered) or red (skipped)
      └──► Move to next question
      │
      ▼
  Timer reaches 0 OR "Submit Exam" clicked OR 5 violations
      │
      ▼
  POST /common/uploadresults  ──► Final result saved with all answers
      │
      ▼
  Navigate back to Student Dashboard
```

### Lab / Coding Exam Flow

```
Student Dashboard (Lab Exam)
      │
      ▼
  GET /compiler/stu/get-questions  ──► 1 random coding question assigned
      │
      ▼
  Monaco Editor loads with question + sample code
  Student writes code, selects language (C / C++ / Java / Python)
      │
      ▼
  "Run" button  ──► POST /run  ──► Kafka (run-submissions)
                                        │
                                        ▼
                               SubmissionConsumer
                               polls Judge0 (:2358)
                                        │
                                        ▼
                               GET /result/{id}  (frontend polls)
                               ──► stdout / stderr displayed
      │
      ▼
  "Submit" button  ──► POST /submit-code  ──► Kafka (submit-submissions)
                                                   │
                                                   ▼
                                          SubmitConsumer
                                          runs ALL test cases
                                          calculates marks
                                          saves Result to MongoDB
                                          (language field stored)
      │
      ▼
  Navigate back to Student Dashboard
```

---

## Troubleshooting

**Kafka not connecting**
- Make sure `docker-compose up -d` was run from the project root.
- Verify with `docker ps` that both `zookeeper` and `kafka` containers are running.
- Check `KAFKA_ADVERTISED_LISTENERS` is set to `PLAINTEXT://localhost:9092` in `docker-compose.yml`.

**Judge0 returning errors / not starting**
- Judge0 requires `privileged: true` in Docker. Ensure Docker Desktop has the necessary permissions.
- First startup downloads images and may take 2–3 minutes. Check with `docker logs judge0-server-1`.
- Verify it is up: `curl http://localhost:2358/system_info`

**403 Forbidden errors**
- Student endpoints (`/student/**`) require a student JWT. Faculty tokens will be rejected.
- Admin endpoints (`/admin/**`) require `ROLE_HOD`. Plain `ROLE_ADMIN` (super-admin) tokens use `/super-admin/**` instead.
- Teacher endpoints (`/teacher/**`) accept `ROLE_TEACHER` or `ROLE_HOD`.

**Code running as wrong language**
- The `language` field on `Result` was added later. Older records may have `null` language.
- The `ViewCode` page auto-detects language from source code patterns (Python keywords, Java class syntax, C++ `cout`, C `printf`). Use the language override dropdown in the top bar if detection is wrong.

**MongoDB connection refused**
- Check that your Atlas cluster IP whitelist includes your machine's IP (or `0.0.0.0/0` for development).
- Confirm credentials in `application.properties` are correct.

**Frontend CORS error**
- Ensure both Spring Boot backends are running before starting the frontend.
- The Compiler Backend (`8081`) has a broad `@CrossOrigin("*")` — no additional config needed.
- The main backend (`8080`) uses `allowedOriginPatterns: *` in `SecurityConfig`.

**Exam questions not loading**
- `GET /student/examquestions` is gated to `ROLE_STUDENT`. Calling it with a teacher token returns 403 — this is expected behavior.
- The teacher view of student answers uses `GET /teacher/getstudentanswers` instead.
