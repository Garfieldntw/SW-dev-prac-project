const Interview = require('../models/Interview');
const Company = require('../models/Company');

// Use UTC boundaries and an exclusive end to include all of May 13.
const START_DATE = new Date('2022-05-10T00:00:00.000Z');
const END_DATE = new Date('2022-05-14T00:00:00.000Z');

// Returns { date } if valid, or { error } with a message
const parseInterviewDate = (value) => {
    const date = new Date(value);
    if (typeof value !== 'string' || Number.isNaN(date.getTime())) {
        return { error: 'Please provide a valid interview date' };
    }
    if (date < START_DATE || date >= END_DATE) {
        return { error: 'Interview date must be between May 10th and 13th, 2022' };
    }
    return { date };
};

// @desc    Get all interviews
// @route   GET /api/v1/interviews
// @access  Public
exports.getInterviews = async (req, res, next) => {
    let query;

    if(req.user.role !== 'admin'){ //General users can see only their interviews!
        query = Interview.find({user: req.user.id}).populate({
            path: 'company',
            select: 'name description tel'
        });
    } else { //If you are an admin, you can see all interviews!
        if(req.params.companyId){
            console.log(req.params.companyId);
            query = Interview.find({company: req.params.companyId}).populate({
                path: 'company',
                select: 'name description tel'
            });
        } else {
            query = Interview.find().populate({
                path: 'company',
                select: 'name description tel'
            });
        }
    }
    try {
        const interviews = await query;
        res.status(200).json({ success: true, count: interviews.length, data: interviews });
    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: 'Cannot find interview' })
    }
}

// @desc    Get single interview
// @route   GET /api/v1/interviews/:id
// @access  Public
exports.getInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id).populate({
            path: 'company',
            select: 'name description tel'
        });

        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview found with id of ${req.params.id}` });
        }

        //Make sure user is the interview owner
        if(interview.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to view this interview` });
        }

        res.status(200).json({ success: true, data: interview });

    } catch (err) {
        console.log(err.stack);
        res.status(500).json({ success: false, message: 'Cannot find interview' })
    }
};

// @desc    Add single interview
// @route   POST /api/v1/companies/:interviewId/interviews
// @access  Private
exports.addInterview = async (req, res, next) => {
    try {
        //add user Id to req.body
        req.body.user = req.user.id;

        // Parse the JSON date string before comparing dates.
        const { date, error } = parseInterviewDate(req.body.interviewDate);
        if (error) {
            return res.status(400).json({ success: false, message: error });
        }
        req.body.interviewDate = date;

        //check for existed interview
        const existedinterview = await Interview.find({user: req.user.id});

        //If the user is not an admin, they can only create 3 interviews
        if(existedinterview.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({ success: false, message: `The user with ID ${req.user.id} has already booked 3 interviews` });
        }
        
        req.body.company = req.params.companyId;

        const company = await Company.findById(req.params.companyId);

        if (!company) {
            return res.status(404).json({ success: false, message: `No company with the id of ${req.params.companyId}` });
        }

        const interview = await Interview.create(req.body);

        res.status(201).json({ success: true, data: interview });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Cannot create interview' })
    }
};

// @desc    Update interview
// @route   PUT /api/v1/interviews/:id
// @access  Private
exports.updateInterview = async (req, res, next) => {
    try {

        let interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview with the id of ${req.params.id}` });
        }

        //Make sure user is the interview owner
        if(interview.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this interview` });
        }

        //Apply the same date rule as when booking
        if (req.body.interviewDate !== undefined) {
            const { date, error } = parseInterviewDate(req.body.interviewDate);
            if (error) {
                return res.status(400).json({ success: false, message: error });
            }
            req.body.interviewDate = date;
        }

        interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: interview });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Cannot update interview' })
    }
};

// @desc    Delete interview
// @route   DELETE /api/v1/interviews/:id
// @access  Private
exports.deleteInterview = async (req, res, next) => {
    try {
        const interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ success: false, message: `No interview with the id of ${req.params.id}` });
        }

        //Make sure user is the interview owner
        if(interview.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this interview` });
        }

        await interview.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Cannot delete interview' })
    }
};
