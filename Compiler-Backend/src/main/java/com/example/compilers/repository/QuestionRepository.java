package com.example.compilers.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.compilers.model.CodingQuestion;

@Repository
public interface QuestionRepository extends MongoRepository<CodingQuestion, String> {

	@Query("{ 'batch': ?0, 'branch': ?1,'exam_type': ?3, 'coursecode':?2}")
	List<CodingQuestion> findQuestions(String year, String branch, String code, String type);

}
