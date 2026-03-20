package com.project.Backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.kafka.KafkaProducerService;
import com.project.Backend.model.Result;
import com.project.Backend.model.Schedule;
import com.project.Backend.repository.ResultRepo;
import com.project.Backend.repository.ScheduleRepo;

@Service
public class CommonFuncServicesConsumer {
	
	@Autowired
	private KafkaTemplate<String, Object> kafkaTemplate;
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final KafkaProducerService kafkaProducerService;
	private final ResultRepo rr;
	private final ScheduleRepo schr;
	
	
	public CommonFuncServicesConsumer(KafkaProducerService kafkaProducerService,ResultRepo rr,ScheduleRepo schr) {
		super();
		this.kafkaProducerService = kafkaProducerService;
		this.rr = rr;
		this.schr = schr;
	}


	public String uploadImage(MultipartFile file, String imgbbApiKey) {
        try {
            byte[] bytes = file.getBytes();
            String encodedImage = Base64.getEncoder().encodeToString(bytes);
            HttpClient httpClient = HttpClients.createDefault();
            HttpPost httpPost = new HttpPost("https://api.imgbb.com/1/upload");
            List<NameValuePair> params = new ArrayList<>();
            params.add(new BasicNameValuePair("key", imgbbApiKey));
            params.add(new BasicNameValuePair("image", encodedImage));
            httpPost.setEntity(new UrlEncodedFormEntity(params));
            HttpResponse response = httpClient.execute(httpPost);
            String json = EntityUtils.toString(response.getEntity());
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            return root.path("data").path("image").path("url").asText();
        } catch (IOException e) {
            return null;
        }
    }
	
	@KafkaListener(topics = "get-sturesult-topic", groupId = "quiz-group")
	public void getresults(String message) {
		Map<String, Object> data;
		try {
			data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String batch = (String) data.get("batch");
			String branch = (String) data.get("branch");
			String code = (String) data.get("coursecode");
			String type = (String) data.get("examtype");
			String semester = (String) data.get("semester");
			String section = (String) data.get("section");
			String u = (String) data.get("username");
			List<Result> r = rr.findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSectionAndUsername(batch, branch, code, type, semester, section, u);
			String jsonResponse = objectMapper.writeValueAsString(r);
			kafkaTemplate.send("get-sturesult-response",reqId,jsonResponse);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	@KafkaListener(topics = "upload-result-topic", groupId = "quiz-group")
	public void uploadresults(String message) {
	    try {
	        Map<String, Object> data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
	        Result r = new Result();
	        r.setBatch((String) data.get("batch"));
	        r.setUsername((String) data.get("username"));
	        r.setBranch((String) data.get("branch"));
	        r.setSemester((String) data.get("semester"));
	        r.setCoursecode((String) data.get("coursecode"));
	        r.setExamType((String) data.get("examtype"));
	        r.setSection((String) data.get("section"));
	        List<String> originalans = (List<String>) data.get("originalans");
	        List<String> attemptedans = (List<String>) data.get("attemptedans");
	        r.setStatus((String) data.get("status"));
	        double marks = 0.0;
	        for (int i = 0; i < Math.min(originalans.size(), attemptedans.size()); i++) {
	            String origAns = originalans.get(i);
	            String attAns = attemptedans.get(i);
	            if (origAns != null && attAns != null && origAns.trim().equalsIgnoreCase(attAns.trim())) {
	                marks += 0.5;
	            }
	        }
	        r.setMarks(Math.ceil(marks));
	        rr.save(r);

	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	@KafkaListener(topics = "get-schedule-topic", groupId = "quiz-group")
	public void getschedule( String message) {
		
		Map<String, Object> data;
		try {
			data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String branch = (String) data.get("branch");
			String semester = (String) data.get("semester");
			List<Schedule> sh = schr.findByBranchAndSemester(branch,semester);
			String jsonResponse = objectMapper.writeValueAsString(sh);
			kafkaTemplate.send("get-schedule-response",reqId,jsonResponse);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}

	
}
