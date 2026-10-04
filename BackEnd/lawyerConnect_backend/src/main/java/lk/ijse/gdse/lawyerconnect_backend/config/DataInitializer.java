package lk.ijse.gdse.lawyerconnect_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;
import lk.ijse.gdse.lawyerconnect_backend.repository.SpecializationRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SpecializationRepository specializationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed Admin Account
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .name("System Administrator")
                    .username("admin")
                    .email("admin@lawyerconnect.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin account created: username=admin, password=admin123");
        }

        // Seed Specializations if empty
        if (specializationRepository.count() == 0) {
            List<String> defaultSpecs = List.of(
                    "Criminal Law",
                    "Civil Litigation",
                    "Family Law",
                    "Corporate Law",
                    "Intellectual Property",
                    "Immigration Law",
                    "Labor Law",
                    "Environmental Law",
                    "Tax Law",
                    "Constitutional Law"
            );

            for (String specName : defaultSpecs) {
                Specialization spec = new Specialization();
                spec.setSpecialization(specName);
                specializationRepository.save(spec);
            }
            log.info("Default legal specializations seeded.");
        }
    }
}
