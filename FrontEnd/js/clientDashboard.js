
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
        const searchInput = document.getElementById("searchInput");

        //sidebar
        const sidebarProfile = document.getElementById('sidebarProfile');
        const sidebarName = document.getElementById('sidebarName');
        const sidebarEmail = document.getElementById('sidebarEmail');

        // Lawyer Profile Page Elements
        const lawyerProfilePage = document.getElementById('lawyer-profile-page');
        const lawyerProfileAvatar = document.getElementById('lawyerProfileAvatar');
        const lawyerProfileName = document.getElementById('lawyerProfileName');
        const lawyerProfileSpecialty = document.getElementById('lawyerProfileSpecialty');
        const lawyerProfileStars = document.getElementById('lawyerProfileStars');
        const lawyerProfileRating = document.getElementById('lawyerProfileRating');
        const lawyerProfileReviews = document.getElementById('lawyerProfileReviews');
        const lawyerProfileDescription = document.getElementById('lawyerProfileDescription');
        const lawyerProfileAbout = document.getElementById('lawyerProfileAbout'); // Added About Me
        const lawyerProfileExperience = document.getElementById('lawyerProfileExperience'); // Added Experience List
        const startBookingBtn = document.getElementById('startBookingBtn');
        const bookLawyerName = document.getElementById('bookLawyerName');

        // Booking Flow Page Elements
        const bookingFlowPage = document.getElementById('booking-flow-page');
        const bookingFlowLawyerName = document.getElementById('bookingFlowLawyerName');
        const bookingSteps = document.querySelectorAll('.booking-step');
        const bookingStep1 = document.getElementById('booking-step-1');
        const bookingStep2 = document.getElementById('booking-step-2');
        const bookingStep3 = document.getElementById('booking-step-3');
        const serviceScheduleForm = document.getElementById('serviceScheduleForm');
        const serviceTypeInput = document.getElementById('serviceType');
        const bookingDateInput = document.getElementById('bookingDate');
        const bookingTimeInput = document.getElementById('bookingTime');
        const caseDescriptionInput = document.getElementById('caseDescription');
        const backToProfileBtn = document.getElementById('backToProfileBtn');
        const backToStep1Btn = document.getElementById('backToStep1Btn');
        const goToStep3Btn = document.getElementById('goToStep3Btn');
        const backToStep2Btn = document.getElementById('backToStep2Btn');
        const finalConfirmBookingBtn = document.getElementById('finalConfirmBookingBtn');

        // Confirmation Details
        const confirmLawyerName = document.getElementById('confirmLawyerName');
        const confirmServiceType = document.getElementById('confirmServiceType');
        const confirmDateTime = document.getElementById('confirmDateTime');
        const confirmCaseDescription = document.getElementById('confirmCaseDescription');

        //available time slots
        const availableTimeSlotsDiv = $('#availableTimeSlots');
        const selectedBookingTimeInput = $('#selectedBookingTime');
        const timeSlotsContainer = $('#timeSlotsContainer');
        const noSlotsMessage = $('.no-slots-message');



        // JWT token check
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first!");
            window.location.href = "../pages/loginAndSignUp.html";
            return;
        }

        // Decode JWT to get lawyer info if needed
        const decoded = parseJwt(token);

        if (!decoded || decoded.role !== "CLIENT") {
            alert("Unauthorized! Only clients can access this page.");
            window.location.href = "../pages/landingPage.html";
            return;
        }


        const bookButtons = document.querySelectorAll('.btn-book');

        // Booking lists
        const upcomingBookingsList = document.getElementById('upcoming-bookings-list');
        const pastBookingsList = document.getElementById('past-bookings-list');


        let currentLawyer = null; // To store the selected lawyer's data
        let currentBookingStep = 1;



        function showPage(pageId) {
            pages.forEach(page => {
                page.style.display = 'none';
            });
            document.getElementById(pageId).style.display = 'block';

            sidebarLinks.forEach(link => {
                if (link.dataset.page + '-page' === pageId ||
                    (pageId === 'lawyer-profile-page' && link.dataset.page === 'home') ||
                    (pageId === 'booking-flow-page' && link.dataset.page === 'home')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        function updateBookingSteps(step) {
            bookingSteps.forEach(s => {
                const stepNum = parseInt(s.dataset.step);
                s.classList.remove('active', 'completed');
                if (stepNum < step) {
                    s.classList.add('completed');
                } else if (stepNum === step) {
                    s.classList.add('active');
                }
            });

            // Hide all step sections and show the current one
            bookingStep1.style.display = 'none';
            bookingStep2.style.display = 'none';
            bookingStep3.style.display = 'none';

            if (step === 1) {
                bookingStep1.style.display = 'block';
            } else if (step === 2) {
                bookingStep2.style.display = 'block';
            } else if (step === 3) {
                bookingStep3.style.display = 'block';
                populateConfirmationDetails();
            }
        }

        function populateConfirmationDetails() {
            if (currentLawyer) {
                confirmLawyerName.textContent = currentLawyer.name;
            }

            confirmServiceType.textContent = serviceTypeInput.options[serviceTypeInput.selectedIndex].text;

            const slotJson = selectedBookingTimeInput.val();
            if (slotJson) {
                try {
                    const s = JSON.parse(slotJson);
                    // format : e.g. "Sep 23, 2025 at 10:00 - 11:00"
                    const dt = new Date(`${s.date}T${s.startTime}`);
                    const formattedDate = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const start = s.startTime.substring(0,5);
                    const end = s.endTime.substring(0,5);
                    confirmDateTime.textContent = `${formattedDate} at ${start} - ${end}`;
                } catch (e) {
                    confirmDateTime.textContent = `${bookingDateInput.value} at ${bookingTimeInput.value}`;
                }
            } else {
                confirmDateTime.textContent = `${bookingDateInput.value} at ${bookingTimeInput.value}`;
            }

            confirmCaseDescription.textContent = caseDescriptionInput.value;


        }





        // Initial page load
        showPage('home-page');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.dataset.page + '-page';
                showPage(pageId);
                // Reset profile edit mode if switching pages
                if (pageId !== 'profile-page') {
                    cancelEdit();
                }
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



        saveProfileBtn.addEventListener('click', () => {
            profileInputs.forEach(input => {
                input.readOnly = true;
                input.style.borderColor = 'var(--border-color)';
            });
            editProfileBtn.style.display = 'inline-block';
            saveProfileBtn.style.display = 'none';
            cancelEditBtn.style.display = 'none';
        });


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


        profileImageUploadSection.style.display = 'none';
        profileInputs.forEach(input => {
            if (input.readOnly) {
                input.style.backgroundColor = '#eceff1';
            }
        });



        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('btn-book')) {
                e.preventDefault();

                const lawyerCard = e.target.closest('.lawyer-card');
                currentLawyer = {
                    id: lawyerCard.dataset.lawyerId,
                    name: lawyerCard.querySelector('.name')?.textContent || '',
                    specialty: lawyerCard.querySelector('.specialty')?.textContent || '',
                    description: lawyerCard.querySelector('.description')?.textContent || '',
                    avatar: lawyerCard.querySelector('img')?.src || '',
                    rating: lawyerCard.dataset.lawyerRating || 0,
                    reviews: lawyerCard.dataset.lawyerReviews || 0,
                    address: lawyerCard.dataset.lawyerAddress,
                    onlineFee: parseFloat(lawyerCard.dataset.onlineFee),
                    inPersonFee: parseFloat(lawyerCard.dataset.inpersonFee)
                };

                lawyerProfileAvatar.src = currentLawyer.avatar;
                lawyerProfileName.textContent = currentLawyer.name;
                lawyerProfileSpecialty.textContent = currentLawyer.specialty;
                lawyerProfileDescription.textContent = currentLawyer.description;
                bookLawyerName.textContent = currentLawyer.name;

                lawyerProfileStars.innerHTML = generateStars(parseFloat(currentLawyer.rating));
                lawyerProfileRating.textContent = currentLawyer.rating;
                lawyerProfileReviews.textContent = currentLawyer.reviews;

                showPage('lawyer-profile-page');
            }
        });



        function loadLawyerProfile(lawyerId) {
            $.ajax({
                url: `http://localhost:8080/api/client/explore/lawyers/${lawyerId}`, // adjust endpoint
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (lawyer) {
                    console.log("Fetched lawyer profile:", lawyer);

                    currentLawyer = lawyer; // store full lawyer object

                    // Fill profile page
                    const BASE_URL = "http://localhost:8080";
                    lawyerProfileAvatar.src = lawyer.profilePictureUrl ? BASE_URL + lawyer.profilePictureUrl : "https://via.placeholder.com/100";
                    lawyerProfileName.textContent = lawyer.fullName || "";
                    lawyerProfileSpecialty.textContent = lawyer.specialties || "";
                    lawyerProfileDescription.textContent = lawyer.bio || "";
                    lawyerProfileAbout.textContent = lawyer.aboutMe || ""; // if available
                    lawyerProfileExperience.innerHTML = (lawyer.experiences || [])
                        .map(exp => `<li>${exp}</li>`)
                        .join("");

                    // Stars + rating
                    lawyerProfileStars.innerHTML = generateStars(lawyer.rating || 0);
                    lawyerProfileRating.textContent = lawyer.rating || 0;
                    lawyerProfileReviews.textContent = lawyer.reviews || 0;

                    bookLawyerName.textContent = lawyer.fullName;

                    showPage("lawyer-profile-page");
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching lawyer profile:", error);
                }
            });
        }


        // Start Booking button on Lawyer Profile Page -> Booking Flow Step 1
        startBookingBtn.addEventListener('click', () => {
            if (currentLawyer) {
                bookingFlowLawyerName.textContent = `Book Appointment with ${currentLawyer.name}`;
                currentBookingStep = 1;
                updateBookingSteps(currentBookingStep);
                showPage('booking-flow-page');


                bookingFlowPage.dataset.lawyerId = currentLawyer.id;
                bookingDateInput.value = "";                        // clear previous date
                availableTimeSlotsDiv.innerHTML = "";               // clear old slots
                timeSlotsContainer.style.display = "none";          // hide until date picked
                selectedBookingTimeInput.value = "";                // clear hidden slot


            } else {
                alert("No lawyer selected. Please go back to find a lawyer.");
                showPage('home-page');
            }
        });


        //fetch when user picks a date
        bookingDateInput.addEventListener('change', () => {
            const selectedDate = bookingDateInput.value; // format YYYY-MM-DD
            const lawyerId = bookingFlowPage.dataset.lawyerId || (currentLawyer && currentLawyer.id);

            if (!selectedDate || !lawyerId) {
                timeSlotsContainer.hide();
                return;
            }

            fetchAndDisplayTimeSlots(lawyerId, selectedDate);
        });





        // Navigation within Booking Flow
        backToProfileBtn.addEventListener('click', () => {
            showPage('lawyer-profile-page'); // Go back to the lawyer's profile
        });




        serviceScheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            currentBookingStep = 2;
            updateBookingSteps(currentBookingStep);

            //Load slots when user submits step 1 with date
            const selectedDate = bookingDateInput.value;
            if (currentLawyer && selectedDate) {
                fetchAndDisplayTimeSlots(currentLawyer.id, selectedDate);
            }
        });

        backToStep1Btn.addEventListener('click', () => {
            currentBookingStep = 1;
            updateBookingSteps(currentBookingStep);
        });

        goToStep3Btn.addEventListener('click', () => {
            // Here you would typically validate payment details
            alert("Proceeding to confirmation! (Payment details would be processed here)");
            currentBookingStep = 3;
            updateBookingSteps(currentBookingStep);
        });

        backToStep2Btn.addEventListener('click', () => {
            currentBookingStep = 2;
            updateBookingSteps(currentBookingStep);
        });






        finalConfirmBookingBtn.addEventListener('click', () => {
            if (!currentLawyer) {
                alert("Error: No lawyer selected.");
                showPage('home-page');
                return;
            }

            const selectedServiceType = serviceTypeInput.value; // ONLINE / IN_PERSON
            const caseDescription = caseDescriptionInput.value;
            const slotJson = selectedBookingTimeInput.val();

            if (!selectedServiceType || !slotJson || !caseDescription) {
                alert('Please select service, time slot, and enter case description.');
                return;
            }

            let slot;
            try {
                slot = JSON.parse(slotJson);
            } catch (e) {
                alert('Invalid selected time slot.');
                return;
            }

            const bookingRequest = {
                lawyerId: parseInt(currentLawyer.id),
                date: slot.date,
                startTime: slot.startTime,
                consultationType: selectedServiceType,
                location: selectedServiceType === "IN_PERSON" ? currentLawyer.address || "Lawyer's Office" : "Online",
                notes: caseDescription
            };

            $.ajax({
                url: "http://localhost:8080/api/appointments/book",
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(bookingRequest),
                success: function(response) {
                    alert(`Booking confirmed with ${currentLawyer.name}!`);
                    // Add booking to upcoming list
                    const formattedDateTime = `${slot.date} ${slot.startTime} - ${slot.endTime}`;
                    const newBookingHtml = `
                <div class="booking-card">
                    <div class="booking-details">
                        <div class="lawyer-name">${currentLawyer.name}</div>
                        <div class="lawyer-specialty">${currentLawyer.specialty}</div>
                        <div class="booking-date-time">${formattedDateTime} - ${selectedServiceType}</div>
                    </div>
                    <span class="booking-status confirmed">Confirmed</span>
                </div>
            `;
                    upcomingBookingsList.insertAdjacentHTML('afterbegin', newBookingHtml);

                    // Reset booking flow
                    currentLawyer = null;
                    serviceScheduleForm.reset();
                    selectedBookingTimeInput.val("");
                    currentBookingStep = 1;
                    showPage('bookings-page');
                },
                error: function(xhr) {
                    alert("Failed to book appointment: " + xhr.responseText);
                }
            });
        });




        //Real backend call for slots
        function fetchAndDisplayTimeSlots(lawyerId, selectedDate) {
            if (!lawyerId || !selectedDate) {
                timeSlotsContainer.hide();
                return;
            }

            availableTimeSlotsDiv.html('<p class="loading-message">Loading available slots...</p>');
            timeSlotsContainer.show();
            noSlotsMessage.hide();

            $.ajax({
                url: `http://localhost:8080/api/client/availability/${lawyerId}?date=${selectedDate}&slotMinutes=60`,
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function(response) {
                    availableTimeSlotsDiv.empty();

                    const slots = response.data || [];
                    if (slots.length === 0) {
                        noSlotsMessage.show();
                        return;
                    }

                    noSlotsMessage.hide();


                    slots.forEach(slot => {
                        // slot expected shape: { date: "YYYY-MM-DD", startTime: "HH:MM:SS", endTime: "HH:MM:SS" }
                        const btn = $('<button>')
                            .addClass('time-slot-button')
                            .text(`${slot.startTime.substring(0,5)} - ${slot.endTime.substring(0,5)}`)
                            .attr('data-date', slot.date)
                            .attr('data-start', slot.startTime)
                            .attr('data-end', slot.endTime);

                        btn.on('click', function() {
                            $('.time-slot-button').removeClass('selected');
                            $(this).addClass('selected');

                            const chosen = {
                                date: $(this).attr('data-date'),
                                startTime: $(this).attr('data-start'),
                                endTime: $(this).attr('data-end')
                            };

                            // store JSON string in the hidden input (clean and structured)
                            selectedBookingTimeInput.val(JSON.stringify(chosen));


                        });

                        availableTimeSlotsDiv.append(btn);
                    });


                },
                error: function(xhr, status, error) {
                    console.error("Error fetching slots:", error);
                    availableTimeSlotsDiv.html('<p class="error-message">Failed to load slots. Try again.</p>');
                }
            });
        }







        function saveProfile() {

            const formData = new FormData();


            const clientProfile = {
                fullName: document.getElementById("fullName").value,
                email: document.getElementById("email").value,
                address: document.getElementById("address").value,
                phone: document.getElementById("phone").value,
                nic: document.getElementById("nic").value,
                dob: document.getElementById("dob").value,

            };

            console.log(clientProfile);

            // Append DTO as JSON
            formData.append("clientProfile", new Blob([JSON.stringify(clientProfile)], { type: "application/json" }));

            // Append profile picture
            const file = document.getElementById("profileImageInput").files[0];
            if (file) formData.append("profilePicture", file);


            const hasProfile = profilePage.dataset.hasProfile === "true";
            const url = hasProfile
                ? "http://localhost:8080/api/client/profile/updateProfile"
                : "http://localhost:8080/api/client/profile/saveProfile";

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
                    loadClientProfile();
                },
                error: function (xhr) {
                    alert("Error saving profile: " + xhr.responseText);
                }
            });
        }


        saveProfileBtn.addEventListener('click', saveProfile);




        loadClientProfile();

        function loadClientProfile() {
            $.ajax({
                url: "http://localhost:8080/api/client/profile/getProfile",
                type: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {

                    if (response && response.data) {
                        let profile = response.data;

                        console.log(profile);

                        profilePage.dataset.hasProfile = "true";
                        profilePage.dataset.profileId = profile.id;

                        document.getElementById("fullName").value = profile.fullName || "";
                        document.getElementById("email").value = profile.email || "";
                        document.getElementById("address").value = profile.address || "";
                        document.getElementById("phone").value = profile.phone || "";
                        document.getElementById("nic").value = profile.nic || "";
                        document.getElementById("dob").value = profile.dob || "";
                        sidebarName.textContent = profile.fullName || "";
                        sidebarEmail.textContent = profile.email || "";


                        const BASE_URL = "http://localhost:8080";

                        if (profile.profilePictureUrl) {
                            profileAvatar.src = BASE_URL + profile.profilePictureUrl;
                            sidebarProfile.src = BASE_URL + profile.profilePictureUrl;


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




        loadLawyers();


        function loadLawyers() {
            $.ajax({
                url: "http://localhost:8080/api/client/explore/getAllLawyers", // adjust backend endpoint
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: function (response) {
                    var $grid = $(".lawyer-grid");
                    $grid.empty();

                    let data = response.data;

                    data.forEach(function (lawyer) {

                        let name = lawyer.fullName;
                        let specialties = lawyer.specialties;
                        let bio = lawyer.bio;
                        let address = lawyer.workingAddress || "";
                        let onlineFee = lawyer.onlineFee || 0;
                        let inPersonFee = lawyer.inPersonFee || 0;
                        const profileUrl = lawyer.profilePictureUrl;
                        const BASE_URL = "http://localhost:8080";
                        const url = BASE_URL + profileUrl;


                        var card = `
                    <div class="lawyer-card" data-lawyer-id="${lawyer.id}" data-lawyer-name="${name}" 
                         data-lawyer-specialty="${specialties || ''}"
                         data-lawyer-bio="${bio || ''}"
                         data-lawyer-address="${address}"
                         data-online-fee="${onlineFee}"
                         data-inperson-fee="${inPersonFee}">
                        <img src="${url || 'https://via.placeholder.com/100'}" 
                             alt="Lawyer Avatar" class="avatar">
                        <div class="name">${name}</div>
                        <div class="specialty">${specialties || ''}</div>
                        
                        <p class="description">${bio || ''}</p>
                        <a href="#" class="btn-book" data-lawyer-id="${lawyer.id}">Book Now</a>
                    </div>
                `;
                        $grid.append(card);
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching lawyers:", error);
                }
            });
        }

        function generateStars(rating) {
            var stars = "";
            var full = Math.floor(rating);
            var half = rating % 1 >= 0.5 ? 1 : 0;

            for (var i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
            if (half) stars += '<i class="fas fa-star-half-alt"></i>';
            for (var j = full + half; j < 5; j++) stars += '<i class="far fa-star"></i>';

            return stars;
        }







        // search by keywords

        // searchBtn.addEventListener("click", () => {
        //     const keyword = searchInput.value.trim();
        //     if(keyword) searchLawyers(keyword);
        // });

        //live search as typing
        searchInput.addEventListener("keyup", (e) => {
            const keyword = e.target.value.trim();
            if(keyword.length >= 2 || keyword.length === 0) {
                searchLawyers(keyword);
            }
        });

        function searchLawyers(keyword) {
            $.ajax({
                url: "http://localhost:8080/api/client/explore/searchByCategory",
                method: "GET",
                headers: { "Authorization": "Bearer " + token },
                data: { keyword: keyword },
                success: function(response) {
                    const data = response.data;
                    const $grid = $(".lawyer-grid");
                    $grid.empty();

                    data.forEach(lawyer => {
                        const BASE_URL = "http://localhost:8080";
                        const profileUrl = lawyer.profilePictureUrl ? BASE_URL + lawyer.profilePictureUrl : 'https://via.placeholder.com/100';

                        const card = `
                    <div class="lawyer-card" data-lawyer-id="${lawyer.id}">
                        <img src="${profileUrl}" alt="Lawyer Avatar" class="avatar">
                        <div class="name">${lawyer.fullName}</div>
                        <div class="specialty">${lawyer.specialties || ''}</div>
                        <p class="description">${lawyer.bio || ''}</p>
                        <a href="#" class="btn-book" data-lawyer-id="${lawyer.id}">Book Now</a>
                    </div>
                `;
                        $grid.append(card);
                    });
                },
                error: function(xhr) {
                    console.error("Search failed:", xhr.responseText);
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



