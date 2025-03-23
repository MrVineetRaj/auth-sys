import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    sessionTokens: [
      {
        sessionToken: String,
        timestamp: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  {
    timestamps: true, //info : it will add createdAt ad updatedAt to the schema
  }
);

userSchema.pre("save", async function (next) {
  console.log("this", this);
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
