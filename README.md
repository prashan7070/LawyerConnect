## LawyerConnect 🤝 - Bridging the Legal Gap

Are you a lawyer seeking to expand your reach and connect with clients effortlessly? Or a client in need of legal assistance, searching for the perfect advocate? LawyerConnect is your intuitive platform, designed to streamline legal interactions and foster meaningful connections within the legal landscape. Our project leverages modern web technologies (HTML, CSS, JavaScript) and a robust Java Spring Boot backend with JWT authentication to create a seamless and secure experience for both legal professionals and those seeking their expertise.

---

## 📸 Project Showcase

Here are some glimpses of LawyerConnect in action, highlighting our key features and user interface.

### 1. Landing Page
Our elegant landing page provides a warm introduction to the platform, inviting users to explore and connect.


<img width="1348" height="609" alt="1" src="https://github.com/user-attachments/assets/43231d28-999c-4f27-88ce-946255413af0" />
<img width="1348" height="605" alt="3" src="https://github.com/user-attachments/assets/9542a505-5e55-42ae-b19c-4ebfc4e28b97" />
<img width="1350" height="608" alt="2" src="https://github.com/user-attachments/assets/b11d051f-10b4-4594-9014-82f482f48c77" />


### 2. Login & Sign Up
Secure and intuitive forms for users to register or log in to their LawyerConnect accounts.
 
<img width="1079" height="603" alt="5" src="https://github.com/user-attachments/assets/97849f4f-88b3-4c09-8679-cd9b78503bb7" />
<img width="1109" height="605" alt="4" src="https://github.com/user-attachments/assets/8d548f4f-8645-4b30-bbd4-a533d656ab46" />

### 3. Client Dashboard
The client dashboard offers a personalized view of their consultations, messages, and a display of existing lawyers they can connect with.
<img width="1347" height="608" alt="6" src="https://github.com/user-attachments/assets/033fc47e-078e-4c14-8592-f0edc3f0144b" />


### 4. Lawyer Dashboard
Lawyers can manage their appointments, view client inquiries, update their profiles, and track their professional engagements from a centralized dashboard.
<img width="1337" height="605" alt="18" src="https://github.com/user-attachments/assets/bd2037d3-9d63-4a31-ad69-3f8f72b68c95" />


### 5. Client Profile
A dedicated section for clients to view and update their personal information and preferences.
 
<img width="910" height="597" alt="16" src="https://github.com/user-attachments/assets/2960b16b-e2ca-4e45-8e6a-07e35e4557b6" />


### 6. Lawyer Profile
Each lawyer has a detailed profile showcasing their expertise, experience, and client testimonials, helping clients make informed decisions.
 
<img width="876" height="604" alt="15" src="https://github.com/user-attachments/assets/997ad9ea-09c8-4f7e-a481-536fb5f0dec3" />
<img width="781" height="583" alt="14" src="https://github.com/user-attachments/assets/b581258d-8174-41cc-add1-e1d88ee4ab16" />
<img width="1021" height="608" alt="13" src="https://github.com/user-attachments/assets/42667f9d-a417-4d0c-83e6-42678cd495b2" />

### 7. Booking Flow Page
Clients can easily book appointments with their chosen lawyers through a user-friendly scheduling interface.
 
<img width="1233" height="589" alt="19" src="https://github.com/user-attachments/assets/cc6b3ae1-f05e-4710-bee2-a64e1bee4f68" />
<img width="680" height="602" alt="30" src="https://github.com/user-attachments/assets/a42fd613-e909-4b97-ad75-e1fcb7393703" />
<img width="617" height="596" alt="31" src="https://github.com/user-attachments/assets/45a304af-8adf-49c7-9b57-3224ed7f0afd" />
<img width="683" height="604" alt="32" src="https://github.com/user-attachments/assets/59bd98ce-7444-47fe-a9ac-af69bddf6896" />


### 8. My Bookings
A comprehensive overview for users to track and manage all their scheduled and past appointments.
 
<img width="1253" height="579" alt="17" src="https://github.com/user-attachments/assets/6e7d5a88-2649-4b5e-b5d8-6ab7b1fcb907" />

---

## Project Description

**LawyerConnect** is an innovative platform designed to bridge the gap between legal professionals and individuals seeking legal assistance. Our goal is to provide an intuitive, efficient, and secure environment where lawyers can showcase their expertise and clients can easily find and connect with the right legal counsel. Built with pure HTML, CSS, and JavaScript for the frontend and a robust Java Spring Boot backend with JWT authentication, LawyerConnect offers a seamless experience for managing legal consultations, appointments, and communication.

---

## Setup Instructions

Follow these steps to get LawyerConnect up and running on your local machine.

### Prerequisites

*   **Java Development Kit (JDK) 17 or higher**
*   **Maven** (for Spring Boot backend)
*   **A database** (e.g., PostgreSQL, MySQL – H2 is used for development by default)
*   **A web browser** (for the frontend)

### Backend Setup (Java Spring Boot)

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/LawyerConnect.git
    cd LawyerConnect/backend
    ```

2.  **Configure Database:**
    *   Open `src/main/resources/application.properties` (or `application.yml`).
    *   Update the database connection details if you're not using the default H2 database.
        ```properties
        spring.datasource.url=jdbc:h2:mem:lawyerconnectdb
        spring.datasource.driverClassName=org.h2.Driver
        spring.datasource.username=sa
        spring.datasource.password=password
        spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
        spring.jpa.hibernate.ddl-auto=update
        ```
        For PostgreSQL example:
        ```properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/lawyerconnect
        spring.datasource.username=your_db_username
        spring.datasource.password=your_db_password
        spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
        spring.jpa.hibernate.ddl-auto=update
        ```

3.  **Build the Project:**
    ```bash
    mvn clean install
    ```

4.  **Run the Backend Application:**
    ```bash
    mvn spring-boot:run
    ```
    The backend will typically run on `http://localhost:8080`.

### Frontend Setup (HTML, CSS, JS)

1.  **Navigate to the Frontend Directory:**
    ```bash
    cd ../frontend # If you are in the backend directory
    ```

2.  **Open in Browser:**
    *   Simply open the `index.html` file (or your main HTML file) in your preferred web browser.
    *   Ensure that your JavaScript code correctly points to the backend API endpoints (e.g., `http://localhost:8080`).

---

## ▶️ Link to the Demo Video

Watch a quick demonstration of LawyerConnect in action:

[**Watch the LawyerConnect Project Demo on YouTube**](https://youtu.be/5rp0h-odY3Y)

---

Thank you for exploring LawyerConnect! We hope you find it to be a valuable tool for connecting the legal world.
