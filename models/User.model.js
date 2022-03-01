const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, match: /\s/gm },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  passwordHash: { type: String, required: true },
  goals: [{ type: mongoose.Types.ObjectId, ref: "Goal" }],

  // soft delete //
  /* isDisable: { type: Boolean, required: true, default: false },
  disableAt: { type: Date }, */
});
const UserModel = model("User", userSchema);

module.exports = UserModel;
