import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    city: { required: true, trim: true, type: String },
    email: { required: true, trim: true, type: String,unique:true },
    firstname: { required: true, trim: true, type: String },
    housenumber: { required: true, trim: true, type: String },
    lastname: { required: true, trim: true, type: String },
    password: { required: true, trim: true, type: String },
    street: { required: true, trim: true, type: String },
    telephone: { required: true, trim: true, type: String },
    wishList: {
      default: [],
      ref: "Item",
      required: true,
      type: [mongoose.Types.ObjectId],
    },
    zipcode: { required: true, trim: true, type: String },
    avatar:{type:String,required:false,
      default:
        "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
    }
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
