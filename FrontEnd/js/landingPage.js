
    document.addEventListener('DOMContentLoaded', () => {
    const authPage = "../pages/LoginAndSignUp.html";
    const clientDashboardPage = "../pages/clientDashBoard.html";

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav .nav-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
    behavior: 'smooth'
});
});
});
//
//     document.getElementById('clientLoginSignupBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     alert('Redirecting to Client Login/Registration');
//     window.location.href = authPage + '?role=client';
// });
//
//     document.getElementById('lawyerLoginSignupBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     alert('Redirecting to Lawyer Login/Registration');
//     window.location.href = authPage + '?role=lawyer';
// });
//
//     document.getElementById('findLawyerBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     alert('Redirecting to Client Dashboard (Find a Lawyer section)');
//     window.location.href = clientDashboardPage;
// });
//
//     document.getElementById('becomeLawyerBtn').addEventListener('click', (e) => {
//     e.preventDefault();
//     alert('Redirecting to Lawyer Sign-up Page');
//     window.location.href = authPage + '?role=lawyer&action=register';
// });

        document.getElementById('clientLoginSignupBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Redirecting...',
                text: 'Redirecting to Client Login/Registration',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Continue',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = authPage + '?role=client';
                }
            });
        });

        document.getElementById('lawyerLoginSignupBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Redirecting...',
                text: 'Redirecting to Lawyer Login/Registration',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Continue',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = authPage + '?role=lawyer';
                }
            });
        });

        document.getElementById('findLawyerBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Redirecting...',
                text: 'Redirecting to Client Dashboard (Find a Lawyer section)',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Go',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = clientDashboardPage;
                }
            });
        });

        document.getElementById('becomeLawyerBtn').addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: 'Redirecting...',
                text: 'Redirecting to Lawyer Sign-up Page',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Proceed',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = authPage + '?role=lawyer&action=register';
                }
            });
        });




        document.getElementById('ctaClientBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Client Login/Registration');
    window.location.href = authPage + '?role=client';
});

    document.getElementById('ctaLawyerBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Lawyer Login/Registration');
    window.location.href = authPage + '?role=lawyer';
});
});
