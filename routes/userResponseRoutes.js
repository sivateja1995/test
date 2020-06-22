const express = require("express");
const router = new express.Router();
const mongoose = require("mongoose");
const auth = require('../middleware/auth');
// const nodemailer = require('nodemailer');

const userResponse = require("../models/userResponse");
const Location = require("../models/locationList");
const { find } = require("../models/userResponse");
// const hradmin = require('../models/HRadmin');

/*api for the saving the user Responses*/
router.post("/api/userResponse", auth, async(req, res) => {
    try {
        let location = await Location.find({ locationName: req.body.locationName });
        if (location && location.length > 0) {
            const Response = new userResponse({
                type: req.body.type,
                locationId: location[0]._id,
                locationName: location[0].locationName,
                locationType: location[0].locationType,
                country: location[0].country,
                region: location[0].region,
                englishName: location[0].englishName,
                email: req.body.email,
                phone: req.body.phone,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                company: req.body.company,
                //updated buildingNo floorNo sectionNo cubeNo
                buildingNo: req.body.buildingNo, //buildingNo updated on 29-may-2020
                floorNo: req.body.floorNo, //floorNo updated on 29-may-2020
                sectionNo: req.body.sectionNo, //sectionNo updated on 29-may-2020
                cubeNo: req.body.cubeNo, //cubeNo updated on 29-may-2020
                ingredionContact: req.body.ingredionContact,
                response: req.body.response,
                certifyInfoName: req.body.certifyInfoName,
                certifyInfoCheck: req.body.certifyInfoCheck,
            });

            await Response.save();

            res.status(200).send(Response);

        } else {
            res.status(200).json({ message: "Location not found" });
        }
    } catch (err) {
        res.status(500).json({ "error": err });
    }
});
// /*nodemailer configuration*/
// function sendingMail(mailAddress, content) {
//     console.log(mailAddress, "#####Content#####", content[0].email);
//     nodemailer.createTestAccount((err, resp) => {
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             port: 465,
//             secure: true, // true for 465, false for other ports
//             auth: {
//                 user: 'sivateja1034@gmail.com', // generated ethereal user
//                 pass: 'p!*#31a_' // generated ethereal password
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });
//         // setup email data with unicode symbols
//         let mailOptions = {
//             from: '"COVID Alert" <sivateja1034@gmail.com>', // sender address
//             to: mailAddress, // list of receivers
//             subject: 'Employee gets COVID Positive',
//             text: 'Employee email:' + '' + content[0].email + '\n' + 'Phone no:' + '' + content[0].phone
//         };
//         console.log(mailOptions);
//         // send mail with defined transport object
//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log("Got error", error);
//             }
//         });
//     });
// }








/*API for checking the user has updated for the day and also color coding for yes and no*/
router.get("/api/userflag", auth, async(req, res) => {
    const Email = req.query.email;
    let dateObj = new Date();
    today = dateObj.toDateString();
    try {
        const URes = await userResponse
            .find({ email: Email })
            .limit(1)
            .sort({ $natural: -1 });
        let udate = URes[0].updatedAt.toDateString();

        let q1Res = URes[0].response[0].answer;
        let q2Res = URes[0].response[1].answer;
        let q3Res = URes[0].response[2].answer;
        let userRegion = URes[0].region;
        console.log(userRegion);
        if (udate == today) {
            //below is changed from == to ===
            if (q1Res === false && q2Res === false && q3Res === false) {
                res.status(200).json({ updated: "yes", colorCode: "green" });
            } else {
                // /*sending mail to the region hr admin*/
                // let hrMail = await hradmin.find({ region: userRegion }, (err, res) => {
                //     if (err) {
                //         console.log(err);
                //     } else {
                //         console.log("Response", res[0].email, URes);
                //         sendingMail(res[0].email, URes);
                //     }
                // });

                /**/
                res.status(200).json({ updated: "yes", colorCode: "amber" });



            }

        } else {
            res.status(200).json({ updated: "No", colorCode: "" });
        }
    } catch (err) {
        res.status(500).json({ message: "user not found" });
    }
});

/*api for the HR Dashboard*/
router.post("/api/dashboard/", auth, async(req, res) => {
    let fromDate = req.body.fromDate;
    let toDate = req.body.toDate;
    let locationName = req.body.locationName;
    try {
        /*when no filter is selected*/
        if (!fromDate && !toDate && !locationName) {
            /*for q1Positive count */
            let q1Positive = await userResponse.find({ "response.0.answer": true }).countDocuments();

            /*for the  q2Positive count */
            let q2Positive = await userResponse.find({ "response.1.answer": true }).countDocuments();

            /*for the q3Positive count*/
            let q3Positive = await userResponse.find({ "response.2.answer": true }).countDocuments();

            /*for the q1Negative count*/
            let q1Negative = await userResponse.find({ "response.0.answer": false }).countDocuments();

            /*for the q2Negative count*/
            let q2Negative = await userResponse.find({ "response.1.answer": false }).countDocuments();

            /*for the q3Negative count*/
            let q3Negative = await userResponse.find({ "response.2.answer": false }).countDocuments();

            /*getting short text for the response*/
            let userRes = await userResponse.find({}, { _id: false }).limit(1).sort({ "$natural": -1 });
            q1ShortText = userRes[0].response[0].shortText;
            q2ShortText = userRes[0].response[1].shortText;
            q3ShortText = userRes[0].response[2].shortText;
            /*for the send of the response*/
            res.status(200).json({ "q1ShortText": q1ShortText, "q1Positive": q1Positive, "q1Negative": q1Negative, "q2ShortText": q2ShortText, "q2Positive": q2Positive, "q2Negative": q2Negative, "q3ShortText": q3ShortText, "q3Positive": q3Positive, "q3Negative": q3Negative });

        }
        /*Total count only for the fromDate*/
        else if (fromDate && !toDate && !locationName) {
            /*for q1Positive count */
            let q1Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.0.answer": true }).countDocuments();

            /*for the  q2Positive count */
            let q2Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.1.answer": true }).countDocuments();

            /*for the q3Positive count*/
            let q3Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.2.answer": true }).countDocuments();

            /*for the q1Negative count*/
            let q1Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.0.answer": false }).countDocuments();

            /*for the q2Negative count*/
            let q2Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.1.answer": false }).countDocuments();

            /*for the q3Negative count*/
            let q3Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate) }, "response.2.answer": false }).countDocuments();

            /*getting short text for the response*/
            let userRes = await userResponse.find({}, { _id: false }).limit(1).sort({ "$natural": -1 });
            q1ShortText = userRes[0].response[0].shortText;
            q2ShortText = userRes[0].response[1].shortText;
            q3ShortText = userRes[0].response[2].shortText;
            /*for the send of the response*/
            res.status(200).json({ "q1ShortText": q1ShortText, "q1Positive": q1Positive, "q1Negative": q1Negative, "q2ShortText": q2ShortText, "q2Positive": q2Positive, "q2Negative": q2Negative, "q3ShortText": q3ShortText, "q3Positive": q3Positive, "q3Negative": q3Negative });

            /*Total count for the locationName*/
        } else if (!fromDate && !toDate && locationName) {

            /*find location englishName*/
            /*when user fill the entries in any language it finds its englishname and based on the englishName we get count */
            let loc = await Location.find({ locationName: locationName });
            console.log(loc[0].englishName);
            /*for q1Positive count */
            let q1Positive = await userResponse.find({ englishName: loc[0].englishName, "response.0.answer": true }).countDocuments();

            /*for the  q2Positive count */
            let q2Positive = await userResponse.find({ englishName: loc[0].englishName, "response.1.answer": true }).countDocuments();

            /*for the q3Positive count*/
            let q3Positive = await userResponse.find({ englishName: loc[0].englishName, "response.2.answer": true }).countDocuments();

            /*for the q1Negative count*/
            let q1Negative = await userResponse.find({ englishName: loc[0].englishName, "response.0.answer": false }).countDocuments();

            /*for the q2Negative count*/
            let q2Negative = await userResponse.find({ englishName: loc[0].englishName, "response.1.answer": false }).countDocuments();

            /*for the q3Negative count*/
            let q3Negative = await userResponse.find({ englishName: loc[0].englishName, "response.2.answer": false }).countDocuments();

            /*getting short text for the response*/
            let userRes = await userResponse.find({}, { _id: false }).limit(1).sort({ "$natural": -1 });
            q1ShortText = userRes[0].response[0].shortText;
            q2ShortText = userRes[0].response[1].shortText;
            q3ShortText = userRes[0].response[2].shortText;
            /*for the send of the response*/
            res.status(200).json({ "q1ShortText": q1ShortText, "q1Positive": q1Positive, "q1Negative": q1Negative, "q2ShortText": q2ShortText, "q2Positive": q2Positive, "q2Negative": q2Negative, "q3ShortText": q3ShortText, "q3Positive": q3Positive, "q3Negative": q3Negative });

            /*Total count for the fromDate and toDate*/
        } else if (fromDate && toDate && !locationName) {

            /*for q1Positive count*/
            let q1Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.0.answer": true }).countDocuments();

            /*for the  q2Positive count */
            let q2Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.1.answer": true }).countDocuments();

            /*for the q3Positive count*/
            let q3Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.2.answer": true }).countDocuments();

            /*for the q1Negative count*/
            let q1Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.0.answer": false }).countDocuments();

            /*for the q2Negative count*/
            let q2Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.1.answer": false }).countDocuments();

            /*for the q3Negative count*/
            let q3Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, "response.2.answer": false }).countDocuments();

            /*getting short text for the response*/
            let userRes = await userResponse.find({}, { _id: false }).limit(1).sort({ "$natural": -1 });
            q1ShortText = userRes[0].response[0].shortText;
            q2ShortText = userRes[0].response[1].shortText;
            q3ShortText = userRes[0].response[2].shortText;
            /*for the send of the response*/
            res.status(200).json({ "q1ShortText": q1ShortText, "q1Positive": q1Positive, "q1Negative": q1Negative, "q2ShortText": q2ShortText, "q2Positive": q2Positive, "q2Negative": q2Negative, "q3ShortText": q3ShortText, "q3Positive": q3Positive, "q3Negative": q3Negative });

            /*total count for the fromDate, toDate and locationName*/
        } else if (fromDate && toDate && locationName) {

            /*find location englishName*/
            /*when user fill the entries in any language it finds its englishname and based on the englishName we get count */
            let loc = await Location.find({ locationName: locationName });

            /*q1 q1Positive count*/
            let q1Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": true }).countDocuments();

            /*for the  q2Positive count */
            let q2Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": true }).countDocuments();

            /*for the q3Positive count*/
            let q3Positive = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": true }).countDocuments();

            /*for the q1Negative count*/
            let q1Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": false }).countDocuments();

            /*for the q2Negative count*/
            let q2Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": false }).countDocuments();

            /*for the q3Negative count*/
            let q3Negative = await userResponse.find({ updatedAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }, englishName: loc[0].englishName, "response.0.answer": false }).countDocuments();

            /*getting short text for the response*/
            let userRes = await userResponse.find({}, { _id: false }).limit(1).sort({ "$natural": -1 });
            q1ShortText = userRes[0].response[0].shortText;
            q2ShortText = userRes[0].response[1].shortText;
            q3ShortText = userRes[0].response[2].shortText;
            /*for the send of the response*/
            res.status(200).json({ "q1ShortText": q1ShortText, "q1Positive": q1Positive, "q1Negative": q1Negative, "q2ShortText": q2ShortText, "q2Positive": q2Positive, "q2Negative": q2Negative, "q3ShortText": q3ShortText, "q3Positive": q3Positive, "q3Negative": q3Negative });
        }
    } catch (err) {
        res.status(500).json({ message: "Match not found" });

    }
});

module.exports = router;