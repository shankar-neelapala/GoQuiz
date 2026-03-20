package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.Questions;


@Repository
public interface QuestionsRepo extends MongoRepository<Questions,String>{
	
	@Query("{ 'batch': ?0, 'exam_type': ?1, 'branch': ?2, 'coursecode':?3}")
	List<Questions> findQuestions(String year, String examType, String branch,String code);



}
