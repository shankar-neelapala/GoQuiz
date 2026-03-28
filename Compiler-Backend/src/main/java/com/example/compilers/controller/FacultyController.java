package com.example.compilers.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.compilers.model.CodingQuestion;
import com.example.compilers.model.LabSchedule;
import com.example.compilers.model.Result;
import com.example.compilers.service.FacultyService;

@CrossOrigin(
	    origins = "http://localhost:3000",
	    allowCredentials = "true"
	)
@RestController
//@RequestMapping("/compiler")
public class FacultyController {

	@Autowired
	private FacultyService facultyService;
	
	@PostMapping("/emp/create-question")
	public CodingQuestion createQuestion(@RequestBody CodingQuestion cq) {
		return facultyService.createQuestion(cq);
	}
	
	
	@PostMapping("/emp/create-schedule")
	public LabSchedule createlabSchedule(@RequestBody LabSchedule ls) {
		return facultyService.createLabSchedule(ls);
	}
	
	
	@GetMapping("/emp/view-coding-results")
	public List<Result> getAll(@RequestParam("batch") String batch,@RequestParam("branch") String branch,@RequestParam("coursecode") String code,@RequestParam("exam_type") String type,@RequestParam("semester") String semester,@RequestParam("section") String section) {
		return facultyService.getAll(batch, branch, code, type, semester, section);
	}
	

}
