package com.example.compilers.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.compilers.repository.SubmissionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class SubmissionConsumer {

    private final SubmissionRepository repo;
    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // Judge0 endpoint
    private final String JUDGE0_URL = "http://localhost:2358/submissions?base64_encoded=true&wait=true";

    public SubmissionConsumer(SubmissionRepository repo) {
        this.repo = repo;
    }

    @KafkaListener(topics = "submissions", groupId = "compiler-group")
    public void consume(String submissionId) {
        repo.findById(submissionId).ifPresent(submission -> {
            try {
                submission.setStatus("RUNNING");
                repo.save(submission);

                Integer langId = mapLang(submission.getLanguage());

                // Base64 encode source code and stdin
                String encodedSource = Base64.getEncoder()
                        .encodeToString(submission.getSourceCode().getBytes(StandardCharsets.UTF_8));
                String encodedStdin = Base64.getEncoder()
                        .encodeToString((submission.getStdin() == null ? "" : submission.getStdin())
                                .getBytes(StandardCharsets.UTF_8));
                String encodedExpectedOutput = Base64.getEncoder()
                        .encodeToString((submission.getExpectedOutput() == null ? "" : submission.getExpectedOutput())
                                .getBytes(StandardCharsets.UTF_8));

                // Build JSON
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

                // Decode output fields safely
                String decodedResult = decodeAllBase64Fields(response.getBody());

                submission.setStatus("DONE");
                submission.setResultJson(decodedResult);
                repo.save(submission);

            } catch (Exception e) {
                submission.setStatus("ERROR");
                submission.setResultJson("Error: " + e.getMessage());
                repo.save(submission);
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

    /**
     * Decode Judge0 response fields if they are base64
     */
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

    /**
     * Decode field only if it is valid base64
     */
    private void decodeField(ObjectNode obj, String fieldName) {
        if (obj.has(fieldName) && !obj.get(fieldName).isNull()) {
            String value = obj.get(fieldName).asText().replaceAll("\\s", "");
                try {
                    byte[] decodedBytes = Base64.getDecoder().decode(value);
                    obj.put(fieldName, new String(decodedBytes, StandardCharsets.UTF_8));
                } catch (IllegalArgumentException ignored) {
                    // Not valid base64, leave as-is
                }
        }
    }
}
