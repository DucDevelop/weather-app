import "../styling/style.css";
import cloudyicon from  "../../assets/weather-cloudy.svg"
import rainyicon from "../../assets/weather-rainy.svg"
import partlycoudlyicon from "../../assets/weather-partly-cloudy.svg"
import sunnyicon from "../../assets/weather-sunny.svg"


console.log("Hello");

async function getWeatherData(location) {

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${API_KEY}&contentType=json`;
  try {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    let data = await response.json();
    console.log(data);
    return data;
  } catch (e) {
    console.log(e);
  }
}

function processWeatherData(data) {
  const result = {};

  result.condition = data.currentConditions.conditions;
  result.humidity = data.currentConditions.humidity;
  result.sunrise = data.currentConditions.sunrise;
  result.sunset = data.currentConditions.sunset;
  result.temperature = data.currentConditions.temp;
  result.uv = data.currentConditions.uvindex;
  result.temperature_max = data.days[0].tempmax;
  result.temperature_min = data.days[0].tempmin;

  result.forecast = [];

  for (let i = 1; i < 6; ++i) {
    result.forecast.push({
      temperature_max: data.days[i].tempmax,
      temperature_min: data.days[i].tempmin,
      condition: data.days[i].conditions,
    });
  }

  console.log(result);
  return result;
}


function getImage(description) {

  if (description.toLocaleLowerCase().includes("overcast")) {
    return cloudyicon
  }
  if (description.toLocaleLowerCase().includes("rainy")) {
    return rainyicon
  }
  if (description.toLocaleLowerCase().includes("cloudy")) {
    return partlycoudlyicon
  }
  if (description.toLocaleLowerCase().includes("clear")) {
    return sunnyicon
  }

}

function renderWeatherdata(data) {
  const weatherContainer = document.createElement("div");
  weatherContainer.setAttribute("id", "weather-today");

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("weather-icon", "weather-today");

  imageContainer.style.backgroundImage = `url(${getImage(data.condition)})`

  const data_copy = { ...data };
  delete data_copy.forecast;

  weatherContainer.appendChild(imageContainer);

  for (const [key, value] of Object.entries(data_copy)) {
    console.log(key, value);
    const span = document.createElement("p");
    span.textContent = `${key}: ${value}`;
    weatherContainer.appendChild(span);
  }

  const weatherToday = document.querySelector("div#weather-today");
  weatherToday.parentElement.replaceChild(weatherContainer, weatherToday);
  console.log(data_copy);
}

function renderWeatherforecast(forecastData) {
  const weatherForecastOld = document.querySelector('div#weather-forecast')


  const weatherContainer = document.createElement("div");
  weatherContainer.setAttribute("id", "weather-forecast");

  forecastData.forEach((weather, idx) => {
    const forecastContainer = document.createElement("div");
    forecastContainer.classList.add("forecast-card")
    
    const weekDay = document.createElement("p");
    weekDay.classList.add("weekday")

    let date = new Date()
    // add days in millisecs
    date.setTime(date.getTime() +  60 * 60 * 24 * 1000 * (idx+1))

    weekDay.textContent = date.toLocaleDateString("en", { weekday: "short" })


    forecastContainer.appendChild(weekDay)


    const imageContainer = document.createElement("div");
    imageContainer.classList.add("weather-icon");
    imageContainer.style.backgroundImage = `url(${getImage(weather.condition)})`

    forecastContainer.appendChild(imageContainer);
    
    const forecast_copy = {...weather}
    delete forecast_copy.condition

    for (const [key, value] of Object.entries(forecast_copy)) {
      const span = document.createElement("p");
      span.textContent = `${key}: ${value} °C`;
      forecastContainer.appendChild(span);
    }
    weatherContainer.appendChild(forecastContainer)
    
    
  });

  weatherForecastOld.parentNode.replaceChild(weatherContainer, weatherForecastOld)
}

function showLoading() {
  document.querySelector("div#weather-loading").style.display = "block"
  document.querySelector("div#weather-today").style.display = "none"
  document.querySelector("div#weather-forecast").style.display = "none"
}
function finishedLoading() {
  document.querySelector("div#weather-loading").style.display = "none"
  document.querySelector("div#weather-today").style.display = "block"
  document.querySelector("div#weather-forecast").style.display = "flex"
}



document.querySelector("button").addEventListener("click", () => {

  showLoading()
  const city = document.querySelector("input").value;
  getWeatherData(city)
    .then((result) => {
      const data = processWeatherData(result);
      renderWeatherdata(data);
      renderWeatherforecast(data.forecast)
    })
    .catch((e) => console.log(e))
    .finally(finishedLoading);
});
