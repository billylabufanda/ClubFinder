/*

init: if you're not logged in, only show the login button
auth: auth the user with gapi
load client: load the gapi spreadsheet client
load data: load the internships sheet 
load prefs: load the user's prior state
display: display the switches/preferences/internships that match

*/
window.renderTindernship = function () {
  //Some Variables
  var hiddenInternshipObjects = [];
  //Calls JSON 
  // TODO: Make this use the sheets API properly
  $.getJSON("https://spreadsheets.google.com/feeds/list/1KiBBwtRUjufhhD5FOwC0b37asXf48Ug1m8zL5WrHCBA/default/public/values?alt=json", function (data) {
    class Internship {
      constructor(entry) {
        this.name = entry.gsx$nameofcompany.$t
        this.location = entry.gsx$location.$t
        this.interest = entry.gsx$fieldofinterest.$t
        this.jobDescription = entry.gsx$jobdescription.$t
        this.contactInfo = entry.gsx$contactinformation.$t
        this.numberofStudents = entry.gsx$numberofstudents.$t
        this.logo = entry.gsx$logo.$t
      }
    }
    var internshipObjects = data.feed.entry.map(e => new Internship(e))
    //This is the object that is displayed, it is based on currentInternship, a value in the array of internshipObjects
    var nextInternship;
    var currentInternshipNumber = 0;
    // TODO: use jquery selectors
    var nextInternshipButton = document.getElementById("nextInternshipButton");
    var InternshipNameHTML = document.getElementById("InternshipName");
    var InternshipInterestHTML = document.getElementById("InternshipInterest");
    var InternshipLogoHTML = document.getElementById("InternshipLogoIMG");
    var InternshipLocationHTML = document.getElementById("InternshipLocation");
    //Render Things

    function renderInternship() {
      nextInternship = internshipObjects[currentInternshipNumber]
      InternshipNameHTML.innerHTML = "Name: " + nextInternship.name
      InternshipInterestHTML.innerHTML = "Interest: " + nextInternship.interest
      InternshipLogoHTML.src = nextInternship.logo
      InternshipLocationHTML.innerHTML = "Location: " + nextInternship.location
    }
    renderInternship()
    //When the Button is Clicked
    nextInternshipButton.addEventListener("click", buttonclick);

    function buttonclick() {
      currentInternshipNumber++
      //Loops though database
      if (currentInternshipNumber >= internshipObjects.length) {
        currentInternshipNumber = 0;
      }
      renderInternship()
      //document.getElementsByClassName("starHTML")[0].className = "glyphicon glyphicon-star-empty starHTML"
    };
    filterWords2();
    //Filter Based on Key Words

    // function filterWords() {
    //     var checkmarkHTML = document.getElementsByClassName("checkmarkVisual");
    //     console.log(checkmarkHTML.length);
    //     for(var i = 0; i < checkmarkHTML.length; i++) {
    //         addEventListener(checkmarkHTML[i], i);
    //     }
    // };

    // function addEventListener(element, index) {
    //     console.log("addEventListenerfunctiontest")
    //     element.addEventListener("click", function() {
    //         clickCheck(index)
    //     }, false);
    // }

    // function clickCheck(index) {
    //     console.log(index);
    //     if(document.getElementsByClassName("checkmarkVisual")[index].className == "glyphicon glyphicon-remove checkmarkVisual") {
    //         console.log("xmarkcheck")
    //         document.getElementsByClassName("checkmarkVisual")[index].className = "glyphicon glyphicon-ok checkmarkVisual";
    //         for(var v = 0; v < hiddenInternshipObjects.length; v++) {
    //             if(hiddenInternshipObjects[v].interest.includes(document.getElementsByClassName("checkmarkVisual")[index].textContent.toLowerCase())) {
    //                 internshipObjects.push(hiddenInternshipObjects[v])
    //                 hiddenInternshipObjects.splice(v, 1);
    //                 v--;
    //             }
    //         }
    //     } else {
    //         console.log("checkmarkcheck");
    //         document.getElementsByClassName("checkmarkVisual")[index].className = "glyphicon glyphicon-remove checkmarkVisual";
    //         //         alert(document.getElementsByClassName("checkmarkVisual")[index].className);
    //         //alert(nextInternship.interest);
    //         for(var v = 0; v < internshipObjects.length; v++) {
    //             if(internshipObjects[v].interest.includes(document.getElementsByClassName("checkmarkVisual")[index].textContent.toLowerCase())) {
    //                 hiddenInternshipObjects.push(internshipObjects[v])
    //                 internshipObjects.splice(v, 1);
    //                 v--;
    //                 if(v <= currentInternshipNumber) {
    //                     currentInternshipNumber--;
    //                 }
    //             }
    //         }
    //         if(currentInternshipNumber < 0) {
    //             currentInternshipNumber = 0;
    //         }
    //         nextInternship = internshipObjects[currentInternshipNumber]
    //         renderInternship()
    //     }
    // }

    //Save Internships
    var starredInternshipsArray = []
    var starButtonHTML = document.getElementById("saveInternshipButton")
    starButtonHTML.addEventListener("click", starFunction2)
    var dummyvariable = 0

    function starFunction2() {
      //         console.log("starFunction2 works")
      if (document.getElementById("InternshipCardHeader").innerHTML == "Saved Internship:") {
        return ("lol")
      } else {
        starredInternshipsArray.push(internshipObjects[currentInternshipNumber])
        console.log(internshipObjects[currentInternshipNumber].name)
        //         console.log(starredInternshipsArray[currentInternship].name)
        console.log(starredInternshipsArray[dummyvariable].interest);
        dummyvariable++;
        console.log("dummyvariable = " + dummyvariable)
        //         $("#footer").append(starredInternshipsArray[currentInternship].interest)  
        buttonclick()
      }
    }

    //New Filtering Engine
    function filterWords2() {
      var toggleHTML = document.getElementsByClassName("mdl-switch__input");
      console.log(toggleHTML.length);
      for (var i = 0; i < toggleHTML.length; i++) {
        addEventListener(toggleHTML[i], i);
      }
    }

    // TODO: don't name-collide on something in window
    // switch to jquery if you like: $("#my-id").click(() => console.log("boom"))
    // switch to jquery if you like: $("#my-id").click(() => {
    //   console.log("boom")
    // })

    function addEventListener(element, index) {
      console.log("addEventListenerfunctiontest");
      element.addEventListener("click", function () {
        clickCheck(index);
      }, false);
    }
    let toggleBoolean = true;

    function clickCheck(index) {
      if (toggleBoolean) {
        console.log("killallthethings")
        console.log(document.getElementsByClassName("mdl-switch__label")[index].textContent)
        for (var v = 0; v < internshipObjects.length; v++) {
          if (internshipObjects[v].interest.includes(document.getElementsByClassName("mdl-switch__label")[index].textContent.toLowerCase())) {
            hiddenInternshipObjects.push(internshipObjects[v])
            internshipObjects.splice(v, 1);
            v--;
            if (v <= currentInternshipNumber) {
              currentInternshipNumber--;
            }
          }
        }
        toggleBoolean = false;
      } else {
        console.log("returnallthethings")
        for (var v = 0; v < hiddenInternshipObjects.length; v++) {
          if (hiddenInternshipObjects[v].interest.includes(document.getElementsByClassName("mdl-switch__label")[index].textContent.toLowerCase())) {
            internshipObjects.push(hiddenInternshipObjects[v])
            hiddenInternshipObjects.splice(v, 1);
            v--;
          }
        }
        toggleBoolean = true;
      }
      nextInternship = internshipObjects[currentInternshipNumber]
      renderInternship()
    }


    //Saved Internships Page
    var placeholderButton = document.getElementById("viewSavedInternships")
    placeholderButton.addEventListener("click", savedInternshipsDisplay)
    var returnSavedInternshipPageBackToRegularInternshipsBoolean = true

    function savedInternshipsDisplay() {
      if (returnSavedInternshipPageBackToRegularInternshipsBoolean && starredInternshipsArray.length > 0) {
        console.log("testinglog")
        var x = 0
        document.getElementById("InternshipCardHeader").innerHTML = "Saved Internship:"
        InternshipNameHTML.innerHTML = "Name: " + starredInternshipsArray[x].name
        InternshipInterestHTML.innerHTML = "Interest: " + starredInternshipsArray[x].interest
        InternshipLogoHTML.src = starredInternshipsArray[x].logo
        InternshipLocationHTML.innerHTML = "Location: " + starredInternshipsArray[x].location
        placeholderButton.innerHTML = "Return to Internships"
        console.log(starredInternshipsArray[x].name)
        returnSavedInternshipPageBackToRegularInternshipsBoolean = false
        console.log(returnSavedInternshipPageBackToRegularInternshipsBoolean)
        nextInternshipButton.addEventListener("click", savedInternshipsButtonClick);
        console.log("1x is equal to " + x)

        function savedInternshipsButtonClick() {
          if (x >= starredInternshipsArray.length - 1) {
            console.log("switching x back to 0")
            x = 0
          } else {
            x++
          }
          console.log("2x is equal to " + x)
          InternshipNameHTML.innerHTML = "Name: " + starredInternshipsArray[x].name
          InternshipInterestHTML.innerHTML = "Interest: " + starredInternshipsArray[x].interest
          InternshipLogoHTML.src = starredInternshipsArray[x].logo
          InternshipLocation.innerHTML = "Location: " + starredInternshipsArray[x].location
        }
        starButtonHTML.innerHTML = "Delete Internship"
        starButtonHTML.addEventListener("click", deleteSavedInternship)

        function deleteSavedInternship() {
          console.log("deleteSavedInternship1")
          starredInternshipsArray.splice(x, 1)
          x++
          if (starredInternshipsArray.length > 0 && x >= starredInternshipsArray.length - 1) {
            x = 0
            InternshipNameHTML.innerHTML = "Name: " + starredInternshipsArray[x].name
            InternshipInterestHTML.innerHTML = "Interest: " + starredInternshipsArray[x].interest
            InternshipLogoHTML.src = starredInternshipsArray[x].logo
            InternshipLocationHTML.innerHTML = "Location: " + starredInternshipsArray[x].location
          } else if (starredInternshipsArray.length > 0) {
            InternshipNameHTML.innerHTML = "Name: " + starredInternshipsArray[x].name
            InternshipInterestHTML.innerHTML = "Interest: " + starredInternshipsArray[x].interest
            InternshipLogoHTML.src = starredInternshipsArray[x].logo
            InternshipLocationHTML.innerHTML = "Location: " + starredInternshipsArray[x].location
          } else {
            InternshipNameHTML.innerHTML = "Name: "
            InternshipInterestHTML.innerHTML = "Interest: "
            InternshipLogoHTML.src = ""
            InternshipLocationHTML.innerHTML = "Location: "
          }
        }
        returnSavedInternshipPageBackToRegularInternshipsBoolean = false
      } else {
        console.log(internshipObjects[currentInternshipNumber].name)
        console.log(returnSavedInternshipPageBackToRegularInternshipsBoolean)
        console.log("elsefunctionisworking")
        console.log(internshipObjects[currentInternshipNumber].name)
        document.getElementById("InternshipCardHeader").innerHTML = "Internship:"
        InternshipNameHTML.innerHTML = "Name: " + nextInternship.name
        InternshipInterestHTML.innerHTML = "Interest: " + nextInternship.interest
        InternshipLogoHTML.src = nextInternship.logo
        InternshipLocationHTML.innerHTML = "Location: " + nextInternship.location
        placeholderButton.innerHTML = "Saved Internships"
        starButtonHTML.innerHTML = "Save Internship for Later Viewing"
        returnSavedInternshipPageBackToRegularInternshipsBoolean = true;
        nextInternshipButton.addEventListener("click", buttonclick2)
        if (document.getElementById("InternshipCardHeader").innerHTML == "Saved Internship:") {
          return ("lol")
        } else {
          starredInternshipsArray.push(internshipObjects[currentInternshipNumber])
          console.log(internshipObjects[currentInternshipNumber].name)
          //         console.log(starredInternshipsArray[currentInternship].name)
          console.log(starredInternshipsArray[dummyvariable].interest);
          dummyvariable++;
          console.log("dummyvariable = " + dummyvariable)
          //         $("#footer").append(starredInternshipsArray[currentInternship].interest)  
          buttonclick()
        }

        function buttonclick2() {
          currentInternshipNumber++
          //Loops though database
          if (currentInternshipNumber >= internshipObjects.length) {
            currentInternshipNumber = 0;
          }
          renderInternship()
        }
      }
    }
    //Showing Additional Info
    var additionalInfoButtonHTML = document.getElementById("AdditionalInternshipInfoButton");
    let internshipAdditionalInfoCard = document.getElementById("internshipCardAdditionalInfo")
    let internshipCardBasicProfile = document.getElementById("internshipCardAttributesList");
    let additionalInfoBoolean = true
    additionalInfoButtonHTML.addEventListener("click", showAdditionalInfo);

    function showAdditionalInfo() {
      let InternshipContactHTML = document.getElementById("InternshipContact")
      let InternshipJobDescriptionHTML = document.getElementById("InternshipJobDescription")
      let InternshipNumberofStudentsHTML = document.getElementById("InternshipNumberofStudents")
      if (additionalInfoBoolean) {
        internshipAdditionalInfoCard.style.zIndex = "1";
        internshipCardBasicProfile.style.zIndex = "-1";
        internshipAdditionalInfoCard.style.visibility = "visible"
        internshipCardBasicProfile.style.visibility = "hidden"
        InternshipContactHTML.innerHTML = "Contact Information: " + internshipObjects[currentInternshipNumber].contactInfo
        InternshipJobDescriptionHTML.innerHTML = "Job Description: " + internshipObjects[currentInternshipNumber].jobDescription
        InternshipNumberofStudentsHTML.innerHTML = "Number of Students Possible: " + internshipObjects[currentInternshipNumber].numberofStudents
        additionalInfoBoolean = false
      } else {
        internshipAdditionalInfoCard.style.zIndex = "-1";
        internshipCardBasicProfile.style.zIndex = "1";
        internshipAdditionalInfoCard.style.visibility = "hidden"
        internshipCardBasicProfile.style.visibility = "visible"
        additionalInfoBoolean = true
      }
    }
    //Showing the Google Profile
    var profileButtonHTML = document.getElementById("viewProfilePage")
    profileButtonHTML.addEventListener("click", renderProfile);
    var buttonClickBoolean = true

    function renderProfile() {
      var InternshipCardHTML = document.getElementById("InternshipCard");
      var FilterCardHTML = document.getElementById("FilterCard");
      var ProfileCardHTML = document.getElementById("ProfileCard");
      var ProfileCardNameHTML = document.getElementById("ProfileName");
      var ProfileCardEmailHTML = document.getElementById("ProfileEmail");
      var ProfileCardIMGHTML = document.getElementById("ProfileImage");
      var ProfileCardButton = document.getElementById("viewProfilePage");
      if (buttonClickBoolean) {
        InternshipCardHTML.style.zIndex = "-1";
        FilterCardHTML.style.zIndex = "-1";
        ProfileCardHTML.style.zIndex = "1";
        ProfileCardHTML.style.visibility = "visible";
        InternshipCardHTML.style.visibility = "hidden";
        FilterCardHTML.style.visibility = "hidden";
        ProfileCardButton.innerHTML = "Return to Internships";
        ProfileCardNameHTML.innerHTML = "Name: " + userData.name;
        ProfileCardEmailHTML.innerHTML = "Email Address: " + userData.email;
        ProfileCardIMGHTML.src = userData.profileURL;
        buttonClickBoolean = false;
        console.log("testingrenderprofile2");
      } else {
        InternshipCardHTML.style.zIndex = "1";
        FilterCardHTML.style.zIndex = "1";
        ProfileCardHTML.style.zIndex = "-1";
        ProfileCardHTML.style.visibility = "hidden";
        InternshipCardHTML.style.visibility = "visible";
        FilterCardHTML.style.visibility = "visible";
        ProfileCardButton.innerHTML = "Profile Page"
        buttonClickBoolean = true
        console.log("testingrenderprofile3")
      }
      console.log("testingrenderprofile1");
    };


    //Title Returns to Basic Page
    var titleButton = document.getElementById("WebsiteTitle")
    titleButton.addEventListener("click", titleReturn);

    function titleReturn() {
      alert("titleReturn");
      // var InternshipCardHTML = document.getElementById("InternshipCard");
      // var FilterCardHTML = document.getElementById("FilterCard");
      // var ProfileCardHTML = document.getElementById("ProfileCard");
      // var ProfileCardNameHTML = document.getElementById("ProfileName");
      // var ProfileCardEmailHTML = document.getElementById("ProfileEmail");
      // var ProfileCardIMGHTML = document.getElementById("ProfileImage");
      // var ProfileCardButton = document.getElementById("viewProfilePage");
      // InternshipCardHTML.style.zIndex = "1";
      // FilterCardHTML.style.zIndex = "1";
      // ProfileCardHTML.style.zIndex = "-1";
      // ProfileCardHTML.style.visibility = "hidden";
      // InternshipCardHTML.style.visibility = "visible";
      // FilterCardHTML.style.visibility = "visible";
      // ProfileCardButton.innerHTML = "Profile Page";
      // document.getElementById("InternshipCardHeader").innerHTML = "Internship:"
      // InternshipNameHTML.innerHTML = "Name: " + nextInternship.name
      // InternshipInterestHTML.innerHTML = "Interest: " + nextInternship.interest
      // InternshipLogoHTML.src = nextInternship.logo
      // InternshipLocationHTML.innerHTML = "Location: " + nextInternship.location
      // placeholderButton.innerHTML = "Saved Internships"
      renderInternship();
    }
  })
}