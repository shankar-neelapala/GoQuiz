package com.example.compilers.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.compilers.model.CodingQuestion;
import com.example.compilers.model.Result;
import com.example.compilers.repository.QuestionRepository;
import com.example.compilers.repository.ResultRepository;

@Service
public class StudentService {

	@Autowired
	private QuestionRepository qr;
	
	

	public List<CodingQuestion> getQuestons(String year, String branch, String code, String type) {
		List<CodingQuestion> questions = qr.findQuestions(year, branch, code, type);
		Collections.shuffle(questions);
		return questions.subList(0, 2);		
	}


	@Autowired
	private ResultRepository rr;
	public void store(Result res) {
		rr.save(res);
	}
}
