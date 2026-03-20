package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.QuesAndAnsProgress;

@Repository
public interface ProgressRepo extends MongoRepository<QuesAndAnsProgress,String>{

	List<QuesAndAnsProgress> findByUsername(String username);

}
