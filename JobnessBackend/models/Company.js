const mongoose = require("mongoose");

// Allowed industry values (shared with the search filter in controllers/companies.js)
const INDUSTRIES = [
  "Software",
  "Finance",
  "Engineering",
  "Manufacturing",
  "Healthcare",
  "Retail",
  "Consulting",
  "Education",
  "Energy",
  "Logistics",
  "Media",
  "Other",
];

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
    industry: {
      type: String,
      required: [true, "Please add an industry"],
      enum: {
        values: INDUSTRIES,
        message: `Industry must be one of: ${INDUSTRIES.join(", ")}`,
      },
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

//Geospatial index for distance search on location ([longitude, latitude])
CompanySchema.index({ location: "2dsphere" });

//Reverse populate with virtuals
CompanySchema.virtual('interviews',{
    ref: 'Interview',
    localField: '_id',
    foreignField: 'company',
    justOne: false
});

const Company = mongoose.model("Company", CompanySchema);
Company.INDUSTRIES = INDUSTRIES;

module.exports = Company;
