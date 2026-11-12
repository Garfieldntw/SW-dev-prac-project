const express = require('express');
const { getLocations } = require('../controllers/locations');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getLocations);

module.exports = router;
