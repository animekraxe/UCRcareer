angular.module('huntEdu.services')
    .factory('JobPost', ['$http', '$q', '_', 'Util', function JobPostFactory($http, $q, _, Util) {
        var forEach = _.forEach,
            isArray = _.isArray,
            isEmpty = _.isEmpty,
            reduce = _.reduce,
            pick = _.pick,
            uniq = _.uniq,
            compactObject = Util.compactObject,
            compactObjectDeep = Util.compactObjectDeep;

        var JOB_POST_DATA_FIELDS = ['meta','specifics', 'location', 'reviews',
                            'date', 'media', 'tags', 'timestamps'];
        
        function baseSetJobPostData(data, context) {
            var relevantData = pick(data, JOB_POST_DATA_FIELDS),
                compactData = compactObject(relevantData);

            forEach(compactData, function(val, key) {
                if(isArray(val)) {
                    context[key] = uniq(val);
                } else {
                    context[key] = val;
                }

            });
        }

        /**
         * Constructor for Job Post. Initializes Job Post given
         * data. 
         * @param data {Object} 
         */

        function JobPost(data) {
           baseSetJobPostData(data, this);
        }

        JobPost.prototype = {
            'timestamps': {
                'created': null,
                'lastModified': null
            },
            'meta': {
                'id': null
            },
            'specifics': {
                'jobTitle': null, 
                'description': null, 
                'requirements': null, 
                'salary': null,
                'companyName': null,
                'department': null,
                'jobType': null
            },
            'location': {
                'city': null,
                'state': null
            },
            'date': {
                'postedOn': null,
                'endsOn': null
            }, 
            'media': {
                'image': null,
                'video': null
            },
            'tags': [],
            'reviews': []
        };

        JobPost.prototype.getId = function() {
            return this.meta.id;
        };

        JobPost.prototype.getCreated = function() {
            return new Date(this.timestamps.created);
        };

        JobPost.prototype.isIn = function(posts) {
            var id = this.getId(),
                found = false;
            
            forEach(posts, function(post) {
                if(post.getId() === id) {
                    found = true;
                    return false;
                }
            });

            return found;
        };

        JobPost.getJobPostDataFields = function() {
            return JOB_POST_DATA_FIELDS;
        };

        JobPost.prototype.getImage = function() {
            return this.media.image;
        };

        JobPost.prototype.hasImage = function() {
            return !!this.media.image;
        };

        JobPost.prototype.getVideo = function() {
            return this.media.video;
        };
        
        JobPost.prototype.hasVideo = function() {
            return !!this.media.video;
        };

        JobPost.prototype.setJobPostData = function(data) {
            baseSetJobPostData(data, this);
        };

        JobPost.prototype.getJobPostData = function() {
            return compactObjectDeep(this);
        };

        JobPost.prototype.pushReview = function(data) {
            this.reviews.push(data);
        };

        JobPost.prototype.updateReview = function(review){
            var jobPost = this;
            forEach(jobPost.reviews, function(val, key) {
                if(val.meta.id === review.meta.id) {
                    jobPost.reviews[key] = review;
                }
            });
        };

        JobPost.prototype.numReviews = function() {
            if(isArray(this.reviews)) {
                return this.reviews.length;
            } else {
                return 0;
            }
        };

        JobPost.prototype.getRating = function() {
            if(isArray(this.reviews) && !isEmpty(this.reviews)) {
                return reduce(this.reviews, function(sum, review) {
                    return sum + review.content.rating;
                }, 0)/this.numReviews();
            } else {
                return 0;
            }
        };

        JobPost.prototype.addReview = function(data) {
            var deferred = $q.defer(),
                jobPost = this;
            $http.post('/post/id/' + jobPost.getId() + '/review', data)
                .then(function(res){
                    deferred.resolve(res);
                }, function(err){
                    deferred.reject(err);
                });
            return deferred.promise;
        };
        
        JobPost.prototype.editReview = function(data, reviewId) {
            var deferred = $q.defer(),
                jobPost = this;
            $http.post('/post/id/' + jobPost.getId() + '/review/id/' + reviewId , data)
                .then(function(res){
                    deferred.resolve(res);
                }, function(err){
                    deferred.reject(err);
                });
            return deferred.promise;
        };
 
        JobPost.prototype.toFilterObj = function() {
            var jobPost = this;
            return {
                'state': jobPost.location.state,
                'city': jobPost.location.city,
                'jobTitle': jobPost.specifics.jobTitle,
                'companyName': jobPost.specifics.companyName,
                'jobType': jobPost.specifics.jobType
            };
        };

        return JobPost;
    }]);
