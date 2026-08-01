document.addEventListener("DOMContentLoaded", function(){
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function(e) {
            e.preventDefault();
            let name = document.getElementById("signupName").value;
            let email = document.getElementById("signupEmail").value;
            let password = document.getElementById("signupPassword").value;

            localStorage.setItem("userFullName", name);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("userPassword", password);

            alert("Account created successfully! Please log in.");
            window.location.href = "login.html";
        });
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            let email = document.getElementById("loginEmail").value;
            let password = document.getElementById("loginPassword").value;

            let savedEmail = localStorage.getItem("userPassword");
            let savedPassword = localStorage.getItem("userPassword");

            if (savedEmail && savedPassword) {
                if (email === savedEmail && password === savedPassword) {
                    localStorage.setItem("isLoggedIn", "true");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Invalid email or password.");
                }
            } else {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "dashboard.html";
            }
        });
    }
    if (window.location.pathname.includes("dashboard.html")) {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "login.html";
        }
    }
})