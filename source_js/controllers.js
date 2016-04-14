var mp4Controllers = angular.module('mp4Controllers', ['720kb.datepicker']);

//var url = "http://localhost:4000";
//var url = "http://www.uiucwp.com:4000";

// SETTINGS
mp4Controllers.controller('SettingsController', ['$scope' , '$http', '$window', function($scope, $http, $window) {
	
    //$window.sessionStorage.baseurl = url;
  
    $scope.setUrl = function(){
		$window.sessionStorage.baseurl = $scope.url;
		$('#settingsAlert').show();
    };

}]);

// USERS
mp4Controllers.controller('UsersController', ['$scope', 'Users', 'Tasks', function($scope, Users, Tasks) {

	// Get all users, set our scope user variable to list of all users
    $scope.getUsers = function() {
	    Users.getUsers().success(function(data) {
		    $scope.users = data.data;
	    });
    };
  
	// Call our function when controller is entered to update our users to reflect users in database
    $scope.getUsers();
  
	// Attempt to delete the specified user
	$scope.deleteUser = function(user, id)
	{ 
		Users.deleteUser(id).success(function(data) {
			
			for(var i = 0; i < user.pendingTasks.length; i++) {
				Tasks.getTask(user.pendingTasks[i]).success(function(data) {
					
					var task = data.data;
					task.assignedUser = "";
					task.assignedUserName = "unassigned";
					Tasks.updateTask(data.data, data.data._id).success(function(data) {

					}).error(function(data) {

					});

				});
				
			}
				
			$scope.getUsers();
		}).error(function(data) {}
		);  
	};
}]);

// ADD USER
mp4Controllers.controller('AddUserController', ['$scope', 'Users', function($scope, Users) {
	
	// Add new user and display server status message to user in the case of either a success or fail
	$scope.addUser = function()
    {
		// Put our user data into a url query for the server
		$scope.user = {}
		$scope.user.name = $scope.name;
		$scope.user.email = $scope.email;
		
		Users.createUser($scope.user).success(function(data) {
			$scope.userSuccess = data.message;
			$('#userSuccess').show();
			$('#userFail').hide();
		}).error(function(data) {
			$scope.userFail = data.message;
			$('#userSuccess').hide();
			$('#userFail').show();
		});
    };
}]);

// USER DETAILS
mp4Controllers.controller('UserDetailsController', ['$scope', 'Users', 'Tasks', '$routeParams', function($scope, Users, Tasks, $routeParams) {
	
	// Current user ID
	$scope.id = $routeParams.id;
	
	$scope.showCompletedTasks = false;
	
	// Function to format date into readable date
	$scope.formatDate = function(oldDate)
	{
		if(oldDate === undefined || oldDate === "undefined")
			return;
		newDate = oldDate.toString().substring(0,10).split("-");
		return newDate[1] + "/" + newDate[2] + "/" + newDate[0];
	};
	
	// Formulate query to only get pending tasks of the user
	var formulateQuery = function() {
		var query = '?where={_id: {$in: [';
			for(var i = 0; i < $scope.user.pendingTasks.length; i++) {
				query = query + '"' + $scope.user.pendingTasks[i] + '"';
				if(i != $scope.user.pendingTasks.length - 1)
					query += ",";
			}
			query += ']}}';
		return query;
	}
	
	// Get user at our user url and set our scope variable to user data received from database
	$scope.getUserDetails = function () {

		Users.getUser($scope.id).success(function(data) {
			
			$scope.user = data.data;

			Tasks.getTasks(formulateQuery()).success(function(data) {
				$scope.tasks = data.data;
				
				query = '?where={assignedUser: "' + $scope.id + '", completed: true}';
				Tasks.getTasks(query).success(function(data) {
					$scope.finishedTasks = data.data;
				}).error(function(data) {
					$scope.userDetailFail = data.message;
					$('#userDetailFail').show();
				});
			}).error(function(data) {
				$scope.userDetailFail = data.message;
				$('#userDetailFail').show();
			});
	
		}).error(function(data) {
			$scope.userDetailFail = data.message;
			$('#userDetailFail').show();
		});
	};
	
	// Call our function when controller is entered to update our user to reflect user in database
	$scope.getUserDetails();
	
	// Function for when completed button for a task is pressed
	$scope.completed = function (task, id) {
		// Find and remove the task from the user's pendingTasks array
		var index = $scope.user.pendingTasks.indexOf(id);
		if (index > -1) {
			$scope.user.pendingTasks.splice(index, 1);
		}
		
		// Update user with new pendingTasks
		Users.updateUser($scope.user, $scope.id).success(function(data) {
			
			// Update task to have status of completed
			task.completed = true;
			Tasks.updateTask(task, id).success(function(data, newTask)
				{}
			).error(function(data) {
				$scope.userDetailFail = data.message;
				$('#userDetailFail').show();
			});
			
			// Refresh our user details
			$scope.getUserDetails();
		}).error(function(data) {
			$scope.userDetailFail = data.message;
			$('#userDetailFail').show();
		});
	}	
}]);

// TASKS
mp4Controllers.controller('TasksController', ['$scope', '$http', 'Tasks', 'Users', function($scope, $http, Tasks, Users) {

	// Function to format date into readable date
	$scope.formatDate = function(oldDate)
	{
		if(oldDate === undefined || oldDate === "undefined")
			return;
		newDate = oldDate.toString().substring(0,10).split("-");
		return newDate[1] + "/" + newDate[2] + "/" + newDate[0];
	};

	// Variables for pagination
	$scope.pagination = 10;
	$scope.skip = 0;

	// Variables for tasks to show
	$scope.tasksToShow = "pending";
	$scope.direction = 1;
	
	// Variables for sorting
	$scope.sorting = 'name';
	$scope.dropdowns = [
		{'name': 'Name',
		 'value': 'name'},
		{'name': 'User',
		 'value': 'assignedUser'},
		{'name': 'Date Created',
		 'value': 'dateCreated'},
		 {'name': 'Deadline',
		 'value': 'deadline'}
	];
	
	// Get all tasks, set our scope user variable to list of all tasks
	$scope.getTasks = function() {
		// Create our query with limit and skip variables, call our getTasks function to update our tasks
		$scope.query = "?limit=" + $scope.pagination + "&skip=" + $scope.skip + "&sort= {" + $scope.sorting + ": " + $scope.direction + "}";
		
		if($scope.tasksToShow === "pending")
			$scope.query += "&where= { completed: false }"
		if($scope.tasksToShow === "completed")
			$scope.query += "&where= { completed: true }"
		
		Tasks.getTasks($scope.query).success(function(data) {
			$scope.tasks = data.data;
		});
	};
	  
	// Call our function when controller is entered to update our tasks to reflect tasks in database
	$scope.getTasks();
	
	// Function to update our pagination values
	$scope.updatePagination = function(value) {
		
		// See how many tasks there actually are
		Tasks.getTasks('?count=true').success(function(data) {
			// If our new skip value is within the amount of tasks there are, increment it
			if (($scope.skip + value >= 0) && ($scope.skip + value < data.data))
				$scope.skip += value;
			// Sanity checks for skip values out of bounds (in the case of deletions)
			if($scope.skip >= data.data)
				$scope.skip -= $scope.pagination;
			if($scope.skip <= 0)
				$scope.skip = 0;
			
			$scope.getTasks();
		});
		
	}
	
	// Attempt to delete the specified task
	$scope.deleteTask = function(task, id)
	{ 
		Tasks.deleteTask(id).success(function(data) {
			
			// If the task had an assigned user, find it, remove the pending task, and update it in the database
			if(task.assignedUser !== "") {
				Users.getUser(task.assignedUser).success(function(data) {
					var person = data.data;
					var index = person.pendingTasks.indexOf(id);
					if (index > -1) {
						person.pendingTasks.splice(index, 1);
					}
					Users.updateUser(person, task.assignedUser).success(function(data)
						{}
					).error(function(data) 
						{}
					);
				});
			}
			// See if we need to update our pagination values, also update our tasks
			$scope.updatePagination(0);
		}).error(function(data)
			{}
		);  
	};
}]);

// ADD TASK
mp4Controllers.controller('AddTaskController', ['$scope', 'Tasks', 'Users', function($scope, Tasks, Users) {

	// Get all users to populate our drop down menu for assigning tasks
	$scope.getUsers = function() {
	    Users.getUsers().success(function(data) {
			$scope.users = data.data;
	    });
	};
	  
	// Call the above function to populate dropdown menu
	$scope.getUsers();

	// Add new task and display server status message to user in the case of either a success or fail
	$scope.addTask = function()
	{	
		// Create our task based on inputs
		$scope.task = {}
		$scope.task.name = $scope.taskName;
		$scope.task.description = $scope.description;
		$scope.task.deadline = $scope.deadline;

		if($scope.user === undefined || $scope.user === "undefined") {
			$scope.task.assignedUser = "";
			$scope.task.assignedUserName = "";
		}
		else {
			$scope.task.assignedUser = $scope.user._id;
			$scope.task.assignedUserName = $scope.user.name;
		}
		
		Tasks.createTask($scope.task).success(function(data) {

			// Push the new task to the user's pending task if there is a user assigned 
			if($scope.task.assignedUser !== "") {
				$scope.user.pendingTasks.push(data.data._id);
				Users.updateUser($scope.user, $scope.task.assignedUser).success(function(data) {
					$scope.getUsers();
				}).error(function(data){
					$scope.getUsers();
				});
			}
			else
				$scope.getUsers();
			
			$scope.taskSuccess = data.message;
			$('#taskSuccess').show();
			$('#taskFail').hide();
			
			// Set current selected user to undefined on load to reflect "blank" drop down choice
			$scope.user = undefined;
		}).error(function(data) {
			$scope.taskFail = data.message;
			$('#taskSuccess').hide();
			$('#taskFail').show();
		});
	}
}]);

// TASK DETAILS
mp4Controllers.controller('TaskDetailsController', ['$scope', 'Tasks', '$routeParams', function($scope, Tasks, $routeParams) {
	
	// Current task ID
	$scope.id = $routeParams.id;
	
	// Function to format date into readable date
	$scope.formatDate = function(oldDate)
	{
		if(oldDate === undefined || oldDate === "undefined")
			return;
		newDate = oldDate.toString().substring(0,10).split("-");
		return newDate[1] + "/" + newDate[2] + "/" + newDate[0];
	};

	// Get task at our task url and set our scope variable to task data received from database
	$scope.getTaskDetails = function () {
		Tasks.getTask($scope.id).success(function(data) {
			$scope.task = data.data;
		}).error(function(data){
			$scope.taskDetailFail = data.message;
			$('#taskDetailFail').show();		
		});
	};
	
	// Call our function when controller is entered to update our task to reflect task in database
	$scope.getTaskDetails();
}]);

// EDIT TASK
mp4Controllers.controller('EditTasksController', ['$scope', 'Tasks', 'Users', '$routeParams', function($scope, Tasks, Users, $routeParams) {
	
	// Current task ID
	$scope.id = $routeParams.id;
	
	// Get all users to populate our drop down menu for assigning tasks
	$scope.getUsers = function() {
	    Users.getUsers().success(function(data) {
			$scope.users = data.data;
			
			// Call our function when controller is entered to update our task to reflect task in database
			$scope.getTaskDetails();
	    });
	};
	
	// Call the above function to populate dropdown menu and get our task details
	$scope.getUsers();
	
	// Get task at our task url and set our scope variable to task data received from database
	$scope.getTaskDetails = function () {
		Tasks.getTask($scope.id).success(function(data) {
			$scope.task = data.data;
			// Set dropdown to current user
			if($scope.users !== undefined || $scope.users !== "undefined") {
				for(var i = 0; i < $scope.users.length; i++) {
					if($scope.task.assignedUser === $scope.users[i]._id)
						$scope.user = $scope.users[i];
				}
			}
			$scope.initialCompleted = $scope.task.completed;
			$scope.initialUser = $scope.task.assignedUser;
		}).error(function(data) {
			$scope.taskFail = data.message;
			$('#editTaskSuccess').hide();
			$('#editTaskFail').show();
		});
	};
	
	$scope.changeTask = function()
	{
		// Create our task based on inputs
		$scope.newTask = {}
		
		$scope.newTask.name = $scope.task.name;
		$scope.newTask.description = $scope.task.description;
		$scope.newTask.deadline = $scope.task.deadline; 
		$scope.newTask.completed = $scope.task.completed;
		if($scope.user === undefined || $scope.user === "undefined") {
			$scope.newTask.assignedUser = "";
			$scope.newTask.assignedUserName = "";
		}
		else {
			$scope.newTask.assignedUser = $scope.user._id;
			$scope.newTask.assignedUserName = $scope.user.name;
		}

		// Remove task from old user's pending tasks array
		if(($scope.initialUser !== undefined) && ($scope.initialUser !== "")) {
				Users.getUser($scope.initialUser).success(function(data) {
					var person = data.data;
					var index = person.pendingTasks.indexOf($scope.task._id);
					if (index > -1) {
						person.pendingTasks.splice(index, 1);
					}
					Users.updateUser(person, person._id).success(function(data)
						{}
					).error(function(data) 
						{}
					);
				})
		}
		
		// If new task is not completed, add it to the new user's pendingTasks array if not there already
		if(($scope.newTask.completed === false) || ($scope.newTask.completed === "false")) {
			
			if(($scope.newTask.assignedUser !== undefined) && ($scope.newTask.assignedUser !== "")) {
				Users.getUser($scope.newTask.assignedUser).success(function(data) {
					var person = data.data;
					var index = person.pendingTasks.indexOf($scope.task._id);
					if (index === -1) {
						person.pendingTasks.push($scope.task._id);
					}
					Users.updateUser(person, person._id).success(function(data)
						{}
					).error(function(data) 
						{}
					);
				})
			}
		}

		
		Tasks.updateTask($scope.newTask, $scope.id).success(function(data) {
			$scope.taskSuccess = data.message;
			$('#editTaskSuccess').show();
			$('#editTaskFail').hide();
			
			$scope.getUsers();
		}).error(function(data) {
			$scope.taskFail = data.message;
			$('#editTaskSuccess').hide();
			$('#editTaskFail').show();
		});
	}
}]);	