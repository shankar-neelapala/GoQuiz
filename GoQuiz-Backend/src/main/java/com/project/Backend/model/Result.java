package com.project.Backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "results")
public class Result {
	@Id
	String id;
	String batch;
	String branch;
	String semester;
	String coursecode;
	String examType;
	String section;
	@Indexed(unique = true)
	String username;
	List<String> originalans;
	List<String> attemptedans;
	String status = null;
	double marks;
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
	public String getExamType() {
		return examType;
	}
	public void setExamType(String exam_type) {
		this.examType = exam_type;
	}
	public String getSection() {
		return section;
	}
	public void setSection(String section) {
		this.section = section;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public double getMarks() {
		return marks;
	}
	public void setMarks(double marks) {
		this.marks = marks;
	}
	public List<String> getOriginalans() {
		return originalans;
	}
	public void setOriginalans(List<String> originalans) {
		this.originalans = originalans;
	}
	public List<String> getAttemptedans() {
		return attemptedans;
	}
	public void setAttemptedans(List<String> attemptedans) {
		this.attemptedans = attemptedans;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	@Override
	public String toString() {
		return "Result [id=" + id + ", batch=" + batch + ", branch=" + branch + ", semester=" + semester
				+ ", coursecode=" + coursecode + ", exam_type=" + examType + ", section=" + section + ", username="
				+ username + "]";
	}
	
	
}
