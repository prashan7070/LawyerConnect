package lk.ijse.gdse.lawyerconnect_backend.controller;

import lk.ijse.gdse.lawyerconnect_backend.dto.ClientDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.DashboardOverviewDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.service.AppointmentService;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerDashboardService;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerProfileService;
import lk.ijse.gdse.lawyerconnect_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lawyer/dashboard")
@CrossOrigin("**")
public class LawyerDashboardController {


    private final LawyerProfileService lawyerProfileService;
    private final UserService userService;
    private final AppointmentService appointmentService;
    private final LawyerDashboardService lawyerDashboardService;

    @GetMapping("/getClients")
    public ResponseEntity<?> getClients() {

        System.out.println("getClients called");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userService.getUserByUsername(username);

        List<ClientDTO> clients = appointmentService.getClientsOfLawyer(user);

        return ResponseEntity.ok(Map.of("data", clients));
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getOverviewForLawyer() {

        System.out.println("overview controller called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        DashboardOverviewDTO dto = lawyerDashboardService.getOverviewForLawyer(user);
        return ResponseEntity.ok(Map.of("data", dto));
    }


}
