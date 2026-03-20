package com.example.compilers.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.compilers.model.Result;

public interface ResultRepository extends MongoRepository<Result, String> {

	Result findByBranch(String branch);

}
