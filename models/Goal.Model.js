const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const goalSchema = new Schema({
  title: { type: String, maxLength: 64, required: true, trim: true },
  deadline: { type: Date, required: true },
  owner: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
  isComplete: { type: Boolean, default: false },
});

const GoalModel = model("Goal", goalSchema);

module.exports = GoalModel;
