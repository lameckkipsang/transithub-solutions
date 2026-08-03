// This is my first part of login,signup and dashboard authentication and redirect and also a functional logout feature,also fixed an error.
document.addEventListener("DOMContentLoaded", function(){
    class User {
        constructor(name, email, password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }

        register() {
            localStorage.setItem("userFullName", this.name);
            localStorage.setItem("userEmail", this.email);
            localStorage.setItem("userPassword", this.password);
        }
        static login(email,password){
            let savedEmail = localStorage.getItem("userEmail");
            let savedPassword = localStorage.getItem("userPassword");
            if (!savedEmail || !savedPassword){
                alert("No amount found! Please sign up first.")
                return false;
            }
            if (email === savedEmail && password ===savedPassword){
                localStorage.setItem("isLoggedIn", "true");
                return true;
            } else{
                alert("Inavalid email or password.");
                return false;
            }
        }
    }
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function(e) {
            e.preventDefault();
            let name = document.getElementById("signupName").value;
            let email = document.getElementById("signupEmail").value;
            let password = document.getElementById("signupPassword").value;
            let newUser = new User(name, email, password);
            newUser.register(); 
            alert("Account created successfully! Please log in.");
            window.location.href = "login.html";
        });
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm){
        loginForm.addEventListener("submit", function(e){
            e.preventDefault();
            let email = document.getElementById("loginEmail").value;
            let password = document.getElementById("loginPassword").value;
            if (User.login(email,password)){
                window.location.href = "dashboard.html";
            }
        })
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
            let priceInput = document.getElementById("carPrice").value;
            let newCar = {
                make: make,
                description: desc,
                price: priceInput
            };

            let cars = JSON.parse(localStorage.getItem("carListings")) || [];
            cars.push(newCar);
            localStorage.setItem("carListings", JSON.stringify(cars));

            carForm.reset();
            displayCarListings();
        });
    }
    function displayCarListings() {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        let dynamicContainer = document.getElementById("dynamicCardsContainer");
        if (!dynamicContainer) return;
        let htmlContent = "";
        for (let i = 0; i < cars.length; i++) {
            let car = cars[i];
            
            htmlContent += `
                <div class="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6 border border-gray-100 dynamic-car-card">
                    <div class="w-full md:w-1/3 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold">New Listing</div>
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                            <h3 class="text-xl font-bold">${car.make}</h3>
                            <p class="text-gray-600 text-sm mt-2">${car.description}</p>
                            <div class="text-yellow-400 text-xl tracking-widest mt-2">★★★★★</div>
                        </div>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="font-bold text-lg text-blue-900">${car.price}</span>
                            <button type="button" class="delete-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-bold" data-index="${i}">Delete Listing</button>
                        </div>
                    </div>
                </div>
            `;
        }
        dynamicContainer.innerHTML = htmlContent;
        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", function() {
                let index = this.getAttribute("data-index");
                deleteCarListing(index);
            });
        });
    }
    function deleteCarListing(index) {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        cars.splice(index, 1);
        localStorage.setItem("carListings", JSON.stringify(cars));
        displayCarListings();
    }
    const weatherInfo = document.getElementById("weatherInfo");
    if (weatherInfo) {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2864&longitude=36.8172&current_weather=true')
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                let temp = data.current_weather.temperature;
                let wind = data.current_weather.windspeed;
                weatherInfo.textContent = `Temperature: ${temp}°C | Wind Speed: ${wind} km/h — Conditions optimal for dispatch.`;
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                weatherInfo.textContent = "Live weather data currently unavailable.";
            });
    }
})