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
})