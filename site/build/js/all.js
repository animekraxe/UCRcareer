angular.module("ucrCareer",["ngRoute","ucrCareerControllers"]).config(["$routeProvider",function(r){r.when("/",{templateUrl:"templates/splash.html",controller:"splashCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("ucrCareerControllers",["ui.bootstrap"]);

angular.module("ucrCareerControllers").controller("splashCtrl",["$scope","$modal",function(o,e){o.user={email:"",password:""},o.open=function(){var l=e.open({templateUrl:"templates/registerModal.html",controller:"registerModalCtrl",size:"lg"});l.result.then(function(e){console.log(e),o.user.email=e.email,o.user.password=e.password},function(){console.log("dey closed dis :(")})}}]).controller("registerModalCtrl",["$scope","$modalInstance",function(o,e){o.user={email:"",password:""},o.ok=function(){console.log("closing modal",o.user),e.close(o.user)},o.cancel=function(){e.dismiss()}}]);

