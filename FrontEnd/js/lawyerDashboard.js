document.addEventListener('DOMContentLoaded', () => {
    const sidebarLinks = document.querySelectorAll('.sidebar nav ul li a');
    const pages = document.querySelectorAll('.main-content > div');

    const profilePage = document.getElementById('profile-page');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileInputs = profilePage.querySelectorAll('input, textarea');
    const profileImageUploadSection = document.getElementById('profileImageUploadSection');
    const profileImageInput = document.getElementById('profileImageInput');
    const profileAvatar = document.getElementById('profileAvatar');

    const onlineChargeInput = document.getElementById("onlineCharge");
    const inPersonChargeInput = document.getElementById("inPersonCharge");
    const sidenavProfile = document.getElementById('sidenavProfile');
    const sidenavName = document.getElementById('sidenavName');
    const sidenavEmail = document.getElementById('sidenavEmail');
    const profileHeaderName = document.getElementById('profile-header-name');
    const profileHeaderSpeciality = document.getElementById('profile-header-speciality');
    const profileHeaderEmail = document.getElementById('profile-header-email');



    // JWT token check
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first!");
        window.location.href = "../pages/loginAndSignUp.html";
        return;
    }

    // Decode JWT to get lawyer info if needed
    const decoded = parseJwt(token);

    if (!decoded || decoded.role !== "LAWYER") {
        alert("Unauthorized! Only lawyers can access this page.");
        window.location.href = "../pages/landingPage.html";
        return;
    }

    function showPage(pageId) {
        pages.forEach(page => page.style.display = 'none');
        document.getElementById(pageId).style.display = 'block';
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId.replace('-page', ''));
        });
    }

    // Initial page load
    showPage('home-page');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page + '-page';
            showPage(pageId);
            if (pageId !== 'profile-page') cancelEdit();

        });
    });



    // Update editProfile and cancelEdit functions
    function toggleEditMode(isEditing) {
        const inputs = $('#profile-page input, #profile-page textarea, .time-slots input');
        const toggleSwitches = $('#profile-page .day-toggle');

        inputs.prop('readonly', !isEditing);
        toggleSwitches.prop('disabled', !isEditing); // Disable toggles too

        // Special handling for time inputs:
        $('.availability-day-group').each(function() {
            const dayToggle = $(this).find('.day-toggle');
            const startTimeInput = $(this).find('.start-time');
            const endTimeInput = $(this).find('.end-time');


            if (isEditing) {
                // If editing, enable time inputs only if the toggle is checked
                if (dayToggle.is(':checked')) {
                    startTimeInput.prop('disabled', false);
                    endTimeInput.prop('disabled', false);
                } else {
                    startTimeInput.prop('disabled', true);
                    endTimeInput.prop('disabled', true);
                }
            } else {
                // If not editing, disable all time inputs
                startTimeInput.prop('disabled', true);
                endTimeInput.prop('disabled', true);


            }
        });


    }




    // Profile Edit functionality
    editProfileBtn.addEventListener('click', () => {
        profileInputs.forEach(input => {
            input.readOnly = false;
            input.style.borderColor = 'var(--primary-color)';
        });
        profileImageUploadSection.style.display = 'block';
        editProfileBtn.style.display = 'none';
        saveProfileBtn.style.display = 'inline-block';
        cancelEditBtn.style.display = 'inline-block';

        toggleEditMode(true);


    });


    $(document).ready(function() {
        $.ajax({
            url: "http://localhost:8080/api/lawyer/profile/getSpecializations",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {

                if(response && response.data){

                    let data = response.data;
                    console.log(data);
                    const dropdown = $("#specialtiesDropdown");
                    data.forEach(function(spec) {
                        dropdown.append(
                            $("<option>").text(spec.specialization).val(spec.id)  // value = id
                        );
                    });

                }

            },
            error: function() {
                console.error("Failed to fetch specializations.");
            }
        });
    });


    loadProfile();

    function loadProfile() {
        $.ajax({
            url: "http://localhost:8080/api/lawyer/profile/getProfile",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (response) {

                if (response && response.data) {
                    let profile = response.data;

                    profilePage.dataset.hasProfile = "true";
                    profilePage.dataset.profileId = profile.id;

                    document.getElementById("fullName").value = profile.fullName || "";
                    document.getElementById("email").value = profile.email || "";
                    document.getElementById("address").value = profile.workingAddress || "";
                    document.getElementById("phone").value = profile.phone || "";
                    document.getElementById("specialties").value = profile.specialties || "";
                    document.getElementById("yearsExperience").value = profile.yearsOfExperience || "";
                    document.getElementById("barId").value = profile.licenceNumber || "";
                    document.getElementById("bio").value = profile.bio || "";
                    profileHeaderName.textContent = profile.fullName || "";
                    profileHeaderSpeciality.textContent = profile.specialties || "";
                    profileHeaderEmail.textContent = profile.email || "";
                    onlineChargeInput.value = profile. onlineFee||"";
                    inPersonChargeInput.value = profile.inPersonFee || "";
                    sidenavName.textContent = profile.fullName || "";
                    sidenavEmail.textContent = profile.email || "";


                    const BASE_URL = "http://localhost:8080";

                    if (profile.profilePictureUrl) {
                        profileAvatar.src = BASE_URL + profile.profilePictureUrl;
                        sidenavProfile.src = BASE_URL + profile.profilePictureUrl;

                    } else {
                        profileAvatar.src = "../assets/images/default-avatar.png";
                    }


                    if (profile.specializations && profile.specializations.length > 0) {
                        $("#specialtiesDropdown").val(
                            profile.specializations.map(spec => spec.id)
                        );
                    }



                    renderAvailabilitySection(profile.availabilitySlots || []);


                } else {
                    profilePage.dataset.hasProfile = "false";
                    renderAvailabilitySection([]);
                }

                toggleEditMode(false);
            },
            error: function () {
                console.error("Could not load profile");
                profilePage.dataset.hasProfile = "false";
                renderAvailabilitySection([]);
                // toggleEditMode(false);
            }
        });
    }


    function initAvailabilityListeners() {
        $('#availability-grid .day-toggle').on('change', function () {
            const toggle = $(this);
            const dayGroup = toggle.closest('.availability-day-group');
            const startTimeInput = dayGroup.find('.start-time');
            const endTimeInput = dayGroup.find('.end-time');

            if (toggle.is(':checked')) {startTimeInput.prop('disabled', false);
                endTimeInput.prop('disabled', false);
            } else {
                startTimeInput.prop('disabled', true).val('');
                endTimeInput.prop('disabled', true).val('');
            }
        });

        // Run once immediately so correct state is applied on load
        $('#availability-grid .day-toggle').trigger('change');
    }

// Call once when page is ready
    $(document).ready(function () {
        initAvailabilityListeners();
    });




    function renderAvailabilitySection(availabilityList = []) {
        const availabilityGrid = $('#availability-grid');
        availabilityGrid.empty(); // Clear existing content

        const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        daysOfWeek.forEach(day => {
            const dayAvailability = availabilityList.find(slot => slot.dayOfWeek === day);
            const isAvailable = dayAvailability !== undefined;
            const startTime = dayAvailability ? dayAvailability.startTime : '';
            const endTime = dayAvailability ? dayAvailability.endTime : '';

            const dayGroup = `
            <div class="availability-day-group" data-day="${day}">
                <div class="availability-day-header">
                    <h4>${day.charAt(0) + day.slice(1).toLowerCase()}</h4>
                    <label class="switch">
                        <input type="checkbox" class="day-toggle" ${isAvailable ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="time-slots">
                    <input type="time" class="start-time" value="${startTime}" ${!isAvailable ? 'disabled' : ''}>
                    <input type="time" class="end-time" value="${endTime}" ${!isAvailable ? 'disabled' : ''}>
                </div>
            </div>
        `;
            availabilityGrid.append(dayGroup);
        });



        initAvailabilityListeners();


    }



    function saveProfile() {

        const formData = new FormData();
        // Create a DTO object for simple fields

            // collect specializationIds
        const selectedSpecializations = Array.from(
            document.getElementById("specialtiesDropdown").selectedOptions
        ).map(option => Number(option.value));

            // selectedSpecializations.forEach((id, index) => {
            //     formData.append(`specializationIds[${index}]`, id);
            // });


        const lawyerProfileDTO = {
            fullName: document.getElementById("fullName").value,
            email: document.getElementById("email").value,
            workingAddress: document.getElementById("address").value,
            phone: document.getElementById("phone").value,
            specialties: document.getElementById("specialties").value,
            yearsOfExperience: document.getElementById("yearsExperience").value,
            licenceNumber: document.getElementById("barId").value,
            bio: document.getElementById("bio").value,
            onlineFee: onlineChargeInput.value,
            inPersonFee: inPersonChargeInput.value,
            specializationIds: selectedSpecializations

        };

        // Append DTO as JSON
        formData.append("lawyerProfile", new Blob([JSON.stringify(lawyerProfileDTO)], { type: "application/json" }));

        // Append profile picture
        const file = document.getElementById("profileImageInput").files[0];
        if (file) formData.append("profilePicture", file);

        // Collect availability slots
        const availabilityData = [];
        document.querySelectorAll('.availability-day-group').forEach(dayGroup => {
            const dayToggle = dayGroup.querySelector('.day-toggle');
            const dayOfWeek = dayGroup.dataset.day;
            const startTimeInput = dayGroup.querySelector('.start-time');
            const endTimeInput = dayGroup.querySelector('.end-time');

            if (dayToggle.checked && startTimeInput.value && endTimeInput.value) {
                availabilityData.push({
                    dayOfWeek,
                    startTime: startTimeInput.value,
                    endTime: endTimeInput.value
                });
            }
        });

        // Append availabilitySlots as JSON
        formData.append("availabilitySlots", new Blob([JSON.stringify(availabilityData)], { type: "application/json" }));

        const hasProfile = profilePage.dataset.hasProfile === "true";
        const url = hasProfile
            ? "http://localhost:8080/api/lawyer/profile/updateProfile"
            : "http://localhost:8080/api/lawyer/profile/saveProfile";

        const method = hasProfile ? "PUT" : "POST";

        $.ajax({
            url: url,
            type: method,
            headers: {
                "Authorization": "Bearer " + token
            },
            processData: false,
            contentType: false,
            data: formData,
            success: function () {
                alert("Profile saved successfully!");
                loadProfile();
            },
            error: function (xhr) {
                alert("Error saving profile: " + xhr.responseText);
            }
        });
    }



    saveProfileBtn.addEventListener('click', saveProfile);

    cancelEditBtn.addEventListener('click', cancelEdit);

    function cancelEdit() {
        profileInputs.forEach(input => input.readOnly = true);
        profileInputs.forEach(input => input.style.borderColor = 'var(--border-color)');
        profileImageUploadSection.style.display = 'none';
        editProfileBtn.style.display = 'inline-block';
        saveProfileBtn.style.display = 'none';
        cancelEditBtn.style.display = 'none';
        toggleEditMode(false);
    }


    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { profileAvatar.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });



    loadLawyerAppointments();


    function loadLawyerAppointments() {
        $.ajax({
            url: "http://localhost:8080/api/appointments/lawyer",
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function(response) {
                const appointments = response.data;

                const upcomingStatuses = ["CONFIRMED", "PENDING"];
                const pastStatuses = ["CANCELLED", "COMPLETED"];

                const upcoming = appointments.filter(app => upcomingStatuses.includes(app.status));
                const past = appointments.filter(app => pastStatuses.includes(app.status));

                renderAppointments("#upcoming-appointments-list", upcoming);
                renderAppointments("#past-appointments-list", past);
                renderAppointments("#home-page .appointments-section .appointment-list", upcoming);
            },
            error: function(err) {
                console.error("Failed to load appointments", err);
            }
        });
    }

// Render appointment cards
    function renderAppointments(containerSelector, appointments) {
        const container = $(containerSelector);
        container.empty();
        const BASE_URL = "http://localhost:8080";

        appointments.forEach(app => {
            const card = $(`
            <div class="appointment-item" 
                 data-id="${app.appointmentId}" 
                 data-client-name="${app.clientName}" 
                 data-client-phone="${app.clientPhone}" 
                 data-lawyer-phone="${app.lawyerPhone}" 
                 data-status="${app.status}">
                <img src="${BASE_URL + app.clientProfileUrl}" alt="Client Avatar" class="avatar">
                <div class="details">
                    <div class="client-name">${app.clientName}</div>
                    <div class="time-topic">${app.date}, ${app.startTime} - ${app.endTime} - ${app.consultationType}</div>
                    <div class="status status-text">Status: ${app.status}</div>
                </div>
                <div class="actions">
                    <button class="btn-view">View</button>
                    <button class="btn-whatsapp">WhatsApp</button>
                </div>
            </div>
        `);
            container.append(card);
        });
    }

// WhatsApp button
    $(document).on("click", ".btn-whatsapp", function() {
        const $card = $(this).closest(".appointment-item");
        const clientName = $card.data("client-name");
        const clientPhone = $card.data("client-phone");

        const message = `Hello ${clientName}, this is your lawyer.`;
        const url = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    });

    $(document).on("click", ".btn-view", function() {
        const $card = $(this).closest(".appointment-item");
        const appointmentId = $card.data("id");
        const currentStatus = $card.data("status");

        Swal.fire({
            title: 'Appointment Details',
            html: `
            <p>Client: ${$card.data("client-name")}</p>
            <p>Time: ${$card.find(".time-topic").text()}</p>
            <p>Status:
                <select id="statusSelect">
                    <option value="CONFIRMED" ${currentStatus === 'CONFIRMED' ? 'selected' : ''}>CONFIRMED</option>
                    <option value="PENDING" ${currentStatus === 'PENDING' ? 'selected' : ''}>PENDING</option>
                    <option value="CANCELLED" ${currentStatus === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
                    <option value="COMPLETED" ${currentStatus === 'COMPLETED' ? 'selected' : ''}>COMPLETED</option>
                </select>
            </p>
        `,
            showCancelButton: true,
            confirmButtonText: 'Update Status'
        }).then((result) => {
            if (result.isConfirmed) {
                const newStatus = document.getElementById("statusSelect").value;
                updateAppointmentStatus(appointmentId, newStatus, $card);
            }
        });
    });

// Update status AJAX
    function updateAppointmentStatus(appointmentId, status, $card) {
        $.ajax({
            url: `http://localhost:8080/api/appointments/${appointmentId}/updateStatus`,
            type: "PUT",
            headers: { "Authorization": "Bearer " + token },
            contentType: "application/json",
            data: JSON.stringify({ status }),
            success: function() {
                Swal.fire("Success", "Status updated successfully!", "success");
                $card.data("status", status);
                $card.find(".status-text").text("Status: " + status);
            },
            error: function() {
                Swal.fire("Error", "Failed to update status.", "error");
            }
        });
    }


    loadLawyerClients();

    function loadLawyerClients() {
        $.ajax({
            url: "http://localhost:8080/api/lawyer/dashboard/getClients",
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function(response) {
                const clients = response.data;
                // renderClients("#clients-list", clients);
                renderClients("#clients-list", clients);
            },
            error: function(err) {
                console.error("Failed to load clients", err);
            }
        });
    }

    function renderClients(containerSelector, clients) {
        const container = $(containerSelector);
        container.empty();
        const BASE_URL = "http://localhost:8080";

        clients.forEach(client => {
            const card = $(`
            <div class="client-item" data-id="${client.clientId}">
                <img src="${BASE_URL + client.clientProfilePicture}" alt="Client Avatar" class="avatar">
                <div class="details">
                    <div class="client-name">${client.clientName}</div>
                    <div class="client-email">${client.clientEmail}</div>
                </div>
                <div class="actions">
                    <button class="btn-message" data-phone="${client.clientPhone}">Message</button>
                </div>
            </div>
        `);
            container.append(card);
        });
    }

    $(document).on("click", ".btn-message", function() {
        const phone = $(this).data("phone");
        window.open(`https://wa.me/${phone}`, "_blank");
    });


    loadDashboardOverview();

    function loadDashboardOverview() {

        $.ajax({
            url: "http://localhost:8080/api/lawyer/dashboard/overview",
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
            success: function(response) {
                const data = response.data || {};

                // upcomingCount, totalClients, monthlyEarnings, avgRating

                $('#upcomingAppointmentsCount').text(data.upcomingCount ?? 0);
                $('#totalClientsCount').text(data.totalClients ?? 0);

                const earnings = data.monthlyEarnings ?? 0;
                const formattedEarnings = Number(earnings).toLocaleString();
                $('#monthlyEarnings').text('LKR ' + formattedEarnings);

                if (data.avgRating != null) {
                    $('#averageRating').text(Number(data.avgRating).toFixed(1));
                } else {
                    $('#averageRating').text('-');
                }
            },
            error: function(err) {
                console.error("Failed to load dashboard overview", err);
            }
        });
    }





    // JWT parser function
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Invalid token", e);
            return null;
        }
    }
});
