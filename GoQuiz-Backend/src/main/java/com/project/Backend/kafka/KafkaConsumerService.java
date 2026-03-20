package com.project.Backend.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

	@Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
	
	public void getMessage(String topic,String reqId,String username,String password) {
		String payload = reqId + ":"+username+":"+password;
        kafkaTemplate.send(topic, payload);
    }
}
