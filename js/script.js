// This is my first part of login,signup and dashboard authentication and redirect and also a functional logout feature,also fixed an error.
document.addEventListener("DOMContentLoaded", function(){
    const protectedPages = [
        "car-hire.html",
        "movers-quote.html",
        "transit.html",
        "movers.html",
        "dashboard.html"
    ];
    const currentPage = window.location.pathname;
    if (protectedPages.some(page => currentPage.includes(page))) {
        if (localStorage.getItem("isLoggedIn") !== "true") {
            window.location.href = "login.html";
            return;
        }
    }
    class User {
        constructor(name, email, password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }

        register() {
            let users = JSON.parse(localStorage.getItem("users")) || [];
            let existingUser = users.find(u => u.email === this.email);
            if (existingUser) {
                alert("An account with this email already exists!");
                return false;
            }
            users.push({
                name: this.name,
                email: this.email,
                password: this.password
            });

            localStorage.setItem("users", JSON.stringify(users));
            return true;
        }
        static login(email,password){
            let users = JSON.parse(localStorage.getItem("users")) || [];
            
            if (users.length === 0) {
                alert("No accounts found! Please sign up first.");
                return false;
            }
            let foundUser = users.find(u => u.email === email && u.password === password);

            if (foundUser) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", foundUser.email);
                localStorage.setItem("userFullName", foundUser.name);
                return true;
            } else {
                alert("Invalid email or password.");
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
            if (newUser.register()) { 
                alert("Account created successfully! Please log in.");
                window.location.href = "login.html";
            }
        });
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm){
        loginForm.addEventListener("submit", function(e){
            e.preventDefault();
            let email = document.getElementById("loginEmail").value;
            let password = document.getElementById("loginPassword").value;
            if (email === "admin@transithub.com" && password === "admin123") {
                localStorage.setItem("isAdmin", "true");
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "admin-dashboard.html";
                return;
            }
            if (User.login(email,password)){
                window.location.href = "dashboard.html";
            }
        })
    }
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("isLoggedIn");
            window.location.href = "../index.html";
        });
    }
    const carForm = document.getElementById("carListingForm");
    const container = document.getElementById("dynamicCardsContainer") || document.getElementById("carListingsContainer");
    const categoryPrices = {
        mini: 5000,
        sedan: 6000,
        suv5: 8000,
        suv7: 12000
    };
    if (container){
        initCarListings();
    }
    if (carForm) {
        carForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let make = document.getElementById("carMake").value;
            let desc = document.getElementById("carDesc").value;
            let priceInput = document.getElementById("carPrice").value;
            let category = document.getElementById("carCategory").value;
            let listingFee = categoryPrices[category] || 5000;
            let imageInput = document.getElementById("carImage");
            let file = imageInput.files[0];
            if (file) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    let imageDataUrl = e.target.result;

                    saveCarToStorage(make, desc, priceInput, imageDataUrl, category, listingFee);
                };
                reader.readAsDataURL(file);
            } else {
                saveCarToStorage(make, desc, priceInput, "", category, listingFee);
            }
        });
    }
    async function initCarListings() {
        let cars = JSON.parse(localStorage.getItem("carListings"));
        if (!cars || cars.length === 0) {
            try {
                let response = await fetch('../data/cars.json');
                if (!response.ok) {
                    throw new Error("Failed to load data/cars.json");
                }
                cars = await response.json();
                localStorage.setItem("carListings", JSON.stringify(cars));
            } catch (error) {
                console.error("Error fetching static car data:", error);
                cars = [];
            }
        }
        displayCarListings();
    }    
    function saveCarToStorage(make, desc, price, image, category, listingFee) {
        let currentUser = localStorage.getItem("userEmail") || "guest_user";
        let newCar = {
            owner: currentUser,
            make: make,
            description: desc,
            price: price,
            image: image,
            category: category,
            listingFee: listingFee,
            hiredUntil: 0
        };
        try {
            let cars = JSON.parse(localStorage.getItem("carListings")) || [];
            cars.push(newCar);
            localStorage.setItem("carListings", JSON.stringify(cars));
            document.getElementById("carListingForm").reset();
            displayCarListings();
            alert("Vehicle listed successfully!");
        } catch (error) {
            console.error("Storage error (Image file may be too large):", error);
            alert("This image file is too large for browser storage. Please try uploading a smaller compressed image.");
        }  
    }      
    function displayCarListings() {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        let dynamicContainer = document.getElementById("dynamicCardsContainer");
        if (!dynamicContainer) return;
        let currentUser = localStorage.getItem("userEmail");
        let isAdmin = localStorage.getItem("isAdmin") === "true";
        let htmlContent = "";
        for (let i = 0; i < cars.length; i++) {
            let car = cars[i];
            let isAvailable = !car.hiredUntil || Number(car.hiredUntil) <= Date.now();
            let statusBadge = isAvailable 
                ? `<span class="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Available</span>`
                : `<span class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">Hired Out</span>`;
            let isOwner = (car.owner === currentUser) || isAdmin;
            let avgRating = car.averageRating || "5.0";
            let totalReviews = car.ratings ? car.ratings.length : 0;
            let starsHTML = `
                <div class="flex items-center gap-2 mt-2">
                    <div class="text-yellow-400 text-lg cursor-pointer flex gap-1">
                        <span onclick="rateCar(${i}, 1)" title="1 Star">★</span>
                        <span onclick="rateCar(${i}, 2)" title="2 Stars">★</span>
                        <span onclick="rateCar(${i}, 3)" title="3 Stars">★</span>
                        <span onclick="rateCar(${i}, 4)" title="4 Stars">★</span>
                        <span onclick="rateCar(${i}, 5)" title="5 Stars">★</span>
                    </div>
                    <span class="text-xs text-gray-500 font-semibold">(${avgRating} / 5 from ${totalReviews} review(s))</span>
                </div>
            `;

            let actionButton = "";
            if (isOwner) {
                actionButton = `<button type="button" class="delete-btn bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm font-bold" data-index="${i}">Delete Listing</button>`;
            } else {
                if (isAvailable) {
                    actionButton = `<button type="button" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-bold" onclick="hireCar(${i})">Hire Car</button>`;
                } else {
                    actionButton = `<span class="text-xs text-gray-500 italic font-semibold">Currently Booked</span>`;
                }
            }
                let imageHTML = car.image 
                ? `<img src="${car.image}" class="w-full md:w-1/3 h-40 object-cover rounded-lg" alt="${car.make}">`
                : `<div class="w-full md:w-1/3 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold">New Listing</div>`;
                htmlContent += `
                <div class="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6 border border-gray-100 dynamic-car-card">
                    ${imageHTML}
                    <div class="flex-grow flex flex-col justify-between">
                        <div>
                           <div class="flex justify-between items-start">
                                <h3 class="text-xl font-bold">${car.make}</h3>
                                ${statusBadge}
                            </div>
                            <p class="text-gray-600 text-sm mt-2">${car.description}</p>
                            <p class="text-xs text-gray-400 mt-1">Owner: ${car.owner || 'System'}</p>
                            ${starsHTML}
                        </div>
                        <div class="mt-4 flex justify-between items-center">
                            <span class="font-bold text-lg text-blue-900">${car.price}</span>
                            <div>${actionButton}</div>
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
    window.rateCar = function(index, rating) {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        let car = cars[index];
        if (!car.ratings) {
            car.ratings = [];
        }

        car.ratings.push(rating);
        
        let sum = car.ratings.reduce((a, b) => a + b, 0);
        car.averageRating = (sum / car.ratings.length).toFixed(1);

        localStorage.setItem("carListings", JSON.stringify(cars));
        alert(`Thank you! You rated this vehicle ${rating} star(s).`);
        displayCarListings();
    };
    window.hireCar = function(index) {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        let car = cars[index];
        
        let days = prompt(`How many days would you like to hire the ${car.make}?`, "3");
        if (!days) return;

        let hireDurationMs = Number(days) * 24 * 60 * 60 * 1000;
        car.hiredUntil = Date.now() + hireDurationMs;

        localStorage.setItem("carListings", JSON.stringify(cars));
        alert(`Success! You have hired the ${car.make} for ${days} day(s).`);
        displayCarListings();
    };
    function deleteCarListing(index) {
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];
        let car = cars[index];
        let currentUser = localStorage.getItem("userEmail");
        let isAdmin = localStorage.getItem("isAdmin") === "true";

        if (!isAdmin && car.owner !== currentUser) {
            alert("You do not have permission to delete this listing.");
            return;
        }

        let confirmed = confirm("Are you sure you really want to delete your car listing?");
        if (confirmed){
            cars.splice(index, 1);
            localStorage.setItem("carListings", JSON.stringify(cars));
            displayCarListings();
        }   
    }
    async function fetchTransitWeather(){
       const weatherInfo = document.getElementById("weatherInfo");
       if (!weatherInfo)return; 
       try {
            let response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2864&longitude=36.8172&current_weather=true')
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            let data = await response.json();          
            let temp = data.current_weather.temperature;
            let wind = data.current_weather.windspeed;
            weatherInfo.textContent = `Temperature: ${temp}°C | Wind Speed: ${wind} km/h — Conditions optimal for dispatch.`;
        } catch(error) {
                console.error("Error fetching weather data:", error);
                weatherInfo.textContent = "Live weather data currently unavailable.";
        }
    }    
    fetchTransitWeather(); 
    if (window.location.pathname.includes("admin-dashboard.html")) {
        if (localStorage.getItem("isAdmin") !== "true") {
            window.location.href = "login.html";
        }
        const adminLogoutBtn = document.getElementById("adminLogout");
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener("click", function() {
                localStorage.removeItem("isAdmin");
                localStorage.removeItem("isLoggedIn");
                window.location.href = "login.html";
            });
        }
        loadAdminData();
    }
    function loadAdminData() {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let cars = JSON.parse(localStorage.getItem("carListings")) || [];

        let totalReceivables = 0;
        cars.forEach(car => {
            totalReceivables += Number(car.listingFee || 5000);
        });
        let receivablesElement = document.getElementById("totalReceivables");
        let listingsCountElement = document.getElementById("totalListingsCount");
        
        if (receivablesElement) receivablesElement.textContent = `Ksh ${totalReceivables.toLocaleString()}`;
        if (listingsCountElement) listingsCountElement.textContent = `${cars.length} vehicle(s)`;

        let userListContainer = document.getElementById("adminUserList");
        if (userListContainer) {
            if (users.length === 0) {
                userListContainer.innerHTML = `<p class="text-gray-500 p-4">No registered user accounts found.</p>`;
                return;
            }
            let usersHtml = "";
            users.forEach((user) => {
                let userCars = cars.filter(car => car.owner === user.email);
                let userReceivables = userCars.reduce((sum, car) => sum + Number(car.listingFee || 5000), 0);
                usersHtml += `
                    <div class="flex justify-between items-center p-4 border rounded-lg bg-gray-50 mb-4">
                        <div>
                            <p class="font-bold text-lg text-gray-900">${user.email}</p>
                            <p class="text-sm text-gray-600">Name: ${user.name || 'N/A'}</p>
                            <p class="text-sm text-gray-600">Total Active Vehicles: ${userCars.length}</p>
                            <p class="text-sm font-semibold text-blue-800 mt-1">Monthly Listing Fee Receivable Due: Ksh ${userReceivables.toLocaleString()}</p>
                        </div>
                        <button type="button" class="delete-user-btn bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition" data-email="${user.email}">Delete User Account</button>
                    </div>
                `;
            });
            userListContainer.innerHTML = usersHtml;
            const deleteUserBtns = document.querySelectorAll(".delete-user-btn");
            deleteUserBtns.forEach(btn => {
                btn.addEventListener("click", function() {
                    let emailToDelete = this.getAttribute("data-email");
                    deleteUserAccount(emailToDelete);
                });
            });
        }
    }
    function deleteUserAccount(email) {
        if (confirm("Are you sure you want to delete this user account and all their vehicle listings?")) {
            let users = JSON.parse(localStorage.getItem("users")) || [];
            let cars = JSON.parse(localStorage.getItem("carListings")) || [];
            users = users.filter(u => u.email !== email);
            cars = cars.filter(car => car.owner !== email);
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("carListings", JSON.stringify(cars)); 
            alert("User account and their listings deleted successfully.");
            loadAdminData();
        }
    }
    const navLinksContainer = document.querySelector("nav .hidden.md\\:flex") || document.querySelector("nav");
if (navLinksContainer && localStorage.getItem("isLoggedIn") === "true") {
    const navAnchorTags = navLinksContainer.querySelectorAll("a");
    navAnchorTags.forEach(anchor => {
        if (anchor.textContent.trim() === "Login") {
            anchor.textContent = "Logout";
            anchor.href = "#";
            anchor.id = "globalLogoutBtn";
            anchor.addEventListener("click", function(e) {
                e.preventDefault();
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("isAdmin");
                alert("Logged out successfully!");
                window.location.href = "../index.html"; 
            });
        }
    });
}
})