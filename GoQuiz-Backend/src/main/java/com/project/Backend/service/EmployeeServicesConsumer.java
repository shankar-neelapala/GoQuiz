package com.project.Backend.service;

import java.io.IOException;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.model.Questions;
import com.project.Backend.model.Regulation;
import com.project.Backend.model.Result;
import com.project.Backend.model.Schedule;
import com.project.Backend.model.Subjects;
import com.project.Backend.model.Teachers;
import com.project.Backend.repository.QuestionsRepo;
import com.project.Backend.repository.RegulationRepo;
import com.project.Backend.repository.ResultRepo;
import com.project.Backend.repository.ScheduleRepo;
import com.project.Backend.repository.SubjectsRepo;
import com.project.Backend.repository.TeacherRepo;
import com.project.Backend.security.JwtUtil;

@Service
public class EmployeeServicesConsumer {
	
	@Value("${imgbb.api.key}")
    private String imgbbApiKey;
	
	@Autowired
	private KafkaTemplate<String, Object> kafkaTemplate;
	
	private final ObjectMapper objectMapper = new ObjectMapper();
    private final TeacherRepo teacherrepo;
    private final CommonFuncServicesConsumer cfsc;
    private final RegulationRepo rr;
    private final ResultRepo rr1;
    private final SubjectsRepo sr;
    private final QuestionsRepo qr;
    private final ScheduleRepo schr;
    
    public EmployeeServicesConsumer(TeacherRepo teacherrepo,CommonFuncServicesConsumer cfsc,RegulationRepo rr,ResultRepo rr1,SubjectsRepo sr,QuestionsRepo qr,ScheduleRepo schr) {
        this.teacherrepo = teacherrepo;
        this.cfsc = cfsc;
        this.rr = rr;
        this.rr1 = rr1;
        this.sr=sr;
        this.qr=qr;
        this.schr=schr;
    }
	
    @KafkaListener(topics = "employee-create-topic", groupId = "quiz-group")
    public void createemp(String message) {
        try {
            Map<String, Object> data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});

            Teachers t = new Teachers();
            t.setName((String) data.get("name"));
            t.setUsername((String) data.get("username"));
            t.setBranch((String) data.get("branch"));
            t.setTeachsubjects((List<String>) data.get("teachsub"));
            t.setRole((String) data.get("role"));

            if (data.containsKey("image")) {
                String base64Image = (String) data.get("image");
                MultipartFile file = base64ToMultipartFile(base64Image, "employee.jpg");
                String imageUrl = cfsc.uploadImage(file, imgbbApiKey);
                t.setImage(imageUrl);
            }

            teacherrepo.save(t);
            System.out.println("Employee created successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private MultipartFile base64ToMultipartFile(String base64, String filename) throws IOException {
	    byte[] decoded = Base64.getDecoder().decode(base64);
	    return new MockMultipartFile(filename, filename, "image/jpeg", decoded);
	}

	
    @KafkaListener(topics = "emplogin-request-topic", groupId = "quiz-group")
	public void loginemp(String message) {
    	Map<String, Object> data;
    	try {
    		data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String username = (String) data.get("username");
			String password = (String) data.get("password");
			List<Teachers> t = teacherrepo.findByUsernameAndPassword(username, password);
		if(!t.isEmpty()) {  //if document is present
				Teachers teacher = t.get(0);        
				String role = teacher.getRole();
				JwtUtil jw = new JwtUtil();
				HashMap<String,Object> hm = new HashMap<>();
				//String r = (String) t.get("role");
				hm.put("token", jw.generateToken(username,role));
				hm.put("details", t);
				try {
					String json = objectMapper.writeValueAsString(hm);
					kafkaTemplate.send("employee-login-response",reqId,json);
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				} 
		}
		else {
		    Map<String, Object> errorResponse = Map.of(
		        "error", "Invalid credentials"
		    );
		    String json = objectMapper.writeValueAsString(errorResponse);
		    kafkaTemplate.send("employee-login-response", reqId, json);
		}
		}
    	catch(Exception e) {
    		e.printStackTrace();
    	}
	}
	
    @KafkaListener(topics = "check-eligible-topic", groupId = "quiz-group")
	public void checkeligibility(String message) {
		Map<String, Object> data;
		try {
			data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String username = (String) data.get("username");
			String coursecode = (String) data.get("coursecode");
			Teachers u = teacherrepo.findByUsernameAndTeachsubjects(username,coursecode);
			if(u!=null) {
				HashMap<String,Object> hm = new HashMap<>();
				hm.put("id",reqId);
				hm.put("output","eligible");
				try {
					String json = objectMapper.writeValueAsString(hm);
					kafkaTemplate.send("check-eligible-topic-response",reqId,json);
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			}
			else {
				HashMap<String,Object> hm = new HashMap<>();
				hm.put("id",reqId);
				hm.put("output","noteligible");
				try {
					String json = objectMapper.writeValueAsString(hm);
					kafkaTemplate.send("check-eligible-topic-response",reqId,json);
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			}
		}
		catch(Exception e) {
			return;
		}
	}
	
	@KafkaListener(topics = "set-regulation-topic", groupId = "quiz-group")
	public void setregulation(String message) {
	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Regulation reg = objectMapper.readValue(message, Regulation.class);
	        rr.save(reg);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}
	
	@KafkaListener(topics = "get-regulation-topic", groupId = "quiz-group")
    public void getRegulation(String message) {
		Map<String, Object> data;
        try {
        	data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String batch = (String) data.get("batch");
			String branch = (String) data.get("branch");

            List<Regulation> result = rr.findByBatchAndBranch(batch, branch);

            // Serialize response
            String responseJson = objectMapper.writeValueAsString(result);

            // Send back to response topic with same key (reqId)
            kafkaTemplate.send("get-regulation-topic-response", reqId, responseJson);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
	
	@KafkaListener(topics = "post-subjects-topic", groupId = "quiz-group")
	public void postsubjects(String message) {
		try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Subjects sub = objectMapper.readValue(message, Subjects.class);
	        sr.save(sub);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}
	
	@KafkaListener(topics = "get-subject-topics", groupId = "quiz-group")
    public void getSubjects(String message) {
		Map<String, Object> data;
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            String reqId = (String) data.get("id");
            String reg = (String) data.get("regulation");
            String branch = (String) data.get("branch");
            String sem = (String) data.get("semester");
            List<Subjects> result = sr.findByRegulationAndBranchAndSemester(reg, branch, sem);
            String responseJson = objectMapper.writeValueAsString(result);
            kafkaTemplate.send("get-subject-topic-response", reqId, responseJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
	
	@KafkaListener(topics = "add-question-topic", groupId = "quiz-group")
	public void createquestion(String message) {
		try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Questions que = objectMapper.readValue(message, Questions.class);
	        que.setQueformate(que.getQueformate());
	        que.setBatch(que.getBatch());
			que.setExam_type(que.getExam_type());
			que.setBranch(que.getBranch());
			que.setSemester(que.getSemester());
			que.setCoursecode(que.getCoursecode());
			que.setQuestion_no(que.getQuestion_no());
			que.setQuestion(que.getQuestion().trim());
			List<String> options = que.getOptions();
		    options.replaceAll(String::trim);
		    que.setOptions(options);
		    que.setAnswer(que.getAnswer().trim());
	        qr.save(que);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	@KafkaListener(topics = "update-question-topic", groupId = "quiz-group")
	public void updateQuestion(String message) {
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        JsonNode root = objectMapper.readTree(message);
	        
	        // Extract request ID and question object from the message
	        String reqId = root.get("id").asText();
	        JsonNode questionNode = root.get("question");

	        Questions q = objectMapper.treeToValue(questionNode, Questions.class);

	        Optional<Questions> optional = qr.findById(q.getId());
	        int result;

	        if (optional.isPresent()) {
	            Questions existing = optional.get();
	            existing.setBatch(q.getBatch());
	            existing.setExam_type(q.getExam_type());
	            existing.setBranch(q.getBranch());
	            existing.setSemester(q.getSemester());
	            existing.setQuestion_no(q.getQuestion_no());
	            existing.setQuestion(q.getQuestion().trim());

	            List<String> options = q.getOptions();
	            if (options != null) {
	                options.replaceAll(String::trim);
	                existing.setOptions(options);
	            }

	            existing.setAnswer(q.getAnswer().trim());

	            qr.save(existing);
	            result = 1;
	        } else {
	            result = 2;
	        }

	        kafkaTemplate.send("update-question-topic-response", reqId, String.valueOf(result));

	    } catch (Exception e) {
	        e.printStackTrace();

	        // You may not have a reqId here, so log it at least
	        kafkaTemplate.send("update-question-topic-response", null, "-1");
	    }
	}

	
	@KafkaListener(topics = "get-question-topic", groupId = "quiz-group")
    public void getQuestions(String message) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode root = objectMapper.readTree(message);
            String reqId = root.get("id").asText();
            String year = root.get("batch").asText();
            String branch = root.get("branch").asText();
            String code = root.get("coursecode").asText();
            String type = root.get("exam_type").asText();
            List<Questions> questions = qr.findQuestions(year, type, branch, code);
            String responseJson = objectMapper.writeValueAsString(questions);
            kafkaTemplate.send("get-question-topic-response", reqId, responseJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
	
	@KafkaListener(topics = "get-noofqueposted-topic", groupId = "quiz-group")
    public void handleGetNoOfQuePosted(String message) {
        try {
            Map<String, Object> data = objectMapper.readValue(message, new TypeReference<>() {});
            String reqId = (String) data.get("id");
            String batch = (String) data.get("batch");
            String branch = (String) data.get("branch");
            String coursecode = (String) data.get("coursecode");
            String examtype = (String) data.get("examtype");
            List<Questions> questions = qr.findQuestions(batch,examtype, branch, coursecode);
            int count = questions.size();
            String jsonResponse = objectMapper.writeValueAsString(count);
            kafkaTemplate.send("get-noofqueposted-response", reqId, jsonResponse);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
	
	@KafkaListener(topics = "delete-question-topic", groupId = "quiz-group")
	public void deleteQuestion(String message) {
		try {
			if(qr.existsById(message)) {
				qr.deleteById(message);
			}
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}

	@KafkaListener(topics = "add-schedule-topic", groupId = "quiz-group")
	public void addschedule(String message) {
		try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Schedule s = objectMapper.readValue(message, Schedule.class);
	        schr.save(s);
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}
	
	@KafkaListener(topics = "all-sturesults-topic", groupId = "quiz-group")
	public void getresultswithoutusername(String message) {
		Map<String, Object> data;
		try {
			data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
			String reqId = (String) data.get("id");
			String batch = (String) data.get("batch");
			String branch = (String) data.get("branch");
			String coursecode = (String) data.get("coursecode");
			String examtype = (String) data.get("examtype");
			String semester = (String) data.get("semester");
			String section = (String) data.get("section");
			List<Result>  res = rr1.findByBatchAndBranchAndCoursecodeAndExamTypeAndSemesterAndSection(batch, branch, coursecode, examtype, semester, section);
			res.sort(Comparator.comparing(Result::getUsername));
			String jsonResponse = objectMapper.writeValueAsString(res);
			kafkaTemplate.send("all-sturesults-response",reqId,jsonResponse);
		}
		catch(Exception e) {
			e.printStackTrace();
		}
	}
}
