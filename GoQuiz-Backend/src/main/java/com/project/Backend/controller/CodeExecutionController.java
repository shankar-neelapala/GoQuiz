package com.project.Backend.controller;




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.project.Backend.service.CodeExecutionService;

import java.util.Map;

@RestController
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    public String execute(@RequestBody Map<String, Object> payload) {
        String sourceCode = (String) payload.get("sourceCode");
        int languageId = (int) payload.get("languageId");
        String stdin = payload.get("stdin") != null ? (String) payload.get("stdin") : "";

        return codeExecutionService.executeCode(sourceCode, languageId, stdin);
    }
}

