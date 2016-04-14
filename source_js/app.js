var app = angular.module('mp4', ['ngRoute', 'mp4Controllers', 'mp4Services']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/settings', {
    templateUrl: 'partials/settings.html',
    controller: 'SettingsController'
  }).
  when('/users', {
    templateUrl: 'partials/users.html',
    controller: 'UsersController'
  }).
  when('/tasks', {
    templateUrl: 'partials/tasks.html',
    controller: 'TasksController'
  }).
  when('/addUser', {
    templateUrl: 'partials/addUser.html',
    controller: 'AddUserController'
  }).
  when('/addTask', {
    templateUrl: 'partials/addTask.html',
    controller: 'AddTaskController'
  }).
  when('/users/:id', {
    templateUrl: 'partials/userDetails.html',
    controller: 'UserDetailsController'
  }).
  when('/tasks/:id', {
    templateUrl: 'partials/taskDetails.html',
    controller: 'TaskDetailsController'
  }).
   when('/tasks/edit/:id', {
    templateUrl: 'partials/editTask.html',
    controller: 'EditTasksController'
  }).
  otherwise({
    redirectTo: '/settings'
  });
}]);
