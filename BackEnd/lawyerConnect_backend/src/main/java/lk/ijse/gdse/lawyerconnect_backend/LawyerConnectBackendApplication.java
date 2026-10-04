package lk.ijse.gdse.lawyerconnect_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class LawyerConnectBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LawyerConnectBackendApplication.class, args);
    }

}
