const express = require("express");
const router = express.Router();
const Course = require("../models").course;
const courseSchema = require("./validation").courseSchema;
const validate = require("./validation").validate;
const { formatCourse, formatCourses } = require("../utils/course-formatter");

router.use((req, res, next) => {
  // console.log("Course route middleware");
  next();
});

router.post("/", validate(courseSchema), async (req, res) => {
  let { title, category, price } = req.body;
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ message: "You are not authorized to create a course" });
  const course = new Course({
    title,
    category,
    price,
    instructor: req.user._id,
  });
  try {
    await course.save();
    const { instructor, ...newCourse } = course;
    res.status(201).json({ message: "Course created successfully", newCourse });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", ["username", "email"])
      .exec();
    res.status(200).json({
      message: "Courses fetched successfully",
      courses: formatCourses(courses),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/number", async (req, res) => {
  try {
    const coursesNumber = await Course.countDocuments();
    res.status(200).json({
      message: "Courses number fetched successfully",
      coursesNumber: coursesNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/enrolled", async (req, res) => {
  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "You are not authorized to view enrolled courses" });
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate("instructor", ["username", "email"])
      .exec();
    if (!courses || courses.length === 0)
      return res.status(404).json({ message: "No enrolled courses found" });
    res.status(200).json({
      message: "Enrolled courses fetched successfully",
      courses: formatCourses(courses),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/enrolled-number", async (req, res) => {
  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "You are not authorized to view enrolled courses" });
  const coursesNumber = await Course.countDocuments({
    students: req.user._id,
  });
  res.status(200).json({
    message: "Enrolled courses number fetched successfully",
    coursesNumber: coursesNumber,
  });
});

router.get("/teaching-courses", async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ message: "You are not authorized to view teaching courses" });
  const courses = await Course.find({
    instructor: req.user._id,
  }).exec();
  res.status(200).json({
    message: "Teaching courses fetched successfully",
    courses: formatCourses(courses),
  });
});

router.get("/teaching-number", async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ message: "You are not authorized to view teaching courses" });
  const coursesNumber = await Course.countDocuments({
    instructor: req.user._id,
  }).exec();
  res.status(200).json({
    message: "Teaching courses number fetched successfully",
    coursesNumber: coursesNumber,
  });
});

router.get("/teaching-students-number", async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ message: "You are not authorized to view teaching students" });
  try {
    const courses = await Course.find({ instructor: req.user._id }).exec();
    const studentsNumber = courses.reduce((acc, course) => {
      return acc + course.students.length;
    }, 0);
    res.status(200).json({
      message: "Teaching students number fetched successfully",
      studentsNumber: studentsNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/total-earnings", async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ message: "You are not authorized to view total earnings" });
  try {
    const earningsData = await Course.aggregate([
      {
        $match: { instructor: req.user._id },
      },
      {
        $project: {
          _id: 0,
          earningsForCourse: { $multiply: ["$price", { $size: "$students" }] },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$earningsForCourse" },
        },
      },
    ]);

    const totalEarnings =
      earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    res.status(200).json({
      message: "Total earnings fetched successfully",
      totalEarnings,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/enroll/:id", async (req, res) => {
  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "You are not authorized to enroll in a course" });
  const { id } = req.params;
  const course = await Course.findById(id).exec();
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.students.includes(req.user._id))
    return res
      .status(400)
      .json({ message: "You are already enrolled in this course" });
  course.students.push(req.user._id);
  await course.save();
  res.status(200).json({ message: "Enrolled Successfully" });
});

router.post("/unenroll/:id", async (req, res) => {
  if (req.user.role !== "student")
    return res
      .status(403)
      .json({ message: "You are not authorized to unenroll from a course" });
  const { id } = req.params;
  const course = await Course.findById(id).exec();
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (!course.students.includes(req.user._id))
    return res
      .status(400)
      .json({ message: "You are not enrolled in this course" });
  course.students = course.students.filter(
    (student) => !student.equals(req.user._id)
  );
  await course.save();
  res.status(200).json({ message: "Unenrolled Successfully" });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id)
      .populate("instructor", ["username", "email"])
      .exec();
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({
      message: "Course fetched successfully",
      course: formatCourse(course),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// router.patch("/:_id", validate(courseSchema), async (req, res) => {
//   if (req.user.role !== "instructor")
//     return res
//       .status(403)
//       .json({ message: "You are not authorized to update a course" });
//   const { _id } = req.params;
//   const { title, description, price } = req.body;
//   try {
//     const course = await Course.findById(_id).exec();
//     if (!course) return res.status(404).json({ message: "Course not found" });
//     if (!course.instructor.equals(req.user._id))
//       return res
//         .status(403)
//         .json({ message: "You are not authorized to update this course" });
//     const updatedCourse = await Course.findByIdAndUpdate(
//       _id,
//       { title, description, price },
//       { new: true },
//       { runValidators: true }
//     );
//     res.status(200).json({
//       message: "Course updated successfully",
//       course: formatCourse(updatedCourse),
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// router.delete("/:_id", async (req, res) => {
//   if (req.user.role !== "instructor")
//     return res
//       .status(403)
//       .json({ message: "You are not authorized to delete a course" });
//   const { _id } = req.params;
//   const course = await Course.findById(_id).exec();
//   if (!course) return res.status(404).json({ message: "Course not found" });
//   if (!course.instructor.equals(req.user._id))
//     return res
//       .status(403)
//       .json({ message: "You are not authorized to delete this course" });
//   try {
//     await Course.findByIdAndDelete(_id).exec();
//     res.status(200).json({ message: "Course deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

module.exports = router;
