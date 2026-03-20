package com.project.Backend.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CodeExecutionService {

    private final String JUDGE0_URL = "http://localhost:2359/submissions/?wait=true";

    public String executeCode(String sourceCode, int languageId, String stdin) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("source_code", sourceCode);
        body.put("language_id", languageId);
        if (stdin != null && !stdin.isEmpty()) {
            body.put("stdin", stdin);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response =
                restTemplate.exchange(JUDGE0_URL, HttpMethod.POST, entity, String.class);

        return response.getBody();
    }
}



