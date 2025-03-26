///////// API-url:s //////////

let faviconUrl = "https://www.google.com/s2/favicons?domain=";

let pokeBaseUrl = "https://pokeapi.co/api/v2/pokemon/";

let unsplashUrl =
  "https://api.unsplash.com/photos/random?orientation=landscape&query=flowers";

let smhiUrl =
  "https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2";

const approvedTimeUrl = `${smhiUrl}/approvedtime.json`;

///////// HTML ELEMENTS (get or create) ///////

const linkModule = document.getElementById("link-module");
const weatherModule = document.getElementById("weather-module");
const apiModule = document.getElementById("api-module");
const notesModule = document.getElementById("notes-module");

const headline = document.getElementById("headline");
const dateTime = document.getElementById("time-date");
const textArea = document.createElement("textarea");
const body = document.querySelector("body");
const linkForm = document.createElement("form");
linkForm.id = "linkForm";

////////// Variables //////////

let notesText = "";
let links = [];

////////// Arrays ////////////

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const weatherDesc = [
  "Clear sky",
  "Nearly clear sky",
  "Variable cloudiness",
  "Halfclear sky",
  "Cloudy sky",
  "Overcast",
  "Fog",
  "Light rain showers",
  "Moderate rain showers",
  "Heavy rain showers",
  "Thunderstorm",
  "Light sleet showers",
  "Moderate sleet showers",
  "Heavy sleet showers",
  "Light snow showers",
  "Moderate snow showers",
  "Heavy snow showers",
  "Light rain",
  "Moderate rain",
  "Heavy rain",
  "Thunder",
  "Light sleet",
  "Moderate sleet",
  "Heavy sleet",
  "Light snowfall",
  "Moderate snowfall",
  "Heavy snowfall",
];

const typeColors = [
  { type: "water", color: "blue" },
  { type: "fire", color: "red" },
  { type: "grass", color: "green" },
  { type: "ghost", color: "#2b1f18ef" },
  { type: "ground", color: "brown" },
  { type: "fairy", color: "pink" },
  { type: "dark", color: "black" },
  { type: "rock", color: "#6b4c3aef" },
  { type: "dragon", color: "darkblue" },
  { type: "psychic", color: "#c20b76ef" },
  { type: "normal", color: "gray" },
  { type: "electric", color: "#e6d329ef" },
  { type: "bug", color: "#0fb100ef" },
  { type: "ice", color: "#05cfdd" },
  { type: "flying", color: "lightblue" },
  { type: "fighting", color: "darkred" },
  { type: "poison", color: "purple" },
  { type: "steel", color: "#01495fef" },
];

//////////// Event listeners ///////////

document.addEventListener("click", removeLink); // Finds closest .close element on click, removes it
linkForm.addEventListener("submit", addLink); // Submit new link
headline.addEventListener("input", editHeadline); // Saves edits to headline
textArea.addEventListener("input", updateNotes); // Saves edits to notes

// Starts running updates of time and notes after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  const dateTimeId = window.setInterval(updateTime, 1000);
});


//////////// API functions ///////////

// Gets and returns favicon url
function favIcon(url) {
  let fetchUrl = faviconUrl + url;

  return fetchUrl;
}

// Random background picture (flowers) - (UNSPLASH)
async function getBgPic() {
  try {
    const response = await fetch(unsplashUrl, {
      method: "GET",
      headers: {
        "Accept-version": "v1",
        Authorization: key,
      },
    });

    if (response.ok) {
      const picData = await response.json();

      const body = document.querySelector("body");

      body.style.backgroundImage = `url("${picData.urls.regular}")`;
      body.style.backgroundSize = "cover";
    } else {
      throw new Error("Error accessing UNSPLASH API");
    }
  } catch (error) {
    console.error(error);
  }
}

// Checks for geolocation // Then runs SMHI
function geoLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      loadSMHI(position.coords.latitude, position.coords.longitude);
    });
  } else {
    const noWeather = document.createElement("p");
    noWeather.textContent = "Please enable geolocation in your browser!";
    weatherModule.insertBefore(noWeather, null);
  }
}

// Connects to SMHI API and fetches weather data for the next 67h
async function loadSMHI(wantedLatitude, wantedLongitude) {
  const pointDataUrl = `${smhiUrl}/geotype/point/lon/${wantedLongitude}/lat/${wantedLatitude}/data.json`;

  // Checks if time stamp of request is ok
  async function getApprovedTime() {
    try {
      const approvedTimeResponse = await fetch(approvedTimeUrl);

      if (!approvedTimeResponse.ok) {
        throw new Error("Error with time response from SMHI");
      }

      const approvedTime = await approvedTimeResponse.json();
    } catch (error) {
      console.error(error);
    }
  }
  // Gets weather data
  async function getPointData() {
    try {
      const pointDataResponse = await fetch(pointDataUrl);

      if (!pointDataResponse.ok) {
        throw new Error("Error connecting to SMHI Data");
      }
      const pointData = await pointDataResponse.json();
      let tempArr = [];
      const twodays = new Date(Date.now()).getDate() + 2;
      console.log("twodays " + twodays);

      console.log(pointData);

      pointData.timeSeries.forEach((time) => {
        console.log(time.validTime);
        if (tempArr.length <= 3) {
          if (pointData.timeSeries.indexOf(time) === 0) {
            tempArr.push(time);
          } else if (time.validTime.includes("14:00")) {
            tempArr.push(time);
          } else if (time.validTime.includes(twodays + "T12:00")) {
            tempArr.push(time);
          }
        }
      });
      console.log(tempArr);
      weatherDisplay(tempArr);
    } catch (error) {
      console.error(error);
    }
  }
  getApprovedTime();
  getPointData();
}

// Gets selected weather data from SMHI as array, formats and displays it
function weatherDisplay(arr) {
  arr.forEach((obj) => {
    const date = new Date(Date.parse(obj.validTime));
    const currentDate = new Date(Date.now());
    const today = currentDate.getDay();
    const day = date.getDay();
    console.log(currentDate.getDate());
    const weatherElement = document.createElement("div");
    weatherElement.className = "weatherDiv";

    const temperature = Math.round(
      obj.parameters.find((parameter) => parameter.name === "t").values[0]
    );

    const weatherSymbol = obj.parameters.find(
      (parameter) => parameter.name === "Wsymb2"
    ).values[0];

    const weatherTime = obj.validTime.slice(11, 16);
    console.log(arr.indexOf(obj) + " arr index of");
    let dayTitle = "";

    if (day === today) {
      dayTitle = "Current";
      console.log(dayTitle + " current?");
    }
    if (arr.indexOf(obj) === 1) {
      dayTitle = "Today";
      console.log(dayTitle + " today?");
    }
    if (arr.indexOf(obj) === 2) {
      dayTitle = "Tomorrow";
      console.log(dayTitle + " tomorrow");
    }
    if (arr.indexOf(obj) === 3) {
      dayTitle = weekdays[day];
    }

    weatherElement.innerHTML = `
        
        <object data="./IMAGES/${weatherSymbol}.svg" class="weathersymbol" alt="väder"></object>
        <p class = "weekday">${dayTitle}</p>
        <div class="temp-desc">
        <p class = "temp">${temperature}° C</p>
        <p class = "w-desc">${weatherDesc[weatherSymbol - 1]}</p>
        </div>`;

    weatherModule.insertBefore(weatherElement, null);
  });
}

// Gets data about random pokemon from PokeAPI
async function randomPokemon() {
  let monId = Math.ceil(Math.random() * 1025);
  pokeBaseUrl += `${monId.toString()}/`;

  fetch(pokeBaseUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erorr in response fron PokeAPI");
      }
      return response.json();
    })
    .then((data) => {
      let imgurl = data.sprites.front_default;

      let types = data.types;

      const pokeTypes = document.createElement("div");
      pokeTypes.className = "poketypes";

      types.forEach((type) => {
        const atype = document.createElement("p");
        atype.className = "type";

        typeColors.forEach((color) => {
          if (color.type === type.type.name) {
            atype.style.backgroundColor = color.color;
          }
        });

        atype.innerHTML = `
            ${type.type.name}
            `;
        pokeTypes.insertBefore(atype, null);
      });

      apiModule.innerHTML += `
        <div id="pokemon">
            <img src="${imgurl}"/>
            <p class ="pokename">${data.name}</p>
        </div>
        `;

      const pokediv = document.getElementById("pokemon");
      pokediv.insertBefore(pokeTypes, null);
    })
    .catch((error) => {
      console.error("Error", error);
    });
}

////////// Startup functions /////////////

// Runs all startup functions:

function initializeModules() {
  linkModule.innerHTML = `
    <h2>Links</h2>
    `;

  weatherModule.innerHTML = `
    <h2>Weather</h2>
    `;

  apiModule.innerHTML = `
    <h2>A pokemon!</h2>
    `;

  notesModule.innerHTML = `
    <h2>Notes</h2>
    `;
  notesModule.insertBefore(textArea, null);

  loadLinks(); // loads links from storage
  linkInput(); // Sets up link input window
  loadNotes(); // Loads notes from storage
  randomPokemon(); // Loads Poke API
  getHeadline(); // Loads Headline from storage
  geoLocation(); // Checks if geolocation works, then loads Weather API (SMHI)
}

// Gets page headline from localstorage
function getHeadline() {
  headline.value = localStorage.getItem("headline");
}

// Gets links from localstorage
function loadLinks() {
  if (!localStorage.getItem("links")) {
    localStorage.setItem("links", links);
  } else {
    links = JSON.parse(localStorage.getItem("links"));
  }
  links.forEach((link) => {
    const aLink = document.createElement("div");
    aLink.className = "linkdiv";
    aLink.innerHTML = `<a href="${link.url}" class="link"><img src="${link.favicon}" class="favicon"/>${link.title} </a><button class="close" id=${link.title}>x</button`;

    linkModule.appendChild(aLink);

    links.push(link);
  });

  const butt = document.createElement("button");
  butt.id = "addlink";
  butt.type = "button";
  butt.setAttribute("onclick", "javascript: openLinkPop();");
  butt.innerHTML = `<img src="./IMAGES/add.gif" id="add" /><p>Add link</p>`;
  linkModule.insertBefore(butt, null);
}

// Gets notes from storage
function loadNotes() {
  if (!localStorage.getItem("notes")) {
    localStorage.setItem("notes", JSON.stringify(""));
  } else {
    notesText = JSON.parse(localStorage.getItem("notes"));
    textArea.value = notesText;
  }
}

//////////// User utility functions //////////

// Creates new link object and sends it to update function
function addLink() {
  const url = document.getElementById("url").value;
  const title = document.getElementById("title").value;
  const favicon = favIcon(extractHostname(url));
 const added = {url, title, favicon};
  console.log("added" + added);
  updateLinks(added);
}

// Updates links in storage on addition
function updateLinks(added) {
  if (localStorage.getItem("links").length > 1) {
    links = JSON.parse(localStorage.getItem("links"));
  }

  if (links.length >= 4) {
    window.alert("No more room for links! Try removing an old one first!");
  } else {
    links.push(added);
    localStorage.setItem("links", JSON.stringify(links));
  }
}

// Removes link from storage, called from event listener
function removeLink(event) {
  const target = event.target.closest(".close");

  if (target) {
    linkModule.removeChild(target.parentNode);
    links = JSON.parse(localStorage.getItem("links"));
    let remove = links.indexOf((element) => element.title === target.id);
    links.splice(remove, 1);
    localStorage.setItem("links", JSON.stringify(links));
  }
}

// Reacts to editing of page headline, saves to storage
function editHeadline(event) {
  let headlineText = event.target.value;

  localStorage.setItem("headline", headlineText);
}

// Finds hostname in link url, returns it

function extractHostname(url) {
  let hostname;

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  hostname = hostname.split(":")[0];
  hostname = hostname.split("?")[0];

  return hostname;
}

// Saves updates to notes
function updateNotes() {
  localStorage.setItem("notes", JSON.stringify(textArea.value));
}

//////////// Pop-up functions ////////////

// The link input pop-up element
function linkInput() {
  const formpop = document.createElement("div");

  formpop.className = "new-link-popup";
  formpop.id = "new-link-popup";

  formpop.insertBefore(linkForm, null);

  linkForm.innerHTML = `

    <h2>Enter new link:</h2>
    <br/>
    <label for="url"><b>URL:</b></label>
    <input type="text" placeholder="Url" name="url" id="url" value="http://" className="new-link-input" required>
    <br/>
    <label for="title"><b>Title:</b></label>
    <input type="text" placeholder="Title" name="title" id="title" className="new-link-input" required>
    <br/></br>
    <button type="submit" class="btn">Add link</button>
    
    <button type="button" class="btn cancel" onclick="closeLinkPop()">Cancel</button>

`;
  document.getElementById("modules").insertBefore(formpop, null);
}

function openLinkPop() {
  document.getElementById("new-link-popup").style.display = "block";
}

function closeLinkPop() {
  document.getElementById("new-link-popup").style.display = "none";
}

/////////// Run-on-interval functions //////////

function updateTime() {
  const time = new Date(Date.now());
  let day = time.getDate();
  let month = time.getMonth();
  let year = time.getFullYear();
  let hr = time.getHours();
  let min = time.getMinutes();

  if (Number(min) <= 9) {
    min = `0${min}`;
  }
  if (Number(hr) <= 9) {
    hr = `0${hr}`;
  }

  const displayTime = `${hr}:${min}`;

  const displayDate = `${day} ${months[month]} ${year}`;

  dateTime.innerHTML = `<p class="bold">${displayTime}</p>
                          <p>${displayDate}</p>`;
}

// runs scripts
initializeModules();
