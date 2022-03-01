const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  title: { type: String, maxLength: 64, required: true, trim: true },
  isDone: { type: Boolean, default: false },
  goal: { type: mongoose.Types.ObjectId, ref: "Goal" },
});

const TaskModel = model("Task", taskSchema);

module.exports = TaskModel;
