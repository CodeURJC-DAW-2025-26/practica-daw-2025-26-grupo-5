package es.stilnovo.library.controller.restControllers;

import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class NoSuchElementExceptionCA {

	/**
	 * Exception Handler: NoSuchElementException to 404 Not Found
	 * 
	 * Converts common runtime exceptions (NoSuchElementException) into proper HTTP 404 responses
	 */
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(NoSuchElementException.class)
	public void handleNotFound() {
	}
}