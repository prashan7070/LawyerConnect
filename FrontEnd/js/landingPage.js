
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

    document.getElementById('clientLoginSignupBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Client Login/Registration');
    window.location.href = authPage + '?role=client';
});

    document.getElementById('lawyerLoginSignupBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Lawyer Login/Registration');
    window.location.href = authPage + '?role=lawyer';
});

    document.getElementById('findLawyerBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Client Dashboard (Find a Lawyer section)');
    window.location.href = clientDashboardPage;
});

    document.getElementById('becomeLawyerBtn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecting to Lawyer Sign-up Page');
    window.location.href = authPage + '?role=lawyer&action=register';
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
