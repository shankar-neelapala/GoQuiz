package com.project.Backend.controller;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import com.project.Backend.kafka.KafkaProducerService;
import com.project.Backend.model.Questions;
import com.project.Backend.model.Regulation;
import com.project.Backend.model.Schedule;
import com.project.Backend.model.Subjects;


@RestController
public class EmployeeController {
	
	private final KafkaProducerService kafkaProducerService;
    Map<String, Map<String, Object>> responseMap = new ConcurrentHashMap<>();
    Map<String, Map<String, Object>> eligibleMap = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<List<Regulation>>> regulationMap = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<List<Subjects>>> subjectMap = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<Integer>> updateQuestionMap = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<List<Questions>>> questionMap = new ConcurrentHashMap<>();
	private final Map<String, List<Object>> allstures = new ConcurrentHashMap<>();
	private final Map<String, Object> noofque = new ConcurrentHashMap<>();
	
	@Autowired
	private ObjectMapper objectMapper;

	public EmployeeController(KafkaProducerService kafkaProducerService) {
	    this.kafkaProducerService = kafkaProducerService;
	}
	
//	@PostMapping("/noauth/createteacher")
//	public String createTeacher(@RequestParam("name") String name,@RequestParam("username") String username,@RequestParam("branch") String branch,@RequestParam("teachsub") List<String> teachsub,@RequestParam(value="image",required = false) MultipartFile image,@RequestParam("role") String role) {
//		
//		try {
//			 HashMap<String, Object> kafkaData = new HashMap<>();
//		        kafkaData.put("name", name);
//		        kafkaData.put("username", username);
//		        kafkaData.put("branch", branch);
//		        kafkaData.put("teachsub", teachsub);
//		        kafkaData.put("role", role);
//		        if (image != null && !image.isEmpty()) {
//		            kafkaData.put("image", Base64.getEncoder().encodeToString(image.getBytes()));
//		        }
//		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
//	            kafkaProducerService.sendMessage("employee-create-topic", jsonMessage);
//		        return "employee creation request accepted";
//		        
//		}
//		catch (Exception e) {
//			e.printStackTrace();
//	        return "Failed to enqueue teacher creation";
//		}
//	}
	
//	@GetMapping("/teacher/getteachers")
//	public List<Teachers> getTeachers(){
//		List<Teachers> u =teacherrepo.findAll();
//		return u;
//	}
//	
//	@GetMapping("/teacher/getstudents")
//	public List<Students> getStudents(){
//		List<Students> s =sturepo.findAll();
//		return s;
//	}
	
	@KafkaListener(topics = "employee-login-response",groupId = "quiz-group")
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
	
	@PostMapping("/noauth/loginemp")
	public Map<String,Object> loginemp(@RequestParam("username") String username,@RequestParam("password") String password) {
		String reqId = UUID.randomUUID().toString();
	    HashMap<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
        kafkaData.put("username", username.toUpperCase().trim());
        kafkaData.put("password", password);
		String jsonMessage;
		try {
			jsonMessage = objectMapper.writeValueAsString(kafkaData);
			kafkaProducerService.sendMessage("emplogin-request-topic", jsonMessage);
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
	
	@KafkaListener(topics = "check-eligible-topic-response",groupId = "quiz-group")
	public void checkeligibilityResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        Map<String, Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	        eligibleMap.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/teacher/checkeligibility")
	public Map<String, Object> checkeligibility(@RequestParam("username") String username,@RequestParam("coursecode") String coursecode) {
		String reqId = UUID.randomUUID().toString();
	    HashMap<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
        kafkaData.put("username", username);
        kafkaData.put("coursecode", coursecode);
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(kafkaData);
			kafkaProducerService.sendMessage("check-eligible-topic", jsonMessage);}
		catch(Exception e) {
				e.printStackTrace();
			}
		int waitTime=0;
	    while(!eligibleMap.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (eligibleMap.containsKey(reqId)) {
	    	Map<String, Object> response = eligibleMap.get(reqId);
	    	return response;
	    }
	    else {
	    	return null;
	    }
	}
	
	
	@PostMapping("/teacher/setregulation")
	public String setregulation(@RequestBody Regulation reg) {
		try {
		ObjectMapper objectMapper = new ObjectMapper();
		String jsonMessage = objectMapper.writeValueAsString(reg);
		kafkaProducerService.sendMessage("set-regulation-topic", jsonMessage);}
		catch(Exception e) {
			e.printStackTrace();
		}
		return "succesfully added";
	}
	
	
	@KafkaListener(topics = "get-regulation-topic-response", groupId = "quiz-group")
	public void getRegulationResponse(ConsumerRecord<String, String> record) {
	    String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        List<Regulation> data = objectMapper.readValue(json, new TypeReference<List<Regulation>>() {});
	        CompletableFuture<List<Regulation>> future = regulationMap.remove(reqId);
	        if (future != null) {
	            future.complete(data);
	        }
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}

	
	@GetMapping("/teacher/getregulation")
	public List<Regulation> getRegulation(@RequestParam("batch") String batch,
	                                      @RequestParam("branch") String branch) {
	    String reqId = UUID.randomUUID().toString();
	    Map<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
	    kafkaData.put("batch", batch);
	    kafkaData.put("branch", branch);
	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
	        kafkaProducerService.sendMessage("get-regulation-topic",jsonMessage);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return Collections.emptyList();
	    }
	    CompletableFuture<List<Regulation>> future = new CompletableFuture<>();
	    regulationMap.put(reqId, future);
	    try {
	        return future.get(5, TimeUnit.SECONDS);
	    } catch (TimeoutException e) {
	        regulationMap.remove(reqId);
	        return Collections.emptyList();
	    } catch (Exception e) {
	        regulationMap.remove(reqId);
	        return Collections.emptyList();
	    }
	}

	
	
	@PostMapping("/teacher/postsubjects")
	public String postsubjects(@RequestBody Subjects s) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(s);
			kafkaProducerService.sendMessage("post-subjects-topic", jsonMessage);}
			catch(Exception e) {
				e.printStackTrace();
			}
			return "succesfully subjects posted";
	}
	
	@KafkaListener(topics = "get-subject-topic-response", groupId = "quiz-group")
	public void getsubjectsres(ConsumerRecord<String, String> record) {
	    String reqId = record.key();
	    String json = record.value();

	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	        List<Subjects> result = objectMapper.readValue(json, new TypeReference<List<Subjects>>() {});
	        CompletableFuture<List<Subjects>> future = subjectMap.remove(reqId);
	        if (future != null) {
	            future.complete(result);
	        }
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}

	
	@GetMapping("/teacher/getsubjects")
	public List<Subjects> getSubjects(@RequestParam("regulation") String reg,
	                                  @RequestParam("branch") String branch,
	                                  @RequestParam("semester") String sem) {
	    String reqId = UUID.randomUUID().toString();

	    Map<String, Object> kafkaData = new HashMap<>();
	    kafkaData.put("id", reqId);
	    kafkaData.put("regulation", reg);
	    kafkaData.put("branch", branch);
	    kafkaData.put("semester", sem);

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
	        kafkaProducerService.sendMessage("get-subject-topics",jsonMessage);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return Collections.emptyList();
	    }

	    CompletableFuture<List<Subjects>> future = new CompletableFuture<>();
	    subjectMap.put(reqId, future); // store future for response

	    try {
	        return future.get(5, TimeUnit.SECONDS);
	    } catch (TimeoutException e) {
	        subjectMap.remove(reqId);
	        return Collections.emptyList();
	    } catch (Exception e) {
	        subjectMap.remove(reqId);
	        return Collections.emptyList();
	    }
	}

	
	
	@PostMapping("/teacher/addquestions")
	public String addquestion(@RequestBody Questions q) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(q);
			kafkaProducerService.sendMessage("add-question-topic", jsonMessage);}
		catch(Exception e) {
				e.printStackTrace();
			}
			return "succesfully added";
	}
	
	@KafkaListener(topics = "update-question-topic-response", groupId = "quiz-group")
	public void handleUpdateQuestionResponse(ConsumerRecord<String, String> record) {
	    String reqId = record.key();
	    String value = record.value();
	    try {
	        int result = Integer.parseInt(value);
	        CompletableFuture<Integer> future = updateQuestionMap.remove(reqId);
	        if (future != null) {
	            future.complete(result);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	
	@PutMapping("/teacher/updatequestion")
	public int updateQuestion(@RequestBody Questions q) {
	    String reqId = UUID.randomUUID().toString();
	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        Map<String, Object> messageData = new HashMap<>();
	        messageData.put("id", reqId);
	        messageData.put("question", q);
	        String jsonMessage = objectMapper.writeValueAsString(messageData);
	        kafkaProducerService.sendMessage("update-question-topic",jsonMessage);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return -1;
	    }
	    CompletableFuture<Integer> future = new CompletableFuture<>();
	    updateQuestionMap.put(reqId, future);

	    try {
	        return future.get(5, TimeUnit.SECONDS);
	    } catch (TimeoutException e) {
	        updateQuestionMap.remove(reqId);
	        return -2;
	    } catch (Exception e) {
	        updateQuestionMap.remove(reqId);
	        return -3;
	    }
	}

	@KafkaListener(topics = "get-question-topic-response", groupId = "quiz-group")
	public void handleQuestionResponse(ConsumerRecord<String, String> record) {
	    String reqId = record.key();
	    String json = record.value();
	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        List<Questions> questions = objectMapper.readValue(json, new TypeReference<List<Questions>>() {});
	        CompletableFuture<List<Questions>> future = questionMap.remove(reqId);
	        if (future != null) {
	            future.complete(questions);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();
	    }
	}

	
	@GetMapping("/teacher/getquestions")
	public List<Questions> findAllQuestions(@RequestParam("batch") String year,
	                                        @RequestParam("branch") String branch,
	                                        @RequestParam("coursecode") String code,
	                                        @RequestParam("exam_type") String type) {
	    String reqId = UUID.randomUUID().toString();

	    Map<String, Object> request = new HashMap<>();
	    request.put("id", reqId);
	    request.put("batch", year);
	    request.put("branch", branch);
	    request.put("coursecode", code);
	    request.put("exam_type", type);

	    try {
	        ObjectMapper objectMapper = new ObjectMapper();
	        String jsonMessage = objectMapper.writeValueAsString(request);
	        kafkaProducerService.sendMessage("get-question-topic",jsonMessage);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return Collections.emptyList();
	    }
	    CompletableFuture<List<Questions>> future = new CompletableFuture<>();
	    questionMap.put(reqId, future);
	    try {
	        return future.get(5, TimeUnit.SECONDS);
	    } catch (TimeoutException e) {
	        questionMap.remove(reqId);
	        return Collections.emptyList();
	    } catch (Exception e) {
	        questionMap.remove(reqId);
	        return Collections.emptyList();
	    }
	}

	
	@KafkaListener(topics = "get-noofqueposted-response", groupId = "quiz-group")
	public void ReceiveNoOfQuePostedResponse(ConsumerRecord<String, String> record) {
	    String reqId = record.key();
	    String json = record.value();
	    try {
	        int data = objectMapper.readValue(json, Integer.class);
	        noofque.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/teacher/getnumofqueposted")
	public int findnumofqueposted(@RequestParam("batch") String year,@RequestParam("branch") String branch,@RequestParam("coursecode") String code,@RequestParam("exam_type") String type) {
		String reqId = UUID.randomUUID().toString();
		try {
				HashMap<String, Object> kafkaData = new HashMap<>();
			 	kafkaData.put("id", reqId);
			 	kafkaData.put("batch", year);
		        kafkaData.put("branch", branch);
		        kafkaData.put("coursecode", code);
		        kafkaData.put("examtype", type);
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("get-noofqueposted-topic", jsonMessage);  
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!noofque.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (noofque.containsKey(reqId)) {
	    	int response = (int) noofque.get(reqId);
	    	return response;
	    }
	    else {
	    	return 0;
	    }
	}
	
	@DeleteMapping("/teacher/deletequestion")
	public String deletequestion(@RequestParam("id") String id) {
		try {
			kafkaProducerService.sendMessage("delete-question-topic", id);
			return "successfully question deleted";
			}
		catch(Exception e) {
				e.printStackTrace();
				return "error occurred";
			}
	}
	
	@PostMapping("/teacher/addschedule")
	public String addschedule(@RequestBody Schedule sch) {
		try {
			ObjectMapper objectMapper = new ObjectMapper();
			String jsonMessage = objectMapper.writeValueAsString(sch);
			kafkaProducerService.sendMessage("add-schedule-topic", jsonMessage);
			return "succesfully added";
			}
		catch(Exception e) {
				e.printStackTrace();
				return "error occurred";
			}
	}
	
	
	@KafkaListener(topics = "all-sturesults-response",groupId = "quiz-group")
	public void ReceiveGetResultsWithoutUsernameResponse(ConsumerRecord<String, String> record) {
		String reqId = record.key();
	    String json = record.value();
	    ObjectMapper objectMapper = new ObjectMapper();
	    try {
	    	List<Object> data = objectMapper.readValue(json, new TypeReference<>() {});
	    	allstures.put(reqId, data);
	    } catch (IOException e) {
	        e.printStackTrace();
	    }
	}
	
	@GetMapping("/teacher/getresultslist")
	public List<Object> getresultswithoutusername(@RequestParam("batch") String batch,@RequestParam("branch") String branch,@RequestParam("coursecode") String code,@RequestParam("exam_type") String type,@RequestParam("semester") String semester,@RequestParam("section") String section) {
		String reqId = UUID.randomUUID().toString();
		try {
				HashMap<String, Object> kafkaData = new HashMap<>();
			 	kafkaData.put("id", reqId);
			 	kafkaData.put("batch", batch);
		        kafkaData.put("branch", branch);
		        kafkaData.put("coursecode", code);
		        kafkaData.put("examtype", type);
		        kafkaData.put("semester", semester);
		        kafkaData.put("section", section);
		        String jsonMessage = objectMapper.writeValueAsString(kafkaData);
				kafkaProducerService.sendMessage("all-sturesults-topic", jsonMessage);  
		}
		catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		int waitTime=0;
	    while(!allstures.containsKey(reqId) && waitTime < 50) {
	    	try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
	    	waitTime++;
	    }
	    if (allstures.containsKey(reqId)) {
	    	List<Object> response = allstures.get(reqId);
	    	return response;
	    }
	    else {
	    	return null;
	    }
	}
	
}