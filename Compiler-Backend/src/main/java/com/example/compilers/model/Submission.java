package com.example.compilers.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;
    private String language;
    private String questionId;
    private String sourceCode;
    private String stdin = null;
    private String status; // PENDING, RUNNING, DONE, ERROR
    private String resultJson;
    private Instant createdAt;
    private String expectedoutput = null;

    // Submit-specific fields (student/exam data)
    private String username;
    private String batch;
    private String branch;
    private String semester;
    private String coursecode;
    private String examType;
    private String section;
    private String questionTitle;

    public Submission() {}

    // Constructor for Run (no student data)
    public Submission(String language, String sourceCode, String stdin, String expectedoutput) {
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
        this.expectedoutput = expectedoutput;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    // Constructor for Submit (with questionId)
    public Submission(String questionId, String language, String sourceCode, String stdin, String expectedoutput) {
        this.questionId = questionId;
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
        this.expectedoutput = expectedoutput;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
    public String getStdin() { return stdin; }
    public void setStdin(String stdin) { this.stdin = stdin; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResultJson() { return resultJson; }
    public void setResultJson(String resultJson) { this.resultJson = resultJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getExpectedOutput() { return expectedoutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedoutput = expectedOutput; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getBranch() { return branch; }
    public void setBranch(String branch) { this.branch = branch; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getCoursecode() { return coursecode; }
    public void setCoursecode(String coursecode) { this.coursecode = coursecode; }
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getQuestionTitle() { return questionTitle; }
    public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }
}
