package com.comparathor.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    private final List<String> details;

    public BadRequestException(String message) {
        super(message);
        this.details = List.of();
    }

    public BadRequestException(String message, List<String> details) {
        super(message);
        this.details = details;
    }

}
