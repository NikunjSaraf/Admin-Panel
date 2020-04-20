//---------------------------------------------------------------------------------
//    Global Ref to the Firebase
//---------------------------------------------------------------------------------
const ref = firebase.database().ref("portal_db/courses");

$(document).ready(function() {
  //---------------------------------------------------------------------------------
  //    List All Courses
  //---------------------------------------------------------------------------------
  listCourses();

  // Add Course Btn Click
  $("#add-course-btn").on("click", e => {
    addCourse();
    e.preventDefault();
  });

  //   Edt Course Btn Click
  $("#edit-course-btn").on("click", e => {
    updateCourse();
    e.preventDefault();
  });

  // Validation Rule
  $("#addcourseform").validate({
    rules: {
      course_title: {
        required: true,
        minlength: 3
      }
    },
    messages: {
      course_title: {
        minlength: "Course Name should be at least 3 characters"
      }
    }
  });

  // Edit Form Validation
  $("#editcourseform").validate({
    rules: {
      edit_course_title: {
        required: true,
        minlength: 3
      }
    },
    messages: {
      edit_course_title: {
        minlength: "Course Name should be at least 3 characters"
      }
    }
  });
});

//---------------------------------------------------------------------------------
//    Add Courses to Firebase
//---------------------------------------------------------------------------------
function addCourse() {
  let coursename = $('input[name="course_title"]');
  let course = {
    coursename: coursename.val()
  };
  course.courseID = ref.push().key;
  ref.child(course.courseID).set(course);
  console.log("Added Course");
  coursename.val("");
  listCourses();
}

//---------------------------------------------------------------------------------
//    List Course To the DOM
//---------------------------------------------------------------------------------
function listCourses() {
  $("#courses-list").html("");
  let count = 1;

  ref.on("child_added", data => {
    let course = data.val();
    // populate the data
    populateCourseList(course, count++);
  });
}

function populateCourseList(course, count) {
  $("#courses-list").append(`
    <tr>
                                    <th scope="row">${count}</th>
                                    <td>
                                        ${course.coursename}
                                    </td>
                                    <td><a class="btn btn-warning" href="#" onclick="editCourses('${course.courseID}')" data-toggle="modal"
                                    data-target="#editCourseModal"><i
                                                class="fas fa-pencil-alt"></i></a></td>
                                    <td> <a class="btn btn-danger" href="#" onclick="deleteCourses('${course.courseID}')"><i
                                                class="fas fa-trash"></i></a></td>
                                </tr>
  `);
}

//---------------------------------------------------------------------------------
//    Find the Selected Course using id and update the Form Fields
//---------------------------------------------------------------------------------
function editCourses(id) {
  let coursename = $('input[name="edit_course_title"]');
  let courseID = $('input[name="edit_course_id"]');

  ref.on("value", function(data) {
    let courses = data.val();
    for (let key in courses) {
      let course = courses[key];
      if (course.courseID == id) {
        coursename.val(`${course.coursename}`);
        courseID.val(`${course.courseID}`);
        break;
      }
    }
  });
}

//---------------------------------------------------------------------------------
//    Update the Course details on Firebase
//---------------------------------------------------------------------------------
function updateCourse() {
  let coursename = $('input[name="edit_course_title"]');
  let courseID = $('input[name="edit_course_id"]');
  if (coursename.val() == "") {
    alert("Course Name Cannot be Empty!");
    return;
  }

  ref
    .child(courseID.val())
    .child("coursename")
    .set(coursename.val());
  listCourses();
}

//---------------------------------------------------------------------------------
//    Delete the Course on Firebase
//---------------------------------------------------------------------------------
function deleteCourses(id) {
  let r = confirm(
    "Deleting a Courses will delete All the Data Associated With It"
  );
  if (r == true) {
    let f = confirm("Are you Sure");
    if (f == true) {
      ref.child(id).remove();
      listCourses();

      console.log("Course Removed");
    }
  }
}
