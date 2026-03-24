package com.example.compilers.service;

import java.nio.charset.StandardCharsets;
import java.util.*;

import org.springframework.http.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.compilers.model.*;
import com.example.compilers.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class SubmitConsumer {

    private final SubmissionRepository submissionRepo;
    private final QuestionRepository questionRepo;
    private final ResultRepository resultRepo;
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private final String JUDGE0_URL = "http://localhost:2358/submissions?base64_encoded=true&wait=true";

    public SubmitConsumer(SubmissionRepository submissionRepo,
                          QuestionRepository questionRepo,
                          ResultRepository resultRepo) {
        this.submissionRepo = submissionRepo;
        this.questionRepo = questionRepo;
        this.resultRepo = resultRepo;
    }

    @KafkaListener(topics = "submit-submissions", groupId = "submit-group")
    public void consume(String submissionId) {
        submissionRepo.findById(submissionId).ifPresent(submission -> {
            try {
                submission.setStatus("RUNNING");
                submissionRepo.save(submission);

                // Fetch question by questionId stored in submission
                CodingQuestion question = questionRepo.findById(submission.getQuestionId()).orElse(null);
                if (question == null) {
                    submission.setStatus("ERROR");
                    submission.setResultJson("Error: Question not found for id: " + submission.getQuestionId());
                    submissionRepo.save(submission);
                    return;
                }

                int langId = mapLang(submission.getLanguage());
                List<String> testCases = question.getTestCases();
                List<String> expectedOutputs = question.getTestCasesOutput();

                int total = testCases != null ? testCases.size() : 0;
                int correct = 0;
                List<Map<String, Object>> results = new ArrayList<>();

                for (int i = 0; i < total; i++) {
                    String input = testCases.get(i);
                    String expected = expectedOutputs.get(i);

                    String encodedSource = Base64.getEncoder().encodeToString(submission.getSourceCode().getBytes(StandardCharsets.UTF_8));
                    String encodedStdin = Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
                    String encodedExpectedOutput = Base64.getEncoder().encodeToString(expected.getBytes(StandardCharsets.UTF_8));

                    String jsonBody = mapper.writeValueAsString(Map.of(
                            "source_code", encodedSource,
                            "language_id", langId,
                            "stdin", encodedStdin,
                            "expected_output", encodedExpectedOutput
                    ));

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                    ResponseEntity<String> response = rest.postForEntity(JUDGE0_URL, entity, String.class);
                    String decodedResult = decodeAllBase64Fields(response.getBody());

                    JsonNode node = mapper.readTree(decodedResult);
                    String stdout = node.has("stdout") ? node.get("stdout").asText().trim() : "";
                    boolean passed = stdout.equals(expected.trim());

                    if (passed) correct++;

                    results.add(Map.of(
                            "testcase", i + 1,
                            "input", input,
                            "expected", expected,
                            "output", stdout,
                            "passed", passed
                    ));
                }

                double marks = total > 0 ? question.getMarks() * ((double) correct / total) : 0;

                // Update submission status
                submission.setResultJson(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(results));
                submission.setStatus("DONE");
                submissionRepo.save(submission);

                // Save exam result - student data comes from the submission itself
                Result result = new Result();
                result.setBatch(submission.getBatch());
                result.setBranch(submission.getBranch());
                result.setSemester(submission.getSemester());
                result.setCoursecode(submission.getCoursecode());
                result.setExamType(submission.getExamType());
                result.setSection(submission.getSection());
                result.setUsername(submission.getUsername());
                result.setQuestion_title(submission.getQuestionTitle());
                result.setSource_code(submission.getSourceCode());
                result.setMarks(marks);
                result.setStatus(correct == total ? "ACCEPTED" : "PARTIAL");

                resultRepo.save(result);

            } catch (Exception e) {
                submission.setStatus("ERROR");
                submission.setResultJson("Error: " + e.getMessage());
                submissionRepo.save(submission);
            }
        });
    }

    private Integer mapLang(String lang) {
        if (lang == null) return 71;
        return switch (lang.toLowerCase()) {
            case "c" -> 50;
            case "cpp", "c++" -> 54;
            case "java" -> 62;
            case "python", "python3" -> 71;
            default -> 71;
        };
    }

    private String decodeAllBase64Fields(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            if (!(root instanceof ObjectNode obj)) return json;
            decodeField(obj, "stdout");
            decodeField(obj, "stderr");
            decodeField(obj, "compile_output");
            decodeField(obj, "message");
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
        } catch (Exception e) {
            return "Error decoding Judge0 response: " + e.getMessage() + "\nRaw: " + json;
        }
    }

    private void decodeField(ObjectNode obj, String fieldName) {
        if (obj.has(fieldName) && !obj.get(fieldName).isNull()) {
            String value = obj.get(fieldName).asText().replaceAll("\\s", "");
            try {
                byte[] decodedBytes = Base64.getDecoder().decode(value);
                obj.put(fieldName, new String(decodedBytes, StandardCharsets.UTF_8));
            } catch (IllegalArgumentException ignored) {}
        }
    }
}
