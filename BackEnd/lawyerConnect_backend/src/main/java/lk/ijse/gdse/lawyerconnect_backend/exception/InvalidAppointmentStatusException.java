package lk.ijse.gdse.lawyerconnect_backend.exception;

public class InvalidAppointmentStatusException extends RuntimeException{
    public InvalidAppointmentStatusException (String massage){
        super(massage);
    }
}
