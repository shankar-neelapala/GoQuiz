package com.project.Backend.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.kafka.KafkaProducerService;
import com.project.Backend.model.Students;
import com.project.Backend.model.Teachers;
import com.project.Backend.service.SuperAdminService;

@RequestMapping("/super-admin")
@RestController
public class SuperAdminController {

	private final KafkaProducerService kafkaProducerService;
	
	@Autowired
	private ObjectMapper objectMapper;
	 
	@Autowired
	private SuperAdminService superAdminService;
	
	public SuperAdminController(KafkaProducerService kafkaProducerService, ObjectMapper objectMapper) {
		super();
		this.kafkaProducerService = kafkaProducerService;
		this.objectMapper = objectMapper;
	}



	@PostMapping("/create-student")
	public String createstu(@RequestParam("name") String name,@RequestParam("username") String username,@RequestParam("batch") String batch,@RequestParam("regulation") String regulation,@RequestParam("branch") String branch,@RequestParam("semester") String semester,@RequestParam("section") String section,@RequestParam(value="image",required = false) MultipartFile image,@RequestParam("role") String role) {
		try {
			 HashMap<String, Object> kafkaData = new HashMap<>();
		        kafkaData.put("name", name);
		        kafkaData.put("username", username);
		        kafkaData.put("batch", batch);
		        kafkaData.put("regulation", regulation);
		        kafkaData.put("branch", branch);
		        kafkaData.put("semester", semester);
		        kafkaData.put("section", section);
		        kafkaData.put("role", role);
		        if (image != null && !image.isEmpty()) {
		            kafkaData.put("image", Base64.getEncoder().encodeToString(image.getBytes()));
		        }
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("student-create-topic", jsonMessage);
		        return "Student creation request accepted";  
		}
		catch (Exception e) {
			e.printStackTrace();
	        return "Failed to enqueue student creation";
		}
		
	}
	
	
	@PostMapping("/create-teacher")
	public String createTeacher(@RequestParam("name") String name,@RequestParam("username") String username,@RequestParam("branch") String branch,@RequestParam("teachsub") List<String> teachsub,@RequestParam(value="image",required = false) MultipartFile image,@RequestParam("role") String role) {
		
		try {
			 HashMap<String, Object> kafkaData = new HashMap<>();
		        kafkaData.put("name", name);
		        kafkaData.put("username", username);
		        kafkaData.put("branch", branch);
		        kafkaData.put("teachsub", teachsub);
		        kafkaData.put("role", role);
		        if (image != null && !image.isEmpty()) {
		            kafkaData.put("image", Base64.getEncoder().encodeToString(image.getBytes()));
		        }
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
	            kafkaProducerService.sendMessage("employee-create-topic", jsonMessage);
		        return "employee creation request accepted";
		        
		}
		catch (Exception e) {
			e.printStackTrace();
	        return "Failed to enqueue teacher creation";
		}
	}
	
	@GetMapping("/get-students")
	public List<Students> getStudents(@RequestParam("batch") String batch, @RequestParam("branch") String branch, @RequestParam("semester") String sem, @RequestParam("section") String section){
		return superAdminService.getStudents(batch, branch, sem, section);
	}
	
	@GetMapping("/get-teachers")
	public List<Teachers> getFaculty(@RequestParam("branch") String branch){
		return superAdminService.getFaculty(branch);
	}
	
	@PutMapping("/update-student")
	public String updateStudent(@RequestBody Students stu) {
		return superAdminService.updateStudent(stu);
	}
}
