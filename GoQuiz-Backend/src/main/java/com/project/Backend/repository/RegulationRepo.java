package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.Regulation;

@Repository
public interface RegulationRepo extends MongoRepository<Regulation,String>{

	List<Regulation> findByBatchAndBranch(String batch, String branch);
	
}
