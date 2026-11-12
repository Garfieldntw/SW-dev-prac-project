const { geocode, GeocodingError } = require('../services/geocoding');

// @desc    Look up coordinates for an address or place name
// @route   GET /api/v1/locations?q=...
// @access  Private
exports.getLocations = async (req, res, next) => {
    try {
        const locations = await geocode(req.query.q);
        res.status(200).json({ success: true, count: locations.length, data: locations });
    } catch (err) {
        if (err instanceof GeocodingError) {
            return res.status(err.statusCode).json({ success: false, message: err.message });
        }
        res.status(500).json({ success: false, message: 'Cannot look up location' });
    }
};
