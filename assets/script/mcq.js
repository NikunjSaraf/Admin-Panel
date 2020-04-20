//---------------------------------------------------------------------------------
//    Global Variable
//---------------------------------------------------------------------------------
let _courseID;
let _levelID;
let _typeId = 0;

$(document).ready(function() {
  // Populate the Select Subject List
  populateCourseSelectList();

  //   Hide the Subject Row
  $(".mcq-row").hide();

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
    $(".mcq-row").show();
    // listMCQList();
    listQuesList();
  });

  // Add MCQ Button Click
  $("#addmcqebtn").on("click", function(e) {
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

  //   Add MCQ Button
  $("#mcq-submit-btn").on("click", function(e) {
    addMCQ();
    e.preventDefault();
  });

  //   Update MCQ Button
  $("#mcq-update-btn").on("click", function(e) {
    updateMCQ();
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
//    Add MCQ to the Firebase
//---------------------------------------------------------------------------------
function addMCQ() {
  let mcq = getInputValue();
  let typeId = 0;
  let typeref = firebase
    .database()
    .ref("Types")
    .child(typeId);
  mcq.qID = typeref.push().key;
  typeref.child(mcq.qID).set(mcq);
  let testref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  let queobj = {
    qID: mcq.qID,
    typeId: mcq.typeId
  };
  testref.child(queobj.qID).set(queobj);
  displayMCQ(mcq);
}

//---------------------------------------------------------------------------------
//    List All MCQ on Firebase
//---------------------------------------------------------------------------------
function listQuesList() {
  $("#mcq-list").html("");
  let qref = firebase
    .database()
    .ref("Test")
    .child(_courseID)
    .child("Levels")
    .child(_levelID)
    .child("ques");
  qref.on("child_added", data => {
    let que = data.val();
    if (que.typeId == 0) {
      // console.log("MCQ IT IS!!");
      fetchMCQ(que);
    }
  });
}

//---------------------------------------------------------------------------------
//    Fetch One MCQ
//---------------------------------------------------------------------------------
function fetchMCQ(que) {
  let typeId = que.typeId;
  let qid = que.qID;
  let mcqref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(qid);
  mcqref.on("value", data => {
    let mcq = data.val();
    displayMCQ(mcq);
  });
}

//---------------------------------------------------------------------------------
//    Display One MCQ
//---------------------------------------------------------------------------------
function displayMCQ(mcq) {
  $("#mcq-list").append(`
  <div class="card mt-2">
                                <div class="card-header">

                                    <a href="#collapse${
                                      mcq.qID
                                    }" data-parent="#mcq-list" data-toggle="collapse">
                                        
                                        ${mcq.ques}
                                    </a>
                                </div>
                                <div id="collapse${mcq.qID}" class="collapse">
                                    <div class="card-body">
                                        <ul class="list-group">
                                            <li class="list-group-item">(A) : ${
                                              mcq.options[0]
                                            }</li>
                                            <li class="list-group-item">(B) : ${
                                              mcq.options[1]
                                            }</li>
                                            <li class="list-group-item">(C) : ${
                                              mcq.options[2]
                                            }</li>
                                            <li class="list-group-item">(D) : ${
                                              mcq.options[3]
                                            }</li>
                                            <li class="list-group-item">Correct: ${
                                              mcq.options[mcq.correct - 1]
                                            } </li>
                                            <li class="list-group-item">Solution: ${
                                              mcq.mcqSolution == undefined
                                                ? ""
                                                : mcq.mcqSolution
                                            }</li>
                                        </ul>
                                    </div>
                                    <div class="card-footer">
                                        <div class="text-right">
                                            <a href="#" class="btn btn-danger" onclick="deleteMCQ('${
                                              mcq.qID
                                            }')"><i class="fas fa-trash mr-2"></i>
                                                Delete</a>
                                            <a href="#" class="btn btn-warning" data-toggle="modal"
                                            data-target="#editMCQModal" onclick="editMCQ('${
                                              mcq.qID
                                            }')"> <i
                                                    class="fas fa-pencil-alt mr-2"></i>Edit</a>
                                        </div>

                                    </div>
                                </div>
                                
                            </div>
  `);
}

//---------------------------------------------------------------------------------
//    Find the Selected MCQ using id and update the Form Fields
//---------------------------------------------------------------------------------
function editMCQ(id) {
  // Get the database Ref
  let typeId = 0;
  let qref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(id);

  qref.on("value", data => {
    let mcq = data.val();
    setEditModal(mcq);
  });
}

function setEditModal(mcq) {
  let question = $('textarea[name="edit_mcq_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let optionC = $('input[name="edit_optionC"]');
  let optionD = $('input[name="edit_optionD"]');
  let mcqid = $("#mcqid");
  let solution = $('textarea[name="edit_mcq_solution"]');

  mcqid.val(`${mcq.qID}`);
  question.val(`${mcq.ques}`);
  optionA.val(`${mcq.options[0]}`);
  optionB.val(`${mcq.options[1]}`);
  optionC.val(`${mcq.options[2]}`);
  optionD.val(`${mcq.options[3]}`);
  solution.val(`${mcq.solution}`);

  $(`input:radio[name="edit_single-answer"][value="${mcq.correct}"]`).prop(
    "checked",
    true
  );
}

//---------------------------------------------------------------------------------
//    Update the MCQ details on Firebase
//---------------------------------------------------------------------------------
function updateMCQ() {
  let mcq = getEditInput();
  let typeId = 0;
  let mcqref = firebase
    .database()
    .ref("Types")
    .child(typeId)
    .child(mcq.qID)
    .set(mcq);
  listQuesList();
}

function getEditInput() {
  let question = $('textarea[name="edit_mcq_question"]');
  let optionA = $('input[name="edit_optionA"]');
  let optionB = $('input[name="edit_optionB"]');
  let optionC = $('input[name="edit_optionC"]');
  let optionD = $('input[name="edit_optionD"]');
  let solution = $('textarea[name="edit_mcq_solution"]');
  let mcqid = $("#mcqid");

  $("#edit_single-answer").show();
  let singleradio = $('input:radio[name="edit_single-answer"]:checked');
  let answer = singleradio.val();

  let mcq = {
    qID: mcqid.val(),
    ques: question.val(),
    options: [optionA.val(), optionB.val(), optionC.val(), optionD.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: answer
  };
  question.val("");
  optionA.val("");
  optionB.val("");
  optionC.val("");
  optionD.val("");
  solution.val("");
  mcqid.val("");
  singleradio.prop("checked", false);
  return mcq;
}

//---------------------------------------------------------------------------------
//    Delete the MCQ using id and update the table
//---------------------------------------------------------------------------------
function deleteMCQ(id) {
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
  let question = $('textarea[name="mcq_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let optionC = $('input[name="optionC"]');
  let optionD = $('input[name="optionD"]');
  let solution = $('textarea[name="mcq_solution"]');
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
  optionD.val("");
  solution.val("");
}

// get Value from Inputs
function getInputValue() {
  let question = $('textarea[name="mcq_question"]');
  let optionA = $('input[name="optionA"]');
  let optionB = $('input[name="optionB"]');
  let optionC = $('input[name="optionC"]');
  let optionD = $('input[name="optionD"]');
  let solution = $('textarea[name="mcq_solution"]');

  let answerchoice = $('input:radio[name="answerchoice"]');

  let singleradio = $('input:radio[name="single-answer"]:checked');
  let singleval = singleradio.val();
  let mcq = {
    ques: question.val(),
    options: [optionA.val(), optionB.val(), optionC.val(), optionD.val()],
    solution: solution.val(),
    level: _levelID,
    typeId: _typeId,
    correct: singleval
  };
  return mcq;
}
