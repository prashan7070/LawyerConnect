package lk.ijse.gdse.lawyerconnect_backend.exception;

import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice

public class GlobalExceptionHandler {

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiResponse> handleFileStorageException(FileStorageException e){
        return new ResponseEntity(new ApiResponse(500,e.getMessage(),null)
                , HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException e){
        return new ResponseEntity(new ApiResponse(404,e.getMessage(),null)
                , HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(AllReadyFoundException.class)
    public ResponseEntity<ApiResponse> handleAllReadyFoundException(AllReadyFoundException e){
        return new ResponseEntity(new ApiResponse(400,e.getMessage(),null)
                , HttpStatus.NOT_FOUND);
    }


    @ExceptionHandler(InvalidAppointmentStatusException.class)
    public ResponseEntity<ApiResponse> handleInvalidAppointmentStatusException(InvalidAppointmentStatusException e){
        return new ResponseEntity<>(new ApiResponse(401,e.getMessage(),null),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentNotValidException
            (MethodArgumentNotValidException e){
        Map<String,String> errors=new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fieldError ->{
            errors.put(fieldError.getField(),fieldError.getDefaultMessage());
        });
        return new ResponseEntity(new ApiResponse(400,"Validation Failed",errors)
                , HttpStatus.BAD_REQUEST);
    }

}

