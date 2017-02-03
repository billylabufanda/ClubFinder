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

const deferredUser = new Deferred<User | undefined>()

declare const gapi: any
declare const $: any

/**
 * Load Sheets API client library.
 */

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
  readonly id: string
  private readonly filterNameToFilter: Map<string, Filter>

  constructor(readonly name: string, readonly filterClickListener: () => void) {
    this.filterNameToFilter = new Map() // "San Jose" => new Filter("San Jose")
    this.id = name + "Filters"
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
  readonly id: string
  private checked: boolean = true
  constructor(readonly filterSet: FilterSet, readonly name: string) {
    const safeName = this.name.toLowerCase().replace(/[^a-z0-9 ]+/g, "").trim().replace(/ +/g, "-")
    this.id = "filter-" + this.filterSet.name + "-" + safeName
  }

  getChecked(): boolean {
    return $("#" + this.id).prop("checked")
  }

  setChecked(newCheckedState: boolean) {
    this.checked = newCheckedState
    $("#" + this.id).prop("checked", newCheckedState)
  }

  render() {
    $("#" + this.filterSet.id).append(
      `<div class="col s4">
         <input type="checkbox" class="filled-in filter" id="${this.id}" ${this.checked ? `checked="checked"` : ""} />
         <label for="${this.id}">${this.name}</label>
       </div>`
    )
    $("#" + this.id).click(() => {
      this.checked = this.getChecked()
      this.filterSet.filterClickListener()
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

  constructor(readonly parent: Internships, entry) {
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

  async render() {
    $("#InternshipCards").append(
      `<div class="col s12 m6 l6" id="${this.mySelector}" style="display:hidden">
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
    const user = await deferredUser.promise
    if (!user) {
      $("#" + this.mySelector + " .card-action").remove()
    }
  }

  getSaved(): boolean {
    return this.saved
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
    this.parent.saveInternships()
  }
}

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
  readonly filters: Filter[]
  private readonly filtersByFilterId = new Map<string, Filter>()
  private readonly studentSheet = new Deferred<StudentSheet>()
  constructor(dataFeedEntry) {
    this.internships = dataFeedEntry.map(e => new Internship(this, e))
    this.locations = new FilterSet("locations", () => this.onFilterChange())
    this.interests = new FilterSet("interests", () => this.onFilterChange())
    this.internships.forEach(internship => {
      internship.locations.forEach(location => this.locations.addFilter(location))
      internship.interests.forEach(interest => this.interests.addFilter(interest))
    })
    this.filters = [...this.locations.filters(), ...this.interests.filters()]
    this.filters.forEach(filter =>
      this.filtersByFilterId.set(filter.id, filter)
    )
    this.locations.render()
    this.interests.render()
    $(".collapsible").collapsible()
    this.internships.map(each => each.render())
    deferredUser.promise.then(user => {
      if (user) {
        const ss = new StudentSheet()
        this.studentSheet.resolve(ss)
        this.loadSavedFilters()
        this.loadSavedInternships()
      } else {
        this.studentSheet.resolve()
        this.onFilterChange()
      } // StudentSheet will call onFilterChange when it loads.
    })
  }

  findByNameAndLocation(name: string, location: string): Internship | undefined {
    return this.internships.find(ea =>
      ea.name === name && hasAnyOf(location.split(","), ea.locations)
    )
  }

  findFilterById(filterId: string): Filter | undefined {
    return this.filtersByFilterId.get(filterId)
  }

  onFilterChange() {
    const selectedLocations = this.locations.selectedFilterNames()
    const selectedInterests = this.interests.selectedFilterNames()
    const toShow: Internship[] = this.internships.filter(internship =>
      hasAnyOf(internship.locations, selectedLocations) &&
      hasAnyOf(internship.interests, selectedInterests)
    )
    toShow.forEach(ea => ea.show())
    const toHide: Internship[] = this.internships.filter(internship => !toShow.includes(internship))
    toHide.forEach(ea => ea.hide())
    this.saveFilters()
  }

  async loadSavedFilters() {
    const studentSheet = await this.studentSheet.promise
    // Leave the interests all checked, and the locations unchecked.
    this.locations.filters().forEach(f => f.setChecked(false))
    const savedFilters = await studentSheet.savedFilters;
    [...savedFilters.entries()].forEach(([filterId, checked]) => {
      const filter = this.findFilterById(filterId)
      if (filter != null) { filter.setChecked(checked) }
    })
    this.onFilterChange()
  }

  async loadSavedInternships() {
    const studentSheet = await this.studentSheet.promise
    const savedInternships = (await studentSheet.savedInternships).map(savedInternship =>
      this.findByNameAndLocation(savedInternship.name, savedInternship.location)
    )
    this.internships.forEach(internship =>
      internship.setSaved(savedInternships.includes(internship))
    )
  }

  async saveFilters() {
    const studentSheet = await this.studentSheet.promise
    if (studentSheet) {
      const filters = new Map(this.filters.map(filter =>
        [filter.id, filter.getChecked()] as [string, boolean])
      )
      return studentSheet.writeFiltersSheet(filters)
    }
  }
  async saveInternships() {
    const studentSheet = await this.studentSheet.promise
    if (studentSheet) {
      return studentSheet.writeInternshipsSheet(
        this.internships.filter(internship => internship.getSaved())
      )
    }
  }
}

interface SavedInternship {
  name: string
  location: string
}

/**
 * Find or Create the Spreadsheet
 */
class StudentSheet {
  static readonly maxValues = 300 // no more than maxValues of filters or saved internships
  readonly savedFilters: Promise<Map<string, boolean>>
  readonly savedInternships: Promise<SavedInternship[]>
  private readonly sheetId: Promise<string | undefined>
  constructor() {
    this.sheetId = this.getSpreadsheetId()
    this.savedInternships = this.readInternshipsSheet()
    this.savedFilters = this.readFiltersSheet()
  }

  async writeFiltersSheet(filters: Map<string, boolean>, sheetId?: string): Promise<void> {
    console.log("Saving checked filters " + [...filters.entries()].filter(([n, b]) => b).map(([n]) => n))

    const spreadsheetId = sheetId || await this.sheetId
    const values = [...filters.entries()].map(([name, checked]) => [name, "" + checked]).sort()
    while (values.length < StudentSheet.maxValues) {
      values.push(["", ""])
    }
    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      valueInputOption: "RAW",
      range: "Filters!A1:B" + StudentSheet.maxValues,
      values
    })
  }

  async writeInternshipsSheet(savedInternships: Internship[]): Promise<void> {
    console.log("Saving internships " + savedInternships.map(i => i.name))
    const spreadsheetId = await this.sheetId
    const header = [
      "Name of Company",
      "Location",
      "Field of Interest",
      "Job Description",
      "Number of Students",
      "Contact Information",
      "Type of Work"
    ]

    const values = [header, ...savedInternships.map(i =>
      [
        i.name,
        i.locations.join(", "),
        i.interests.join(", "),
        i.jobDescription,
        i.numberOfStudents,
        i.contactInfo,
        i.typeOfWork
      ]
    )]

    while (values.length < StudentSheet.maxValues) {
      values.push(["", "", "", "", "", "", ""])
    }
    const response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      valueInputOption: "RAW",
      range: "Internships!A1:G" + StudentSheet.maxValues,
      values
    })
  }

  private async getSpreadsheetId(): Promise<string | undefined> {
    const user = await deferredUser.promise
    if (user == null) {
      return
    }

    console.log("OMG I AM GETTING A SHEET ID NOW for " + user.getEmail())

    // Does the sheet exist already?
    const listResponse = await gapi.client.drive.files.list({
      pageSize: 1,
      q: `properties has { key='InternshipsFor' and value='${user.getEmail()}'}`
    })

    const files = listResponse.result.files

    if (files && files.length === 1 && files[0].id) {
      const spreadsheetId = files[0].id
      console.log("Found prior Sheet " + spreadsheetId)
      return spreadsheetId
    }

    // Darn, we have to create it:

    const response = await gapi.client.sheets.spreadsheets.create({
      "properties": {
        "title": `Saved Internships for ${user.getName()}`
      }
    })

    const spreadsheetId = response.result.spreadsheetId

    // And set the metadata to find it later

    const driveUpdateResponse = await gapi.client.drive.files.update({
      fileId: spreadsheetId,
      properties: {
        InternshipsFor: user.getEmail()
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

    // Save default filter values. TODO replace with Geo browser lookup!
    this.writeFiltersSheet(
      new Map([
        "filter-locations-burlingame",
        "filter-locations-san-carlos",
        "filter-locations-san-francisco",
        "filter-locations-san-mateo"
      ].map(filterId => [filterId, true] as [string, boolean])),
      spreadsheetId
    )
    return spreadsheetId
  }

  private async readFiltersSheet(): Promise<Map<string, boolean>> {
    const spreadsheetId = await this.sheetId
    console.log("Reading filters from " + spreadsheetId)
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Filters"
    })
    return new Map<string, boolean>(
      (response.result.values || []).map(([filterId, value]) => [filterId, stringToBoolean(value)])
    )
  }

  private async readInternshipsSheet(): Promise<SavedInternship[]> {
    const spreadsheetId = await this.sheetId
    console.log("Reading internships from " + spreadsheetId)
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Internships!A2:B" + StudentSheet.maxValues
    })
    return (response.result.values || []).map(([name, location]) => {
      return { name, location }
    })
  }
}

function stringToBoolean(s: string): boolean {
  return ["true", "yes", "t", "y"].includes(s && s.toLowerCase())
}

// Create Internships Array from Sheet
// tslint:disable-next-line:max-line-length
$.getJSON("https://spreadsheets.google.com/feeds/list/1KiBBwtRUjufhhD5FOwC0b37asXf48Ug1m8zL5WrHCBA/default/public/values?alt=json", function (data) {
  try {
    new Internships(data.feed.entry)
    console.log("Finished loading internships")
  } catch (error) {
    alert("Couldn't load available internships. Sorry.")
    console.log(error)
  }
})

function geoLocationFilter() {
  return true
}

const CLIENT_ID = "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com"
const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive"

function handleClientLoad() {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      apiKey: "AIzaSyBVE4YYgpUF8Kc0gTm_DGEd81zsP4i6P10",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        "https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest"
      ],
      clientId: "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com",
      scope: "email profile"
    }).then(function () {
      const auth2 = gapi.auth2.getAuthInstance()
      auth2.isSignedIn.listen(updateSigninStatus)
      updateSigninStatus(auth2.isSignedIn.get())
    })
  })
}

function updateSigninStatus(isSignedIn) {
  console.log("updateSigninStatus: isSignedIn is " + isSignedIn)
  if (isSignedIn) {
    let profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
    console.log("Student email: " + profile.getEmail())
    $("#sign-in-button").text("Signed in").removeAttr("onclick")
    deferredUser.resolve(profile)
  } else {
    deferredUser.resolve(undefined)
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn()
}

$(document).ready(function () {
  $(".button-collapse").sideNav()
})
