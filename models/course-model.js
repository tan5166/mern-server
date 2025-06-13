const mongoose = require("mongoose");
const { Schema } = mongoose;

const Course = mongoose.model(
  "Course",
  new Schema({
    title: {
      type: String,
      minlength: 6,
      maxlength: 100,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Web Development",
        "Mobile Development",
        "Data Science",
        "AI",
        "Game Development",
        "Cloud Computing",
        "Cybersecurity",
        "DevOps",
        "Blockchain",
        "UI/UX Design",
        "Digital Marketing",
        "Other",
      ],
      required: true,
    },
    price: {
      type: Number,
      min: 1,
      max:9999,
      required: true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    ],
  })
);

module.exports = Course;
