var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
class Counter {
    constructor() {
        this.counts = new Map();
    }
    increment(name) {
        this.counts.set(name, 1 + this.get(name));
    }
    get(name) {
        return this.counts.has(name) ? this.counts.get(name) : 0;
    }
}
const deferredUser = new Deferred();
function handleError(message, error) {
    Materialize.toast(message);
    $(".footer").append(JSON.stringify(error));
}
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
    constructor(name, otherName, filterClickListener) {
        this.name = name;
        this.otherName = otherName;
        this.filterClickListener = filterClickListener;
        this.filterNameToFilter = new Map(); // "San Jose" => new Filter("San Jose")
        this.id = name + "Filters";
    }
    filterNames() {
        return [...this.filterNameToFilter.keys()].sort();
    }
    filters() {
        return [...this.filterNameToFilter.values()];
    }
    addFilter(filterName) {
        if (!this.filterNameToFilter.has(filterName)) {
            this.filterNameToFilter.set(filterName, new Filter(this, filterName));
        }
    }
    /**
     * filterName is the name of a specific filter, like "San Francisco" or "Engineering".
     * newCheckedValue is the current state of the filter checkbox/switch
     */
    setFilterChecked(filterName, isChecked) {
        this.filterNameToFilter.get(filterName).setChecked(isChecked);
    }
    render() {
        this.filterNames().forEach(filterName => {
            this.filterNameToFilter.get(filterName).render();
        });
        $("#" + this.name + " .select-all").click(() => {
            this.setAllFilters(true);
        });
        $("#" + this.name + " .select-none").click(() => {
            this.setAllFilters(false);
        });
    }
    setAllFilters(checked) {
        this.filters().forEach(filter => filter.setChecked(checked));
        this.filterClickListener();
    }
    selectedFilterNames() {
        return this.filters().filter(ea => ea.getChecked()).map(ea => ea.name);
    }
    unselectedFilterNames() {
        return this.filters().filter(ea => !ea.getChecked()).map(ea => ea.name);
    }
    calculateCounts(counter) {
        console.log("Calculating counts for " + this.name);
        console.dir(counter);
        this.filters().forEach(filter => filter.setCount(counter.get(filter.name)));
    }
}
/**
 * "San Jose" or "Engineering"
 */
class Filter {
    constructor(filterSet, name) {
        this.filterSet = filterSet;
        this.name = name;
        this.checked = true;
        const safeName = this.name.toLowerCase().replace(/[^a-z0-9 ]+/g, "").trim().replace(/ +/g, "-");
        this.id = "filter-" + this.filterSet.name + "-" + safeName;
    }
    getChecked() {
        return $("#" + this.id).prop("checked");
    }
    setChecked(newCheckedState) {
        this.checked = newCheckedState;
        $("#" + this.id).prop("checked", newCheckedState);
    }
    setCount(count) {
        $("#" + this.id).parent().find(".count").text(count);
    }
    render() {
        $("#" + this.filterSet.id).append(`<div class="col s12 l6">
         <input type="checkbox" class="filled-in filter" id="${this.id}" ${this.checked ? `checked="checked"` : ""} />
         <label class="truncate" for="${this.id}">${this.name}
           <span
             class="count"
             title="Number of ${this.name} internships 
(with currently selected ${this.filterSet.otherName})">-</span> 
         </label>
       </div>`);
        $("#" + this.id).click(() => {
            this.checked = this.getChecked();
            this.filterSet.filterClickListener();
        });
    }
}
function splitAndTrim(s) {
    return s.split(",").map(ea => ea.trim());
}
let internshipCounter = 0;
class Internship {
    constructor(parent, entry) {
        this.parent = parent;
        this.saved = false;
        this.id = ++internshipCounter;
        this.mySelector = "Internship" + this.id;
        try {
            this.name = entry.gsx$nameofcompany.$t;
            this.locations = splitAndTrim(entry.gsx$location.$t);
            this.interests = splitAndTrim(entry.gsx$fieldofinterest.$t);
            this.jobDescription = entry.gsx$jobdescription.$t;
            this.contactInfo = entry.gsx$contactinformation.$t;
            this.typeOfWork = entry.gsx$typeofwork.$t;
            this.numberOfStudents = entry.gsx$numberofstudents.$t;
            this.logo = entry.gsx$logo.$t;
            this.approved = "Approved" === entry.gsx$approval.$t;
        }
        catch (error) {
            handleError("Failed to read internship", { entry, error });
            this.approved = false;
        }
    }
    show() {
        $("#" + this.mySelector).fadeIn();
    }
    hide() {
        $("#" + this.mySelector).fadeOut();
    }
    bgStyle() {
        return (this.logo && this.logo.length > 0) ? `background-image:url(${this.logo})` : "";
    }
    // TODO later? Add to the card-image div:
    // <i class="material-icons ${this.mySelector}-save" title="Unsaved">star_border</i>
    render() {
        return __awaiter(this, void 0, void 0, function* () {
            $("#InternshipCards").append(`<div class="col s12 m6 l6" id="${this.mySelector}" style="display:hidden">
        <div class="card sticky-action z-depth-1 hoverable">
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
            <span class="card-title">${this.name}<i class="material-icons right">close</i></span>
            <p>${this.jobDescription}</p>
            <p><i title="Locations" class="tiny material-icons">location_on</i> ${this.locations.join(", ")}</p>
            <p><i title="Contact Info" class="tiny material-icons">contact_phone</i> ${this.contactInfo}</p>
            <p><i title="Interests" class="tiny material-icons">favorite</i> ${this.interests.join(", ")}</p>
            <p><i title="Work Involved" class="tiny material-icons">work</i> ${this.typeOfWork}</p>
            <p><i
              title="How many students can fill position"
              class="tiny material-icons">people</i> ${this.numberOfStudents}</p>
          </div>
          <div class="card-action">
            <div class="save progress">
              <div class="indeterminate">
              </div>
            </div>
          </div>
        </div>
      </div>`);
            $("#" + this.mySelector).on("click", ".save", () => this.saveClicked());
            const user = yield deferredUser.promise;
            if (!user) {
                $("#" + this.mySelector + " .card-action").remove();
            }
        });
    }
    getSaved() {
        return this.saved;
    }
    setSaved(newSavedState) {
        this.saved = newSavedState;
        this.renderSaveButton();
    }
    renderSaveButton() {
        $(`#${this.mySelector} .save`).replaceWith(this.saved ?
            `<a class="save waves-effect waves-indigo btn-flat" title="Unsave this internship">Unsave</a>` :
            `<a class="save waves-effect waves-indigo btn-flat" title="Save this internship">Save</a>`);
    }
    saveClicked() {
        this.saved = !this.saved;
        this.renderSaveButton();
        this.parent.saveInternships();
    }
}
/**
 * @return an array holding only elements found in every array
 */
function intersect(...array) {
    return array.pop().filter(element => array.every(arr => arr.includes(element)));
}
function hasAnyOf(needles, haystack) {
    return needles.findIndex(needle => haystack.includes(needle)) !== -1;
}
/**
 * parses the internships and sets up the filtersets
 */
class Internships {
    constructor(dataFeedEntry) {
        this.filtersByFilterId = new Map();
        this.studentSheet = new Deferred();
        this.internships = dataFeedEntry
            .map(e => new Internship(this, e))
            .filter(internship => internship.approved);
        this.locations = new FilterSet("locations", "interests", () => this.onFilterChange());
        this.interests = new FilterSet("interests", "locations", () => this.onFilterChange());
        this.internships.forEach(internship => {
            internship.locations.forEach(location => this.locations.addFilter(location));
            internship.interests.forEach(interest => this.interests.addFilter(interest));
        });
        this.filters = [...this.locations.filters(), ...this.interests.filters()];
        this.filters.forEach(filter => this.filtersByFilterId.set(filter.id, filter));
        this.locations.render();
        this.interests.render();
        $(".collapsible").collapsible();
        this.internships.map(each => each.render());
        deferredUser.promise.then(user => this.withDeferredUser(user));
    }
    withDeferredUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user) {
                const ss = new StudentSheet();
                this.studentSheet.resolve(ss);
                yield Promise.all([
                    this.showSavedSheetLink(),
                    this.loadSavedFilters(),
                    this.loadSavedInternships()
                ]);
            }
            else {
                this.studentSheet.resolve();
                yield this.onFilterChange();
            } // StudentSheet will call onFilterChange when it loads.
            // Everything is loaded and we're ready to open the curtains:
            $(".before-loaded").hide();
            $(".after-loaded").fadeIn();
        });
    }
    findByNameAndLocation(name, location) {
        return this.internships.find(ea => ea.name === name && hasAnyOf(location.split(","), ea.locations));
    }
    findFilterById(filterId) {
        return this.filtersByFilterId.get(filterId);
    }
    onFilterChange(onLoad = false) {
        const selectedLocations = this.locations.selectedFilterNames();
        const selectedInterests = this.interests.selectedFilterNames();
        const selectedLocationInternships = this.internships.filter(internship => hasAnyOf(internship.locations, selectedLocations));
        const selectedInterestsInternships = this.internships.filter(internship => hasAnyOf(internship.interests, selectedInterests));
        const locationCounter = new Counter();
        const interestCounter = new Counter();
        // Given the selected interests, what are the location counts
        selectedInterestsInternships.forEach(internship => {
            internship.locations.forEach(location => locationCounter.increment(location));
        });
        // Given the selected locations, what are the interest counts
        selectedLocationInternships.forEach(internship => {
            internship.interests.forEach(interest => interestCounter.increment(interest));
        });
        this.locations.calculateCounts(locationCounter);
        this.interests.calculateCounts(interestCounter);
        const toShow = intersect(selectedLocationInternships, selectedInterestsInternships);
        toShow.forEach(ea => ea.show());
        const toHide = this.internships.filter(internship => !toShow.includes(internship));
        toHide.forEach(ea => ea.hide());
        if (!onLoad)
            this.saveFilters();
    }
    loadSavedFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            const studentSheet = yield this.studentSheet.promise;
            // Leave the interests all checked, and the locations unchecked.
            this.locations.filters().forEach(f => f.setChecked(false));
            const savedFilters = yield studentSheet.savedFilters;
            [...savedFilters.entries()].forEach(([filterId, checked]) => {
                const filter = this.findFilterById(filterId);
                if (filter != null) {
                    filter.setChecked(checked);
                }
            });
            this.onFilterChange(true);
        });
    }
    loadSavedInternships() {
        return __awaiter(this, void 0, void 0, function* () {
            const studentSheet = yield this.studentSheet.promise;
            const savedInternships = (yield studentSheet.savedInternships).map(savedInternship => this.findByNameAndLocation(savedInternship.name, savedInternship.location));
            this.internships.forEach(internship => internship.setSaved(savedInternships.includes(internship)));
        });
    }
    showSavedSheetLink() {
        return __awaiter(this, void 0, void 0, function* () {
            const ss = yield this.studentSheet.promise;
            if (ss) {
                const sheetId = yield ss.sheetId;
                $(".saved-internship-link").append(`<a target="_blank" href="https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0">Saved Internships</a>`);
            }
        });
    }
    saveFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            const studentSheet = yield this.studentSheet.promise;
            if (studentSheet) {
                const filters = new Map(this.filters.map(filter => [filter.id, filter.getChecked()]));
                return studentSheet.writeFiltersSheet(filters);
            }
        });
    }
    saveInternships() {
        return __awaiter(this, void 0, void 0, function* () {
            const studentSheet = yield this.studentSheet.promise;
            if (studentSheet) {
                return studentSheet.writeInternshipsSheet(this.internships.filter(internship => internship.getSaved()));
            }
        });
    }
}
/**
 * Find or Create the Spreadsheet
 */
class StudentSheet {
    constructor() {
        this.sheetId = this.getSpreadsheetId();
        this.savedInternships = this.readInternshipsSheet();
        this.savedFilters = this.readFiltersSheet();
    }
    writeFiltersSheet(filters, sheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Saving checked filters " + [...filters.entries()].filter(([n, b]) => b).map(([n]) => n));
                const spreadsheetId = sheetId || (yield this.sheetId);
                const values = [...filters.entries()].map(([name, checked]) => [name, "" + checked]).sort();
                while (values.length < StudentSheet.maxValues) {
                    values.push(["", ""]);
                }
                const response = yield gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId,
                    valueInputOption: "RAW",
                    range: "Filters!A1:B" + StudentSheet.maxValues,
                    values
                });
            }
            catch (error) {
                Materialize.toast("Oops. Saving your filters failed: " + error, 4000); // 4000 is the duration of the toast
            }
        });
    }
    writeInternshipsSheet(savedInternships) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Saving internships " + savedInternships.map(i => i.name));
                const spreadsheetId = yield this.sheetId;
                const header = [
                    "Name of Company",
                    "Location",
                    "Field of Interest",
                    "Job Description",
                    "Number of Students",
                    "Contact Information",
                    "Type of Work"
                ];
                const values = [header, ...savedInternships.map(i => [
                        i.name,
                        i.locations.join(", "),
                        i.interests.join(", "),
                        i.jobDescription,
                        i.numberOfStudents,
                        i.contactInfo,
                        i.typeOfWork
                    ])];
                while (values.length < StudentSheet.maxValues) {
                    values.push(["", "", "", "", "", "", ""]);
                }
                const response = yield gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId,
                    valueInputOption: "RAW",
                    range: "Internships!A1:G" + StudentSheet.maxValues,
                    values
                });
            }
            catch (error) {
                handleError("Sorry, couldn't save the internship", error);
            }
        });
    }
    getSpreadsheetId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield deferredUser.promise;
                if (user == null) {
                    console.log("No user, so no student sheet");
                    return;
                }
                console.log("OMG I AM GETTING A SHEET ID NOW for " + user.getEmail());
                // Does the sheet exist already?
                const listResponse = yield gapi.client.drive.files.list({
                    pageSize: 1,
                    q: `properties has { key='InternshipsFor' and value='${user.getEmail()}'}`
                });
                const files = listResponse.result.files;
                if (files && files.length === 1 && files[0].id) {
                    const spreadsheetId = files[0].id;
                    console.log("Found prior Sheet " + spreadsheetId);
                    return spreadsheetId;
                }
                // Darn, we have to create it:
                const response = yield gapi.client.sheets.spreadsheets.create({
                    "properties": {
                        "title": `Saved Internships for ${user.getName()}`
                    }
                });
                const spreadsheetId = response.result.spreadsheetId;
                // And set the metadata to find it later
                const driveUpdateResponse = yield gapi.client.drive.files.update({
                    fileId: spreadsheetId,
                    properties: {
                        InternshipsFor: user.getEmail()
                    }
                });
                console.log("Yay got drive update response " + JSON.stringify(driveUpdateResponse));
                // Create 3 sheets: one for the saved internships
                const renameSavedInternshipRequest = {
                    updateSheetProperties: {
                        properties: {
                            title: "Internships",
                            index: 0
                        },
                        fields: "title"
                    }
                };
                const addFilterSheetRequest = {
                    addSheet: {
                        properties: {
                            title: "Filters",
                            index: 1
                        }
                    }
                };
                const request = {
                    spreadsheetId,
                    requests: [
                        renameSavedInternshipRequest,
                        addFilterSheetRequest
                    ],
                    responseIncludeGridData: false
                };
                const batchUpdateResponse = yield gapi.client.sheets.spreadsheets.batchUpdate(request);
                console.log("Got batch update response: " + JSON.stringify(batchUpdateResponse));
                // Save default filter values. TODO replace with Geo browser lookup!
                this.writeFiltersSheet(new Map([
                    "filter-locations-burlingame",
                    "filter-locations-san-carlos",
                    "filter-locations-san-francisco",
                    "filter-locations-san-mateo"
                ].map(filterId => [filterId, true])), spreadsheetId);
                return spreadsheetId;
            }
            catch (error) {
                handleError("Sorry, couldn't find or create your personal sheet", error);
            }
        });
    }
    readFiltersSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const spreadsheetId = yield this.sheetId;
                console.log("Reading filters from " + spreadsheetId);
                const response = yield gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: "Filters"
                });
                return new Map((response.result.values || []).map(([filterId, value]) => [filterId, stringToBoolean(value)]));
            }
            catch (error) {
                handleError("Couldn't read the filters sheet", error);
            }
        });
    }
    readInternshipsSheet() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const spreadsheetId = yield this.sheetId;
                console.log("Reading internships from " + spreadsheetId);
                const response = yield gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: "Internships!A2:B" + StudentSheet.maxValues
                });
                return (response.result.values || []).map(([name, location]) => {
                    return { name, location };
                });
            }
            catch (error) {
                handleError("Couldn't see which internships were saved", error);
            }
        });
    }
}
StudentSheet.maxValues = 300; // no more than maxValues of filters or saved internships
function stringToBoolean(s) {
    return ["true", "yes", "t", "y"].includes(s && s.toLowerCase());
}
// Create Internships Array from Sheet
// tslint:disable-next-line:max-line-length
$.getJSON("https://spreadsheets.google.com/feeds/list/1KiBBwtRUjufhhD5FOwC0b37asXf48Ug1m8zL5WrHCBA/default/public/values?alt=json", function (data) {
    try {
        new Internships(data.feed.entry);
        console.log("Finished loading internships");
    }
    catch (error) {
        handleError("Couldn't load available internships. Sorry.", error);
    }
});
function geoLocationFilter() {
    return true;
}
const CLIENT_ID = "246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com";
const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";
function handleClientLoad() {
    gapi.load("client:auth2", initAuth);
}
function initAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield gapi.client.init({
                apiKey: "AIzaSyBVE4YYgpUF8Kc0gTm_DGEd81zsP4i6P10",
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                    "https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest"
                ],
                clientId: CLIENT_ID,
                scope: SCOPES
            });
            const auth2 = gapi.auth2.getAuthInstance();
            auth2.isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(auth2.isSignedIn.get(), true);
        }
        catch (error) {
            handleError("Could not set up Google client library", error);
        }
    });
}
function updateSigninStatus(isSignedIn, onStartup = false) {
    try {
        console.log("updateSigninStatus: isSignedIn is " + isSignedIn + ", onStartup is " + onStartup);
        if (isSignedIn) {
            if (!onStartup) {
                location.reload();
            }
            else {
                let profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
                console.log("Student email: " + profile.getEmail());
                $("#sign-in-button")
                    .text("Sign out")
                    .removeAttr("onclick")
                    .attr("onclick", "handleSignOutClick()")
                    .attr("title", "Click to sign out")
                    .show();
                deferredUser.resolve(profile);
            }
        }
        else {
            $("#sign-in-button").show();
            deferredUser.resolve(undefined);
        }
    }
    catch (error) {
        handleError("Failed to get user data from Google", error);
        deferredUser.resolve(undefined);
    }
}
function handleSignInClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}
function handleSignOutClick(event) {
    return __awaiter(this, void 0, void 0, function* () {
        yield gapi.auth2.getAuthInstance().signOut();
        location.reload();
    });
}
$(document).ready(function () {
    $(".button-collapse").sideNav();
    $(".collapse").click(function () {
        // Come with me on a journey beyond time and space. Through the DOM and down the rabbit hole.
        $(this).parent(".collapsible-body").siblings(".collapsible-header").trigger("click");
    });
});
//# sourceMappingURL=index.js.map