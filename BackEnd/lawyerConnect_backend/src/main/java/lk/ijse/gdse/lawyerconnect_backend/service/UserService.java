package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.entity.User;

public interface UserService {

    User getUserByUsername(String username);

}
