package com.example.compilers.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "coding_questions")
public class CodingQuestion {

	@Id
	private String id;
	private String batch="";
	private String exam_type="";
	private String branch="";
	private String semester="";
	private String coursecode="";
	private String question_no="";
	private String question_title="";
	private String question_description="";
	private List<String> testCases;
	private List<String> testCasesOutput;
	private double marks;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getBatch() {
		return batch;
	}
	public void setBatch(String batch) {
		this.batch = batch;
	}
	public String getExam_type() {
		return exam_type;
	}
	public void setExam_type(String exam_type) {
		this.exam_type = exam_type;
	}
	public String getBranch() {
		return branch;
	}
	public void setBranch(String branch) {
		this.branch = branch;
	}
	public String getSemester() {
		return semester;
	}
	public void setSemester(String semester) {
		this.semester = semester;
	}
	public String getCoursecode() {
		return coursecode;
	}
	public void setCoursecode(String coursecode) {
		this.coursecode = coursecode;
	}
	public String getQuestion_no() {
		return question_no;
	}
	public void setQuestion_no(String question_no) {
		this.question_no = question_no;
	}
	public List<String> getTestCases() {
		return testCases;
	}
	public void setTestCases(List<String> testCases) {
		this.testCases = testCases;
	}
	public String getQuestion_title() {
		return question_title;
	}
	public void setQuestion_title(String question_title) {
		this.question_title = question_title;
	}
	public String getQuestion_description() {
		return question_description;
	}
	public void setQuestion_descrption(String question_description) {
		this.question_description = question_description;
	}
	public List<String> getTestCasesOutput() {
		return testCasesOutput;
	}
	public void setTestCasesOutput(List<String> testCasesOutput) {
		this.testCasesOutput = testCasesOutput;
	}
	public double getMarks() {
		return marks;
	}
	public void setMarks(double marks) {
		this.marks = marks;
	}
	
	
	
}
