package lk.ijse.gdse.lawyerconnect_backend.config;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 0. Seed Admin Account if missing
        userRepository.findByUsername("admin").orElseGet(() -> {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@lawyerconnect.lk");
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            return userRepository.save(admin);
        });

        System.out.println("DataSeeder: Seeding 10 prominent Sri Lankan advocates into database...");

        Object[][] lawyersData = {
                {
                        "Kanthi Fernando", "kanthi.fernando@lawchambers.lk", "kanthi2026", "kanthi123",
                        "BASL/LIC/2005/4192", 19, "Corporate Law & Commercial Arbitration",
                        "No. 45, Hulftsdorp Street, Colombo 12", "+94 77 341 8920",
                        "Senior Counsel with 19 years at the Commercial High Court of Sri Lanka. Specializing in company mergers, corporate governance, and cross-border commercial arbitration.",
                        new BigDecimal("7500.00"), new BigDecimal("12000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000001/nic_kanthi.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000001/bar_cert_kanthi.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000001/license_kanthi.pdf"
                },
                {
                        "Romesh de Silva", "romesh.desilva@lawchambers.lk", "romesh2026", "romesh123",
                        "BASL/LIC/1998/1042", 26, "Criminal Defense & Trial Advocacy",
                        "Chambers 14, Supreme Court Complex, Colombo 12", "+94 71 829 4011",
                        "President's Counsel caliber trial advocate with extensive court experience in high-profile criminal litigation, appellate court defense, and bail hearings.",
                        new BigDecimal("8500.00"), new BigDecimal("15000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000002/nic_romesh.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000002/bar_cert_romesh.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000002/license_romesh.pdf"
                },
                {
                        "Ali Sabry", "ali.sabry@supremelaw.lk", "alisabry2026", "sabry123",
                        "BASL/LIC/2002/3301", 22, "Constitutional Law & Fundamental Rights",
                        "No. 120, Ward Place, Colombo 07", "+94 77 912 3388",
                        "Expert practitioner in Constitutional Writs, Fundamental Rights Petitions before the Supreme Court, and Public Interest Litigation.",
                        new BigDecimal("8000.00"), new BigDecimal("14000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000003/nic_ali.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000003/bar_cert_ali.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000003/license_ali.pdf"
                },
                {
                        "Saliya Peiris", "saliya.peiris@barcounsel.lk", "saliya2026", "saliya123",
                        "BASL/LIC/2000/2208", 24, "Human Rights & Criminal Trial Defense",
                        "Chambers 08, Law Courts Road, Colombo 12", "+94 77 455 6072",
                        "Former President of the Bar Association of Sri Lanka. Renowned criminal defense attorney with over two decades of trial expertise.",
                        new BigDecimal("7000.00"), new BigDecimal("13000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000004/nic_saliya.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000004/bar_cert_saliya.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000004/license_saliya.pdf"
                },
                {
                        "Srimathi Jayawardena", "srimathi.j@civilchambers.lk", "srimathi2026", "srimathi123",
                        "BASL/LIC/2009/5812", 15, "Civil Litigation & Property Law",
                        "No. 88, Galle Road, Colombo 03", "+94 76 220 1934",
                        "Specialist in land title partition suits, deed disputes, real estate conveyance, and landlord-tenant litigation across Sri Lanka.",
                        new BigDecimal("5500.00"), new BigDecimal("9500.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000005/nic_srimathi.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000005/bar_cert_srimathi.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000005/license_srimathi.pdf"
                },
                {
                        "Upul Jayasuriya", "upul.jayasuriya@legalchambers.lk", "upul2026", "upul123",
                        "BASL/LIC/1995/0981", 29, "Employment & Labor Law",
                        "No. 12, Bauddhaloka Mawatha, Colombo 07", "+94 77 730 4490",
                        "Senior Labor Tribunal Counsel representing corporate employers and trade unions in industrial disputes, termination claims, and workplace compliance.",
                        new BigDecimal("6500.00"), new BigDecimal("11000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000006/nic_upul.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000006/bar_cert_upul.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000006/license_upul.pdf"
                },
                {
                        "Kuvera de Zoysa", "kuvera.zoysa@iplaw.lk", "kuvera2026", "kuvera123",
                        "BASL/LIC/2007/4921", 17, "Intellectual Property & Trademarks",
                        "Level 4, World Trade Centre, Colombo 01", "+94 71 600 2819",
                        "Leading IP Counsel advising tech startups, corporate brands, and creative enterprises on patent registration, trademark protection, and copyright infringement.",
                        new BigDecimal("6000.00"), new BigDecimal("10000.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000007/nic_kuvera.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000007/bar_cert_kuvera.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000007/license_kuvera.pdf"
                },
                {
                        "Thishya Weragoda", "thishya.w@familylaw.lk", "thishya2026", "thishya123",
                        "BASL/LIC/2011/6734", 13, "Family Law & Custody Disputes",
                        "No. 34, Havelock Road, Colombo 05", "+94 77 842 1109",
                        "Compassionate Advocate providing expert counsel in matrimonial disputes, divorce proceedings, child custody rights, and alimony claims.",
                        new BigDecimal("4500.00"), new BigDecimal("7500.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000008/nic_thishya.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000008/bar_cert_thishya.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000008/license_thishya.pdf"
                },
                {
                        "Sanjeewa Jayawardena", "sanjeewa.j@bankinglaw.lk", "sanjeewa2026", "sanjeewa123",
                        "BASL/LIC/2004/3820", 20, "Banking, Finance & Debt Recovery",
                        "No. 15, Janadhipathi Mawatha, Fort, Colombo 01", "+94 77 119 5532",
                        "Financial Counsel specializing in debt recovery litigation under Parate Execution, banking compliance, credit agreements, and insolvency law.",
                        new BigDecimal("7000.00"), new BigDecimal("12500.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000009/nic_sanjeewa.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000009/bar_cert_sanjeewa.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000009/license_sanjeewa.pdf"
                },
                {
                        "Shanaka Cooray", "shanaka.cooray@kandylaw.lk", "shanaka2026", "shanaka123",
                        "BASL/LIC/2014/7901", 10, "Civil Litigation & Kandy High Court Practice",
                        "No. 110, Main Street, Kandy", "+94 81 223 9081",
                        "Practicing Advocate at the Kandy High Court and District Court, handling civil appeals, land boundary disputes, and estate probate matters.",
                        new BigDecimal("4000.00"), new BigDecimal("6500.00"),
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000010/nic_shanaka.jpg",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000010/bar_cert_shanaka.pdf",
                        "https://res.cloudinary.com/lawyerconnect/image/upload/v1700000010/license_shanaka.pdf"
                }
        };

        for (Object[] item : lawyersData) {
            String name = (String) item[0];
            String email = (String) item[1];
            String username = (String) item[2];
            String rawPassword = (String) item[3];

            // 1. Save User Entity
            User user = userRepository.findByUsername(username).orElseGet(() -> {
                User u = new User();
                u.setName(name);
                u.setEmail(email);
                u.setUsername(username);
                u.setPassword(passwordEncoder.encode(rawPassword));
                u.setRole(Role.LAWYER);
                u.setStatus(UserStatus.ACTIVE); // Active user account, PENDING lawyer verification!
                u.setCreatedAt(LocalDateTime.now());
                return userRepository.save(u);
            });

            // 2. Save or Update LawyerProfile Entity
            final User finalUser = user;
            LawyerProfile profile = lawyerProfileRepository.findByUser(finalUser).orElseGet(() -> {
                LawyerProfile p = new LawyerProfile();
                p.setUser(finalUser);
                return p;
            });

            profile.setFullName(name);
            profile.setEmail(email);
            profile.setLicenceNumber((String) item[4]);
            profile.setYearsOfExperience((Integer) item[5]);
            profile.setSpecialties((String) item[6]);
            profile.setWorkingAddress((String) item[7]);
            profile.setPhone((String) item[8]);
            profile.setBio((String) item[9]);
            profile.setOnlineFee((BigDecimal) item[10]);
            profile.setInPersonFee((BigDecimal) item[11]);
            profile.setVerificationStatus("PENDING"); // Pending Admin Approval!
            profile.setNicDocumentUrl((String) item[12]);
            profile.setBarCertificateUrl((String) item[13]);
            profile.setPracticingLicenseUrl((String) item[14]);
            if (profile.getCreatedAt() == null) profile.setCreatedAt(LocalDateTime.now());
            profile.setUpdatedAt(LocalDateTime.now());
            
            lawyerProfileRepository.save(profile);
        }

        System.out.println("DataSeeder: 10 Sri Lankan Advocates seeded successfully with PENDING verification status!");
    }
}
