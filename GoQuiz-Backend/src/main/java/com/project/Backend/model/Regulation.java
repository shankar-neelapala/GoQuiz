package com.project.Backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "batchwise_regulation_sections")
public class Regulation {
	@Id
	String id;
	String batch;
	String branch;
	String regulation;
	List<String> sections;
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
	public String getRegulation() {
		return regulation;
	}
	public void setRegulation(String regulation) {
		this.regulation = regulation;
	}
	public List<String> getSections() {
		return sections;
	}
	public void setSections(List<String> sections) {
		this.sections = sections;
	}
	@Override
	public String toString() {
		return "Regulation [id=" + id + ", batch=" + batch + ", branch=" + branch + ", regulation=" + regulation
				+ ", sections=" + sections + "]";
	}
	
	
	
}
