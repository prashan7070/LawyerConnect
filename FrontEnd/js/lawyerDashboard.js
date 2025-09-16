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
        window.location.href = "../pages/signIn.html";
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

                    // if (profile.profilePictureUrl) {
                    //     profileAvatar.src = profile.profilePictureUrl;
                    // }

                    const BASE_URL = "http://localhost:8080";

                    if (profile.profilePictureUrl) {
                        profileAvatar.src = BASE_URL + profile.profilePictureUrl;

                    } else {
                        profileAvatar.src = "../assets/images/default-avatar.png";
                    }
                } else {
                    profilePage.dataset.hasProfile = "false";
                }
            },
            error: function () {
                console.error("Could not load profile");
                profilePage.dataset.hasProfile = "false";
            }
        });
    }


    // function saveProfile() {
    //     const profileData = {
    //         fullName: document.getElementById("fullName").value,
    //         email: document.getElementById("email").value,
    //         address: document.getElementById("address").value,
    //         phone: document.getElementById("phone").value,
    //         specialties: document.getElementById("specialties").value,
    //         bio: document.getElementById("bio").value
    //     };
    //
    //     const hasProfile = profilePage.dataset.hasProfile === "true";
    //     const url = hasProfile
    //         ? "http://localhost:8080/api/lawyers/profile/" + profilePage.dataset.profileId
    //         : "http://localhost:8080/api/lawyers/profile";
    //
    //     const method = hasProfile ? "PUT" : "POST";
    //
    //     $.ajax({
    //         url: url,
    //         type: method,
    //         contentType: "application/json",
    //         headers: {
    //             "Authorization": "Bearer " + token
    //         },
    //         data: JSON.stringify(profileData),
    //         success: function () {
    //             alert("Profile saved successfully!");
    //             profileInputs.forEach(input => {
    //                 input.readOnly = true;
    //                 input.style.borderColor = 'var(--border-color)';
    //             });
    //             profileImageUploadSection.style.display = 'none';
    //             editProfileBtn.style.display = 'inline-block';
    //             saveProfileBtn.style.display = 'none';
    //             cancelEditBtn.style.display = 'none';
    //             loadProfile(); // refresh data
    //         },
    //         error: function (xhr) {
    //             alert("Error saving profile: " + xhr.responseText);
    //         }
    //     });
    // }

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
