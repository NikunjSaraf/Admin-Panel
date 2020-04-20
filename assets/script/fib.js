//---------------------------------------------------------------------------------
//    Global Variable
//---------------------------------------------------------------------------------
let _courseID;
let _levelID;
let _typeId = 1;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();

  //   Hide the Subject Row
  $(".fib-row").hide();

  //---------------------------------------------------------------------------------
  //    Event Change on the Course Selector
  //---------------------------------------------------------------------------------
  $('select[name="current_course_select"]').on("change", function() {
    _courseID = $(this).val();
    // Populate the subject List
    populateLevelSelectList();
  });

  //---------------------------------------------------------------------------------
  //    Event Change on the Chapter Selector
  //---------------------------------------------------------------------------------
  $('select[name="current_level_select"]').on("change", function() {
    _levelID = $(this).val();
    // Show the Table
    $(".fib-row").show();
    // listfibList();
    listQuesList();
  });

  // Add fib Button Click
  $("#addfibebtn").on("click", function(e) {
    clearInputs();
    $("#multiple-answer").hide();
    $('input:radio[name="answerchoice"]').on("change", function() {
      var radioValue = $('input:radio[name="answerchoice"]:checked').val();

      if (radioValue == "single") {
        $("#single-answer").show();
        $("#multiple-answer").hide();
      } else {
        $("#single-answer").hide();
        $("#multiple-answer").show();
      }
    });
    e.preventDefault();
  });

  let answerchoice = $('input:radio[name="edit_answerchoice"]');
  $("#edit_single-answer").show();
  $("#edit_multiple-answer").hide();
  answerchoice.on("change", function() {
    var radioValue = $('input:radio[name="edit_answerchoice"]:checked').val();
    if (radioValue == "single") {
      $("#edit_single-answer").show();
      $("#edit_multiple-answer").hide();
    } else {
      $("#edit_single-answer").hide();
      $("#edit_multiple-answer").show();
    }
  });

  //   Add fib Button
  $("#fib-submit-btn").on("click", function(e) {
    addfib();
    e.preventDefault();
  });

  //   Update fib Button
  $("#fib-update-btn").on("click", function(e) {
    updatefib();
    e.preventDefault();
  });
});

//---------------------------------------------------------------------------------
//    Fetch the data from firebase and Populate the Courses Selector
//---------------------------------------------------------------------------------
function populateCourseSelectList() {
  // $('select[name="current_course_select"]').html('');
  $('select[name="current_course_select"]').html(`
    <option selected disabled>Select Courses</option>
    `);
  let ref = firebase.database().ref("Test");
  ref.on("child_added", data => {
    let courses = data.val();
    // for (let k in courses) {
    //   let course = courses[k];
    $('select[name="current_course_select"]').append(`
            <option value="${courses.courseID}">${courses.coursename}</option>
            `);
    // }
  });
}

//---------------------------------------------------------------------------------
//    Fetch the data from firebase and Populate the Subject Selector
//---------------------------------------------------------------------------------
function populateLevelSelectList() {
  $('select[name="current_level_select"]').html(`
  <option selected disabled>Choose Chapter</option>
  `);
  let levelref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels");
  levelref.on("child_added", data => {
    let level = data.val();
    $('select[name="current_level_select"]').append(
      `<option value="${level.levelID}">${level.levelname}</option>`
    );
  });
}

//---------------------------------------------------------------------------------
//    Add fib to the Firebase
//---------------------------------------------------------------------------------
function addfib() {
  let fib = getInputValue();
  let typeId = 1;
  let typeref = firebase
    .database()
    .ref("Types")
    .child(typeId);
  fib.qID = typeref.push().key;
  typeref.child(fib.qID).set(fib);
  let testref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  let queobj = {
    qID: fib.qID,
    typeId: fib.typeId
  };
  testref.child(queobj.qID).set(queobj);
  displayfib(fib);
}

//---------------------------------------------------------------------------------
//    List All fib on Firebase
//---------------------------------------------------------------------------------
function listQuesList() {
  $("#fib-list").html("");
  let qref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  qref.on("child_added", data => {
    let que = data.val();
    if (que.typeId == 1) {
      // console.log("fib IT IS!!");
      fetchfib(que);
    }
  });
}

//---------------------------------------------------------------------------------
//    Fetch One fib
//---------------------------------------------------------------------------------
function fetchfib(que) {
  let typeId = que.typeId;
  let qid = que.qID;
  let fibref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(qid);
  fibref.on("value", data => {
    let fib = data.val();
    displayfib(fib);
  });
}

//---------------------------------------------------------------------------------
//    Display One fib
//---------------------------------------------------------------------------------
function displayfib(fib) {
  $("#fib-list").append(`
  <div class="card mt-2">
                                <div class="card-header">

                                    <a href="#collapse${
                                      fib.qID
                                    }" data-parent="#fib-list" data-toggle="collapse">
                                        
                                        ${fib.ques}
                                    </a>
                                </div>
                                <div id="collapse${fib.qID}" class="collapse">
                                    <div class="card-body">
                                        <ul class="list-group">
                                            <li class="list-group-item">(A) : ${
                                              fib.options[0]
                                            }</li>
                                            <li class="list-group-item">(B) : ${
                                              fib.options[1]
                                            }</li>
                                            <li class="list-group-item">(C) : ${
                                              fib.options[2]
                                            }</li>
                                            <li class="list-group-item">Correct: ${
                                              fib.options[fib.correct - 1]
                                            } </li>
                                            <li class="list-group-item">Solution: ${
                                              fib.fibSolution == undefined
                                                ? ""
                                                : fib.fibSolution
                                            }</li>
                                        </ul>
                                    </div>
                                    <div class="card-footer">
                                        <div class="text-right">
                                            <a href="#" class="btn btn-danger" onclick="deletefib('${
                                              fib.qID
                                            }')"><i class="fas fa-trash mr-2"></i>
                                                Delete</a>
                                            <a href="#" class="btn btn-warning" data-toggle="modal"
                                            data-target="#editfibModal" onclick="editfib('${
                                              fib.qID
                                            }')"> <i
                                                    class="fas fa-pencil-alt mr-2"></i>Edit</a>
                                        </div>

                                    </div>
                                </div>
                                
                            </div>
  `);
}

//---------------------------------------------------------------------------------
//    Find the Selected fib using id and update the Form Fields
//---------------------------------------------------------------------------------
function editfib(id) {
  // Get the database Ref
  let typeId = 1;
  let qref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(id);

  qref.on("value", data => {
    let fib = data.val();
    setEditModal(fib);
  });
}

function setEditModal(fib) {
  let question = $('textarea[name="edit_fib_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let optionC = $('input[name="edit_optionC"]');
  let fibid = $("#fibid");
  let solution = $('textarea[name="edit_fib_solution"]');

  fibid.val(`${fib.qID}`);
  question.val(`${fib.ques}`);
  optionA.val(`${fib.options[0]}`);
  optionB.val(`${fib.options[1]}`);
  optionC.val(`${fib.options[2]}`);
  solution.val(`${fib.solution}`);

  $(`input:radio[name="edit_single-answer"][value="${fib.correct}"]`).prop(
    "checked",
    true
  );
}

//---------------------------------------------------------------------------------
//    Update the fib details on Firebase
//---------------------------------------------------------------------------------
function updatefib() {
  let fib = getEditInput();
  let typeId = 1;
  let fibref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(fib.qID)
    .set(fib);
  listQuesList();
}

function getEditInput() {
  let question = $('textarea[name="edit_fib_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let optionC = $('input[name="edit_optionC"]');
  let solution = $('textarea[name="edit_fib_solution"]');
  let fibid = $("#fibid");

  $("#edit_single-answer").show();
  let singleradio = $('input:radio[name="edit_single-answer"]:checked');
  let answer = singleradio.val();

  let fib = {
    qID: fibid.val(),
    ques: question.val(),
    options: [optionA.val(), optionB.val(), optionC.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: answer
  };
  question.val("");
  optionA.val("");
  optionB.val("");
  optionC.val("");
  solution.val("");
  fibid.val("");
  singleradio.prop("checked", false);
  return fib;
}

//---------------------------------------------------------------------------------
//    Delete the fib using id and update the table
//---------------------------------------------------------------------------------
function deletefib(id) {
  let f = confirm("Are you Sure");
  if (f == true) {
    firebase
      .database()
      .ref("Types")
      .child(_typeId)
      .child(id)
      .remove();
    firebase
      .database()
      .ref("Test")
      .child(_courseID)
      .child("Levels")
      .child(_levelID)
      .child("ques")
      .child(id)
      .remove();
    listQuesList();
  }
}

// Clear Input
function clearInputs() {
  let question = $('textarea[name="fib_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let optionC = $('input[name="optionC"]');
  let solution = $('textarea[name="fib_solution"]');
  $('input:radio[name="answerchoice"][value = "single"]').prop("checked", true);
  let answerchoice = $('input:radio[name="answerchoice"]');

  $("#single-answer").show();
  let singleradio = $('input:radio[name="single-answer"]');
  singleradio.prop("checked", false);
  let multiplcheck = $('input:checkbox[name="multiple-answer"]');
  multiplcheck.prop("checked", false);
  question.val("");
  optionA.val("");
  optionB.val("");
  optionC.val("");
  solution.val("");
}

// get Value from Inputs
function getInputValue() {
  let question = $('textarea[name="fib_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let optionC = $('input[name="optionC"]');
  let solution = $('textarea[name="fib_solution"]');

  let answerchoice = $('input:radio[name="answerchoice"]');

  let singleradio = $('input:radio[name="single-answer"]:checked');
  let singleval = singleradio.val();
  let fib = {
    ques: question.val(),
    options: [optionA.val(), optionB.val(), optionC.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: singleval
  };
  return fib;
}
