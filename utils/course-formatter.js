const formatCourse = (course) => ({
  _id: course._id,
  title: course.title,
  category: course.category,
  price: course.price,
  instructor: {
    username: course.instructor.username,
    email: course.instructor.email,
  },
  students: course.students,
});

const formatCourses = (courses) => courses.map(formatCourse);

module.exports = {
  formatCourse,
  formatCourses,
};
