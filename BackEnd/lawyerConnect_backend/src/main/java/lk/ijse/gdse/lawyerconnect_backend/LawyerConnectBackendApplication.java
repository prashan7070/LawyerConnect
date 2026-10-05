package lk.ijse.gdse.lawyerconnect_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cache.annotation.EnableCaching;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EnableCaching
@EnableJpaRepositories("lk.ijse.gdse.lawyerconnect_backend.repository")
@EntityScan("lk.ijse.gdse.lawyerconnect_backend.entity")
public class LawyerConnectBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LawyerConnectBackendApplication.class, args);
    }

}
