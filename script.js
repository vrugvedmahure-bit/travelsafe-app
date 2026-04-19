function call(num) {
  alert("Calling " + num);
}

function openPoliceNearby() {
  window.open("https://www.google.com/maps/search/police+near+me");
}

function openHospitals() {
  window.open("https://www.google.com/maps/search/hospitals+near+me");
}

async function getWeather() {
  let city = prompt("Enter city:");
  if (!city) return;

  let res = await fetch(`https://wttr.in/${city}?format=j1`);
  let data = await res.json();

  document.getElementById("weather").innerText =
    `${city}: ${data.current_condition[0].temp_C}°C`;
}

function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(async pos => {
    let res = await fetch(`https://wttr.in/${pos.coords.latitude},${pos.coords.longitude}?format=j1`);
    let data = await res.json();

    document.getElementById("weather").innerText =
      `Your Location: ${data.current_condition[0].temp_C}°C`;
  });
}

function showCountryNumbers() {
  let country = document.getElementById("countrySelect").value.toLowerCase();

  let data = {
    india: "100 / 108 / 101",
    usa: "911",
    uk: "999"
  };

  document.getElementById("info").innerText =
    data[country] || "Emergency: 112";
}

function getTouristTips() {
  document.getElementById("tips").innerText =
    "Stay safe, use maps, keep emergency numbers!";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("Service Worker Error:", err));
}

