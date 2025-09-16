const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
   container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});


$("#signInBtn").click( function () {
    let username = $("#username").val();
    let password = $("#password").val();

    let user = {
        username: username,
        password: password
    };

    $.ajax({
        url: "http://localhost:8080/auth/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function (response) {
            // console.log(response);

            localStorage.setItem("token", response.data.accessToken);
            const token = response.data.accessToken;

            // if (!token) {
            //     alert("Please login first!");
            //     return;
            // }

            const decoded = parseJwt(token);

            // if (response.data.role === "CLIENT") {
            //     window.location.href = "../pages/clientDashboard.pages";
            // } else if (response.data.role === "LAWYER") {
            //     window.location.href = "../pages/lawyerDashboard.pages";
            // }
            //
            //
            // }

            if (decoded && decoded.role) {
                    if (decoded.role === "CLIENT") {
                        window.location.href = "../pages/clientDashBoard.html";
                    } else if (decoded.role === "LAWYER") {
                        window.location.href = "../pages/lawyerDashboard.html";
                    }
            } else {
                        alert("Invalid token!");
                        // window.location.href = "../pages/signIn.html";

                    }
            },
            error: function (error) {
                console.log(error);
            }
    });
});



// const token = localStorage.getItem("token");
//
// if (!token) {
//     alert("Please login first!");
//     window.location.href = "../pages/signIn.html";
//     return;
// }
//
// const decoded = parseJwt(token);
//
// if (decoded && decoded.role) {
//     if (decoded.role === "ADMIN") {
//         alert("Hello Admin!");
//     } else if (decoded.role === "USER") {
//         alert("Hello User!");
//     } else {
//         alert("Hello!");
//     }
// } else {
//     alert("Invalid token!");
//     window.location.href = "../pages/signIn.html";
// }



$("#signUpBtn").click(function () {
    let name = $("#fullName").val();
    let username = $("#usernameSignUp").val();
    let password = $("#passwordSignUp").val();
    let email = $("#emailSignUp").val();

    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get("role");

    let user = {
        name: name,
        username: username,
        password: password,
        email: email,
        role: role.toUpperCase()
    };

    console.log(JSON.stringify(user, null, 2));

    $.ajax({
        url: "http://localhost:8080/auth/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function (response) {
            // alert("Sign up successful!");
            // window.location.href = "../pages/signIn.pages";
            alert("Sign up successful! Please login.");
            container.classList.remove('active');
        },
        error: function (xhr, status, error) {
            alert("Sign up failed: " + error);
        }
    });
});


function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Invalid token", e);
        return null;
    }
}