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
import com.project.Backend.model.Schedule;
import com.project.Backend.repository.ScheduleRepo;

@RestController
public class AdminController {
	
	Map<String, List<Object>> getadminexamsche = new ConcurrentHashMap<>();
	Map<String, String> scheupdate = new ConcurrentHashMap<>();
	private final KafkaProducerService kafkaProducerService;
	
	@Autowired
    private ObjectMapper objectMapper;
	
	
	public AdminController(KafkaProducerService kafkaProducerService, ScheduleRepo sr) {
		super();
		this.kafkaProducerService = kafkaProducerService;
	}
	
	@KafkaListener(topics = "admin-getschedule-response",groupId = "quiz-group")
	public void ReceiveGetExamResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	    	getadminexamsche.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}

	@GetMapping("/admin/getschedule")
	public List<Object> getschedule(@RequestParam("branch") String branch,@RequestParam("semester") String semester,@RequestParam("coursecode") String coursecode,@RequestParam("subject") String subject,@RequestParam("exam_type") String exam_type) {
		String reqId = UUID.randomUUID().toString();
		try {
				HashMap<String, Object> kafkaData = new HashMap<>();
			 	kafkaData.put("id", reqId);
		        kafkaData.put("branch", branch);
		        kafkaData.put("semester", semester);
		        kafkaData.put("coursecode", coursecode);
		        kafkaData.put("subject", subject);
		        kafkaData.put("examtype", exam_type);
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("admin-getschedule-topic", jsonMessage);  
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!getadminexamsche.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (getadminexamsche.containsKey(reqId)) {
	    	List<Object> response = getadminexamsche.get(reqId);
	    	return response;
	    }
	    else {
	    	return null;
	    }
	}
	
	
	@KafkaListener(topics = "admin-updateschedule-response",groupId = "quiz-group")
	public void ReceiveUpdateScheduleResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	String data = json;
	    	scheupdate.put(reqId, data);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}
	
	
	@PostMapping("/admin/updateschedule")
	public String updateschedule(@RequestBody Schedule sc) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(sc);
			kafkaProducerService.sendMessage("admin-updateschedule-topic", jsonMessage);
			}
		catch(Exception e) {
				e.printStackTrace();
			}
		int waitTime=0;
	    while(!scheupdate.containsKey(sc.getId()) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (scheupdate.containsKey(sc.getId())) {
	    	String response = scheupdate.get(sc.getId());
	    	return response;
	    }
	    else {
	    	return null;
	    }
	}
}
