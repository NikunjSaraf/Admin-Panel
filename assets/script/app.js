// let _coursename = $("#course_select").val();

$(document).ready(function() {
  //---------------------------------------------------------------------------------
  //    SIDE TOGGLE FUNCTION
  //---------------------------------------------------------------------------------
  $("#sidebarCollapse").on("click", function() {
    $("#sidebar").toggleClass("active");
    $("#content").toggleClass("active");
  });

  //---------------------------------------------------------------------------------
  //    CAll Auth State FUNCTION to find the state of authentication
  //---------------------------------------------------------------------------------
  checkAuthState();

  //---------------------------------------------------------------------------------
  //    Populate the Username field if user is logged in
  //---------------------------------------------------------------------------------
  populateUserName();

  //---------------------------------------------------------------------------------
  //    Handle On Click Function for Log Out Button
  //---------------------------------------------------------------------------------
  $(".logoutbtn").on("click", function(e) {
    e.preventDefault();
    firebase
      .auth()
      .signOut()
      .then(
        function() {
          // Sign-out successful.
          console.log("sign out successful");
        },
        function(error) {
          // An error happened.
          console.log(error);
        }
      );
  });
});

//---------------------------------------------------------------------------------
//    Check Auth State Function Defination
//---------------------------------------------------------------------------------
function checkAuthState() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var email = user.email;
      var uid = user.uid;
    } else {
      // If The User is Logged Out then redirect the user to the login screen automatically
      window.location.href = "./login.html";
    }
  });
}

//---------------------------------------------------------------------------------
//    If the User is Logged in Populate the User Name
//---------------------------------------------------------------------------------
function populateUserName() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      let email = user.email;

      setUserField(email);
    } else {
      // No user is signed in.
    }
  });
}

//---------------------------------------------------------------------------------
//    Find the User with Given Email and Populate the Name of the user on the screens
//---------------------------------------------------------------------------------
function setUserField(email) {
  let adminref = firebase.database().ref("admin-user");
  let result;
  adminref.on("value", data => {
    let users = data.val();
    for (let i in users) {
      let user = users[i];
      if (user.email == email) {
        result = user;
        $(".profile h4").html(`${result.name}`);
        break;
      }
    }
  });
  return result;
}
