package com.project.Backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.model.Schedule;
import com.project.Backend.repository.ScheduleRepo;

@Service
public class AdminServiceConsumer {
	
	private final ScheduleRepo sr;
	
	@Autowired
	private KafkaTemplate<String, Object> kafkaTemplate;
	
	@Autowired
    private ObjectMapper objectMapper;
	
	public AdminServiceConsumer(ScheduleRepo sr) {
		super();
		this.sr = sr;
	}

	@KafkaListener(topics = "admin-getschedule-topic", groupId = "quiz-group")
	public void getschedule(String message) {
		
		Map<String, Object> data;
		try {
			data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String branch = (String) data.get("branch");
			String coursecode = (String) data.get("coursecode");
			String examtype = (String) data.get("examtype");
			String semester = (String) data.get("semester");
			String subject = (String) data.get("subject");
			List<Schedule> s = sr.findByBranchAndSemesterAndCoursecodeAndSubjectAndExamtype(branch,semester,coursecode,subject,examtype);
			String jsonResponse = objectMapper.writeValueAsString(s);
			kafkaTemplate.send("admin-getschedule-response",reqId,jsonResponse);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}

	@KafkaListener(topics = "admin-updateschedule-topic", groupId = "quiz-group")
	public void updateschedule(String message) {	
		try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Schedule s = new Schedule();
	        Schedule sc = objectMapper.readValue(message, Schedule.class);
	        s.setId(sc.getId());
			s.setBranch(sc.getBranch());
			s.setExamtype(sc.getExamtype());
			s.setSemester(sc.getSemester());
			s.setCoursecode(sc.getCoursecode());
			s.setSubject(sc.getSubject());
			s.setDate(sc.getDate());
			s.setStartTime(sc.getStartTime());
			s.setEndTime(sc.getEndTime());
			sr.save(s);
			String jsonResponse = "sucessfully schedule updated";
			kafkaTemplate.send("admin-updateschedule-response",s.getId(),jsonResponse);
	    } catch (Exception e) {
	    	try {
		    	Schedule sc = objectMapper.readValue(message, Schedule.class);
		    	String jsonResponse = "error occured";
				kafkaTemplate.send("admin-updateschedule-response",sc.getId(),jsonResponse);
	    	}
	    	catch(Exception e1) {
	    		e1.printStackTrace();
	        }
	    }
	}
	
	
}
