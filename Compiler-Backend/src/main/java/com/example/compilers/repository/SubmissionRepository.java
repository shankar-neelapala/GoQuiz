package com.example.compilers.repository;

import com.example.compilers.model.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> { }