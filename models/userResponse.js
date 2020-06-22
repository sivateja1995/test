const mongoose = require("mongoose");
const express = require("express");
const validator = require("validator");

const responseSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["employee", "vendor", "customer", "visitor"],
    },
    locationId: {
        type: String,
    },
    locationName: {
        type: String,
    },
    locationType: {
        type: String,
    },
    country: {
        type: String,
    },
    region: {
        type: String,
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("email is invalid");
            }
        },
    },
    phone: {
        type: String,
    },
    //Changes: added the buildingNo, floorNo, sectionNo , cubeNo
    buildingNo: { //buildingNo is added 
        type: String
    },
    floorNo: { //floorNo is added
        type: String
    },
    sectionNo: { //sectionNo is added     
        type: String
    },
    cubeNo: { //cubeNo is added 
        type: String
    },
    // changes are done from above comment to here.
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    company: {
        type: String,
    },
    ingredionContact: {
        type: String,
    },
    response: [{
        _id: false,
        questionId: { type: String },
        shortText: { type: String },
        answer: { type: Boolean },
        addlInfo: { type: String },
    }, ],
    certifyInfoName: {
        type: String,
    },
    certifyInfoChecked: {
        type: Boolean,
    },
    englishName: {
        type: String
    }
}, { timestamps: { createdOn: "createdOn" } });

const userResponse = mongoose.model("userResponse", responseSchema);
module.exports = userResponse;