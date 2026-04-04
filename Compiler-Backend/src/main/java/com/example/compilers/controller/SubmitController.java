package com.example.compilers.controller;

import com.example.compilers.model.Submission;
import com.example.compilers.repository.SubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin("*")
@RestController
public class SubmitController {
    private final SubmissionRepository repo;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String TOPIC = "submit-submissions";

    public SubmitController(SubmissionRepository repo, KafkaTemplate<String, String> kafkaTemplate) {
        this.repo = repo;
        this.kafkaTemplate = kafkaTemplate;
    }

    record SubmitRequest(
        String questionId,
        String language,
        String source_code,
        String stdin,
        String expectedoutput,
        String username,
        String batch,
        String branch,
        String semester,
        String coursecode,
        String examType,
        String section,
        String question_title
    ) {}

    @PostMapping("/submit-code")
    public ResponseEntity<?> submit(@RequestBody SubmitRequest req) {
        Submission s = new Submission(req.questionId(), req.language(), req.source_code(), req.stdin(), req.expectedoutput());
        s.setUsername(req.username());
        s.setBatch(req.batch());
        s.setBranch(req.branch());
        s.setSemester(req.semester());
        s.setCoursecode(req.coursecode());
        s.setExamType(req.examType());
        s.setSection(req.section());
        s.setQuestionTitle(req.question_title());
        s.setSourceCode(req.source_code());
        s.setLanguage(req.language());
        s = repo.save(s);
        kafkaTemplate.send(TOPIC, s.getId());
        return ResponseEntity.ok().body(java.util.Map.of("submissionId", s.getId()));
    }

    @GetMapping("/submit-result/{id}")
    public ResponseEntity<?> result(@PathVariable String id) {
        Optional<Submission> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(opt.get());
    }
}
