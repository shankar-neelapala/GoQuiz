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
    private String stdin=null;
    private String status; // PENDING, RUNNING, DONE, ERROR
    private String resultJson;
    private Instant createdAt;
    private String expectedoutput=null;

	public Submission() {}

    public Submission(String language, String sourceCode, String stdin, String expectedoutput) {
        this.language = language; this.sourceCode = sourceCode; this.stdin = stdin;
        this.status = "PENDING"; this.createdAt = Instant.now();this.expectedoutput = expectedoutput;
    }
    
    
    public Submission(String questionId, String language, String sourceCode, String stdin, String expectedoutput) {
        this.questionId = questionId;
        this.language = language;
        this.sourceCode = sourceCode;
        this.stdin = stdin;
        this.status = "PENDING";
        this.createdAt = Instant.now();
        this.expectedoutput = expectedoutput;
    }

    // getters & setters
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
    public String getExpectedOutput() {return expectedoutput;}
	public void setExpectedOutput(String expectedOutput) {expectedoutput = expectedOutput;}

	public String getQuestionId() {
		return questionId;
	}

	public void setQuestionId(String questionId) {
		this.questionId = questionId;
	}
	
}