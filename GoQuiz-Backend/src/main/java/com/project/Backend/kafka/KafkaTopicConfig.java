package com.project.Backend.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.TopicBuilder;

@EnableKafka
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic createstudentTopic() {
        return TopicBuilder.name("student-create-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic createemployeeTopic() {
        return TopicBuilder.name("employee-create-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }

    @Bean
    public NewTopic stuloginrequestTopic() {
        return TopicBuilder.name("stulogin-request-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic stuloginresponseTopic() {
        return TopicBuilder.name("student-login-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic emploginrequestTopic() {
        return TopicBuilder.name("emplogin-request-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic emploginresponseTopic() {
        return TopicBuilder.name("employee-login-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic postsubjectsTopic() {
        return TopicBuilder.name("post-subjects-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }

    @Bean
    public NewTopic addquestionTopic() {
        return TopicBuilder.name("add-question-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic deletequestionTopic() {
        return TopicBuilder.name("delete-question-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic addscheduleTopic() {
        return TopicBuilder.name("add-schedule-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic uploadresultTopic() {
        return TopicBuilder.name("upload-result-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getexamsTopic() {
        return TopicBuilder.name("get-exams-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getexamsresponseTopic() {
        return TopicBuilder.name("get-exam-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getexamsqueTopic() {
        return TopicBuilder.name("get-examsque-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getexamsqueresponseTopic() {
        return TopicBuilder.name("get-examque-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getsturesultTopic() {
        return TopicBuilder.name("get-sturesult-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getsturesultresponseTopic() {
        return TopicBuilder.name("get-sturesult-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getscheduleTopic() {
        return TopicBuilder.name("get-schedule-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getscheduleresponseTopic() {
        return TopicBuilder.name("get-schedule-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getadminscheduleTopic() {
        return TopicBuilder.name("admin-getschedule-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getadminscheduleresponseTopic() {
        return TopicBuilder.name("admin-getschedule-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic updateadminscheduleTopic() {
        return TopicBuilder.name("admin-updateschedule-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic updateadminscheduleresponseTopic() {
        return TopicBuilder.name("admin-updateschedule-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic allsturesultsTopic() {
        return TopicBuilder.name("all-sturesults-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic allsturesultsresponseTopic() {
        return TopicBuilder.name("all-sturesults-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getnoofquepostedTopic() {
        return TopicBuilder.name("get-noofqueposted-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getnoofquepostedresponseTopic() {
        return TopicBuilder.name("get-noofqueposted-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic checkeligibilityTopic() {
        return TopicBuilder.name("check-eligible-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic checkeligibilityresponseTopic() {
        return TopicBuilder.name("check-eligible-topic-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getregulationTopic() {
        return TopicBuilder.name("get-regulation-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getregulationresponseTopic() {
        return TopicBuilder.name("get-regulation-topic-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getsubjectsTopic() {
        return TopicBuilder.name("get-subjects-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic getsubjectsresponseTopic() {
        return TopicBuilder.name("get-subject-topic-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic updatequeTopic() {
        return TopicBuilder.name("update-question-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic updatequeresponseTopic() {
        return TopicBuilder.name("update-question-topic-response")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
    
    @Bean
    public NewTopic updateprogressTopic() {
        return TopicBuilder.name("update-progress-topic")
                           .partitions(3)
                           .replicas(1)
                           .build();
    }
}
