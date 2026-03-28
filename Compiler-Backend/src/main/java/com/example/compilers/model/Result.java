package com.example.compilers.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "coding_results")
@CompoundIndex(name = "unique_user_question", def = "{'username': 1, 'question_title': 1}", unique = true)
public class Result {

	@Id
    private String id;
    private String batch;
    private String branch;
    private String semester;
    private String coursecode;
    private String examType;
    private String section;
    @Indexed
    private String username;
    private String question_title;
    private String source_code;
    private String language;
    private double marks;
    private String status = null;

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }
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
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getQuestion_title() { return question_title; }
	public void setQuestion_title(String question_title) { this.question_title = question_title; }
	public String getSource_code() { return source_code; }
	public void setSource_code(String source_code) { this.source_code = source_code; }
	public String getLanguage() { return language; }
	public void setLanguage(String language) { this.language = language; }
	public double getMarks() { return marks; }
	public void setMarks(double marks) { this.marks = marks; }
	public String getStatus() { return status; }
	public void setStatus(String status) { this.status = status; }
}
