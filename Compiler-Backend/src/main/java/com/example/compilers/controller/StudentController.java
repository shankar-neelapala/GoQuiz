package com.example.compilers.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.compilers.model.CodingQuestion;
import com.example.compilers.model.Result;
import com.example.compilers.service.StudentService;

@CrossOrigin("*")
@RestController
@RequestMapping("/compiler")
public class StudentController {

	@Autowired
	private StudentService studentService;
	
	@GetMapping("/stu/get-questions")
	public List<CodingQuestion> getAll(
			@RequestParam("batch") String year,
			@RequestParam("branch") String branch,
			@RequestParam("coursecode") String code,@RequestParam("exam_type") String type) {
		return studentService.getQuestons(year, branch, code, type);
	}
	
	@PostMapping("/stu/submit-code")
	public void submitCode(@RequestBody Result res) {
		studentService.store(res);
	}
}
