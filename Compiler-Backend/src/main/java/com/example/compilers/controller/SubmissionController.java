package com.example.compilers.controller;

import com.example.compilers.model.Submission;
import com.example.compilers.repository.SubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin("*")
@RestController
//@RequestMapping("/compiler")
public class SubmissionController {
    private final SubmissionRepository repo;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String TOPIC = "submissions";

    public SubmissionController(SubmissionRepository repo, KafkaTemplate<String, String> kafkaTemplate) {
        this.repo = repo; this.kafkaTemplate = kafkaTemplate;
    }

    record SubmitRequest(String questionId,String language, String source_code, String stdin, String expectedoutput) {}

    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody SubmitRequest req) {
        Submission s = new Submission(req.language, req.source_code, req.stdin, req.expectedoutput);
        s = repo.save(s);
        // publish submission id to Kafka
        kafkaTemplate.send(TOPIC, s.getId());
        return ResponseEntity.ok().body(java.util.Map.of("submissionId", s.getId()));
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<?> result(@PathVariable String id) {
        Optional<Submission> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(opt.get());
    }
}