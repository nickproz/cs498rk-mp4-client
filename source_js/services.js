var mp4Services = angular.module('mp4Services', []);

// Service for shared data among controllers
mp4Services.factory('CommonData', function(){
    var data = "";
    return{
        getData : function(){
            return data;
        },
        setData : function(newData){
            data = newData;
        }
    }
});

// Service for our User API requests
mp4Services.factory('Users', function($http, $window) {
	
	// Encode our request as url encoded parameters and our server url variable
	//var config = { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }; 
	var baseUrl = $window.sessionStorage.baseurl + '/api/users/';
	
	// Route to correct HTTP API call
    return {

		createUser : function(user) {
			return $http.post(baseUrl, user);
        },
		getUsers : function(query) {
			if(query === undefined || query === "undefined")
				return $http.get(baseUrl);
			else
				return $http.get(baseUrl + query);
		},
		getUser : function(id) {
			return $http.get(baseUrl + id);	
		},
		updateUser : function(user, id) {
			return $http.put(baseUrl + id, user);
		},
		deleteUser : function(id) {
			return $http.delete(baseUrl + id);
		}
    }
});

// Service for our Task API requests
mp4Services.factory('Tasks', function($http, $window) {
	
	// Encode our request as url encoded parameters and our server url variable
	//var config = { headers: {'Content-Type': 'application/x-www-form-urlencoded'} }; 
	var baseUrl = $window.sessionStorage.baseurl + '/api/tasks/';
	
	// Route to correct HTTP API call
	return {
		
		createTask : function(task) {
			return $http.post(baseUrl, task);
		},
		getTasks : function (query) {
			if(query === undefined || query === "undefined")
				return $http.get(baseUrl);
			else
				return $http.get(baseUrl + query);
		},
		getTask : function(id) {
			return $http.get(baseUrl + id);
		},
		updateTask : function(task, id) {
			return $http.put(baseUrl + id, task);
		},
		deleteTask : function(id) {
			return $http.delete(baseUrl + id);
		}
	}
});