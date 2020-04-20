var current_page = 1;
var records_per_page = 10;
var users = [];
let userref = firebase
  .database()
  .ref("Users/UID1")
  .orderByKey()
  .limitToFirst(records_per_page);

// var _lastKey;

$(document).ready(function() {
  // ListUser(userref);

  fetchUser();
  $("#btn-next").on("click", e => {
    // console.log("function is called");
    nextPage();
    e.preventDefault();
  });
  $("#btn-prev").on("click", e => {
    // console.log("function is called");
    prevPage();
    e.preventDefault();
  });
  // $("#usertable").DataTable({
  //   data: users,
  //   paging: false,
  //   info: false
  // });
});

function fetchUser() {
  userref.on("value", async snap => {
    let data = await snap.val();
    let count = 1;
    for (let k in data) {
      users.push(data[k]);
      if (count == 10) {
        _lastKey = k;
      }
      count++;
    }
    updateTable();
    userref = firebase
      .database()
      .ref("Users/UID1")
      .orderByKey()
      .limitToFirst(records_per_page);
  });
}

function updateTable() {
  $("#user-list").html("");
  let end = current_page * records_per_page;
  for (let i = end - records_per_page + 1; i <= end; i++) {
    let user = users[i - 1];
    if (user == undefined) continue;
    try {
      $("#user-list").append(`
        <tr>
        <td>${i}</td>
        <td>${user.firstName + " " + user.lastName}</td>
        <td>${user.institute}</td>
        <td>${user.city}</td>
        <td>${user.phone}</td>
      </tr>
          `);

      // console.log(i, user);
    } catch (e) {
      console.log(e.message);
    }
  }
}

function ListUser(userref) {
  $("#user-list").html("");
  let count = 1;
  let lastkey;
  userref.on("value", async function(data) {
    let users = await data.val();
    // console.log(users);
    for (let k in users) {
      let user = users[k];
      $("#user-list").append(`
      <tr>
      <td>${count}</td>
      <td>${user.firstName + " " + user.lastName}</td>
      <td>${user.institute}</td>
      <td>${user.city}</td>
      <td>${user.phone}</td>
    </tr>
        `);
      if (count == 10) {
        _lastKey = k;
        console.log("LastKey is set", _lastKey);
      }
      count++;
    }

    // $("#usertable").DataTable({
    //   scrollY: 500,
    //   paging: false
    // });
    // $("#pagination").show();
    // nextPage();
    // prevPage();
  });
}

function nextPage() {
  // console.log("here");
  current_page++;
  userref = userref.startAt(_lastKey);
  fetchUser();
}
function prevPage() {
  if (current_page != 1) {
    current_page--;
    fetchUser();
  }
}
