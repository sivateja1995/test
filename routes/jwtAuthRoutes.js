const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
privateKey = process.env.JWT_SECRET_KEY; //JWT_SECRET_KEY as env variable

/*genrating the jwt token using the email*/
router.get('/api/generateJwtToken', async (req, res) => {
  const email = req.query.email || '';
  const token = jwt.sign({ email: email.toString() }, privateKey, {
    expiresIn: '1h',
  }); //with the session expiresIn 1h
  res.status(200).send({ token: token });
});

module.exports = router;
