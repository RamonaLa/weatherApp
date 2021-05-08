var inputField = document.getElementById("city");

var tempField = document.getElementById("temp");
var humidityField = document.getElementById("humidity");
var pressureField = document.getElementById("pressure");
var descriptionField = document.getElementById("description");
var minTempField = document.getElementById("minTemp");
var maxTempField = document.getElementById("maxTemp");
var weatherIcon = document.getElementById("image");

var mapField = document.getElementById("map");

var day1 = document.getElementById("day1");

let httpRequest = new XMLHttpRequest();
let httpRequestForIcon = new XMLHttpRequest();
let httpRequestForDays = new XMLHttpRequest();

document.getElementById("weather").addEventListener("click", showWeather);
document
  .getElementById("weatherOnDays")
  .addEventListener("click", showWeatherOnDays);
inputField.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    showWeather();
    showWeatherOnDays();
  }
});

function showWeather() {
  resetPage();

  var city = inputField.value;

  if (city === "") {
    inputField.classList.add("invalid");
  } else {
    inputField.classList.remove("invalid");

    httpRequest.addEventListener("load", displayWeather2);

  let scaleOption = getScalePreferrence();
  if(scaleOption == "celsius"){
    httpRequest.open(
      "GET",
      "https://api.openweathermap.org/data/2.5/weather?appid=69518b1f8f16c35f8705550dc4161056&units=metric&lang=ro&q=" +
        city
    );
  }else{
    httpRequest.open(
      "GET",
      "https://api.openweathermap.org/data/2.5/weather?appid=69518b1f8f16c35f8705550dc4161056&units=imperial&lang=ro&q=" +
        city
    );
  }
    httpRequest.send();
  }
}

function displayWeather2() {

  if (httpRequest.status === 200) {
    var responseObject = JSON.parse(httpRequest.responseText);

    weatherIcon.innerHTML =
      "<img width='60px' src='" +
      "http://openweathermap.org/img/w/" +
      responseObject.weather[0].icon +
      ".png" +
      "'>";
    tempField.innerHTML = responseObject.main.temp;
    humidityField.innerText = responseObject.main.humidity;
    pressureField.innerText = responseObject.main.pressure;
    descriptionField.innerText = responseObject.weather[0].description;
    minTempField.innerText = responseObject.main.temp_min;
    maxTempField.innerText = responseObject.main.temp_max;
    mapField.innerHTML =
      '<div id="mapBox" ><iframe width="100%" height="300" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=300&amp;hl=ro&amp;q=' +
      responseObject.coord.lat +
      ",%20" +
      responseObject.coord.lon +
      '+(City)&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"></iframe></div>';

    inputField.value = "";
  }
}

function showWeatherOnDays() {
  resetPage();

  var city = inputField.value;

  if (city === "") {
    inputField.classList.add("invalid");
  } else {
    inputField.classList.remove("invalid");

    httpRequestForDays.addEventListener("load", displayWeatherOnDays);

    let scaleOption = getScalePreferrence();
    if(scaleOption == "celsius"){
      httpRequestForDays.open(
          "GET",
          "https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=metric&lang=ro&q=" +
            city
        );
    }else{
      httpRequestForDays.open(
        "GET",
        "https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=imperial&lang=ro&q=" +
          city
      );
    }
    httpRequestForDays.send();
  }
}

function displayWeatherOnDays() { 
  if (httpRequestForDays.status === 200) {
    var responseObjectForDays = JSON.parse(httpRequestForDays.responseText);

    displayDates(responseObjectForDays);
    displayDataPerHour(responseObjectForDays);

    inputField.value = "";
  }
}

function displayDates(response) {
  day1.innerText = "Ziua: " + response.list[0].dt_txt.split(" ")[0];

  var currentDay = response.list[0].dt_txt.split(" ")[0];
  var dayNo = 1;

  for (let i = 0; i < response.list.length; i++) {
    if (currentDay != response.list[i].dt_txt.split(" ")[0]) {
      currentDay = response.list[i].dt_txt.split(" ")[0];
      dayNo++;
      document.getElementById("day" + dayNo).innerText =
        "Ziua: " + response.list[i].dt_txt.split(" ")[0];
    }
  }
}

function displayDataPerHour(response) {
  var currentDay = response.list[0];
  var index = 1;

  for (var i = 0; i < response.list.length; i++) {
    if (
      currentDay.dt_txt.split(" ")[0] === response.list[i].dt_txt.split(" ")[0]
    ) {
      currentDay = response.list[i];
      addDataBox(currentDay, index);
    } else {
      currentDay = response.list[i];
      index++;
      addDataBox(currentDay, index);
    }
  }
}

function addDataBox(day, index) { 
  var icon = document.createElement("div");
  icon.innerHTML =
    "<img width='60px' src='" +
    "http://openweathermap.org/img/w/" +
    day.weather[0].icon +
    ".png" +
    "'>";

  var hour = document.createElement("p");
  hour.innerText = "Ora: " + day.dt_txt.split(" ")[1];

  var temperature = document.createElement("p");
  temperature.innerText = "Temperatura: " + day.main.temp;

  var description1 = document.createElement("p");
  description1.innerText = "Descriere: " + day.weather[0].description;

  var dataBox = document.createElement("div");
  dataBox.classList.add("boxWithData");
  dataBox.appendChild(icon);
  dataBox.appendChild(hour);
  dataBox.appendChild(temperature);
  dataBox.appendChild(description1);

  document.getElementById("day" + index).appendChild(dataBox);
}

function resetPage() {

  var weatherInputs = document.getElementsByClassName("weatherData");
  var daysDetails = document.getElementsByClassName("daysFromPage");

  for (let i = 0; i < weatherInputs.length; i++) {
    weatherInputs[i].innerHTML = "";
  }

  for (let i = 0; i < daysDetails.length; i++) {
    daysDetails[i].innerHTML = "";
  }

  document.getElementById("map").innerHTML = "";
  weatherIcon.innerHTML = "";
}

////////////////// Cookie/storage for temp. scale //////////////////////
const SCALE = "scale";
const DEFAULT_SCALE = "celsius";

var scaleSelect = document.getElementById("scaleSelect");

window.addEventListener("load", selectScaleBasedOnPreference);

scaleSelect.addEventListener("change", updatePreference);

function updatePreference(){
  getLocation();
  localStorage.setItem(SCALE, scaleSelect.value);
  document.cookie = `${SCALE}=${scaleSelect.value};max-age=` + 60*60*24*365;
  resetPage();
}

function selectScaleBasedOnPreference(){ 
  let scalePreference = getScalePreferrence();
  scaleSelect.value = scalePreference;
}

function getScalePreferrence(){ 
  let scalePreference = localStorage.getItem(SCALE);
  if(scalePreference == null){
    scalePreference = getCookie(SCALE);
  }
  if(scalePreference == ""){
    scalePreference = DEFAULT_SCALE;
  }
  return scalePreference;
}
 
function getCookie(cname){
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i< ca.length; i++){
    var c = ca[i];
    while(c.charAt(0) == ' '){
      c = c.substring(1);
    }
    if(c.indexOf(name) == 0){
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

///////////////////////////// Geolocation ////////////////////////////////////////////

window.addEventListener("load", getLocation);

function getLocation(){
  navigator.geolocation.getCurrentPosition( logPosition );
}

function logPosition(position){
  var defaultUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=metric&lang=ro&lon=${position.coords.longitude}&lat=${position.coords.latitude}`;

  fetch(defaultUrl)
  .then(response => response.json())
  .then(result => {
    inputField.value = result.city.name;
    showWeather();
    showWeatherOnDays();
  })
}