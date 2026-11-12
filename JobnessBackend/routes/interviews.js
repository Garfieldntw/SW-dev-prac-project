const express = require('express');

const {getInterviews, getInterview, addInterview, updateInterview, deleteInterview} = require('../controllers/interviews');

const router = express.Router({mergeParams: true});

const {protect,authorize} = require('../middleware/auth');

router.route('/')
    .get(protect,getInterviews)
    .post(protect, authorize('admin','user'), addInterview);
router.route('/:id')
    .get(protect, getInterview)
    .put(protect,authorize('admin','user'), updateInterview)
    .delete(protect,authorize('admin','user'), deleteInterview);

module.exports = router;