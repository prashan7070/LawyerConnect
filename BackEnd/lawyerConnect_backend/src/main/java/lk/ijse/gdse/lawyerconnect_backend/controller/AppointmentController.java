package lk.ijse.gdse.lawyerconnect_backend.controller;


import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.dto.AppointmentDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentRequestDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.service.AppointmentService;
import lk.ijse.gdse.lawyerconnect_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("**")
@RequiredArgsConstructor

public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse> bookAppointment(@RequestBody BookAppointmentRequestDTO request) {

        System.out.println("booking appointment controller called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        BookAppointmentResponseDTO response = appointmentService.bookAppointment(request, user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse(201, "Appointment booked successfully", response));


    }


    @GetMapping("/client")
    public ResponseEntity<ApiResponse> getClientAppointments() {

        System.out.println("client getAppointments called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        List<AppointmentDTO> appointments = appointmentService.getClientAppointments(user);
        return new ResponseEntity(new ApiResponse(200,"Appointments fetched Successfully",appointments), HttpStatus.OK);


    }













}
