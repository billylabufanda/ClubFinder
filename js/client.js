class Deferred {
  constructor() {
    this._fulfilled = false;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get fulfilled() {
    return this._fulfilled;
  }
  resolve(value) {
    this._fulfilled = true;
    this._resolve(value);
  }
  reject(reason) {
    this._fulfilled = true;
    this._reject(reason);
  }
}

const deferredUser = new Deferred();
const user = deferredUser.promise;
const driveClientLoaded = new Deferred();
const sheetClientLoaded = new Deferred();

/**
 * Load Sheets API client library.
 */
function loadClients() {
  sheetClientLoaded.resolve(
    gapi.client.load('https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest')
  );
  driveClientLoaded.resolve(
    gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest')
  );
}

/**
 * Find or Create the Spreadsheet
 */
const deferredSpreadsheetId = new Deferred();
const spreadsheetId = deferredSpreadsheetId.promise

async function fetchSpreadsheetId() {
  await driveClientLoaded.promise;
  await sheetClientLoaded.promise;

  // Does the sheet exist already?
  const deferredFiles = new Deferred()
  gapi.client.drive.files.list({
    pageSize: 1,
    q: `properties has { key='InternshipsFor' and value='${(await user).getEmail()}'}`,
  }).execute(result => deferredFiles.resolve(result.files));

  const files = await deferredFiles.promise

  if (files && files.length == 1) {
    deferredSpreadsheetId.resolve(files[0].id)
    console.log("Found prior Sheet " + files[0].id);
    return
  }

  // Darn, we have to create it:

  const response = await gapi.client.sheets.spreadsheets.create({
    "properties": {
      "title": `Tindernship Profile for ${(await user).getName()}`
    }
  })

  const spreadsheetId = response.result.spreadsheetId

  // And set the metadata to find it later

  gapi.client.drive.files.update({
    fileId: spreadsheetId,
    properties: {
      InternshipsFor: (await user).getEmail()
    }
  }).execute(result => {
    deferredSpreadsheetId.resolve(spreadsheetId)
    console.log("Created new sheet " + spreadsheetId);
  })
}
fetchSpreadsheetId();

// Find and display internships from form sheet
/**
 *How things need to render:
 1) The Page needs to show the first item
 2) On button click, the page needs to show the next item
 3) So run a function that displays the internship once, and then have the function increase every time button
 Ok New Plan with Dad time:
Make a class of internships
Each internship is aware of its filterability

Read spreadsheet
 Array of internships
 Things to filter against
If logged in, apply saved state
 What filters are selected
 What internships are saved
Render the UI
 Set filters to saved state
 Render the first internship that meets current filters

 */

/**
 * Holds the types of a given kind of filter, like "location" or "interest" 
 */
class FilterSet {
  constructor(name) {
    this.name = name;
    this.filterNameToInternships = new Map(); // "San Jose" => [Artik, MACLA]
    this.checkedFilterNames = new Set();
  }

  /**
   * Add the given internship as being associated to the given filterName.
   * For example, Nine Lives Foundation would be associated with San Mateo.
   */
  addInternshipToFilter(internship, filterName) {
    if (filterName.length > 0) {
      if (!this.filterNameToInternships.has(filterName)) {
        this.filterNameToInternships.set(filterName, [])
      }
      this.filterNameToInternships.get(filterName).push(internship)
      this.setFilterChecked(filterName, true)
    }
  }

  /**
   * filterName is the name of a specific filter, like "San Francisco" or "Engineering".
   * newCheckedValue is the current state of the filter checkbox/switch
   */
  setFilterChecked(filterName, isChecked) {
    if (isChecked) {
      this.checkedFilterNames.add(filterName)
    } else {
      this.checkedFilterNames.delete(filterName)
    }
  }

  filterNames() {
    return [...this.filterNameToInternships.keys()]
  }

  render() {
    this.filterNames().sort().forEach(filterName => {
      // "San Francisco" -> "filter-location-san-francisco"
      const filterId = "filter-" + this.name + "-" + filterName.toLowerCase().replace(/[^a-z0-9 ]+/g, "").trim().replace(/ +/g, "-");
      $("#" + this.name + "Filters").append(
        `<div class="col s4">
          <input type="checkbox" class="filled-in" id="${filterId}" checked="checked" />
          <label for="${filterId}">${filterName}</label>
        </div>`
      );
      const self = this
      $("#" + filterId).click(function () {
        const checked = $(this).attr("checked")
        console.log(filterId + " is now " + checked)
        self.setFilterChecked(filterName, checked)
      })
    })
  }

  /**
   * union of all internships for currently selected filters
   */
  selectedInternships() /* :Set<Internship> */ {
    const selectedInternshipsSet = new Set()
    this.checkedFilterNames.forEach(filterName => {
      const internships = this.filterNameToInternships.get(filterName)
      internships.forEach(internship =>
        selectedInternshipsSet.add(internship)
      )
    })
    return selectedInternshipsSet
  }
}

const locations = new FilterSet("locations")
const interests = new FilterSet("interests")
const typesOfWork = new FilterSet("typesOfWork")

const blankImages = [
  "/images/intern1.jpg",
  "/images/intern2.jpg",
  "/images/intern3.jpg",
  "/images/intern4.jpg",
  "/images/intern5.jpg"
]

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomBlankImage() {
  return blankImages[getRandomInt(0, blankImages.length)]
}

class Internship {
  constructor(entry) {
    this.name = entry.gsx$nameofcompany.$t
    this.location = entry.gsx$location.$t
    this.location.split(",").forEach(ea => locations.addInternshipToFilter(this, ea.trim()))
    this.interest = entry.gsx$fieldofinterest.$t
    this.interest.split(",").forEach(ea => interests.addInternshipToFilter(this, ea.trim()))
    this.jobDescription = entry.gsx$jobdescription.$t
    this.contactInfo = entry.gsx$contactinformation.$t
    this.typeOfWork = entry.gsx$typeofwork.$t
    this.typeOfWork.split(",").forEach(ea => typesOfWork.addInternshipToFilter(this, ea.trim()))
    this.numberOfStudents = entry.gsx$numberofstudents.$t
    this.logo = entry.gsx$logo.$t
  }

  // TODO: append new card to #InternshipCards

  img() {
    return (this.logo && this.logo.length > 0) ? this.logo : randomBlankImage()
  }

  render() {
    $("#InternshipCards").append(
      `<div class="col s12 m6 l4">
          <div class="card">
            <div class="card-image">
              <img src="${this.img()}">
              <span class="card-title">${this.name}</span>
              <a class="btn-floating halfway-fab waves-effect waves-light red" title="Save this internship"><i class="material-icons">star_border</i></a>
            </div>
            <div class="card-content">
              <ul class="xcollection">
                <li class="collection-item"><i class="material-icons">info</i> ${this.jobDescription}</li>
                <li class="collection-item"><i class="material-icons">location_on</i> ${this.location}</li>
                <li class="collection-item"><i class="material-icons">contact_phone</i> ${this.contactInfo}</li>
                <li class="collection-item"><i class="material-icons">work</i> ${this.typeOfWork}</li>
                <li class="collection-item"><i class="material-icons">people</i> ${this.numberOfStudents}</li>
              </ul>
            </div>
          </div>
        </div>`)
  }
}

/**
 * Intersect an array of sets
 */
function intersect(arrayOfSets) {
  const intersection = new Set()
  const lastSet = arrayOfSets.pop()
  for (element of lastSet) {
    if (arrayOfSets.every(set => set.has(element))) {
      intersection.add(element)
    }
  }
  return intersection
}

/**
 * @return an array holding only elements found in every element in `arrayOfSets`
 */
function intersect(arrayOfSets) {
  return [...arrayOfSets.pop()].filter(element => arrayOfSets.every(set => set.has(element)))
}

const internshipObjects = new Deferred()

//Create Internships Array from Sheet
$.getJSON("https://spreadsheets.google.com/feeds/list/1KiBBwtRUjufhhD5FOwC0b37asXf48Ug1m8zL5WrHCBA/default/public/values?alt=json", function (data) {
  try {
    const internships = data.feed.entry.map(e => new Internship(e))
    internshipObjects.resolve(internships)
    internships.map(each => each.render())
    console.log("OK, done with parsing the sheet!")

    const currentInternships = intersect([locations.selectedInternships(), interests.selectedInternships(), typesOfWork.selectedInternships()]);

    console.log(JSON.stringify(currentInternships));

  } catch (error) {
    alert("Couldn't load available internships. Sorry.")
    console.log(error)
  }
});

async function renderFilters() {
  // Waiting for internshipObjects ensures filter sets are filled
  await internshipObjects.promise;
  console.log("rendering filters!")
  locations.render();
  interests.render();
  typesOfWork.render();
}

/**
 * Save Internships to Spreadsheet
 */
const sheetButton = $("#saveToSheetButton")
sheetButton.on("click", sheetButtonClick)

async function sheetButtonClick() {
  console.log("This is a save test")
  await console.log("More save testing" + internship.name)
}


/**
 *GeoLocation Data
 */
function geoFindMe() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported on this browser")
    return;
  }

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log("Your position is: " + latitude + ", " + latitude)
  }

  function error() {
    alert("Unable to retrieve your location");
  }
  navigator.geolocation.getCurrentPosition(success, error);
}

const CLIENT_ID = '246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com';
const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";

/**
 * When Google Sign-in succeeds
 */
async function onSuccess(googleUser) {
  const user = googleUser.getBasicProfile();
  deferredUser.resolve(user);
  console.log(JSON.stringify(user))
  gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPES,
    'immediate': true
  }, loadClients);
}

function onFailure(error) {
  console.log(error);
}

// TODO: try to delete the meta tag and see if it still works
function goGoGoogle() {
  gapi.signin2.render('google-signin-button', {
    'scope': SCOPES,
    'client_id': CLIENT_ID,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}

$(document).ready(function () {
  $(".button-collapse").sideNav();
  $('.collapsible').collapsible();
  geoFindMe();
  renderFilters()
});

