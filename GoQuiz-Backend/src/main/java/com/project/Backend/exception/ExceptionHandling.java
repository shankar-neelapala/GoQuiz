package com.project.Backend.exception;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;



@ControllerAdvice
public class ExceptionHandling{
	@ExceptionHandler(DuplicateKeyException.class)
	public ResponseEntity<String> handleDuplicateKeyException(DuplicateKeyException ex) {
	    return new ResponseEntity<>("Duplicate key error: " + ex.getMessage(), HttpStatus.CONFLICT);
	}
}