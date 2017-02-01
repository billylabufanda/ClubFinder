class Deferred<T> {
  readonly promise: Promise<T>
  private _resolve: (value?: T) => void
  private _reject: (reason?: any) => void
  private _fulfilled: boolean = false

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  get fulfilled(): boolean {
    return this._fulfilled
  }

  resolve(value?: T): void {
    this._fulfilled = true
    this._resolve(value)
  }

  reject(reason?: any): void {
    this._fulfilled = true
    this._reject(reason)
  }
}

interface User {
  getName(): string
  getEmail(): string
}

const deferredUser = new Deferred<User>()
const user = deferredUser.promise
const driveClientLoaded = new Deferred<void>()
const sheetClientLoaded = new Deferred<void>()

declare const gapi: any
declare const $: any

/**
 * Load Sheets API client library.
 */
function loadClients() {
  sheetClientLoaded.resolve(
    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest")
  )
  driveClientLoaded.resolve(
    gapi.client.load("https://www.googleapis.com/discovery/v1/apis/drive/v3/rest")
  )
}

// Find and display internships from form sheet
/*
 How things need to render:
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
  readonly name: string
  readonly id: string
  readonly filterClickListener: () => void
  private readonly filterNameToFilter: Map<string, Filter>

  constructor(name, filterClickListener) {
    this.name = name
    this.filterNameToFilter = new Map() // "San Jose" => new Filter("San Jose")
    this.id = name + "Filters"
    this.filterClickListener = filterClickListener
  }

  filterNames() {
    return [...this.filterNameToFilter.keys()].sort()
  }

  filters() {
    return [...this.filterNameToFilter.values()]
  }

  addFilter(filterName) {
    if (!this.filterNameToFilter.has(filterName)) {
      this.filterNameToFilter.set(filterName, new Filter(this, filterName))
    }
  }

  /**
   * filterName is the name of a specific filter, like "San Francisco" or "Engineering".
   * newCheckedValue is the current state of the filter checkbox/switch
   */
  setFilterChecked(filterName, isChecked) {
    this.filterNameToFilter.get(filterName).setChecked(isChecked)
  }

  render() {
    this.filterNames().forEach(filterName => {
      this.filterNameToFilter.get(filterName).render()
    })
  }

  selectedFilterNames() {
    return this.filters().filter(ea => ea.getChecked()).map(ea => ea.name)
  }

  unselectedFilterNames() {
    return this.filters().filter(ea => !ea.getChecked()).map(ea => ea.name)
  }
}

/**
 * "San Jose" or "Engineering"
 */
class Filter {
  readonly name: string
  private readonly filterSet: FilterSet
  private readonly id: string
  constructor(filterSet, name) {
    this.filterSet = filterSet
    this.name = name
    const safeName = this.name.toLowerCase().replace(/[^a-z0-9 ]+/g, "").trim().replace(/ +/g, "-")
    this.id = "filter-" + this.filterSet.name + "-" + safeName
  }

  getChecked() {
    return $("#" + this.id).prop("checked")
  }

  setChecked(newCheckedState) {
    $("#" + this.id).prop("checked", newCheckedState)
  }

  render() {
    $("#" + this.filterSet.id).append(
      `<div class="col s4">
         <input type="checkbox" class="filled-in filter" id="${this.id}" checked="checked" />
         <label for="${this.id}">${this.name}</label>
       </div>`
    )
    const self = this
    $("#" + this.id).click(function () {
      self.filterSet.filterClickListener()
    })
  }
}

const blankImages = [
  "/images/intern1.jpg",
  "/images/intern2.jpg",
  "/images/intern3.jpg",
  "/images/intern4.jpg",
  "/images/intern5.jpg"
]

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function randomBlankImage() {
  return blankImages[getRandomInt(0, blankImages.length)]
}

function splitAndTrim(s) {
  return s.split(",").map(ea => ea.trim())
}

let internshipCounter = 0
class Internship {
  readonly locations: string[]
  readonly interests: string[]
  readonly name: string
  readonly jobDescription: string
  readonly contactInfo: string
  readonly typeOfWork: string
  readonly numberOfStudents: string
  readonly logo: string
  private readonly id: number
  private readonly mySelector: string
  private saved: boolean = false

  constructor(entry) {
    this.id = ++internshipCounter
    this.mySelector = "Internship" + this.id
    this.name = entry.gsx$nameofcompany.$t
    this.locations = splitAndTrim(entry.gsx$location.$t)
    this.interests = splitAndTrim(entry.gsx$fieldofinterest.$t)
    this.jobDescription = entry.gsx$jobdescription.$t
    this.contactInfo = entry.gsx$contactinformation.$t
    this.typeOfWork = entry.gsx$typeofwork.$t
    this.numberOfStudents = entry.gsx$numberofstudents.$t
    this.logo = entry.gsx$logo.$t
  }

  show() {
    $("#" + this.mySelector).fadeIn()
  }

  hide() {
    $("#" + this.mySelector).fadeOut()
  }

  bgStyle() {
    return (this.logo && this.logo.length > 0) ? `background-image:url(${this.logo})` : ""
  }

  // TODO later? Add to the card-image div:
  // <i class="material-icons ${this.mySelector}-save" title="Unsaved">star_border</i>

  render() {
    $("#InternshipCards").append(
      `<div class="col s12 m6 l6" id="${this.mySelector}">
        <div class="card sticky-action z-depth-1">
          <div class="card-image waves-effect waves-block waves-light"> 
            <img class="activator" style="${this.bgStyle()}" />
          </div>
          <div class="card-content">
            <span class="card-title activator">
              <i class="material-icons right">more_vert</i>
              ${this.name}
            </span>
          </div>
          <div class="card-reveal">
            <i class="material-icons right">close</i>
            <span class="card-title">${this.name}</span>
            <p>${this.jobDescription}</p>
            <p><i class="tiny material-icons">location_on</i> ${this.locations.join(", ")}</p>
            <p><i class="tiny material-icons">contact_phone</i> ${this.contactInfo}</p>
            <p><i class="tiny material-icons">favorite</i> ${this.interests.join(", ")}</p>
            <p><i class="tiny material-icons">work</i> ${this.typeOfWork}</p>
            <p><i class="tiny material-icons">people</i> ${this.numberOfStudents}</p>
          </div>
          <div class="card-action">
            <div class="save progress">
              <div class="indeterminate">
              </div>
            </div>
          </div>
        </div>
      </div>`)
    $("#" + this.mySelector).on("click", ".save", () => this.saveClicked())
  }

  setSaved(newSavedState: boolean) {
    this.saved = newSavedState
    this.renderSaveButton()
  }

  renderSaveButton() {
    $(`#${this.mySelector} .save`).replaceWith(
      this.saved ?
        `<a class="save waves-effect waves-indigo btn-flat" title="Unsave this internship">Unsave</a>` :
        `<a class="save waves-effect waves-indigo btn-flat" title="Save this internship">Save</a>`
    )
  }

  saveClicked() {
    this.saved = !this.saved
    this.renderSaveButton()
  }
}

/**
 * Intersect an array of sets
 */
// function intersect(arrayOfSets:Array<) {
//   const intersection = new Set()
//   const lastSet = arrayOfSets.pop()
//   for (element of lastSet) {
//     if (arrayOfSets.every(set => set.has(element))) {
//       intersection.add(element)
//     }
//   }
//   return intersection
// }

/**
 * @return an array holding only elements found in every element in `arrayOfSets`
 */
function intersect<T>(arrayOfSets: Set<T>[]): T[] {
  return [...arrayOfSets.pop()].filter(element => arrayOfSets.every(set => set.has(element)))
}

function hasAnyOf<T>(needles: T[], haystack: T[]) {
  return needles.findIndex(needle => haystack.includes(needle)) !== -1
}

/**
 * parses the internships and sets up the filtersets
 */
class Internships {
  readonly internships: Internship[]
  readonly locations: FilterSet
  readonly interests: FilterSet
  constructor(dataFeedEntry) {
    this.internships = dataFeedEntry.map(e => new Internship(e))
    this.locations = new FilterSet("locations", () => this.onFilterChange())
    this.interests = new FilterSet("interests", () => this.onFilterChange())
    this.internships.forEach(internship => {
      internship.locations.forEach(location => this.locations.addFilter(location))
      internship.interests.forEach(interest => this.interests.addFilter(interest))
    })
    this.locations.render()
    this.interests.render()
    $(".collapsible").collapsible()
    this.internships.map(each => each.render())
    this.onFilterChange()
  }

  findByNameAndLocation(name: string, location: string): Internship | undefined {
    return this.internships.find(ea =>
      ea.name === name && hasAnyOf(location.split(","), ea.locations)
    )
  }

  onFilterChange() {
    const selectedLocations = this.locations.selectedFilterNames()
    const selectedInterests = this.interests.selectedFilterNames()
    const toShow = this.internships.filter(internship =>
      hasAnyOf(internship.locations, selectedLocations) &&
      hasAnyOf(internship.interests, selectedInterests)
    )
    toShow.forEach(ea => ea.show())
    const toHide = this.internships.filter(internship => !toShow.includes(internship))
    toHide.forEach(ea => ea.hide())
  }
}

const deferredInternships = new Deferred<Internships>()

/**
 * Find or Create the Spreadsheet
 */
class StudentSheet {
  private readonly sheetId: Promise<string>
  private readonly savedFilters: Promise<Map<string, boolean>>
  constructor() {
    this.sheetId = this.getSpreadsheetId()
    this.readInternshipsSheet()
    this.savedFilters = this.readFiltersSheet()
  }

  /**
   * @returns the prior saved state of the given filter
   */
  async getFilterState(filterId: string): Promise<boolean> {
    return (await this.savedFilters).get(filterId) || false
  }

  async setFilterState(filterId: string, checked: boolean) {
    throw new Error("TODO")
  }

  private async getSpreadsheetId(): Promise<string> {
    await driveClientLoaded.promise
    await sheetClientLoaded.promise

    // Does the sheet exist already?
    const deferredFiles = new Deferred<any[]>()
    gapi.client.drive.files.list({
      pageSize: 1,
      q: `properties has { key='InternshipsFor' and value='${(await user).getEmail()}'}`
    }).execute(result => deferredFiles.resolve(result.files))

    const files = await deferredFiles.promise

    if (files && files.length === 1 && files[0].id) {
      const spreadsheetId = files[0].id
      console.log("Found prior Sheet " + spreadsheetId)
      return spreadsheetId
    }

    // Darn, we have to create it:

    const response = await gapi.client.sheets.spreadsheets.create({
      "properties": {
        "title": `Saved Internships for ${(await user).getName()}`
      }
    })

    const spreadsheetId = response.result.spreadsheetId

    // And set the metadata to find it later

    const driveUpdateResponse = await gapi.client.drive.files.update({
      fileId: spreadsheetId,
      properties: {
        InternshipsFor: (await user).getEmail()
      }
    })

    console.log("Yay got drive update response " + JSON.stringify(driveUpdateResponse))

    // Create 3 sheets: one for the saved internships

    const renameSavedInternshipRequest = {
      updateSheetProperties: {
        properties: {
          title: "Internships",
          index: 0
        },
        fields: "title"
      }
    }
    const addFilterSheetRequest = {
      addSheet: {
        properties: {
          title: "Filters",
          index: 1
        }
      }
    }

    const request = {
      spreadsheetId,
      requests: [
        renameSavedInternshipRequest,
        addFilterSheetRequest
      ],
      responseIncludeGridData: false
    }
    const batchUpdateResponse = await gapi.client.sheets.spreadsheets.batchUpdate(request)
    console.log("Got batch update response: " + JSON.stringify(batchUpdateResponse))
    return spreadsheetId
  }

  private async readFiltersSheet(): Promise<Map<string, boolean>> {
    const spreadsheetId = await this.sheetId
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Filters"
    })
    return new Map<string, boolean>(
      response.result.values.map(([filterId, value]) =>
        [filterId, stringToBoolean(value)]
      )
    )
  }

  private async readInternshipsSheet(): Promise<void> {
    const spreadsheetId = await this.sheetId
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Internships!A2:B200"
    })
    const internships: Internships = await deferredInternships.promise
    const savedInternships = response.result.values.map(([name, location]) =>
      internships.findByNameAndLocation(name, location)
    )
    internships.internships.forEach(internship =>
      internship.setSaved(savedInternships.includes(internship))
    )
  }
}

function stringToBoolean(s: string): boolean {
  return ["true", "yes", "t", "y"].includes(s && s.toLowerCase())
}

const studentSheet = new StudentSheet()

// Create Internships Array from Sheet
// tslint:disable-next-line:max-line-length
$.getJSON("https://spreadsheets.google.com/feeds/list/1KiBBwtRUjufhhD5FOwC0b37asXf48Ug1m8zL5WrHCBA/default/public/values?alt=json", function (data) {
  try {
    deferredInternships.resolve(new Internships(data.feed.entry))
  } catch (error) {
    alert("Couldn't load available internships. Sorry.")
    console.log(error)
  }
})

/**
 * GeoLocation Data
 */
function geoFindMe() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported on this browser")
    return
  }

  function success(position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    console.log("Your position is: " + latitude + ", " + latitude)
  }

  function error() {
    alert("Unable to retrieve your location")
  }
  navigator.geolocation.getCurrentPosition(success, error)
}

function geoLocationFilter() {
  return true
}

const CLIENT_ID = "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com"
const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive"

/**
 * When Google Sign-in succeeds
 */

// async function onSuccess(googleUser) {
//   const user = googleUser.getBasicProfile()
//   console.log("Got " + JSON.stringify({ user }))
//   // location.reload(true)
// }

// function onFailure(error) {
//   console.log("oh snap, we're not signed in")
//   console.log(error)
// }

// // TODO: try to delete the meta tag and see if it still works
// function goGoGoogle() {
//   gapi.signin2.render("google-signin-button", {
//     "scope": SCOPES,
//     "client_id": CLIENT_ID,
//     "theme": "dark",
//     "onsuccess": onSuccess,
//     "onfailure": onFailure
//   })
// }

// async function checkAuth() {
//   await gapi.load("auth2")
//   const auth2 = await gapi.auth2.init({
//     "client_id": CLIENT_ID,
//     "scope": SCOPES
//   })
//   if (auth2.isSignedIn.get()) {
//     await auth2.signIn()
//     const googUser = auth2.currentUser.get()
//     console.log("YAY user is " + JSON.stringify(googUser))
//     deferredUser.resolve(googUser)
//     loadClients()
//   } else {
//     console.log("BOO user is not signed in yet")
//     deferredUser.resolve(undefined)
//   }
// }
function checkAuth() {
  gapi.auth.authorize(
    {
      "client_id": CLIENT_ID,
      "scope": SCOPES,
      "immediate": true
    },
    handleAuthResult
  )
}

async function handleAuthResult(authResult) {
  console.log("didthebuttongetclicked")
  if (authResult && !authResult.error) {
    $("#sign-in-button").text("Signed In To Google")
    // load client library.
    // const googUser = auth2.currentUser.get()
    console.log("YAY user is " + JSON.stringify(authResult))
    deferredUser.resolve(googUser)
    loadClients()
  })
} else {
  console.log("BOO no user")
  deferredUser.resolve(undefined)

  // Show auth UI, allowing the user to initiate authorization by
  // clicking authorize button.
}
}

function handleAuthClick(event) {
  gapi.auth.authorize(
    {
      "client_id": CLIENT_ID,
      "scope": SCOPES,
      immediate: false
    },
    handleAuthResult)
  return false
}

$(document).ready(function () {
  $(".button-collapse").sideNav()
  // geoFindMe()
})
