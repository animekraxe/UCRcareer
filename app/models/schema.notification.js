/**
 * Module dependancies
 */

var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;


/**
 * Define notification schema
 */

var notificationSchema = new Schema({
    message: { type: String, required: true }
  , meta: {
        jobPost: { type: Schema.Types.ObjectId, ref: 'JobPosting' }
    }
  , recipients: [{ type: Schema.Types.ObjectId, ref: 'Applicant'}]
});

/**
 * Wrapper around notification.findById
 * populates recipients list and jobPost fields
 * @param id {ObjectId} notification id
 * @param cb {Function} callback function
 */

notificationSchema.static('findByNotificationId', function(id, cb){
    var Notification = this;

    Notification.findById(id)
        .populate("recipients", "-_id -__v")
        .populate("meta.jobPost", "-_id -__v")
        .exec(cb);
});

/**
 * Create and save a updated job posting notification. 
 * @param jobPostId {ObjectID} id of jobposting to include in notification
 * @param recipients {Array of ObjectID's} all the applicants to attach to recipients
                                           list
 * @param cb {Function} callback function
 */ 

notificationSchema.static('createJobUpdated', function (jobPostId, recipients, cb){
    var Notification = this;

    // Figure out if a notification already existed, if so we would 
    // just want to update the recipient list
    Notification.find({meta: {jobPost: jobPostId}}, function (err, notification){
        if (err) {
            var Err = new Error("Couldn't create notification");
            return cb(Err);
        }
        // notification already existed
        else if (notification) {
            notification.recipients = recipients;
            notification.save(cb);  
        }
        
        // notification did not exist
        else {
            // Create notification body
            var body = {
                message: "New updates to listing are available"
              , meta: {
                    jobPost: jobPostId
                }
              , recipients: recipients
            };

            Notification.save(body, cb);
        }
    });
});

/**
 * Remove applicant from a given notification id. If notification
 * has no more recipients, delete it from the db
 * @param applicantId {ObjectId} id of applicant to remove
 * @param notificationId {ObjectId} id of notification
 * @param cb {Function} callback function
 */

notificationSchema.static('removeRecipient', function (applicantId, notificationId, cb){
    var Notification = this;

    Notification.findById(notificationId, function(err, notification){
        if (err || !notification){
            var Err = new Error("Couldn't remove applicant from notification");
            return cb(Err);
        }

        /*
         * Figure out where applicant is in notification's recipients
         */

        // Create a copy of notification's recipients as strings
        // This needs to be done because ObjectIds cannot be compared to 
        // each other directly
        var _recipients = _.map(notification.recipients, function(objId){
            return String(objId);
        });

        var applicantPos = _.indexOf(_recipients, String(applicantId));
        if (applicantPos === -1){
            // Nothing to do. Applicant wasn't a recipient
            return cb(null);
        }

        // Remove recipient
        notification.recipients.splice(applicantPos, 1);
        if (notification.recipients.length === 0){
            // recipients is empty, no longer need notification
            notification.remove(cb);
        }
        else {
            notification.save(cb);
        }
    });
});

/**
 * Export schema
 */

exports = module.exports = notificationSchema;
