package com.project.Backend.model;

import java.util.List;

public class Subjects {

	String id;
	String regulation;
	List<String> branch;
	String semester;
	List<String> coursecode;
	List<String> subjectname;
	List<String> shortform;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getRegulation() {
		return regulation;
	}
	public void setRegulation(String regulation) {
		this.regulation = regulation;
	}
	public String getSemester() {
		return semester;
	}
	public void setSemester(String semester) {
		this.semester = semester;
	}
	
	public List<String> getBranch() {
		return branch;
	}
	public void setBranch(List<String> branch) {
		this.branch = branch;
	}
	public List<String> getCoursecode() {
		return coursecode;
	}
	public void setCoursecode(List<String> coursecode) {
		this.coursecode = coursecode;
	}
	public List<String> getSubjectname() {
		return subjectname;
	}
	public void setSubjectname(List<String> subjectname) {
		this.subjectname = subjectname;
	}
	public List<String> getShortform() {
		return shortform;
	}
	public void setShortform(List<String> shortform) {
		this.shortform = shortform;
	}
	@Override
	public String toString() {
		return "Subjects [id=" + id + ", regulation=" + regulation + ", semester=" + semester + ", coursecode="
				+ coursecode + ", subjectname=" + subjectname + ", shortform=" + shortform + "]";
	}
	
}
