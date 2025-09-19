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
        window.location.href = "../pages/loginAndSignUp.html";
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
            url: "http://localhost:8080/api/lawyer/profile/getspecializations",
            method: "GET",
            success: function(data) {
                const dropdown = $("#specialtiesDropdown");
                data.forEach(function(spec) {
                    dropdown.append(
                        $("<option>").text(spec.name).val(spec.id)  // value = id
                    );
                });
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
                    onlineChargeInput.value = profile. onlineFee||"";
                    inPersonChargeInput.value = profile.inPersonFee || "";


                    const BASE_URL = "http://localhost:8080";

                    if (profile.profilePictureUrl) {
                        profileAvatar.src = BASE_URL + profile.profilePictureUrl;

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
                // renderAvailabilitySection([]); // Render empty availability on error
                // toggleEditMode(false); // Set to read-only even on error
            }
        });
    }


    function initAvailabilityListeners() {
        $('#availability-grid .day-toggle').on('change', function () {
            const toggle = $(this);
            const dayGroup = toggle.closest('.availability-day-group');
            const startTimeInput = dayGroup.find('.start-time');
            const endTimeInput = dayGroup.find('.end-time');

            if (toggle.is(':checked')) {
                startTimeInput.prop('disabled', false);
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

        // Add event listeners for the new toggles
        // availabilityGrid.find('.day-toggle').on('change', function() {
        //     const toggle = $(this);
        //     const dayGroup = toggle.closest('.availability-day-group');
        //     const startTimeInput = dayGroup.find('.start-time');
        //     const endTimeInput = dayGroup.find('.end-time');
        //
        //     if (toggle.is(':checked')) {
        //         startTimeInput.prop('disabled', false);
        //         endTimeInput.prop('disabled', false);
        //
        //     } else {
        //         startTimeInput.prop('disabled', true);
        //         endTimeInput.prop('disabled', true);
        //         startTimeInput.val(''); // Clear times when disabled
        //         endTimeInput.val(''); // Clear times when disabled
        //
        //     }
        // });

        initAvailabilityListeners();


    }




    function saveProfile() {

        const formData = new FormData();

        // append normal fields
        formData.append("fullName", document.getElementById("fullName").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("workingAddress", document.getElementById("address").value);
        formData.append("phone", document.getElementById("phone").value);
        formData.append("specialties", document.getElementById("specialties").value);
        formData.append("yearsOfExperience", document.getElementById("yearsExperience").value);
        formData.append("licenceNumber", document.getElementById("barId").value);
        formData.append("bio", document.getElementById("bio").value);
        formData.append("onlineCharge", onlineChargeInput.value);
        formData.append("inPersonCharge", inPersonChargeInput.value);


        // collect specializationIds
        const selectedSpecializations = Array.from(
            document.getElementById("specialtiesDropdown").selectedOptions
        ).map(option => option.value);

        selectedSpecializations.forEach((id, index) => {
            formData.append(`specializationIds[${index}]`, id);  // ✅ Spring binds this automatically
        });


        const availabilityData = [];
        document.querySelectorAll('.availability-day-group').forEach((dayGroup, index) => {
            const dayToggle = dayGroup.querySelector('.day-toggle');
            const dayOfWeek = dayGroup.dataset.day; // Get the day from data-day attribute
            const startTimeInput = dayGroup.querySelector('.start-time');
            const endTimeInput = dayGroup.querySelector('.end-time');

            // Only include if the toggle is checked AND times are provided
            if (dayToggle.checked && startTimeInput.value && endTimeInput.value) {
                availabilityData.push({
                    dayOfWeek: dayOfWeek,
                    startTime: startTimeInput.value,
                    endTime: endTimeInput.value
                });
            }
        });

        formData.append("availabilitySlots", JSON.stringify(availabilityData));




        // append file
        const file = document.getElementById("profileImageInput").files[0];
        if (file) {
            formData.append("profilePicture", file);
        }

        const hasProfile = profilePage.dataset.hasProfile === "true";
        const url = hasProfile
            // ? "http://localhost:8080/api/lawyers/profile/" + profilePage.dataset.profileId
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
