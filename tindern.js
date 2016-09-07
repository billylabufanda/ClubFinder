/**
 * Created with Tindernship.
 * User: billylabufanda
 * Date: 2016-05-30
 * Time: 03:53 PM
 * To change this template use Tools | Templates.
 **/
//Error function cause no inspect element
//Internship Object Prototype

function Internship(name, size, interest, location) {
    this.name = name;
    this.size = size;
    this.interest = interest;
    this.location = location;
}
//Creates the spreadsheet link
var spreadsheetId = "1mbhOYeSMbUxoYYej2ypa9EBqALvran9G_9ZKU80Hki4",
    databaseUrl = "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/od6/public/basic?alt=json";
//Some Variables
var internshipObjects = [];
var hiddenInternshipObjects = [];
var jsonString;
//Calls JSON and then slices and dices it
$.getJSON(databaseUrl, function(json) {
    //     console.log(json.feed.entry.title.toString());
    jsonString = JSON.stringify(json);
    jsonString = jsonString.slice(jsonString.indexOf("title") + 5, jsonString.length);
    jsonString = jsonString.slice(jsonString.indexOf("title") + 5, jsonString.length);
    jsonString = jsonString.slice(jsonString.indexOf("title") + 5, jsonString.length);
    //     $("#footer").append(jsonString);
    while(jsonString.indexOf("title") >= 0) {
        var name = jsonString.slice(jsonString.indexOf("$t") + 5, jsonString.indexOf("},") - 1);
        var description = jsonString.slice(jsonString.indexOf("cokwr") + 7, jsonString.indexOf(", _"));
        var location = jsonString.slice(jsonString.indexOf("_cpzh4") + 7, jsonString.indexOf("link") - 4);
        jsonString = jsonString.slice(jsonString.indexOf("title") + 5, jsonString.length);
        var internship = new Internship(name, 0, description, location)
        internshipObjects.push(internship);
        //         $("#footer").append(name+" ");
        //         $("#footer").append(internship.toString());
    }
    nextInternship = internshipObjects[0];
    InternshipName.innerHTML = "Name: " + nextInternship.name
    InternshipInterest.innerHTML = "Interest: " + nextInternship.interest
    InternshipSize.innerHTML = "Size: " + nextInternship.size
    InternshipLocation.innerHTML = "Location: " + nextInternship.location
    renderInternship()
});
//This is the object that is displayed, it is based on currentInternship, a value in the array of internshipObjects
var nextInternship;
var currentInternship = 0;
var nextInternshipButton = document.getElementById("nextInternshipButton");
var InternshipName = document.getElementById("InternshipName");
var InternshipInterest = document.getElementById("InternshipInterest");
var InternshipSize = document.getElementById("InternshipSize");
var InternshipLocation = document.getElementById("InternshipLocation");
//Render Things

function renderInternship() {
    nextInternship = internshipObjects[currentInternship]
    InternshipName.innerHTML = "Name: " + nextInternship.name
    InternshipInterest.innerHTML = "Interest: " + nextInternship.interest
    InternshipSize.innerHTML = "Size: " + nextInternship.size
    InternshipLocation.innerHTML = "Location: " + nextInternship.location
}
//When the Button is Clicked
nextInternshipButton.addEventListener("click", buttonclick);

function buttonclick() {
    currentInternship++
    //Loops though database
    if(currentInternship >= internshipObjects.length) {
        currentInternship = 0;
    }
    renderInternship()
    //document.getElementsByClassName("starHTML")[0].className = "glyphicon glyphicon-star-empty starHTML"
};
filterWords();
//Filter Based on Key Words

function filterWords() {
    var checkmarkHTML = document.getElementsByClassName("checkmarkVisual");
    console.log(checkmarkHTML.length);
    for(var i = 0; i < checkmarkHTML.length; i++) {
        addEventListener(checkmarkHTML[i], i);
    }
};

function addEventListener(element, index) {
    console.log("addEventListenerfunctiontest")
    element.addEventListener("click", function() {
        clickCheck(index)
    }, false);
}

function clickCheck(index) {
    console.log(index);
    if(document.getElementsByClassName("checkmarkVisual")[index].className == "glyphicon glyphicon-remove checkmarkVisual") {
        console.log("xmarkcheck")
        document.getElementsByClassName("checkmarkVisual")[index].className = "glyphicon glyphicon-ok checkmarkVisual";
        for(var v = 0; v < hiddenInternshipObjects.length; v++) {
            if(hiddenInternshipObjects[v].interest.includes(document.getElementsByClassName("checkmarkVisual")[index].textContent.toLowerCase())) {
                internshipObjects.push(hiddenInternshipObjects[v])
                hiddenInternshipObjects.splice(v, 1);
                v--;
            }
        }
    } else {
        console.log("checkmarkcheck");
        document.getElementsByClassName("checkmarkVisual")[index].className = "glyphicon glyphicon-remove checkmarkVisual";
        //         alert(document.getElementsByClassName("checkmarkVisual")[index].className);
        //alert(nextInternship.interest);
        for(var v = 0; v < internshipObjects.length; v++) {
            if(internshipObjects[v].interest.includes(document.getElementsByClassName("checkmarkVisual")[index].textContent.toLowerCase())) {
                hiddenInternshipObjects.push(internshipObjects[v])
                internshipObjects.splice(v, 1);
                v--;
                if(v <= currentInternship) {
                    currentInternship--;
                }
            }
        }
        if(currentInternship < 0) {
            currentInternship = 0;
        }
        nextInternship = internshipObjects[currentInternship]
        renderInternship()
    }
}
//Prefered Internships
// var emptyStarHTML = document.getElementsByClassName("starHTML");
// document.getElementsByClassName("starHTML")[0].addEventListener("click", starFunction1);
//     function starFunction1() {
//         if(document.getElementsByClassName("starHTML")[0].className == "glyphicon glyphicon-star-empty starHTML") {
//             document.getElementsByClassName("starHTML")[0].className = "glyphicon glyphicon-star starHTML"
//             starredInternshipsArray.push(internshipObjects[currentInternship])
//             $("#footer").append(starredInternshipsArray[0].interest)
//         } else {
//             document.getElementsByClassName("starHTML")[0].className = "glyphicon glyphicon-star-empty starHTML"
//             starredInternshipsArray.splice(internshipObjects[currentInternship], 1);
//             console.log("starFunctiontest")
//         }
//     }
var starredInternshipsArray = []
var starButtonHTML = document.getElementById("saveInternshipButton")
starButtonHTML.addEventListener("click", starFunction2)
var dummyvariable = 0

    function starFunction2() {
        //         console.log("starFunction2 works")
        if(document.getElementById("InternshipCardHeader").innerHTML == "Saved Internship:") {
            return("lol")
        } else {
            starredInternshipsArray.push(internshipObjects[currentInternship])
            console.log(internshipObjects[currentInternship].name)
            //         console.log(starredInternshipsArray[currentInternship].name)
            console.log(starredInternshipsArray[dummyvariable].interest);
            dummyvariable++;
            console.log("dummyvariable = " + dummyvariable)
            //         $("#footer").append(starredInternshipsArray[currentInternship].interest)  
            buttonclick()
        }
    }
    //Saved Internships Page
var placeholderButton = document.getElementById("placeholderButton")
placeholderButton.addEventListener("click", savedInternshipsDisplay)
var returnSavedInternshipPageBackToRegularInternshipsBoolean = true

    function savedInternshipsDisplay() {
        if(returnSavedInternshipPageBackToRegularInternshipsBoolean && starredInternshipsArray.length > 0) {
            console.log("testinglog")
            var x = 0
            document.getElementById("InternshipCardHeader").innerHTML = "Saved Internship:"
            InternshipName.innerHTML = "Name: " + starredInternshipsArray[x].name
            InternshipInterest.innerHTML = "Interest: " + starredInternshipsArray[x].interest
            InternshipSize.innerHTML = "Size: " + starredInternshipsArray[x].size
            InternshipLocation.innerHTML = "Location: " + starredInternshipsArray[x].location
            placeholderButton.innerHTML = "Return to Internships"
            console.log(starredInternshipsArray[x].name)
            returnSavedInternshipPageBackToRegularInternshipsBoolean = false
            console.log(returnSavedInternshipPageBackToRegularInternshipsBoolean)
            nextInternshipButton.addEventListener("click", savedInternshipsButtonClick);
            console.log("1x is equal to " + x)

            function savedInternshipsButtonClick() {
                if(x >= starredInternshipsArray.length - 1) {
                    console.log("switching x back to 0")
                    x = 0
                } else {
                    x++
                }
                console.log("2x is equal to " + x)
                InternshipName.innerHTML = "Name: " + starredInternshipsArray[x].name
                InternshipInterest.innerHTML = "Interest: " + starredInternshipsArray[x].interest
                InternshipSize.innerHTML = "Size: " + starredInternshipsArray[x].size
                InternshipLocation.innerHTML = "Location: " + starredInternshipsArray[x].location
            }
            returnSavedInternshipPageBackToRegularInternshipsBoolean = false
        } else {
            console.log(internshipObjects[currentInternship].name)
            console.log(returnSavedInternshipPageBackToRegularInternshipsBoolean)
            console.log("elsefunctionisworking")
            console.log(internshipObjects[currentInternship].name)
            document.getElementById("InternshipCardHeader").innerHTML = "Internship:"
            InternshipName.innerHTML = "Name: " + nextInternship.name
            InternshipInterest.innerHTML = "Interest: " + nextInternship.interest
            InternshipSize.innerHTML = "Size: " + nextInternship.size
            InternshipLocation.innerHTML = "Location: " + nextInternship.location
            placeholderButton.innerHTML = "Click for saved internships"
            returnSavedInternshipPageBackToRegularInternshipsBoolean = true;
            nextInternshipButton.addEventListener("click", buttonclick2)

            function buttonclick2() {
                currentInternship++
                //Loops though database
                if(currentInternship >= internshipObjects.length) {
                    currentInternship = 0;
                }
                renderInternship()
            }
        }
    }
