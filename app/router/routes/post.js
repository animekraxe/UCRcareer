var express = require('express'),
    models = require('../../models');

var router = express.Router();

/*
 * Route logic for posting a job 
 * @param req {Object} 
 *  @field req.body, job post description, 
 *      should have fields that allowed by the schema in schema.jobPosting.js
 *
 * @param res {Object} the response object
 * @param next {Function} callback, used to send errors to the Error Middleware
 *
 */
router.post('/', function(req, res, next) {
    var JobPosting = models.jobPosting(),
        newJobPosting = null,
        jobPostingData = req.body;
    
    if(!req.session.employerUserId) {
        var err = new Error("Not Authorized: not Employer");
        err.status = 403;
        next(err);
    }
    
    if(jobPostingData) {
        newJobPosting = new JobPosting(jobPostingData);
        newJobPosting.save(function(err, newJobPostingUpdated) {
            if(err) {
                err.status = 400;
                next(err);
            } else {
                res.status(200).end();
            }
        });
    } else {
        var err = new Error('Missing job post info');            
        err.status = 400;
        next(err);
    }
});


router.get('/id/:id', function(req, res, next) {
    var JobPosting = models.jobPosting(), 
        base64Id = req.params.id;

    if(base64Id) { 
        JobPosting.findByUrlId(base64Id, function(err, jobPosting) {
            if(err || !jobPosting) {
                res.status(404).end();
            } else {
                res.status(200).json(jobPosting); 
            }
        }); 
    } else {
        var err = new Error("Missing id");
        err.status = 403;
        next(err);
    } 
});

exports = module.exports = router;
