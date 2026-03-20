package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.Students;

@Repository
public interface StudentRepo extends MongoRepository<Students, String> {

	List<Object> findByUsernameAndPassword(String username, String password);

	List<Students> findByBatchAndBranchAndSemesterAndSection(String batch, String branch, String sem, String section);


}
