// This is my first part of login,signup and dashboard authentication and redirect and also a functional logout feature,also fixed an error.
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

            let savedEmail = localStorage.getItem("userEmail");
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
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("isLoggedIn");
            window.location.href = "index.html";
        });
    }
    const carForm = document.getElementById("carListingForm");
    const container = document.getElementById("carListingsContainer");
    
    if (carForm && container) {
        displayCarListings();

        carForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let make = document.getElementById("carMake").value;
            let desc = document.getElementById("carDesc").value;

            let newCar = {
                make: make,
                description: desc,
                price: ""
            };

            let cars = JSON.parse(localStorage.getItem("carListings")) || [];
            cars.push(newCar);
            localStorage.setItem("carListings", JSON.stringify(cars));

            carForm.reset();
            displayCarListings();
        });
    }
})