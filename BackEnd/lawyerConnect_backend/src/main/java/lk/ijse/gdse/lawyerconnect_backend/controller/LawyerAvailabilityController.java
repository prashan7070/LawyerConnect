package lk.ijse.gdse.lawyerconnect_backend.controller;

import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.dto.TimeSlotDTO;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerAvailabilityService;
import lk.ijse.gdse.lawyerconnect_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/client/availability")
@RequiredArgsConstructor
@CrossOrigin("**")
public class LawyerAvailabilityController {

    private final LawyerAvailabilityService availabilityService;
    private final UserService userService;

    @GetMapping("/{lawyerId}")
    public ResponseEntity<ApiResponse> getAvailableSlots(
            @PathVariable Long lawyerId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "slotMinutes", defaultValue = "60") int slotMinutes){

        System.out.println("lawyer availability controller called");

        List<TimeSlotDTO> slots = availabilityService.getAvailableSlots(lawyerId, date, slotMinutes);
        return ResponseEntity.ok(new ApiResponse(200, "Available slots fetched", slots));


    }





}
