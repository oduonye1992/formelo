(function() {
    var config  = formelo.require('config');
    var MoltinManager = formelo.require('MoltinManager');
    var UserManager = {};
    /*
    *  Load properties to this class
    *  UserManager.findAll = function(){
    *      // Do stuff
    *  }
    */
    UserManager.isLoggedIn = function(){
        return false;
    };
    UserManager.users = {
        current : null,
        data : {}
    };
    UserManager.initialized = false;
    UserManager.init = function(callback){
        if (UserManager.initialized === true){
            console.log('Config already initialized');
            return callback();
        }
        // Get config from Formelo -- Oonly available in production
        if (config.inProductionMode()){
            formelo.storage().get(config.appletID+'_users', function(data){
                if (data){
                    console.log('Initialized user config');
                    UserManager.users = data;
                    UserManager.initialized = true;
                } else {
                    console.log('Date not found'.data);
                }
                callback();
            }, function(){
                console.log('Error initializing user config');
                callback();
            });
        } else {
            callback();
        }

    };
    UserManager.save = function(){
        if (config.inProductionMode()){
            formelo.storage().set(config.appletID+'_users', UserManager.users, function(data){
                console.log('Saved user config');
            }, function(err){
                console.log('Error saving user config '+err);
            });
        }
    };
    UserManager.getUser = function(successCB, errorCB){
        // Generate fictitious data
        var data = {
            id : "fksndlkmds",
            email : "dante@gmail.com"
        }
    };
    UserManager.isAdmin = function(){

    };
    UserManager.getUserProfile = function(id, callback){
        callback(UserManager.users.data[id]);
    };
    UserManager.getAllUsers = function(callback){
        callback(UserManager.users.data);
    };
    UserManager.addUser = function(id, obj, _successCB, _errorCB){
        var errorCB = _errorCB || function(){};
        var successCB = _successCB || function(){};
        if (!(id && obj)) {
            return errorCB('No ID or user object');
        }
        UserManager.users.data[id] = obj;
        UserManager.save();
        successCB();
    };
    UserManager.getCurrentUser = function(callback){
        return UserManager.users.data[UserManager.users.current];
    };
    UserManager.setCurrentUser = function(id){
        UserManager.users.current = id;
        UserManager.save();
    };
    UserManager.isUserExist = function(id){
        if (!id) {
            // Check if any user exist at all
            return UserManager.users.data.length ? true : false;
        }
        return UserManager.users.data[id] ? true : false;
    };
    UserManager.currentUser = null;
    UserManager.authenticate = function(userData, successCB, errorCB){
        userData['password'] = "S0ftware!";
        MoltinManager.customers.create(userData, function(data){
            console.log(data);
            UserManager.currentUser = data;
            successCB(data);
        }, function (err) {
            console.log(err);
            if (err.status == '406'){
                console.log('Authenticating users');
                MoltinManager.customers.login(userData.email, userData.password, function(data){
                    console.log(data);
                    var newUser = {
                        first_name : data.first_name,
                        last_name : data.last_name,
                        email : data.email,
                        id : data.id
                    };
                    UserManager.currentUser = newUser;
                    successCB(newUser)
                }, function(err){
                    console.log(err);
                    errorCB(err);
                })
            } else {
                errorCB();
            }
        });
    };
    UserManager.showRegistration = function(callback, errorCB){
        if (UserManager.currentUser !== null){
            return callback(UserManager.currentUser);
        }
        if (config.inPrivateMode()){
            // Private mode;
            // Fetch applet details from server
            return callback({id : "dsdnsdweosdnjd2323"});
        } else {
            if (config.inProductionMode()){
                // TODO implement native version
                formelo.profile().getProfile(function(data){
                    console.log(JSON.stringify(data));
                    var userData = {
                        first_name : data.name,
                        last_name : data.name,
                        email : data.email
                    };
                    UserManager.authenticate(userData, callback, errorCB);
                }, errorCB);
            } else {
                var first_name = window.prompt('What is your firstname');
                var last_name = window.prompt('What is your lastname');
                var email = window.prompt('What is your email address');
                var userData = {
                    first_name : first_name,
                    last_name : last_name,
                    email : email
                };
                UserManager.authenticate(userData, callback, errorCB);
            }
        }
    };
    formelo.exports('UserManager', UserManager);
})();