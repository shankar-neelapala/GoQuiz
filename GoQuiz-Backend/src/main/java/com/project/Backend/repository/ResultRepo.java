package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.Result;

@Repository
public interface ResultRepo extends MongoRepository<Result, String> {

	List<Result> findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSectionAndUsername(String batch,
			String branch, String code, String type, String semester, String section, String u);

	List<Result> findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSection(String batch, String branch,
			String code, String type, String semester, String section);

}
