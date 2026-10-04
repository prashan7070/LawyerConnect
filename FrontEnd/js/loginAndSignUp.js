// const container = document.querySelector('.container');
// const registerBtn = document.querySelector('.register-btn');
// const loginBtn = document.querySelector('.login-btn');
//
// registerBtn.addEventListener('click', () => {
//    container.classList.add('active');
// });
//
// loginBtn.addEventListener('click', () => {
//     container.classList.remove('active');
// });
//
//
// $("#signInBtn").click( function () {
//     let username = $("#username").val();
//     let password = $("#password").val();
//
//     let user = {
//         username: username,
//         password: password
//     };
//
//     $.ajax({
//         url: "http://localhost:8080/auth/login",
//         method: "POST",
//         contentType: "application/json",
//         data: JSON.stringify(user),
//         success: function (response) {
//
//             // console.log(response);
//
//             localStorage.setItem("token", response.data.accessToken);
//             const token = response.data.accessToken;
//
//             if (!token) {
//                 alert("Please login first!");
//                 return;
//             }
//
//             const decoded = parseJwt(token);
//
//             // if (response.data.role === "CLIENT") {
//             //     window.location.href = "../pages/clientDashboard.pages";
//             // } else if (response.data.role === "LAWYER") {
//             //     window.location.href = "../pages/lawyerDashboard.pages";
//             // }
//             //
//             //
//             // }
//
//             if (decoded && decoded.role) {
//                     if (decoded.role === "CLIENT") {
//                         window.location.href = "../pages/clientDashBoard.html";
//                     } else if (decoded.role === "LAWYER") {
//                         window.location.href = "../pages/lawyerDashboard.html";
//                     }
//             } else {
//                         alert("Invalid token!");
//                         // window.location.href = "../pages/signIn.html";
//
//                     }
//             },
//             error: function (error) {
//                 console.log(error);
//             }
//     });
// });
//
//
//
//
//
//
//
//
// // const token = localStorage.getItem("token");
// //
// // if (!token) {
// //     alert("Please login first!");
// //     window.location.href = "../pages/signIn.html";
// //     return;
// // }
// //
// // const decoded = parseJwt(token);
// //
// // if (decoded && decoded.role) {
// //     if (decoded.role === "ADMIN") {
// //         alert("Hello Admin!");
// //     } else if (decoded.role === "USER") {
// //         alert("Hello User!");
// //     } else {
// //         alert("Hello!");
// //     }
// // } else {
// //     alert("Invalid token!");
// //     window.location.href = "../pages/signIn.html";
// // }
//
//
//
// $("#signUpBtn").click(function () {
//     let name = $("#fullName").val();
//     let username = $("#usernameSignUp").val();
//     let password = $("#passwordSignUp").val();
//     let email = $("#emailSignUp").val();
//
//     const urlParams = new URLSearchParams(window.location.search);
//     const role = urlParams.get("role");
//
//     let user = {
//         name: name,
//         username: username,
//         password: password,
//         email: email,
//         role: role.toUpperCase()
//     };
//
//     console.log(JSON.stringify(user, null, 2));
//
//     $.ajax({
//         url: "http://localhost:8080/auth/register",
//         method: "POST",
//         contentType: "application/json",
//         data: JSON.stringify(user),
//         success: function (response) {
//             // alert("Sign up successful!");
//             // window.location.href = "../pages/signIn.pages";
//             alert("Sign up successful! Please login.");
//             container.classList.remove('active');
//         },
//         error: function (xhr, status, error) {
//             alert("Sign up failed: " + error);
//         }
//     });
// });
//
//
// function parseJwt(token) {
//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(
//             atob(base64)
//                 .split('')
//                 .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//                 .join('')
//         );
//         return JSON.parse(jsonPayload);
//     } catch (e) {
//         console.error("Invalid token", e);
//         return null;
//     }
// }




    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

    loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});


    $("#signInBtn").click(function () {
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
    beforeSend: function () {
    Swal.fire({
    title: "Signing in...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => {
    Swal.showLoading();
}
});
},
    success: function (response) {
    Swal.close();

    localStorage.setItem("token", response.data.accessToken);
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("userId", response.data.userId);

    const token = response.data.accessToken;
    const role = response.data.role;

    if (!token) {
        Swal.fire({
            title: "Login Failed ❌",
            text: "No token received. Please try again.",
            icon: "error"
        });
        return;
    }

    Swal.fire({
        title: "Login Successful 🎉",
        text: "Welcome " + role,
        icon: "success",
        confirmButtonText: "Continue"
    }).then(() => {
        if (role === "ADMIN") {
            window.location.href = "../pages/adminDashboard.html";
        } else if (role === "CLIENT") {
            window.location.href = "../pages/clientDashBoard.html";
        } else if (role === "LAWYER") {
            window.location.href = "../pages/lawyerDashboard.html";
        }
    });
},
    error: function (xhr, status, error) {
    Swal.close();
    Swal.fire({
    title: "Login Failed ❌",
    text: "Invalid username or password.",
    icon: "error",
    confirmButtonText: "Retry"
});
}
});
});



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
    beforeSend: function () {
    Swal.fire({
    title: "Signing up...",
    text: "Please wait",
    allowOutsideClick: false,
    didOpen: () => {
    Swal.showLoading();
}
});
},
    success: function (response) {
    Swal.close();
    Swal.fire({
    title: "Sign Up Successful 🎉",
    text: "Please log in to continue.",
    icon: "success",
    confirmButtonText: "Login"
}).then(() => {
    container.classList.remove('active'); // switch back to login form
});
},
    error: function (xhr, status, error) {
    Swal.close();
    Swal.fire({
    title: "Sign Up Failed ❌",
    text: xhr.responseText || "Something went wrong. Please try again.",
    icon: "error"
});
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

