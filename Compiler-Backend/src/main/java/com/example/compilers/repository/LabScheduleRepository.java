package com.example.compilers.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.compilers.model.LabSchedule;

public interface LabScheduleRepository extends MongoRepository<LabSchedule, String> {

	void deleteByBranch(String string);

}
