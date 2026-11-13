class GeocodingError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Shared by company creation, address updates, and company search.
async function geocode(query) {
    if (typeof query !== 'string' || query.trim().length < 2) {
        throw new GeocodingError('Please provide an address or place name of at least two characters', 400);
    }
    const key = process.env.OPENCAGE_API_KEY;
    if (!key) {
        throw new GeocodingError('Geocoding is not configured on the server', 503);
    }

    const url = new URL('https://api.opencagedata.com/geocode/v1/json');
    url.search = new URLSearchParams({
        key,
        q: query.trim(),
        limit: '5',
        no_annotations: '1',
        no_record: '1'
    }).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            const unavailable = [401, 402, 403, 429].includes(response.status);
            throw new GeocodingError('Geocoding service is unavailable; please try again later', unavailable ? 503 : 502);
        }
        const body = await response.json();
        if (!Array.isArray(body.results)) {
            throw new GeocodingError('Geocoding service returned an invalid response', 502);
        }
        return body.results.map(result => {
            const { lat, lng } = result.geometry || {};
            const validCoordinates = Number.isFinite(lat) && Number.isFinite(lng) &&
                Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
            if (!validCoordinates || typeof result.formatted !== 'string') {
                throw new GeocodingError('Geocoding service returned an invalid location', 502);
            }
            return { label: result.formatted, latitude: lat, longitude: lng };
        });
    } catch (error) {
        if (error instanceof GeocodingError) throw error;
        // Do not expose upstream errors or URLs containing the API key.
        if (controller.signal.aborted) {
            throw new GeocodingError('Geocoding service timed out', 504);
        }
        throw new GeocodingError('Could not contact the geocoding service', 502);
    } finally {
        clearTimeout(timeout);
    }
}

async function geocodeAddress(address) {
    const matches = await geocode(address);
    if (matches.length === 0) {
        throw new GeocodingError('No location found; please provide a more specific company address', 422);
    }
    if (matches.length > 1) {
        throw new GeocodingError('Address matches multiple locations; please provide a more specific company address', 422);
    }
    const match = matches[0];
    return { type: 'Point', coordinates: [match.longitude, match.latitude], formattedAddress: match.label };
}

module.exports = { geocode, geocodeAddress, GeocodingError };
