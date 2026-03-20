package com.example.compilers.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.compilers.model.Submission;
import com.example.compilers.repository.SubmissionRepository;

@CrossOrigin("*")
@RestController
//@RequestMapping("/compiler")
public class SubmitController {
    private final SubmissionRepository repo;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String TOPIC = "submissions";

    public SubmitController(SubmissionRepository repo, KafkaTemplate<String, String> kafkaTemplate) {
        this.repo = repo;
        this.kafkaTemplate = kafkaTemplate;
    }

    record SubmitRequest(String questionId, String language, String source_code, String stdin, String expectedoutput) {}

    @PostMapping("/submit-code")
    public ResponseEntity<?> submit(@RequestBody SubmitRequest req) {
        Submission s = new Submission(req.questionId(), req.language(), req.source_code(), req.stdin(), req.expectedoutput());
        s = repo.save(s);
        kafkaTemplate.send(TOPIC, s.getId());
        return ResponseEntity.ok().body(java.util.Map.of("submissionId", s.getId()));
    }
    
    

    
}
