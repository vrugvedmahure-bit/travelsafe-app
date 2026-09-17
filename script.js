/* =========================================
   TRAVELSAFE INDIA
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   THEME
========================================= */

function toggleTheme() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "travelSafeDarkMode",
        isDark ? "true" : "false"
    );
}


function loadTheme() {

    const darkMode =
        localStorage.getItem("travelSafeDarkMode");

    if (darkMode === "true") {

        document.body.classList.add("dark");

    }
}


/* =========================================
   GOOGLE MAPS
========================================= */

function openGoogleMaps() {

    const addressInput =
        document.getElementById("addressInput");

    const address =
        addressInput.value.trim();

    if (!address) {

        alert(
            "Please enter an address or place."
        );

        addressInput.focus();

        return;
    }

    const mapsURL =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(address);

    window.open(
        mapsURL,
        "_blank"
    );
}


/* =========================================
   DIRECTIONS
========================================= */

function getDirections() {

    const destination =
        document
            .getElementById("destinationInput")
            .value
            .trim();

    if (!destination) {

        alert(
            "Please enter a destination."
        );

        return;
    }

    const directionsURL =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(destination);

    window.open(
        directionsURL,
        "_blank"
    );
}


/* =========================================
   EMERGENCY CALL
========================================= */

function callNumber(number, service) {

    const confirmation =
        confirm(
            "Open the phone dialer for " +
            service +
            " (" +
            number +
            ")?"
        );

    if (!confirmation) {
        return;
    }

    window.location.href =
        "tel:" + number;
}


/* =========================================
   SOS
========================================= */

function showSOS() {

    const modal =
        document.getElementById("sosModal");

    modal.classList.add("show");
}


function closeSOS() {

    const modal =
        document.getElementById("sosModal");

    modal.classList.remove("show");
}


/* Close modal when clicking outside */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById("sosModal");

        if (
            event.target === modal
        ) {

            closeSOS();

        }

    }
);


/* =========================================
   NEARBY SERVICES
========================================= */

function openNearby(place) {

    const mapsURL =
        "https://www.google.com/maps/search/" +
        "?api=1&query=" +
        encodeURIComponent(place + " near me");

    window.open(
        mapsURL,
        "_blank"
    );
}


/* =========================================
   LOCATION
========================================= */

let currentLatitude = null;
let currentLongitude = null;


function getMyLocation() {

    const result =
        document.getElementById(
            "locationResult"
        );

    if (!navigator.geolocation) {

        result.innerHTML =
            "❌ Geolocation is not supported by this browser.";

        return;
    }

    result.innerHTML =
        "📍 Finding your location...";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            currentLatitude =
                position.coords.latitude;

            currentLongitude =
                position.coords.longitude;

            const accuracy =
                Math.round(
                    position.coords.accuracy
                );

            result.innerHTML = `
                <strong>📍 Location Found</strong><br>
                Latitude: ${currentLatitude.toFixed(6)}<br>
                Longitude: ${currentLongitude.toFixed(6)}<br>
                Accuracy: approximately ${accuracy} metres
            `;

        },

        function(error) {

            let message =
                "Unable to get your location.";

            if (error.code === 1) {

                message =
                    "Location permission was denied.";

            } else if (error.code === 2) {

                message =
                    "Your location could not be determined.";

            } else if (error.code === 3) {

                message =
                    "Location request timed out.";

            }

            result.innerHTML =
                "❌ " + message;

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}


/* =========================================
   SHARE LOCATION
========================================= */

function shareLocation() {

    if (
        currentLatitude === null ||
        currentLongitude === null
    ) {

        alert(
            "Please find your location first."
        );

        getMyLocation();

        return;
    }

    const locationURL =
        "https://www.google.com/maps/search/?api=1&query=" +
        currentLatitude +
        "," +
        currentLongitude;

    const shareText =
        "My current location:\n" +
        locationURL;


    if (
        navigator.share
    ) {

        navigator.share({

            title: "My TravelSafe Location",

            text: shareText,

            url: locationURL

        }).catch(function() {});

    } else {

        navigator.clipboard
            .writeText(shareText)
            .then(function() {

                alert(
                    "Location link copied to clipboard."
                );

            })
            .catch(function() {

                prompt(
                    "Copy this location link:",
                    locationURL
                );

            });

    }
}


/* =========================================
   SAFETY SCANNER
========================================= */

function safetyScanner() {

    const services = [
        "police",
        "hospital",
        "pharmacy",
        "ATM",
        "railway station"
    ];

    const search =
        services.join(" near me ");

    const url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            "police hospital pharmacy ATM railway station near me"
        );

    window.open(
        url,
        "_blank"
    );
}


/* =========================================
   WEATHER
========================================= */

async function getWeather() {

    const city =
        document
            .getElementById("cityInput")
            .value
            .trim();

    const result =
        document.getElementById(
            "weatherResult"
        );

    if (!city) {

        alert(
            "Please enter a city."
        );

        return;
    }

    result.innerHTML =
        "🌦️ Checking weather...";


    try {

        const url =
            "https://wttr.in/" +
            encodeURIComponent(city) +
            "?format=j1";

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Weather request failed."
            );

        }

        const data =
            await response.json();

        const current =
            data.current_condition[0];

        const temperature =
            current.temp_C;

        const feelsLike =
            current.FeelsLikeC;

        const humidity =
            current.humidity;

        const wind =
            current.windspeedKmph;

        const description =
            current.weatherDesc[0].value;

        result.innerHTML = `

            <h3>🌍 ${city}</h3>

            <p>
                🌡️ Temperature:
                <strong>${temperature}°C</strong>
            </p>

            <p>
                🤒 Feels Like:
                <strong>${feelsLike}°C</strong>
            </p>

            <p>
                ☁️ Condition:
                <strong>${description}</strong>
            </p>

            <p>
                💧 Humidity:
                <strong>${humidity}%</strong>
            </p>

            <p>
                💨 Wind:
                <strong>${wind} km/h</strong>
            </p>

        `;

    } catch (error) {

        result.innerHTML =
            "❌ Weather information could not be loaded. Please check the city name or internet connection.";

    }
}


/* =========================================
   WEATHER FROM LOCATION
========================================= */

function getLocationWeather() {

    const result =
        document.getElementById(
            "weatherResult"
        );

    if (!navigator.geolocation) {

        result.innerHTML =
            "❌ Location is not supported.";

        return;
    }

    result.innerHTML =
        "📍 Finding your location...";

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            try {

                /*
                   Use OpenStreetMap's
                   reverse geocoding service
                   to find the nearest city.
                */

                const geoURL =
                    "https://nominatim.openstreetmap.org/reverse" +
                    "?format=json&lat=" +
                    lat +
                    "&lon=" +
                    lon;

                const geoResponse =
                    await fetch(
                        geoURL,
                        {
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );

                const geoData =
                    await geoResponse.json();

                const address =
                    geoData.address || {};

                const city =
                    address.city ||
                    address.town ||
                    address.village ||
                    address.county ||
                    "your location";

                document
                    .getElementById("cityInput")
                    .value = city;

                getWeather();

            } catch (error) {

                result.innerHTML =
                    "❌ Could not determine your city.";

            }

        },

        function() {

            result.innerHTML =
                "❌ Location permission was denied.";

        }

    );
}


/* =========================================
   BATTERY
========================================= */

async function getBattery() {

    const result =
        document.getElementById(
            "batteryResult"
        );

    if (
        !navigator.getBattery
    ) {

        result.innerHTML =
            "Battery information is not supported by this browser.";

        return;
    }

    try {

        const battery =
            await navigator.getBattery();

        function updateBattery() {

            const percentage =
                Math.round(
                    battery.level * 100
                );

            let icon =
                "🔋";

            if (percentage <= 20) {

                icon = "🪫";

            }

            result.innerHTML = `
                ${icon}
                Battery Level:
                <strong>${percentage}%</strong>
                <br>
                Charging:
                <strong>
                    ${battery.charging ? "Yes" : "No"}
                </strong>
            `;

        }

        updateBattery();

        battery.addEventListener(
            "levelchange",
            updateBattery
        );

        battery.addEventListener(
            "chargingchange",
            updateBattery
        );

    } catch (error) {

        result.innerHTML =
            "Battery information unavailable.";

    }
}


/* =========================================
   LANGUAGE
========================================= */

function changeLanguage() {

    const language =
        document
            .getElementById(
                "languageSelect"
            )
            .value;

    const message =
        document.getElementById(
            "languageMessage"
        );


    const messages = {

        English:
            "Language selected: English",

        Hindi:
            "भाषा चुनी गई: हिन्दी",

        Marathi:
            "निवडलेली भाषा: मराठी",

        Bengali:
            "নির্বাচিত ভাষা: বাংলা",

        Tamil:
            "தேர்ந்தெடுக்கப்பட்ட மொழி: தமிழ்",

        Telugu:
            "ఎంచుకున్న భాష: తెలుగు"

    };


    message.textContent =
        messages[language] ||
        "Language selected: " + language;
}


/* =========================================
   TOURIST TIPS
========================================= */

function showTip(type) {

    const result =
        document.getElementById(
            "tipResult"
        );


    const tips = {

        railway: `
            🚆 <strong>Railway Safety</strong><br>
            Keep your luggage close and avoid accepting food or drinks from strangers.
            Check your platform and train information before boarding.
        `,

        hotel: `
            🏨 <strong>Hotel Safety</strong><br>
            Keep your room locked and avoid sharing your room number publicly.
            Save the hotel's contact details.
        `,

        mountain: `
            🏔️ <strong>Mountain Safety</strong><br>
            Stay on marked paths and check weather conditions before travelling.
            Carry enough water and inform someone about your route.
        `,

        beach: `
            🏖️ <strong>Beach Safety</strong><br>
            Follow lifeguard instructions and avoid entering unsafe water conditions.
            Keep your belongings secure.
        `,

        taxi: `
            🚕 <strong>Taxi Safety</strong><br>
            Use trusted transportation services whenever possible.
            Check the vehicle and driver details before travelling.
        `,

        night: `
            🌙 <strong>Night Travel</strong><br>
            Prefer well-lit and populated routes.
            Keep your phone charged and let someone know your travel plans.
        `,

        money: `
            💰 <strong>Money Safety</strong><br>
            Keep only the necessary amount of cash with you.
            Protect your cards, PINs and important documents.
        `,

        phone: `
            📱 <strong>Phone Safety</strong><br>
            Keep your phone charged and save important emergency numbers.
            Avoid sharing sensitive information with strangers.
        `

    };


    result.innerHTML =
        tips[type] ||
        "Select a safety topic.";

}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadTheme();

        getBattery();

    }
);
