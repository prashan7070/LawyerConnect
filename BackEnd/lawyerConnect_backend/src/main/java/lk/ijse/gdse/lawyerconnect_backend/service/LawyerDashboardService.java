package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.DashboardOverviewDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;

public interface LawyerDashboardService {
    DashboardOverviewDTO getOverviewForLawyer(User user);
}
