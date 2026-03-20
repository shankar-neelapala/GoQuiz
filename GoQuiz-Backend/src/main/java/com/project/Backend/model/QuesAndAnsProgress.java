package com.project.Backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "progress")
public class QuesAndAnsProgress {
	@Id
	private String id;
	private String username;
	private String batch="";
	private String exam_type="";
	private String branch="";
	private String semester="";
	private String coursecode="";
	private String question_no="";
	private String question="";
	public List<String> options=null;
	private String answer="";
	private String selectedopt=null;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
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
	public String getQuestion() {
		return question;
	}
	public void setQuestion(String question) {
		this.question = question;
	}
	public List<String> getOptions() {
		return options;
	}
	public void setOptions(List<String> options) {
		this.options = options;
	}
	public String getAnswer() {
		return answer;
	}
	public void setAnswer(String answer) {
		this.answer = answer;
	}
	public String getSelectedopt() {
		return selectedopt;
	}
	public void setSelectedopt(String selectedopt) {
		this.selectedopt = selectedopt;
	}
	
	
}
