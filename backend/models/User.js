const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 20,
      unique: true, // khi người khác tạo user giống cái có trước đó r thì sẽ báo lỗi
    },
    email: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 50,
      unique: true, // khi người khác tạo user giống cái có trước đó r thì sẽ báo lỗi
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
