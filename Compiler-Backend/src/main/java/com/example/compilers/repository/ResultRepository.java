package com.example.compilers.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.compilers.model.Result;

public interface ResultRepository extends MongoRepository<Result, String> {

	Result findByBranch(String branch);

	List<Result> findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSection(String batch, String branch, String code,
			String type, String semester, String section);

}
