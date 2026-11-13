
// ======================================
// DATHEON WEATHER FORECAST APPLICATION
// ======================================

// HTML elements
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-btn");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weather-description");
const weatherIcon = document.getElementById("weather-icon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");

const forecastContainer = document.getElementById("forecast-container");
const errorMessage = document.getElementById("error-message");
const loadingMessage = document.getElementById("loading-message");

// OpenWeatherMap API URLs
const CURRENT_WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";

// Fetch weather information
async function getWeather(city) {
    try {
        errorMessage.style.display = "none";
        loadingMessage.textContent = "Loading weather information...";
        searchButton.disabled = true;

        if (!city.trim()) {
            throw new Error("Please enter a city name.");
        }

        if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
            throw new Error("Please add your OpenWeatherMap API key in config.js.");
        }

        const currentUrl =
            `${CURRENT_WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const forecastUrl =
            `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        // Fetch both API responses
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        // Check for API errors
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error("City not found. Please check the spelling.");
            }

            if (currentResponse.status === 401) {
                throw new Error("API key is invalid or not activated yet.");
            }

            throw new Error("Unable to retrieve weather information.");
        }

        if (!forecastResponse.ok) {
            throw new Error("Unable to retrieve the five-day forecast.");
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(currentData);
        displayForecast(forecastData);

        loadingMessage.textContent = "";

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = "block";
        loadingMessage.textContent = "";
        forecastContainer.innerHTML =
            "<p>Forecast unavailable. Please try again.</p>";

    } finally {
        searchButton.disabled = false;
    }
}

// Display current weather
function displayWeather(data) {
    cityName.textContent =
        `${data.name}, ${data.sys.country}`;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    weatherDescription.textContent =
        data.weather[0].description;

    humidity.textContent =
        `${data.main.humidity}%`;

    windSpeed.textContent =
        `${data.wind.speed} m/s`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherIcon.alt = data.weather[0].description;
    weatherIcon.hidden = false;

    changeBackground(data);
}

function changeBackground(data) {
    const condition = data.weather[0].main.toLowerCase();

    const currentTime = data.dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    const isNight = currentTime < sunrise || currentTime >= sunset;

    if (isNight) {
        document.body.style.background =
            "linear-gradient(135deg, #141e30, #243b55)";
    } 
    else if (condition.includes("rain") ||
             condition.includes("drizzle") ||
             condition.includes("thunderstorm")) {
        document.body.style.background =
            "linear-gradient(135deg, #485563, #29323c)";
    } 
    else if (condition.includes("snow")) {
        document.body.style.background =
            "linear-gradient(135deg, #83a4d4, #b6fbff)";
    } 
    else if (condition.includes("cloud")) {
        document.body.style.background =
            "linear-gradient(135deg, #757f9a, #d7dde8)";
    } 
    else if (condition.includes("clear")) {
        document.body.style.background =
            "linear-gradient(135deg, #56ccf2, #2f80ed)";
    } 
    else {
        document.body.style.background =
            "linear-gradient(135deg, #667eea, #764ba2)";
    }
}

// Display five-day forecast
function displayForecast(data) {
    const dailyForecasts = {};

    // Group forecast entries by date
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = [];
        }

        dailyForecasts[date].push(item);
    });

    // Select one forecast near midday for each day
    const fiveDays = Object.values(dailyForecasts)
        .map(dayEntries => {
            return dayEntries.reduce((closest, item) => {
                const hour = Number(item.dt_txt.split(" ")[1].slice(0, 2));

                const closestHour =
                    Number(closest.dt_txt.split(" ")[1].slice(0, 2));

                return Math.abs(hour - 12) < Math.abs(closestHour - 12)
                    ? item
                    : closest;
            });
        })
        .slice(0, 5);

    // Create forecast cards
    forecastContainer.innerHTML = fiveDays.map(day => {
        const date = new Date(day.dt * 1000);

        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const icon = day.weather[0].icon;

        return `
            <div class="forecast-card">
                <h3>${dayName}</h3>

                <img
                    src="https://openweathermap.org/img/wn/${icon}@2x.png"
                    alt="${day.weather[0].description}"
                >

                <p>${Math.round(day.main.temp)}°C</p>

                <p>${day.weather[0].main}</p>
            </div>
        `;
    }).join("");
}

// Search button
searchButton.addEventListener("click", function() {
    getWeather(cityInput.value);
});

// Search using Enter key
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather(cityInput.value);
    }
});
