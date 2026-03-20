package com.project.Backend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.kafka.KafkaProducerService;
import com.project.Backend.model.Result;



@RestController
public class CommonFuncController {
	
	@Autowired
	private ObjectMapper objectMapper;
	
	private final KafkaProducerService kafkaProducerService;
	Map<String, List<Object>> getresult = new ConcurrentHashMap<>();
	Map<String, List<Object>> getschedule = new ConcurrentHashMap<>();
	
	public CommonFuncController(KafkaProducerService kafkaProducerService) {
	    this.kafkaProducerService = kafkaProducerService;
	}
	
	@KafkaListener(topics = "get-sturesult-response",groupId = "quiz-group")
	public void ReceiveGetExamResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	    	getresult.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/common/getresults")
	public List<Object> getresults(@RequestParam("batch") String batch,@RequestParam("branch") String branch,@RequestParam("coursecode") String code,@RequestParam("exam_type") String type,@RequestParam("semester") String semester,@RequestParam("section") String section,@RequestParam("username") String u) {
		String reqId = UUID.randomUUID().toString();
	    HashMap<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
        kafkaData.put("batch", batch);
        kafkaData.put("branch", branch);
        kafkaData.put("coursecode", code);
        kafkaData.put("examtype", type);
        kafkaData.put("semester", semester);
        kafkaData.put("section", section);
        kafkaData.put("username", u);
		String jsonMessage;
		try {
			jsonMessage = objectMapper.writeValueAsString(kafkaData);
			kafkaProducerService.sendMessage("get-sturesult-topic", jsonMessage);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!getresult.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (getresult.containsKey(reqId)) {
	    	List<Object> response = getresult.get(reqId);
	    	return (List<Object>) response;
	    }
	    else {
	    	return null;
	    }
	}
	
	@PostMapping("/common/uploadresults")
	public String uploadresults(@RequestBody Result r) {
	    try {
	        HashMap<String, Object> kafkaData = new HashMap<>();
	        kafkaData.put("branch", r.getBranch());
	        kafkaData.put("batch", r.getBatch());
	        kafkaData.put("coursecode", r.getCoursecode());
	        kafkaData.put("examtype", r.getExamType());
	        kafkaData.put("section", r.getSection());
	        kafkaData.put("semester", r.getSemester());
	        kafkaData.put("username", r.getUsername());
	        kafkaData.put("originalans", r.getOriginalans());
	        kafkaData.put("attemptedans", r.getAttemptedans());
	        kafkaData.put("status", r.getStatus());
	        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
	        kafkaProducerService.sendMessage("upload-result-topic", jsonMessage);

	        return "successfully result uploaded";
	    } catch (Exception e) {
	        e.printStackTrace();
	        return "Failed to upload result";
	    }
	}

	
	@KafkaListener(topics = "get-schedule-response",groupId = "quiz-group")
	public void ReceiveGetScheduleResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	    	getschedule.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/common/getschedule")
	public List<Object> getschedule(@RequestParam("branch") String branch,@RequestParam("semester") String semester){
		String reqId = UUID.randomUUID().toString();
	    HashMap<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
        kafkaData.put("branch", branch);
        kafkaData.put("semester", semester);
		String jsonMessage;
		try {
			jsonMessage = objectMapper.writeValueAsString(kafkaData);
			kafkaProducerService.sendMessage("get-schedule-topic", jsonMessage);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!getschedule.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (getschedule.containsKey(reqId)) {
	    	List<Object> response = getschedule.get(reqId);
	    	return  response;
	    }
	    else {
	    	return null;
	    }
	}
}
