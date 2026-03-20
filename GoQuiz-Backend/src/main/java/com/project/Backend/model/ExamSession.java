package com.project.Backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "exam_session")
public class ExamSession {

	@Id
    private Long id;
    private Long username;
    private Long examId;     
    private int remainingTime;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getUsername() {
		return username;
	}
	public void setUsername(Long username) {
		this.username = username;
	}
	public Long getExamId() {
		return examId;
	}
	public void setExamId(Long examId) {
		this.examId = examId;
	}
	public int getRemainingTime() {
		return remainingTime;
	}
	public void setRemainingTime(int remainingTime) {
		this.remainingTime = remainingTime;
	}
    
    
}
