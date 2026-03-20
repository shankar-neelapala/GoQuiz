package com.project.Backend.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "TeachersList")
public class Teachers {
	@Id
	private String id;
	private String name;
	@Indexed(unique = true)
	private String username;
	private String password="1234";
	private String branch=null;
	private List<String> teachsubjects=null;
	private String image = null;
	private String role = null;
	private List<String> subjectsname=null;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getBranch() {
		return branch;
	}
	public void setBranch(String branch) {
		this.branch = branch;
	}
	public List<String> getTeachsubjects() {
		return teachsubjects;
	}
	public void setTeachsubjects(List<String> teachsubjects) {
		this.teachsubjects = teachsubjects;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public List<String> getSubjectsname() {
		return subjectsname;
	}
	public void setSubjectsname(List<String> subjectsname) {
		this.subjectsname = subjectsname;
	}
	@Override
	public String toString() {
		return "Teachers [id=" + id + ", name=" + name + ", username=" + username + ", password=" + password
				+ ", branch=" + branch + ", teachsubjects=" + teachsubjects + ", image=" + image + ", role=" + role
				+ "]";
	}
	
	
}
