// TODO: replace with (await user)
var userData = {
  name: "Chuck Norris",
  profileURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/M101_hires_STScI-PRC2006-10a.jpg/1280px-M101_hires_STScI-PRC2006-10a.jpg",
  email: "chucknorris@hotmail.com"
  //     savedInternships:
}
const CLIENT_ID = '246642128409-40focd7nja03tje6l4i21rl1lt9rtn5b.apps.googleusercontent.com';
const SCOPES = "email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive";

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


//Find and display internships from form sheet
/**
 *How things need to render:
 1) The Page needs to show the first item
 2) On button click, the page needs to show the next item
 3) So run a function that displays the internship once, and then have the function increase every time button
 */

const entry = await gapi.client.sheets.spreadsheets.values.get({
  "properties": {
    "title": `Tindernship Profile for ${(await user).getName()}`
  }
})





/**
 * Save Internships to Spreadsheet
 */
const sheetButton = $("saveToSheetButton")
sheetButton.on("click", sheetButtonClick)

function sheetButtonClick() {
  consolelog(internshipObjects)
}



/**
 *When Google Sign-in succeeds
 */
async function onSuccess(googleUser) {
  deferredUser.resolve(googleUser.getBasicProfile());

  /** Base scope **/

  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
  const profile = googleUser.getBasicProfile();
  console.log(JSON.stringify(googleUser))
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail());
  userData.name = profile.getName();
  userData.profileURL = profile.getImageUrl();
  userData.email = profile.getEmail();

  gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPES,
    'immediate': true
  }, loadClients);
  // console.log("rendering tindernship")
  try {
    window.renderTindernship()
  } catch (error) {
    console.log("Bummer: " + error)
  }
}

function onFailure(error) {
  console.log(error);
}

function goGoGoogle() {
  gapi.signin2.render('google-signin-button', {
    'scope': SCOPES,
    'width': 240,
    'height': 25,
    'longtitle': true,
    'theme': 'dark',
    'onsuccess': onSuccess,
    'onfailure': onFailure
  });
}