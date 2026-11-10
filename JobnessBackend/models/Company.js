const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a company name"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    website: {
      type: String,
      required: [true, "Please add a website"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Reverse populate with virtuals
HospitalSchema.virtual('interviews',{
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model("Company", CompanySchema);
