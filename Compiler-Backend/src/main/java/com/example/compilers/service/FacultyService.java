package com.example.compilers.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.compilers.model.CodingQuestion;
import com.example.compilers.model.LabSchedule;
import com.example.compilers.model.Result;
import com.example.compilers.repository.LabScheduleRepository;
import com.example.compilers.repository.QuestionRepository;
import com.example.compilers.repository.ResultRepository;

@Service
public class FacultyService {

	@Autowired
	private QuestionRepository questionRepo;
	
	public CodingQuestion createQuestion(CodingQuestion cq) {
		return questionRepo.save(cq);
	}


	@Autowired
	private LabScheduleRepository labSheduleRepo;
	
	public LabSchedule createLabSchedule(LabSchedule ls) {
		return labSheduleRepo.save(ls);
		
	}

	@Autowired
	private ResultRepository resultRepo;
	
//	public Result getAll(String branch) {
//		return resultRepo.findByBranch(branch);
//	}

	public List<Result> getAll(String batch, String branch, String code, String type, String semester, String section) {
		return resultRepo.findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSection(batch, branch, code, type, semester, section);
	}

}
