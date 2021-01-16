/*Core.JS is for the essential bits: stuff that if you don't have it, then you probably won't have a FUNCTIONAL application*/
var statusEnum = {
    DONE: 1,
    WORKING: 2,
    TODO: 0,
    FAILED: -1
};



var firebase;
var db;
var auth;
var functions;

//Application specific variables
var club_search_index;
var extra_requests;

//Call this onload
function init() {
    initFirebase();
    initGui();

    initExtras();
}

function initFirebase() {
    //Handle the firebase init here
    // Your web app's Firebase configuration
    var firebaseConfig = {
        apiKey: "AIzaSyCnBCgx64QUfcbml3247lig0B0GVxQopn8",
        authDomain: "gammaloop-one.firebaseapp.com",
        databaseURL: "https://gammaloop-one.firebaseio.com",
        projectId: "gammaloop-one",
        storageBucket: "gammaloop-one.appspot.com",
        messagingSenderId: "897573796462",
        appId: "1:897573796462:web:4c89b4ffbe6adb3d"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    //init the specific functions here
    db = firebase.firestore();
    auth = firebase.auth();
    functions = firebase.functions();

}

function initGui() {
    //Handle any gui init here
}


//0: search index
function initExtras() {
    extra_requests = [];
    extra_requests[0] = {};
    firebaseLoadClubSearchIndex(extra_requests[0]);
}

//Firebase functions
//TODO: function-related feedback

//Email: string, Password: string. Returns nothing
function firebaseLogin(email, password) {
    auth.signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        console.log(error);
    });
}

//No input, no output
function firebaseLogout() {
    firebase.auth().signOut().then(function() {
        return true;
    }, function(error) {
        console.log(error);
    });
}

//Email: string, Password: string. Returns nothing
function firebaseSignup(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });
}


//Input: request = {}, Output: request = {data, status = true};
function firebaseUserData(request) {
    request.status = statusEnum.TODO;
    let user_id = auth.currentUser.uid;
    const user_ref = db.collection('users').doc(user_id);
    user_ref.get()
        .then(doc => {
            if (!doc.exists) {
                //Something really fucked up
                request.status = statusEnum.FAILED;
                request.error = "DOCUMENT NOT FOUND";
            }
            else {
                request.data = doc.data();
                request.status = statusEnum.DONE;
            }
        })
}


//Request must contain a field with the id of the club called club_id
//Input: request = {club_id = $}, Output: request = {data, status = true};
function firebaseLoadClub(request) {
    request.status = statusEnum.TODO;
    let club_id = request.club_id;
    const club_ref = db.collection('providers/clubs/public').doc(club_id);
    club_ref.get()
        .then(doc => {
            if (!doc.exists) {
                //You fucked up
                request.status = statusEnum.FAILED;
                request.error = "DOCUMENT NOT FOUND";
            }
            else {
                request.data = doc.data();
                request.status = statusEnum.DONE;
            }
        });
}


//No error checking - you gotta do it right!
//Request must contain a field with the id of the club called club_id
//Input: request = {club_id = $}, Output: request = {data, status = true};
function firebaseLoadClubMember(request) {
    request.status = statusEnum.TODO;
    let user_id = auth.currentUser.uid;
    let club_id = request.club_id;
    const user_ref = db.collection('providers/clubs/public/' + club_id + '/members').doc(user_id);
    user_ref.get()
        .then(doc => {
            if (!doc.exists) {
                //You fucked up
                request.status = statusEnum.FAILED;
                request.error = "DOCUMENT NOT FOUND";
            }
            else {
                request.data = doc.data();
                request.status = statusEnum.DONE;
            }
        });
}

//Request must contain a field with the name of the club
//Input: request = {club_id = $}, Output: request = {data, status = true};
function firebaseAddPublicClub(request) {
    request.status = statusEnum.TODO;
    var addClub = firebase.functions().httpsCallable('addClub');
    addClub({ text: "/providers/clubs/public/" + request.club_id }).then(function(result) {
        // Read result of the Cloud Function.
        request.status = statusEnum.DONE;
        request.data = result.data;
        // ...
    });
}

//Input: request = {club_id = $}, Output: request = {data, status = true};
function firebaseLeavePublicClub(request) {
    request.status = statusEnum.TODO;
    var leaveClub = firebase.functions().httpsCallable('leaveClub');
    leaveClub({ text: "/providers/clubs/public/" + request.club_id }).then(function(result) {
        // Read result of the Cloud Function.
        request.status = statusEnum.DONE;
        request.data = result.data;
        // ...
    });
}


function firebaseAddPublicEvent(request) {
    request.status = statusEnum.TODO;
    var leaveClub = firebase.functions().httpsCallable('leaveClub');
    leaveClub({ text: "/providers/clubs/public/" + request.club_id }).then(function(result) {
        // Read result of the Cloud Function.
        request.status = statusEnum.DONE;
        request.data = result.data;
        // ...
    });
}



function firebaseLoadClubSearchIndex(request) {
    request.status = statusEnum.TODO;
    //Search is handled as a local thingy, not as in firebase
    //Load the index.
    var search_index_reference = db.collection("/index/providers/clubs").doc("public");

    search_index_reference.get().then(function(doc) {
        if (doc.exists) {
            //The document structure is such that EACH value is an entry, so this could take a while
            club_search_index = doc.data();
            request.status = statusEnum.DONE;
        }
        else {
            request.status = statusEnum.FAILED;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        request.status = statusEnum.FAILED;
    });
}

function searchDocumentValues(JSON_doc, query) {
    var result = [];
    for (var key in JSON_doc) {
        if (key.includes(query)) {
            let pair = [];
            pair[0] = key;
            pair[1] = JSON_doc[key];
            result.push(pair);
        }
    }
    return result;
}

//Search and stuff will come later... for now, you have to know the club id of the club that you want to join
//Input: request = {search_query = $}, Output: request = {data, status = true};
function firebaseSearchPublicClub(request) {
    request.status = statusEnum.TODO;
    if (extra_requests[0].status != statusEnum.DONE) {
        //Preconditions have not been met.
        request.status = statusEnum.FAILED;
        //Run it again if by some weird logic it hasn't or something
        firebaseLoadClubSearchIndex(extra_requests[0]);
    }
    else {
        //It has been loaded nicely for us!
        //Each value is a field
        let results = searchDocumentValues(club_search_index, request.search_query);
        request.results = results;
        request.status = statusEnum.DONE;
    }
}

//For testing, use bN6Se7EyrelsC6hP17bc
