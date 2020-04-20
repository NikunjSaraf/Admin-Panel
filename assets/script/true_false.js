//---------------------------------------------------------------------------------
//    Global Variable
//---------------------------------------------------------------------------------
let _courseID;
let _levelID;
let _typeId = 2;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();

  //   Hide the Subject Row
  $(".true_false-row").hide();

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
    $(".true_false-row").show();
    // listtrue_falseList();
    listQuesList();
  });

  // Add true_false Button Click
  $("#addtrue_falseebtn").on("click", function(e) {
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

  //   Add true_false Button
  $("#true_false-submit-btn").on("click", function(e) {
    addtrue_false();
    e.preventDefault();
  });

  //   Update true_false Button
  $("#true_false-update-btn").on("click", function(e) {
    updatetrue_false();
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
//    Add true_false to the Firebase
//---------------------------------------------------------------------------------
function addtrue_false() {
  let true_false = getInputValue();
  let typeId = 2;
  let typeref = firebase
    .database()
    .ref("Types")
    .child(typeId);
  true_false.qID = typeref.push().key;
  typeref.child(true_false.qID).set(true_false);
  let testref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  let queobj = {
    qID: true_false.qID,
    typeId: true_false.typeId
  };
  testref.child(queobj.qID).set(queobj);
  displaytrue_false(true_false);
}

//---------------------------------------------------------------------------------
//    List All true_false on Firebase
//---------------------------------------------------------------------------------
function listQuesList() {
  $("#true_false-list").html("");
  let qref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  qref.on("child_added", data => {
    let que = data.val();
    if (que.typeId == 2) {
      // console.log("true_false IT IS!!");
      fetchtrue_false(que);
    }
  });
}

//---------------------------------------------------------------------------------
//    Fetch One true_false
//---------------------------------------------------------------------------------
function fetchtrue_false(que) {
  let typeId = que.typeId;
  let qid = que.qID;
  let true_falseref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(qid);
  true_falseref.on("value", data => {
    let true_false = data.val();
    displaytrue_false(true_false);
  });
}

//---------------------------------------------------------------------------------
//    Display One true_false
//---------------------------------------------------------------------------------
function displaytrue_false(true_false) {
  $("#true_false-list").append(`
  <div class="card mt-2">
                                <div class="card-header">

                                    <a href="#collapse${
                                      true_false.qID
                                    }" data-parent="#true_false-list" data-toggle="collapse">
                                        
                                        ${true_false.ques}
                                    </a>
                                </div>
                                <div id="collapse${
                                  true_false.qID
                                }" class="collapse">
                                    <div class="card-body">
                                        <ul class="list-group">
                                            <li class="list-group-item">(A) : ${
                                              true_false.options[0]
                                            }</li>
                                            <li class="list-group-item">(B) : ${
                                              true_false.options[1]
                                            }</li>
                                            
                                            <li class="list-group-item">Correct: ${
                                              true_false.options[
                                                true_false.correct - 1
                                              ]
                                            } </li>
                                            <li class="list-group-item">Solution: ${
                                              true_false.true_falseSolution ==
                                              undefined
                                                ? ""
                                                : true_false.true_falseSolution
                                            }</li>
                                        </ul>
                                    </div>
                                    <div class="card-footer">
                                        <div class="text-right">
                                            <a href="#" class="btn btn-danger" onclick="deletetrue_false('${
                                              true_false.qID
                                            }')"><i class="fas fa-trash mr-2"></i>
                                                Delete</a>
                                            <a href="#" class="btn btn-warning" data-toggle="modal"
                                            data-target="#edittrue_falseModal" onclick="edittrue_false('${
                                              true_false.qID
                                            }')"> <i
                                                    class="fas fa-pencil-alt mr-2"></i>Edit</a>
                                        </div>

                                    </div>
                                </div>
                                
                            </div>
  `);
}

//---------------------------------------------------------------------------------
//    Find the Selected true_false using id and update the Form Fields
//---------------------------------------------------------------------------------
function edittrue_false(id) {
  // Get the database Ref
  let typeId = 2;
  let qref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(id);

  qref.on("value", data => {
    let true_false = data.val();
    setEditModal(true_false);
  });
}

function setEditModal(true_false) {
  let question = $('textarea[name="edit_true_false_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let true_falseid = $("#true_falseid");
  let solution = $('textarea[name="edit_true_false_solution"]');

  true_falseid.val(`${true_false.qID}`);
  question.val(`${true_false.ques}`);
  optionA.val(`${true_false.options[0]}`);
  optionB.val(`${true_false.options[1]}`);
  solution.val(`${true_false.solution}`);

  $(
    `input:radio[name="edit_single-answer"][value="${true_false.correct}"]`
  ).prop("checked", true);
}

//---------------------------------------------------------------------------------
//    Update the true_false details on Firebase
//---------------------------------------------------------------------------------
function updatetrue_false() {
  let true_false = getEditInput();
  let typeId = 2;
  let true_falseref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(true_false.qID)
    .set(true_false);
  listQuesList();
}

function getEditInput() {
  let question = $('textarea[name="edit_true_false_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let solution = $('textarea[name="edit_true_false_solution"]');
  let true_falseid = $("#true_falseid");

  $("#edit_single-answer").show();
  let singleradio = $('input:radio[name="edit_single-answer"]:checked');
  let answer = singleradio.val();

  let true_false = {
    qID: true_falseid.val(),
    ques: question.val(),
    options: [optionA.val(), optionB.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: answer
  };
  question.val("");
  optionA.val("");
  optionB.val("");
  solution.val("");
  true_falseid.val("");
  singleradio.prop("checked", false);
  return true_false;
}

//---------------------------------------------------------------------------------
//    Delete the true_false using id and update the table
//---------------------------------------------------------------------------------
function deletetrue_false(id) {
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
  let question = $('textarea[name="true_false_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let solution = $('textarea[name="true_false_solution"]');
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
  solution.val("");
}

// get Value from Inputs
function getInputValue() {
  let question = $('textarea[name="true_false_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let solution = $('textarea[name="true_false_solution"]');

  let answerchoice = $('input:radio[name="answerchoice"]');

  let singleradio = $('input:radio[name="single-answer"]:checked');
  let singleval = singleradio.val();
  let true_false = {
    ques: question.val(),
    options: [optionA.val(), optionB.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: singleval
  };
  return true_false;
}
