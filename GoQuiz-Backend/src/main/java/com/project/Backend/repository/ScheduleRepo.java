package com.project.Backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.project.Backend.model.Schedule;

@Repository
public interface ScheduleRepo extends MongoRepository<Schedule, String> {

	List<Schedule> findByBranchAndSemesterAndDate(String branch, String semester, String date);

	List<Schedule> findByBranchAndSemester(String branch, String semester);

	List<Schedule> findByBranchAndSemesterAndCoursecodeAndSubjectAndExamtype(String branch, String semester, String coursecode, String subject, String exam_type);

}
