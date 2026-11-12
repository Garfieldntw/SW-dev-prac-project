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
      trim: true,
    },
    // Optional for existing companies; populated from the external API on writes.
    location: {
      type: new mongoose.Schema({
        type: { type: String, enum: ["Point"], required: true },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function (values) {
              return values.length === 2 &&
                values.every(Number.isFinite) &&
                Math.abs(values[0]) <= 180 &&
                Math.abs(values[1]) <= 90;
            },
            message: "Location must contain valid [longitude, latitude] coordinates"
          }
        },
        formattedAddress: String
      }, { _id: false }),
      default: undefined
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
CompanySchema.virtual('interviews',{
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

module.exports = mongoose.model("Company", CompanySchema);
