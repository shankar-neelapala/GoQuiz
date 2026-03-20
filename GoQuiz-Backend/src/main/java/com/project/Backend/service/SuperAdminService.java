package com.project.Backend.service;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.Backend.model.Students;
import com.project.Backend.model.Teachers;
import com.project.Backend.repository.StudentRepo;
import com.project.Backend.repository.TeacherRepo;

@Service
public class SuperAdminService {
	
	@Value("${imgbb.api.key}")
    private String imgbbApiKey;

	private final ObjectMapper objectMapper = new ObjectMapper();
	private final StudentRepo studentRepo;
	private final CommonFuncServicesConsumer cfs;
	private final TeacherRepo teacherrepo;
	
	
	public SuperAdminService(StudentRepo studentRepo, CommonFuncServicesConsumer cfs, TeacherRepo teacherrepo) {
		this.studentRepo = studentRepo;
		this.cfs = cfs;
		this.teacherrepo = teacherrepo;
	}

	@KafkaListener(topics = "student-create-topic", groupId = "quiz-group")
    public void createstu(String message) {
        try {
            Map<String, Object> data = objectMapper.readValue(message, new TypeReference<Map<String, Object>>() {});
            Students student = new Students();
            student.setName((String) data.get("name"));
            student.setUsername((String) data.get("username"));
            student.setBatch((String) data.get("batch"));
            student.setRegulation((String) data.get("regulation"));
            student.setBranch((String) data.get("branch"));
            student.setSemester((String) data.get("semester"));
            student.setSection((String) data.get("section"));
            student.setRole((String) data.get("role"));
            if (data.containsKey("image")) {
                String base64Image = (String) data.get("image");
                MultipartFile file = base64ToMultipartFile(base64Image, "student.jpg");
                String imageUrl = cfs.uploadImage(file, imgbbApiKey);
                student.setImage(imageUrl);
            }
            studentRepo.save(student);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

	private MultipartFile base64ToMultipartFile(String base64, String filename) throws IOException {
	    byte[] decoded = Base64.getDecoder().decode(base64);
	    return new MockMultipartFile(filename, filename, "image/jpeg", decoded);
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
                String imageUrl = cfs.uploadImage(file, imgbbApiKey);
                t.setImage(imageUrl);
            }

            teacherrepo.save(t);
            System.out.println("Employee created successfully!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

	
	public List<Students> getStudents(String batch, String branch, String sem, String section) {
		return studentRepo.findByBatchAndBranchAndSemesterAndSection(batch, branch, sem, section);
	}

	public List<Teachers> getFaculty(String branch) {
		return teacherrepo.findByBranch(branch);
	}

	public String updateStudent(Students stu) {
		Students newStu = studentRepo.findById(stu.getId()).orElse(null);
		if(newStu != null) {
			newStu.setName(stu.getName());
			newStu.setUsername(stu.getUsername());
			newStu.setBatch(stu.getBatch());
			newStu.setBranch(stu.getBranch());
			newStu.setPassword(stu.getPassword());
			newStu.setRegulation(stu.getRegulation());
			newStu.setSection(stu.getSection());
			newStu.setSemester(stu.getSemester());
			newStu.setRole(stu.getRole());
			studentRepo.save(newStu);
			
			return "Updated Successfully!";
		}
		else
			return "Invalid Details";
	}
}
