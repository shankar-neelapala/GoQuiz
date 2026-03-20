package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.project.Backend.model.Teachers;

public interface TeacherRepo extends MongoRepository<Teachers, String> {


	List<Teachers> findByUsernameAndPassword(String username, String password);

	Teachers findByUsernameAndTeachsubjects(String username, String coursecode);

	void deleteByUsername(String username);

	List<Teachers> findByBranch(String branch);

}
