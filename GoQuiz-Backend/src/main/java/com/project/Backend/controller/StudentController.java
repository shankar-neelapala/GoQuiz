package com.project.Backend.controller;

import java.io.IOException;
import java.util.Base64;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.kafka.KafkaConsumerService;
import com.project.Backend.kafka.KafkaProducerService;
import com.project.Backend.model.QuesAndAnsProgress;
import com.project.Backend.model.Subjects;
import com.project.Backend.repository.QuestionsRepo;
import com.project.Backend.repository.ScheduleRepo;
import com.project.Backend.repository.StudentRepo;
import com.project.Backend.service.StudentServicesConsumer;



//@CrossOrigin(
//"*"
////origins = "http://localhost:3000",
////allowedHeaders = "*",
////exposedHeaders = "Authorization",
////allowCredentials = "true"
//)

@RestController
public class StudentController {
	
    private final KafkaProducerService kafkaProducerService;
    Map<String, Map<String, Object>> responseMap = new ConcurrentHashMap<>();
    Map<String, List<Object>> getexam = new ConcurrentHashMap<>();
    Map<String, List<Object>> getexamque = new ConcurrentHashMap<>();

    
    @Autowired
    private ObjectMapper objectMapper;

    public StudentController(KafkaProducerService kafkaProducerService,
    						 KafkaConsumerService kafkaconsumerservice,
                             StudentServicesConsumer stus,
                             StudentRepo sturepo,
                             ScheduleRepo schr,
                             QuestionsRepo qr) {
    	this.kafkaProducerService = kafkaProducerService;
    }
	
	
//	@PostMapping("/noauth/createstu")
//	public String createstu(@RequestParam("name") String name,@RequestParam("username") String username,@RequestParam("batch") String batch,@RequestParam("regulation") String regulation,@RequestParam("branch") String branch,@RequestParam("semester") String semester,@RequestParam("section") String section,@RequestParam(value="image",required = false) MultipartFile image,@RequestParam("role") String role) {
//		try {
//			 HashMap<String, Object> kafkaData = new HashMap<>();
//		        kafkaData.put("name", name);
//		        kafkaData.put("username", username);
//		        kafkaData.put("batch", batch);
//		        kafkaData.put("regulation", regulation);
//		        kafkaData.put("branch", branch);
//		        kafkaData.put("semester", semester);
//		        kafkaData.put("section", section);
//		        kafkaData.put("role", role);
//		        if (image != null && !image.isEmpty()) {
//		            kafkaData.put("image", Base64.getEncoder().encodeToString(image.getBytes()));
//		        }
//		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
//				kafkaProducerService.sendMessage("student-create-topic", jsonMessage);
//		        return "Student creation request accepted";  
//		}
//		catch (Exception e) {
//			e.printStackTrace();
//	        return "Failed to enqueue student creation";
//		}
//		
//	}
	 
	@KafkaListener(topics = "student-login-response",groupId = "quiz-group")
	public void ReceiveLoginResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	        responseMap.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@PostMapping("/noauth/loginstu")
	public Map<String, Object> loginstu(@RequestParam("username") String username,@RequestParam("password") String password) {
	    String reqId = UUID.randomUUID().toString();
	    HashMap<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
        kafkaData.put("username", username.toUpperCase().trim());
        kafkaData.put("password", password);
		String jsonMessage;
		try {
			jsonMessage = objectMapper.writeValueAsString(kafkaData);
			kafkaProducerService.sendMessage("stulogin-request-topic", jsonMessage);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	    int waitTime=0;
	    while(!responseMap.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (responseMap.containsKey(reqId)) {
	    	Map<String, Object> response = responseMap.get(reqId);
	    	return response;
	    }
	    else {
	    	return null;
	    }
	}
	
	
	@KafkaListener(topics = "get-exam-response",groupId = "quiz-group")
	public void ReceiveGetExamResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	    	getexam.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/student/getexams")
	public List<Object> getexams(@RequestParam("branch") String branch,@RequestParam("semester") String semester,@RequestParam("date") String date){
		String reqId = UUID.randomUUID().toString();
		try {
				HashMap<String, Object> kafkaData = new HashMap<>();
			 	kafkaData.put("id", reqId);
		        kafkaData.put("branch", branch);
		        kafkaData.put("semester", semester);
		        kafkaData.put("date", date);
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("get-exams-topic", jsonMessage);  
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!getexam.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (getexam.containsKey(reqId)) {
	        List<Object> response = getexam.get(reqId);
	        return response;
	    } else {
	        return null;
	    }


	}
	
	
	@KafkaListener(topics = "get-examque-response",groupId = "quiz-group")
	public void ReceiveGetExamQuestionsResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	        getexamque.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/student/examquestions")
	public List<Object> findallexamquestions(@RequestParam("username") String username ,@RequestParam("batch") String year,@RequestParam("branch") String branch,@RequestParam("coursecode") String code,@RequestParam("examtype") String type)
	{
		String reqId = UUID.randomUUID().toString();
		try {
				HashMap<String, Object> kafkaData = new HashMap<>();
			 	kafkaData.put("id", reqId);
			 	kafkaData.put("username", username);
			 	kafkaData.put("batch",year );
		        kafkaData.put("branch", branch);
		        kafkaData.put("coursecode", code);
		        kafkaData.put("examtype", type);
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("get-examsque-topic", jsonMessage);  
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!getexamque.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (getexamque.containsKey(reqId)) {
	        List<Object> response = getexamque.get(reqId);
	        return  response;
	    } else {
	        return null;
	    }
	}
	

	@PutMapping("/student/updateprogress")
	public void updateprogress(@RequestBody QuesAndAnsProgress p) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(p);
			kafkaProducerService.sendMessage("update-progress-topic", jsonMessage);}
			catch(Exception e) {
				e.printStackTrace();
			}
	}
}