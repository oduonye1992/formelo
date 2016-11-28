function salert(msg){}
//All global variables
var version             = 'v3.38';
var xconfig;
var dialogIsRunning     = false; // Used to check againgts duplicate dialog declaration
var bodyContainer       = null; // Placeholder for JQMs "mobile:pageContainer". So we dont have to search each time
var BODY                = null;
// FingerPrint
var FINGER_PRINT_KEY    = "";
var retryCount          = 0;
var TIMEOUT             = 90000; // For network calls
var DATABASE_VERSION    = 2; // Change to trigger database migrations
// device events
var networkStatus;
var load;
var DEFAULT_REALM_ID = 'd9f3a9a9';
// used to deterimine when to show the invite code dialog
var LAUNCH_DATE = '31-08-2016';
// Current form page number to manage form navigation
var formPageNumber      = -1;
var currentPageBackCommand = '';
//Geo Location
var location_global     = "";
var gpsLocCount         = 0; // Used to fix bug in capturing location
var APPLET_MODE         = ''; // Store what mode we are in
var apiVersion          = 'v1';
var customisationCount  = 0; //TODO Used to block multiple invocation of the {} function
var SOCKET_URL          = "https://system.formelo.com/";
var GOOGLE_ANALYTICS_TRACKING_ID = 'UA-77310634-1';
var latestLocation = {
    longitude   :   0,
    latitude    :   0,
    timestamp   :   0
};
var DEMO_CREDENTIALS = {
    code        : 'demo',
    username    : 'guest',
    password    : 'P@ss123$',
    userId      : 'd9c0d1ec'
};
var customiser = {
    company_name : "",
    company_color: "#000000",
    company_realm: "",
    includePublicMode: true,
    restrictToDomain: false, // false
    primaryTextColour: "#ffffff",
    requireGPS: true // Stop the app from opening a form is there is no GPS
};
var publicDetails = {
    name        : 'Public User',
    api_key     : 'SSAUBKND8732Y7Y3879913',
    username    : 'username_one',
    avatar      : 'img/loading.png',
    id          : 'd3a9e9a9',
    realm       : 'd3adf3a9',
    endpoint    : 'https://test.formelo.com'
};
// Store the  current page for form navigation
var nav_options = {
    "formRef": "1",
    "number_of_pages": "",
    "previous_page": "",
    "current_page": ""
};

// Open Applet
function openDevApplet(){
    // Get the json
    readTextFile('formelo.manifest', function(data){
        var myData = JSON.parse(data);
        formelo = new Formelo(myData.id, 'selector-page', JSON.parse(data));
        formelo.start();
    });
}
function readTextFile(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    };
    rawFile.send(null);
}

/** Global formelo variable for aplets to hook into the Formelo API */
var formelo = null;

// Execute code in app. . . Danger
var userScripts = {
    "exec": function(key){
        try {
            var evalScript = app.scripts[key];
            return eval(evalScript);
        } catch(e){
            showMessage(e.message);
            alert(e.message+' Stack: '+JSON.stringify(e));
        }
    }
};
function initApp(){
    var onReady = function(){
        FastClick.attach(document.body);
        $('.tooltip').tooltipster({
            animation:'grow',
            theme: 'tooltipster-shadow'
        });
        //monitorEvents();
        bodyContainer = $(":mobile-pagecontainer");
        BODY = $('body');
        $.mobile.defaultPageTransition      = 'none';
        $.mobile.defaultDialogTransition    = 'none';
        $.mobile.useFastClick               = true;
        $.mobile.touchOverflowEnabled       = true;
    };
    //customiseSplash();//
    //adjustHeightsToViewport();
    $.event.special.tap.emitTapOnTaphold = false;
    $(document).ready(function() {
        (function($){
            $.fn.appends = function(message) {
                this.append(message);
                return this;
            };
        })(jQuery);
        //initFunctions.database.create();
        //initialize swiper when document ready
        var mySwiper = new Swiper ('.swiper-container', {
            // Optional parameters
            direction: 'horizontal',
            loop: true
        });
        onReady(); // D E M O
        openDevApplet();
    });
    document.addEventListener('deviceready', function () {
        //onReady();
    }, false);

    $(document).on('pageinit', function(){});
}
function validateAccess(successCB, errorCB){
    if (!successCB || !errorCB) throw new Error ('Error and Success callback not passed');
    var keys = [
        'hello',
        'itsme',
        'ivebeenwondering',
        'ifafter',
        'alltheseyears',
        'youdliketomeet',
        'togoover',
        'everything',
        'theysaythat',
        'timessupposedtohealya',
        'butiaintdone',
        'muchhealing'
    ];
    var targetDate = moment(LAUNCH_DATE, 'DD-MM-YYYY');
    var today = moment();
    function isValidCode(code){
        return keys.indexOf(code) !== -1;
    }
    function isBetaStillOn(){
        return today.isBefore(targetDate);
    }
    function showNotification (){
        navigator.notification.prompt(
            'Kindly enter your Invite code',
            function(result) {
                if (result.buttonIndex == 1) {
                    if (result.input1 && result.input1.length){
                        if (isValidCode(result.input1)){
                            successCB();
                        } else {
                            errorCB('Kindly specify a valid invite code');
                        }
                    } else {errorCB('Kindly specify a valid invite code');}
                }
            },
            'Early Bird Access Code', ['Enter', 'Cancel'],
            ''
        );
    }
    if (isBetaStillOn()){
        showNotification();
    } else {
        successCB();
    }
}
var loader  = function (){
    var page = null;
    var selector = null;
    var oldValue = null;
    //var html = '<img src="img/header-loader.gif" style="width:20%;">';/// '<div class="progress-circle-indeterminate" style="display: block;"></div>';
    var html = '<span style="color:#e74c3c;">L o a d i n g</span>';
    var reset =  function(){
        if (selector){
            selector.html(oldValue);
        }
        page = null;
        selector = null;
        oldValue = null;
    };
    return {
        show : function(_page){
            reset();
            page = _page;
            selector = $('#'+page+ ' div.blue-gradient h1');
            oldValue = selector.html();
            selector.html(html);
            // backup plan
            showMessage('Please wait...');
        },
        hide : function(){
            reset();
        }
    }
}();
function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
var getDeviceInfo = function(){
        return {
            'platform'      : device.platform,
            'os_version'    : device.version,
            'app_model'     : device.model,
            'app_version'   : version,
            'device_id'     : globals.files.id,
            'scope'         : 'public', //Needed for what we wanted to us the function for.
            'country_code'  : getCurrentCountry()
        };
};
var getRemoteStats = function() {
    var txDeferred = $.Deferred();
    try {
        var options = {
            fromDate    : '1916-04-20',
            toDate      : moment().format('YYYY-MM-DD'),
            realm_url   : getEndpoint(),
            userID      : getUserCredentials().id,
            username    : getUserCredentials().username,
            api_key     : getUserCredentials().api_key,
            mode        : 'summary'
        };
        $.when(app.constructors.getUserStats(options))
            .done(function (data) {
                remoteStats('post', 'remote', data[0].count);
                options.mode = 'series';
                $.when(app.constructors.getUserStats(options))
                    .done(function (data) {
                        remoteStats('post', 'chart', data);
                        txDeferred.resolve();
                    }).fail(txDeferred.reject);
            }).fail(txDeferred.reject);
    } catch (e) {
        alert(JSON.stringify(e));
        txDeferred.reject(e);
    }
    return txDeferred.promise();
};
var remoteStats = function(mode, key, value){
    var remoteStatObj   = Manager.get(Manager.keys.STAT_REMOTE);
    var realm           = JSON.parse(window.localStorage.realm_full).id;
    var newObj = {
        userID  : getUserCredentials().id,
        realm   : realm,
        chart   : [],
        initial : 0,
        remote  : 0
    };
    var active = false;
    if (mode == 'post'){
        $.each(remoteStatObj, function() {
            var curr =  this;
            if (curr.userID == getUserCredentials().id && curr.realm == realm) {
                curr[key] = value;
                active = true;
            }
        });
        if (!active){
            newObj[key] = value;
            remoteStatObj.push(newObj);
        }
        Manager.set(Manager.keys.STAT_REMOTE, remoteStatObj);
    } else if (mode == 'get'){
        var returnValue = '';
        $.each(remoteStatObj, function() {
            var curr =  this;
            if (curr.userID == getUserCredentials().id && curr.realm == realm) {
                //alert('returned obj for '+key+' is '+curr[key]);
                active = true;
                returnValue = curr[key];
                return;
            }
        });
        if (!active){
            //alert('user obj doesnt exist. Creating one');
            remoteStatObj.push(newObj);
            Manager.set(Manager.keys.STAT_REMOTE, remoteStatObj);
            returnValue = newObj[key];
        }
        return returnValue;
    }
};
function customiseSplash(){
    //Customise the greeting text
    var greetingMessage = '';
    var image = '';
    var splashLogo = '';
    var myDate = new Date();
    //alert('time is '+myDatinvie.getHours());
    /* hour is before noon */
    if ( myDate.getHours() >= 5 && myDate.getHours() < 12 )  {
        greetingMessage = "Good Morning!";
        image = globals.files.images.backgrounds.morning;//'img/splash/splash_morning.jpg';
        splashLogo = globals.files.images.logo_small;//'img/splash/logo_darkbg.png';
    } else /* Hour is from noon to 5pm (actually to 5:59 pm) */ if (
        myDate.getHours() >= 12 && myDate.getHours() <= 17 ) {
        greetingMessage = "Good Afternoon!";
        image = globals.files.images.backgrounds.afternoon;//'img/splash/splash_morning.jpg';
        splashLogo = globals.files.images.logo_small;//'img/splash/logo_darkbg.png';
    } else  /* the hour is after 5pm, so it is between 6pm and midnight */ if (
        myDate.getHours() > 17 && myDate.getHours() <= 24 ) {
        greetingMessage = "Good Evening!";
        image = globals.files.images.backgrounds.night;//'img/splash/splash_morning.jpg';
        splashLogo = globals.files.images.logo_small;//'img/splash/logo_darkbg.png';
    } else  /* the hour is not between 0 and 24, so something is wrong */ {
        greetingMessage = "Welcome Back!";
        //image = 'assets/images/hero_2.jpeg';
        image = globals.files.images.backgrounds.night;//'img/splash/splash_morning.jpg';
        splashLogo = globals.files.images.logo_small;//'img/splash/logo_darkbg.png';
    }
    $('#welcomeGreetingHeader').html(greetingMessage);
    //$('#splash-background-image').attr('data-pages-bg-image', image);
    $('#splash-background-image').css('background-image', 'url(' + image + ')');
    $('#splash-logo').attr('src', splashLogo);
    // End
}
function adjustHeightsToViewport(){
    var clientWidth = $( window ).width();
    var clientHeight = $( window ).height();
    var inLandscape = clientHeight < clientWidth;
    var image = getCountryImage();
    $('.country-link').attr('src', image);
    $('.full-vh').each(function() {
        $(this).css('height', clientHeight);
    });
    for (var i = 0; i < 100; i++ ){
        $('.'+i+'-vh').each(function() {
            $(this).css('height', (i*clientHeight)/100);
        });
        $('.'+i+'-min-vh').each(function() {
            $(this).css('min-height', (i*clientHeight)/100);
        });
        $('.'+i+'-max-vh').each(function() {
            $(this).css('max-height', (i*clientHeight)/100);
        });
        $('.'+i+'-margin-top-vh').each(function() {
            $(this).css('margin-top', (i*clientHeight)/100);
        });
        $('.'+i+'-margin-top-o-vh').each(function() {
            $(this).css('margin-top', -1 * (i*clientHeight)/100);
        });
        $('.'+i+'-margin-bottom-vh').each(function() {
            $(this).css('margin-bottom', (i*clientHeight)/100);
        });
        $('.'+i+'-margin-bottom-o-vh').each(function() {
            $(this).css('margin-bottom', -1 * (i*clientHeight)/100);
        });
    }
    $('.details-applet-image').each(function(){
        if (inLandscape) {
            $(this).attr('width', 100);
        } else {
            $(this).attr('width', 200);
        }
    });
    globals.customise();
}
function computeSentItems(currentSentCount){
    try{
        var  initialCount   = remoteStats('get', 'initial');
        var  remoteCount    = remoteStats('get', 'remote');
        var  currentCount   = 0;
        //alert('Initial: '+initialCount+'. Remote: '+remoteCount);

        currentCount    =  currentSentCount;
        var diff        =  currentCount - initialCount;
        remoteCount     += diff;
        initialCount    =  currentCount;
        //alert('Initial: '+initialCount+'. Remote: '+remoteCount);

        remoteStats('post', 'initial', initialCount);
        remoteStats('post', 'remote', remoteCount);
        return remoteCount;
    } catch(e){
        alert(JSON.stringify(e));
        return currentSentCount;
    }
}
function isFirstTime(){
    if (!window.localStorage.existing_user) {
        return true;
    } else {
        return false;
    }
}
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
function getCurrentLocation(){
    var txDeferred = $.Deferred();
    if (window.navigator.geolocation) {
        var option = {
            maximumAge: 0,
            timeout: 10000,
            enableHighAccuracy: true
        };
        window.navigator.geolocation.getCurrentPosition(function(position){
                latestLocation.longitude    = position.coords.longitude;
                latestLocation.latitude     = position.coords.latitude;
                latestLocation.date         = moment(position.timestamp).format('YYYY-MM-DD HH:mm:ss');
                txDeferred.resolve(latestLocation);
            },
            function(e){
                if (gpsLocCount === 0){
                    showMessage("Kindly turn on GPS to enhance your experience");
                    txDeferred.reject("Kindly turn on GPS to enhance your experience "+JSON.stringify(e));
                    gpsLocCount++;
                }
                txDeferred.reject();
            },option);
    } else {
        txDeferred.reject("Geolocation is not supported on this phone");//, 'short', 'bottom');
    }
    return txDeferred.promise();
}
function deflateEntity(entity) {
    var txDeferred = $.Deferred();
    syncPlugin.deflateEntity(entity, function(data){
            txDeferred.resolve(data);
        },
        function(error){
            txDeferred.reject(error);
        });
    return txDeferred.promise();
}
function inflateEntity(entity) {
    var txDeferred = $.Deferred();
    syncPlugin.inflateEntity(entity, function(data){
         txDeferred.resolve(data);
        },
        function(error){
            txDeferred.reject(error);
        });
    return txDeferred.promise();
}
function cleanEntity(entity) {
    var txDeferred = $.Deferred();
    syncPlugin.cleanEntity(entity, function(data){
            txDeferred.resolve(data);
        },
        function(error){
            txDeferred.reject(error);
        });
    return txDeferred.promise();
}
function logUserAction(type, formRef) {
    var Log = {
        type : type,
        form_ref : formRef,
        owner : getUserCredentials().username
    };
    initFunctions.database.log(Log);
    return true;
}
function fetchData(url, _data, _method, _headers){
    var data    = _data      || {};
    var method  = _method    || 'GET';
    var txDeferred = $.Deferred();
    var headers = _headers || {};
    var header = headers['accept-encoding'] = 'gzip';
    if (isonline()){
        $.ajax({
            url : url,
            type : method,
            data : data,
            cache: false,
            headers: header,
            success : function(data){
                txDeferred.resolve(data);
            },
            error: function(xhr){
                handleErrorCodes(xhr, txDeferred);
            },
            timeout: TIMEOUT
        });
    } else{
        txDeferred.reject('No internet connection');
    }
    return txDeferred.promise();
}
function getUserCredentials() {
    try{
        if (APPLET_MODE == 'private'){
            var userCredentials = Manager.get(Manager.keys.CREDENTIALS);
            //var realm           = JSON.parse(window.localStorage["realm_full"]).id;
            if (!$.isEmptyObject(userCredentials)) {
                var avatar = userCredentials.avatar_url ? userCredentials.avatar_url : "img/unknown.gif";
                var userObject = {
                    name        : userCredentials.data.name,
                    api_key     : userCredentials.data.token.access_token,
                    username    : userCredentials.data.username,
                    avatar      : avatar,
                    id          : userCredentials.data.id,
                    realm       : userCredentials.data.realm.id,
                    role        : userCredentials.data.role_code,
                    email_address : userCredentials.data.email_address,
                    first_name    : userCredentials.data.first_name,
                    interval    : userCredentials.data.interval ? userCredentials.data.interval : 50000
                };
                return userObject;
            } else {
                return null;
            }
        } else {
            var formConf = Manager.get(Manager.keys.FORM_CONFIG);
            if (!$.isEmptyObject(formConf) && formConf.hasOwnProperty('default_user')){
                var tmpObj = {
                    name      : formConf.default_user.name,
                    realm     : formConf.default_user.realm.id,
                    api_key   : formConf.default_user.token.access_token,
                    username  : formConf.default_user.username,
                    id        : formConf.default_user.id
                };
                return tmpObj;
            } else {
                return null;
            }
        }
    } catch (e){
        alert(JSON.stringify(e));
    }
}
function getLoginEndpoint(username, password) {
    var _endPoint = getEndpoint() !== null ? getEndpoint() : "";
    return _endPoint + "/actions/"+apiVersion+"/users/info";//?username="+username+"&password="+encodeURIComponent(password);
}
function getEndpoint(){
    if (APPLET_MODE == 'public'){
        return publicDetails.endpoint;
    }
    var returnEndpoint = '';
    if (window.localStorage.realm_full !== undefined) {
        var realm = JSON.parse(window.localStorage.realm_full);
        returnEndpoint = realm.base_url;
    } else {
        returnEndpoint = null;
    }
    return returnEndpoint;
}
function getSubmissionEndpoint() {
    var _endPoint = getEndpoint() !== null ? getEndpoint() : "";
    return _endPoint + "/api/"+apiVersion+"/submissions";
}
function getUserConfigEndpoint() {
    var     _endPoint = getEndpoint() !== null ? getEndpoint() : "";
    return  _endPoint + "/actions/"+apiVersion+"/applets/config?scope=private&username="+getUserCredentials().username;
}
function countFormsInConfig(conf) {
    var count = 0;
    var groups = conf.groups;
    for (var i = 0; i < groups.length; i++) {
        var model = groups[i].models;
        count += model.length;
    }
    return count;
}
function validateConfig(form) {

    var validated = true;
    var errors = [];

    var model = form;//groups.models[j];
    var keys = [];
    // fail if models aint got names, id, pages
    // id
    if (!model){
        validated = false;
        errors.push("Form is not available \n");
        //throw new Error('Form is not available');
    }
    if (!model.id) {
        validated = false;
        errors.push("Model has no ID \n");
    }// name
    if (!model.name) {
        validated = false;
        errors.push("Model has no Name \n");
    }
    // pages
    if (!model.hasOwnProperty('pages')) {
        validated = false;
        errors.push("Model has no Page \n");
    } else {
        // Pages
        // fail if page doesn't have a name
        // fail if page  doesnt have a fieldset
        for (var k = 0, dlen = model.pages.length; k < dlen; k++) {
            var pages = model.pages[k];
            if (!pages.name) {
                validated = false;
                errors.push("Page " + k + " in Model  has no name \n");
            }
            // fieldsets
            if (!pages.hasOwnProperty('fieldsets')) {
                validated = false;
                errors.push("Page " + k + " has no fieldset \n");
            } else {
                for (var l = 0, elen = pages.fieldsets.length; l < elen; l++) {
                    var fieldset = pages.fieldsets[l];
                    // Fields
                    if(fieldset.fields === undefined){
                        validated = false;
                        errors.push("Fieldset "+l+" in page "+k+" has no field \n");
                    } else {
                        for (var m = 0, flen = fieldset.fields.length; m < flen; m++) {
                            var fields = fieldset.fields[m];
                            // fail if field doesnt have a type
                            if (!fields.name) {
                                validated = false;
                                errors.push("field " + m + " in fieldset " + l + " in page " + k + " has no name \n");
                            }
                            // fail if field doesn't have a key
                            if (!fields.key) {
                                validated = false;
                                errors.push("field " + m + " in fieldset " + l + " in page " + k + " has no key \n");
                            } else {
                                // fail if duplicate keys exists
                                if (keys.indexOf(fields.key) > -1) {
                                    validated = false;
                                    errors.push("field " + m + " in fieldset " + l + " in page " + k + " has duplicate keys \n");
                                } else {
                                    keys.push(fields.key);
                                }
                                // Radio, select
                                if (fields.type == 'multiselect' || fields.type == 'select') {
                                    // Fail if field doesnt have a dataset
                                    if (!fields.parameters.hasOwnProperty('dataset') || !fields.parameters.dataset.id) {
                                        //validated = false;
                                        //alert( fields.name + " " + fields.parameters.dataset.key + " " +fields.parameters.dataset.id);
                                        //errors.push("field "+ m + " in fieldset "+l+" in page "+k+" has no dataset \n");
                                    }
                                }
                            }
                        }
                    }

                    //}
                }
            }
        }
    }
    return {isValid:validated, error:errors};
}
function errorExistsInConfig(conf) {
    var error = false;
    if (!conf.hasOwnProperty('data')) {
        error = true;
    } else {
        if (!conf.data.hasOwnProperty('token')) {
            error = true;
        }
        if(!conf.data.email_address || !conf.data.name ) {
            error = true;
        }
    }
    return error;
}
function getResults(endpoint){
    var deferred = $.Deferred();
    var cc = null;

    $.ajax({
        url: endpoint,
        cache: false,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "GET",
        processData: false,
        success: function(data) {
            deferred.resolve(data);
        },
        error: function(xhr, textStatus, errorThrown) {
            if (xhr.statusText == "timeout") {
                deferred.reject("Taking longer than expected. .  Kindly retry");
            } else if(xhr.status == 403) {
                deferred.reject("Incorrect username or password");
            } else if(xhr.status == 404) {
                deferred.reject("Cant reach the server, please try again later");
            } else if(xhr.status == 500) {
                deferred.reject("The server encountered an error, please try again later");
            } else {
                deferred.reject(JSON.stringify(xhr));
            }
        },
        timeout: TIMEOUT
    });
    return deferred.promise();
}
function showList(sourceArray, options) {
    var defaults = {
        label: "{name}",
        info: "",
        icon_url: null
    };
    options = $.extend(true, {}, defaults, options);
    var rand = str_random(10);

    var txDeferred = $.Deferred();
    var lists = '';

    for (var i = 0; i < sourceArray.length; i++) {
        // TODO: Implement a more efficient algorithm
        var flattenedObj = flattenObject(sourceArray[i]);
        var title = options.label;
        var description = options.info;
        for (var key in flattenedObj) {
            var regexp = new RegExp("\{" + key + "\}", "ig");
            title = title.replace(regexp, flattenedObj[key]);
            description = description.replace(regexp, flattenedObj[key]);
        }
        if (!title || (title.length && title.charAt(0) == "{")) {
            title = "- Untitled -";
        }
        if (!description || (description.length && description.charAt(0) == "{")) {
            description = "";
        }
        var image = null;
        if (options.icon_url) {
            image = flattenedObj[options.icon_url];
        } else {
            image = title.charAt(0).toUpperCase();
            if (/[^a-zA-Z]/.test(image)){
                image = "img/bg/unknown.gif";
            } else {
                image = "img/bg/" + image + ".gif";
            }
        }

        lists +=
            '<div class="clickable card-header clearfix listItem" data='+i+'>'+
            '<div class="user-pic pull-left">'+
                '<img alt="Profile Image" width="33" height="33" data-src-retina="'+image+'" data-src="'+image+'" src="'+image+'">'+
            '</div>'+
            '<div style="margin-left: 40px">'+
                '<h5 style="font-weight: 300; text-transform: capitalize !important;">'+title+'</h5>'+
                '<h6 style="text-transform: capitalize !important;">'+description+'</h6>'+
            '</div>'+
            '</div>';
    }
    var html = '<div class="modal fade slide-right in" id="'+rand+'" tabindex="-1" role="dialog" aria-hidden="false" style="display: block; overflow:scroll;>'+
        '<div class="modal-dialog modal-sm">'+
        '<div class="modal-content-wrapper">'+
        '<div class="modal-content">'+
        '<br/>'+
        '<div class="container-xs-height full-height">'+
        '<div class="row-xs-height">'+
        '<div class="modal-body col-xs-height col-middle xtext-center" style="padding: 6px;">'+
        '<h5 class="text-primary" style="text-align: center">Showing '+sourceArray.length+' <span class="semi-bold">results</span><span data-dismiss="modal" style="float:right;'+
        'margin-right: 10px;"><i class="pg-close_line"></i></span></h5>'+
        '<div class="card share full-height no-margin-card" data-social="item">'+
        lists+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<!-- /.modal-content -->'+
        '</div>'+
        '<!-- /.modal-dialog -->'+
        '</div>';
    BODY.appends(html);
    $('#'+rand).modal();
    $('#'+rand).find('.listItem').each(function(index) {
        $(this).click(function(e){
            e.stopPropagation();
            $('#'+rand).modal('toggle');
            txDeferred.resolve(sourceArray[index]);
        });
    });

    return txDeferred.promise();
}
function getField($key) {
    return Activity.getCurrentStackObject().find('[name="' + key + '"');
}
function search(url, options) {
    var txDeferred = $.Deferred();
    if (!isonline()){
        txDeferred.reject('You need the internet to complete this operation');
    }
    if (options.showLoading) {
        customFunctions.displayNotificationDialog('', '', true);
    }
    $.ajax({
        url: url,
        data: options.data,
        cache: options.cache || false,
        dataType: options.dataType || "json",
        contentType: options.contentType || "application/json; charset=utf-8",
        type: options.type || "GET",
        processData: options.processData || false,
        success: function(data) {
            if (options.showLoading) {
                customFunctions.closeNotificationDialog();
            }
            $.when(showList(data, options.resultsTemplate))
                .done(function(itemChosen){
                    txDeferred.resolve(itemChosen);
                })
                .fail(function(message){});
        },
        error: function(xhr, textStatus, errorThrown) {
            if (options.showLoading) {
                customFunctions.closeNotificationDialog();
            }
            handleErrorCodes(xhr, txDeferred, options.showToast);
        },
        timeout: TIMEOUT
    });
    return txDeferred.promise();
}
function handleErrorCodes(error, saveDeferred, showToast, url) {
    try {
        var _url = url || "Not Provided";
        var LOG_TAG  = 'Network Error';
        Log.f('Network error for ('+_url+'): ' + JSON.stringify(error), LOG_TAG);

        var errorCode = error.status;
        var errorMessage = null;
        //alert('error');
        console.log(error);
        alert('handleErrorCodes = '+JSON.stringify(error));
        if(errorCode == 201) {
            saveDeferred.resolve();
        } else if (errorCode == 200 && !error.responseText.trim().length) {
            errorMessage = "Server returned an invalid message.";
        } else if (error.statusText == "timeout") {
            errorMessage = "Taking longer than expected. .  Kindly retry";
        } else if(errorCode == 403 || errorCode == 401) {
            errorMessage = "Incorrect username or password";
        } else if(errorCode == 404) {
            errorMessage = "Not available";
        } else if(errorCode == 500) {
            errorMessage = "The server encountered an error, please try again later";
        } else {
            errorMessage = "Kindly connect to the internet and try again";//JSON.stringify(error);
        }

        if (errorMessage !== null) {
            saveDeferred.reject(errorMessage);
            if (showToast) {
                window.plugins.toast.show(errorMessage, 'short', 'bottom');
            }
        }
    } catch(e){
        alert(JSON.stringify(e));
        saveDeferred.reject('An error occured.');
    }
}
function resetForm() {
    return populateForm({}, null, true);
}
function populateForm(data, formRef, isReset, isPreview) {
    var reset       = isReset || false;
    var preview     = isPreview || false;
    var txDeferred  = $.Deferred();
    customFunctions.displayNotificationDialog('','Populating.. ');
    try {
        formRef                 = formRef || app.activeFormRef;
        var entity              = data;
        alert(JSON.stringify(data));
        $.when(initFunctions.getFormConfigByRef(formRef))
            .done(function(formConfig){
                for (var i = 0, len = formConfig.pages.length; i < len; i++) {
                    for (var j = 0, alen = formConfig.pages[i].fieldsets.length ; j < alen; j++) {
                        for (var k = 0, blen = formConfig.pages[i].fieldsets[j].fields.length ; k < blen; k++) {
                            var entityContext = entity;
                            var formField = formConfig.pages[i].fieldsets[j].fields[k];

                            //var $formControl = $('[name="'+formField.key+'"]');//$('#' + formField.id);
                            var $formControl = Activity.getCurrentStackObject().find('[name = "'+formField.key+'"]');

                            var key = formField.key;
                            var value = entityContext[key];// entityContext.hasOwnProperty(key) ? entityContext[key] : null;
                            if (!value){
                                continue;
                            }
                            if ($formControl.attr("extra") == "checkbox") {
                                for (var f = 0; f < value.length; f++){
                                    Activity.getCurrentStackObject().find("input[name='"+formField.key+"'][value='"+value[f]+"']" ).prop('checked', true);
                                }
                            } else if ($formControl.attr("extra") == "radio") {
                                Activity.getCurrentStackObject().find("input[name='"+formField.key+"'][value='"+value+"']" ).prop('checked', true);
                            } else if ($formControl.attr("extra") == "rating") {
                                $formControl.raty({
                                   score : value
                                });
                            } else if ($formControl.attr("extra") == "select") {
                                var displayName = '';
                                var mainValue   = '';
                                //if value is not null
                                if (value){
                                    if (formField.parameters.hasOwnProperty('dataset') && formField.parameters.dataset.id){
                                        var dataset  = config.datasets[formField.parameters.dataset.id];
                                        if(dataset){
                                            if (typeof value === 'object' && value.id){
                                                displayName = dataset[value.id];
                                                mainValue   = value.id;
                                            } else if(typeof value === 'string') {
                                                displayName = dataset[value];
                                                mainValue   = value;
                                            }
                                            $formControl.parent().find("span").html(reset ? '' :displayName);
                                            $formControl.val(reset ? '' : mainValue);
                                        }
                                    }
                                }
                            } else if ($formControl.attr("extra") == "multiselect") {
                                $formControl.val(reset ? '' : value);
                            } else if ($formControl.attr("extra") == "textarea") {
                                $formControl.val(reset ? '' : value);
                            } else if ($formControl.attr("extra") == "gps") {
                                if(value && value !== ""){
                                    var valueString = value.longitude+","+value.latitude+","+value.timestamp;
                                    $formControl.val(reset ? '' : valueString);
                                } else {
                                    $formControl.val(reset ? '' : value);
                                }
                            } else if ($formControl.attr("extra") == "fingerprint") {
                                var image = entityContext[key] === null ? "img/fingerprint.png" : entityContext[key];
                                $formControl.attr("src", reset ? 'img/fingerprint.png' :image);
                                try{
                                    alert('setting template key');
                                    var par = $formControl.attr("parameters");
                                    var params = par ? JSON.parse(par) : false;
                                    if (params && params.hasOwnProperty('template_key')){
                                        Activity.getCurrentStackObject().find('[name="'+ params.template_key + '"]').val(entityContext[params.template_key]);
                                    } else {
                                        //alert('no template key '+params);
                                    }
                                } catch (e){
                                    alert(JSON.stringify(e));
                                }
                            } else if ($formControl.attr("extra") == "signature") {
                                var image = entityContext[key] === null ? "img/signature.png" : entityContext[key];
                                $formControl.attr("src", reset ? 'img/signature.png' :image);
                            } else if ($formControl.attr("extra") == "image") {
                                var image = entityContext[key] === null ? "img/camera.png" : entityContext[key];
                                $formControl.attr("src", reset ? 'img/camera.png' :image);
                            } else if ($formControl.attr("extra") == "audio") {
                                var audioData = entityContext[key];
                                var audioPlaceholder = formField.key;
                                var audioSource = formField.key+'_source';
                                var audio = document.getElementById(audioPlaceholder);
                                var source = document.getElementById(audioSource);
                                //alert(audioData.raw_data);
                                source.src = audioData.raw_data;
                                audio.load();
                                Activity.getCurrentStackObject().find('#'+audioSource).attr('path', audioData.file_path);
                            }
                            else if ($formControl.attr("extra") == "readonly" || preview) {
                                var readOnlyControl = $('#form_data_preview').find('[name="' + formField.key + '"]');
                                var mode = readOnlyControl.attr("mode");
                                if (typeof value === 'object' && value !== null) {
                                    readOnlyControl.val(value.name);
                                } else {
                                    if (mode){
                                        var formattedDate = value ? value : '';
                                        if(mode == 'picture') {
                                            if (entityContext[key] !== null){
                                                readOnlyControl.attr("src", entityContext[key]);
                                            } else {
                                                alert('null image: '+entityContext[key]);
                                            }
                                        } else if (mode == 'date') {
                                            readOnlyControl.val(formattedDate);
                                        } else if (mode == 'checkbox') {
                                            readOnlyControl.val(JSON.stringify(formattedDate));
                                        } else {
                                            readOnlyControl.val(value);
                                        }
                                    } else {
                                        //
                                    }
                                }
                            } else { //text, date, number. . .
                                Activity.getCurrentStackObject().find('input[name="' + formField.key + '"]').val(reset ? '' : value);
                            }
                        }
                    }
                }
                customFunctions.closeNotificationDialog();
                txDeferred.resolve();
            });
    } catch(e){
        customFunctions.closeNotificationDialog();
        alert(JSON.stringify(e));
        txDeferred.resolve();
    }
    customFunctions.closeNotificationDialog();
    return txDeferred.promise();
}
function flattenObject (objA, baseMap, parentKey) {
    var map = baseMap || {};
    for (var key in objA) {
        var value = objA[key];
        var canonicalKey = parentKey ? (parentKey + '.' + key) : key;
        if (Array.isArray(value)) {
            continue;
        } else if (typeof value == 'object') {
            map = $.extend(true, map, flattenObject(value, baseMap, canonicalKey));
        } else {
            map[canonicalKey] = objA[key];
        }
    }
    return map;
}
function getCompanyDetails() {
    if (window.localStorage.realm_full) {
        var realm = JSON.parse(window.localStorage.realm_full);
        var backgroundColor = "#ffffff";//realm && realm.theme && realm.theme.logo_url ? realm.theme.logo_url : null;
        var image = realm && realm.theme && realm.theme.logo_large_url ? realm.theme.logo_large_url : null;
        return {
            background_color: backgroundColor,
            image: image
        };
    } else {
        //alert('no realm');
        return null;
    }
}
function openAndPopulateForm (formRef, data) {
    $.when(initFunctions.getFormConfigByRef(formRef))
        .done(function(formConfig){
            var formValidated = validateConfig(formConfig);
            if  (formValidated.isValid) { // if it is a valid form //
                app.constructors.createFormEditor(formRef);
                if(data){
                    populateForm(data, formRef);
                }
            } else {
                //showMessage("The format of this form is wrong, please contact your administrator", "short", "bottom");
                throw new Error('The format of this form is wrong, please contact your administrator');
            }
        })
        .fail(function(){
            throw new Error('Form not found');
        });
}
function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}
function str_random(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function isValidString(str){
    return str.match(/[^a-zA-Z0-9\-]/) ? false : true;
}
function updateLga(){
    // Pre-populating select list (LGA) based on data gotten from

    var stateLgaKey     = "state_of_origin";
    var lgakey          = "lga_code";
    var lgasName        = "dafec5a9";

    var state = $('select[name="' + stateLgaKey + '"]').find(":selected").val();
    alert("state = "+state);

    if (state.trim().length){

        var stateToLgaMap  = {
            "AB":["EZA","ABA","ACH","BND","KWU","KPU","MBA","MBL","NGK","HAF","SSM","GWB","KEK","KKE","UMA","APR","UNC"],
            "AD":["DSA","FUR","GAN","GRE","GMB","GUY","HNG","   JAD","JMT","LMR","MDG","MAH","MWA","MCH","MUB","GYL","NUM","SHG","SNG","TNG","YLA"],
            "AK":["ABK","KRT","KET","KST","AFH","AEE","ETN","PNG","NGD","BMT","NYA","KKN","KTS","KTE","DRK","TTU","ENW","MKP","TAI","AFG","KTD","NTE","KPD","ABT","RNN","KTM","EYF","KPK","UFG","DUU","UYY"],
            "AN":["AGU","AAH","NZM","NEN","ACA","AWK","NKK","KPP","ZBL","GDD","JJT","HAL","ABN","NNE","UKP","ATN","NSH","FGG","AJL","UMZ","HTE"],
            "BA":["ALK","BAU","BGR","DBM","DRZ","DAS","GAM","GJW","GYD","TSG","JMA","KTG","KRF","MSA","NNG","SHR","TFB","TRR","VDY","WRJ","ZAK"],
            "BE":["GMU","GTU","GKP","BKB","GBK","YGJ","ALD","NAK","KAL","TSE","WDP","GBG","MKD","BRT","BGT","DKP","JUX","PKG","TKP","WNN","UKM","SEL"],
            "BO":["ADM","ASU","BAM","BAY","BBU","CBK","DAM","DKW","GUB","GZM","GZA","HWL","JRE","KGG","KBG","KDG","KWA","KWY","MAF","MGM","MAG","MAR","MBR","MNG","NGL","NGZ"],
            "BY":["BRS","KMR","KMK","NEM","GBB","SAG","SHN","SPR","YEN"],
            "CR":["TGD","KAM","KTA","BKS","ABE","AKP","BJE","CAL","ANA","EFE","KMM","BNS","BRA","UDU","DUK","GGJ","GEP","CKK"],
            "DT":["SLK","GWK","BMA","BUR","SKL","GRA","AYB","AGB","DSZ","LEH","ABH","KWC","KPE","ASB","AKU","PTN","SAP","ALA","UGH","JRT","BKW","EFR","GBJ","WWR"],
            "EB":["AKL","AFK","EDA","UGB","EBJ","NKE","CHR","ZLL","SKA","BKL","HKW","BZR","NCA","KLK"],
            "ED":["GAR","USL","RRU","URM","UBJ","EKP","FUG","AGD","AUC","GUE","DGE","BEN","ABD","AKA","GBZ","AFZ","SGD","HER"],
            "EK":["ADK","EFY","MUE","LAW","AMK","EMR","DEA","DEK","JER","KER","KLE","YEK","GED","SSE","TUN","YEE"],
            "EN":["DBR","AWG","NKW","ENU","UWN","AGW","GBD","ENZ","BBG","KEM","MGL","AGN","NSK","JRV","BLF","UDD","UMU"],
            "FC":["ABJ","ABC","BWR","GWA","KWL"],
            "FOREIGN":["FOREIGN"],
            "GB":["AKK","BLG","BLR","DKU","FKY","GME","KLT","KUJ","KWM","NFD","SHM","YDB"],
            "IM":["ABB","AFR","EHM","ETU","URU","DFB","EKE","KED","UML","UMD","NWA","NGN","UMK","NKR","AMG","TTK","GUA","EBM","KGE","KWE","RLU","AWD","MMA","NGB","WER","RRT","UMG"],
            "JG":["AUY","BBR","BNW","BKD","BUJ","DUT","GGW","GRK","GML","GRR","GRM","GWW","HJA","JHN","KHS","KGM","KZR","KKM","KYW","MGR","MMR","MGA","RNG","RRN","STK","TAR","YKS"],
            "KB":["ALR","KGW","ARG","AUG","BGD","BRK","BNZ","KMB","MHT","GWN","JEG","KLG","BES","MYM","WRR","DRD","SNA","DKG","RBH","YLW","ZUR"],
            "KD":["BNG","KJM","GKW","TRK","KAR","KWB","KAF","KCH","DKA","MKA","KGK","KJR","KRA","KRU","ANC","HKY","SNK","MKR","SBG","GWT","MGN","ZKW","ZAR"],
            "KG":["DAV","AJA","KPA","BAS","KNA","NDG","DAH","AJK","JMU","KAB","KKF","LKJ","MPA","KFU","KPF","KKH","KNE","LAM","BJK","ERE","SAN"],
            "KN":["AJG","ABS","BGW","BBJ","BCH","BNK","DAL","DBT","DKD","DTF","DGW","FGE","DSW","GAK","GNM","GYA","GZW","GWL","GRZ","KBK","KMC","KRY","KBY","KKU","KBT","KNC","KUR","MDB","MKK","MJB","NSR","RAN","RMG","RGG","SNN","SML","TAK","TRN","TFA","TYW","TWD","UGG","WRA","WDL"],
            "KT":["BKR","BAT","BTR","BRE","BDW","CRC","DMS","DDM","DJA","DRA","DTS","DTM","FSK","FTA","NGW","JBY","KFR","KAT","KKR","KNK","KTN","KUF","KSD","MDW","MNF","MAN","MSH","MTZ","MSW","RMY","SBA","SFN","SDM","ZNG"],
            "KW":["AFN","KSB","LAF","ARP","SHA","KEY","FUF","LRN","MUN","WSN","KMA","BDU","FFA","LFF","LEM","PTG"],
            "LA":["GGE","AGL","KTU","FST","APP","BDG","EPE","EKY","AKD","FKJ","KJA","KRD","KSF","AAA","LND","MUS","JJJ","LSD","SMK","RSD","LSR"],
            "NG":["AGA","AGR","BDA","NBS","MAK","MNA","ENG","LMU","GWU","KHA","KNT","LAP","KUG","NAS","BMG","MSG","MKW","SRP","PAK","KAG","RJA","KUT","SUL","WSH"],
            "NR":["AKW","AWE","DMA","KRV","KEN","KEF","GRU","LFA","NSW","NEG","NBB","WSE","NTT","WAM"],
            "OD":["SUA","KAK","ANG","KAA","AKR","JTA","GKB","WEN","FGB","GBA","LEL","REL","REE","KTP","NND","BDR","FFN","WWW"],
            "OG":["AKM","AAB","OTA","AYE","LAR","TRE","FFF","GBE","JGB","JNE","JBD","KNN","MEK","PKA","WDE","DED","DGB","ABG","JRM","SMG"],
            "OS":["SSU","PRN","GBN","LGB","TAN","RGB","EDE","EDT","AAW","EJG","PMD","FTD","FFE","FEE","FDY","KNR","LRG","LES","LEW","RLG","KRE","APM","WWD","BKN","DTN","BDS","GNN","JJS","FNN","SGB"],
            "OY":["JBL","MNY","FMT","TDE","EGB","BDJ","AGG","NRK","MAP","LUY","RUW","AYT","IRP","DDA","KSH","SEY","TUT","WEL","KEH","YNF","KNH","AME","AJW","GBY","YRE","AKN","GBH","KKY","JND","YYY","GMD","SHK"],
            "PL":["BLD","BSA","BKK","ANW","JJN","BUU","DNG","KWK","LGT","MBD","MGU","TNK","PKN","QAP","RYM","SHD","WAS"],
            "RV":["ABU","AHD","KNM","ABM","NDN","BGM","BNY","DEG","NCH","MHA","KHE","KPR","SKP","BRR","RUM","RGM","GGU","KRK","BER","PBT","AFM","SKN"],
            "SO":["BJN","DBN","DGS","GAD","GRY","BLE","GWD","LLA","SAA","KBE","KWR","PHC","RBA","SBN","SGR","SLM","SKK","SRZ","TBW","TGZ","TRT","WMK","WRN","YYB"],
            "TB":["ARD","BAL","DGA","GKA","GAS","BBB","JAL","KLD","KRM","LAU","SDA","TTM","USS","WKR","YRR","TZG"],
            "YB":["GSH","DPH","DTR","FKA","FUN","GDM","GJB","GLN","JAK","KRS","MCN","NNR","NGU","PKM","TMW","YUN","YSF"],
            "ZA":["ANK","BKA","BMJ","BKM","BUG","GMM","GUS","KRN","MRD","MRR","SKF","TMA","TSF","ZRM"]
        };

        // get the code of the selected state
        var selectedItem    = state;
        //alert("state = "+selectedItem);
        // get the resulting object (array) from the map
        var resultObject    = stateToLgaMap[selectedItem];
        alert(JSON.stringify(resultObject));

        // loop through the array gotten from th map
        // prepare an options html
        var optionsHtml     = '';

        //clear the list
        $('select[name="' + lgakey + '"]').html("");

        for(var i = 0; i < resultObject.length; i++) {
            // for each loop
            // get the name from the dataset array.
            var lgaCode         = resultObject[i];
            var configLgaItem   = app.datasets[lgasName].data;
            var lgaName         = configLgaItem[lgaCode];

            optionsHtml += '<option name="'+lgaName+'" value ="'+lgaCode+'">'+lgaName+'</option>';
        }

        alert(optionsHtml);

        $('select[name="' + lgakey + '"]').html("");

        $('select[name="' + lgakey + '"]').html(optionsHtml);

        alert($('select[name="' + lgakey + '"]').html());

    }

}
function checkBiometrics() {
    var biometricImages = [
        'media.identity.left_thumb_source_url',
        'media.identity.left_index_source_url',
        'media.identity.left_middle_source_url',
        'media.identity.left_ring_source_url',
        'media.identity.left_small_source_url',
        'media.identity.right_thumb_source_url',
        'media.identity.right_index_source_url',
        'media.identity.right_middle_source_url',
        'media.identity.right_ring_source_url',
        'media.identity.right_small_source_url'
    ];

    var biometricOptionKey = "disability_status";

    var bioControl = $('select[name="' + biometricOptionKey + '"]').find(":selected").val();
    for (var i = 0; i < biometricImages.length; i++) {
        var status = (bioControl && bioControl == 'no') ? true : false;
        $("[name='"+biometricImages[i]+"']").attr('required', status);
    }

}
function xcheckBiometrics() {
    var biometricImages = [
        'media.identity.left_thumb_source_url',
        'media.identity.left_index_source_url',
        'media.identity.left_middle_source_url',
        'media.identity.left_ring_source_url',
        'media.identity.left_small_source_url',
        'media.identity.right_thumb_source_url',
        'media.identity.right_index_source_url',
        'media.identity.right_middle_source_url',
        'media.identity.right_ring_source_url',
        'media.identity.right_small_source_url'
    ];

    var biometricOptionKey = "disability_status";

    var bioControl = $('select[name="' + biometricOptionKey + '"]').find(":selected").val();

    for (var i = 0; i < biometricImages.length; i++) {
        var status = (bioControl && bioControl == 'no') ? true : false;
        $("[name='"+biometricImages[i]+"']").attr('required', status);
    }
}
function validateField(element){
    var id          = $(element).attr('id');
    var name        = $(element).attr('name');
    var type        = $(element).attr('extra');
    var parameters  = $(element).attr('parameters') ? JSON.parse($(element).attr('parameters')) : null;//parameters
    var value       = $(element).val();
    var min_length  = 0;
    var max_length  = 99;

    if(type == 'email') {
        if (!isValid.email($(element).val())) {
            //$(element).css({"border-bottom": "1px solid #D24D57"});
            $(element).parent().addClass('has-error');
        } else {
            //$(element).css({"border": "none"});
            $(element).parent().removeClass('has-error');
        }
    }
    if(type == 'phone' || type == 'text'){
        if (!value){
            $(element).val('');
        } else {
            min_length = parameters.min_length ? parameters.min_length : min_length;
            max_length = parameters.max_length ? parameters.max_length : max_length;
            if (value.length > max_length){
                $(element).val(value.substr(0, max_length));
            }
        }
    }
}
function showDatePicker(element) {
    var max = '';
    var min = '';
    var id          = $(element).attr('id');
    var name        = $(element).attr('name');
    var type        = $(element).attr('extra');
    var parameters  = JSON.parse($(element).attr('parameters'));
    var value       = $(element).val();
    min = parameters.min_value ? Date.parse(parameters.min_value) : min;
    max = parameters.max_value ? Date.parse(parameters.max_value) : max;
    var options = {
        date: new Date(),
        mode: 'date',
        maxDate: max,
        minDate: min
    };
    function onSuccess(date) {
        Activity.getCurrentStackObject().find('#'+id).val(moment(date).format('DD/MM/YYYY'));
        Activity.getCurrentStackObject().find('label[for = "'+id+'"]').removeClass('fade').addClass('fade');
        Activity.getCurrentStackObject().find('#'+id).trigger("change");
    }

    function onError(error) { // Android only
        alert('Error: ' + error);
        showMessage('An error has occured');
    }
    //datePicker.show();
    datePicker.show(options, onSuccess, onError);
    //alert('date picker shown');

}
function getDate(dateString) {
    return dateString ? moment(dateString, 'DD/MM/YYYY').utc() : undefined;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** Expose series of helper function call */

function getTemplate(key){
    var formRef = nav_options.formRef;
    var formPrefix = 'forms_' + formRef + '_';
    var formControl  = Activity.getCurrentStackObject().find('[id^='+formPrefix+']').find("input[name= '"+key+"']");
    var val     =  formControl ? formControl.val() : null;
    if (val && val.length) {
        var finger  =  formControl.attr('finger');
        return {template:val, finger:finger};
    } else {
        return null;
    }
}
function selectOptions (keysArray, callback){
    var modal = $('#modalSlideLeft');
    try {
        var lists = '<div class="checkbox" id="tmpCheckbox">';
        for (var i = 0; i < keysArray.length; i++){
            var item = keysArray[i];
            lists += //'<div class="checkbox ">'+
            '<input type="checkbox" value="'+item.key+'" id="'+item.key+'" xx="'+item.name+'">'+
            '<label for="'+item.key+'">'+item.name+'</label>'+
            '<br/>';
        }
        lists += '</div>';

        modal.remove();
        var html = '<div class="modal fade slide-right in" id="modalSlideLeft" tabindex="-1" role="dialog" aria-hidden="false" style="display: block; overflow:scroll;>'+
            '<div class="modal-dialog modal-sm">'+
            '<div class="modal-content-wrapper">'+
            '<div class="modal-content">'+
            '<br/>'+
            '<div class="container-xs-height full-height">'+
            '<div class="row-xs-height">'+
            '<div class="modal-body col-xs-height col-middle xtext-center" style="padding: 6px;">'+
            '<h5 class="text-primary" style="text-align: center"><span class="semi-bold">Select all that apply</span><span data-dismiss="modal" style="float:right;'+
            'margin-right: 10px;"><i class="pg-close_line"></i></span></h5>'+
            '<div class="card share full-height no-margin-card" data-social="item">'+
            lists+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>';
        BODY.appends(html);
        modal.modal();
        modal.on('hidden.bs.modal', function (e) {
            var selected = [];
            $('#tmpCheckbox input:checked').each(function() {
                selected.push(
                    {
                        key : $(this).val(),
                        name : $(this).attr('xx')
                    }
                );
            });
            if (callback && typeof(callback) === 'function') {
                callback(selected);
            } else {
                alert('no callback '+callback);
            }
        });
    } catch(e){
        alert(JSON.stringify(e));
    }
}
function find(key){
    var formRef = nav_options.formRef;
    var formPrefix = 'forms_' + formRef + '_';
    var formControl  = Activity.getCurrentStackObject().find("[name = '"+key+"']");
    //var formControl  = $('[id^='+formPrefix+']').find("[name = '"+key+"']");
    return formControl;
}
function get(key){
    var formControl  = find(key);
    var extra = formControl.attr("extra");
    var fieldValue;
    switch (extra) {
        case 'image': extra = 'camera';
        case 'fingerprint':
        case 'signature':
            fieldValue = formControl.attr('src');
            fieldValue = fieldValue != ('img/' + extra + '.png') ? fieldValue : '';
            break;
        default:
            fieldValue = formControl.val();
    }
    return fieldValue ? fieldValue : undefined;
}
function set(key, value){
    //alert(key + ' ' + value);
    var formControl  = find(key);
    var extra = formControl.attr("extra");
    var fieldValue;
    switch (extra) {
        case 'image': extra = 'camera';
        case 'fingerprint':
        case 'signature':
            if (!value || value.length === 0) {
                value = 'img/' + extra + '.png';
            }
            formControl.attr('src', value);
            formControl.removeClass('large');
            break;
        default:
            formControl.val(value);
    }
    if (extra == 'fingerprint') {
        var formRef = nav_options.formRef;
        var formPrefix = 'forms_' + formRef + '_';
        $('[id^='+formPrefix+']').find("input[for= '"+key+"'][type='hidden']").val("");
    }
}
function getkeyObj(key){
    var formConfig = initFunctions.getFormConfigByRef(app.activeFormRef);

    if (key){
        for (var pageNumber = 0; pageNumber < formConfig.pages.length; pageNumber++) { //each page
            for (var j = 0; j < formConfig.pages[pageNumber].fieldsets.length; j++) {
                for (var k = 0; k < formConfig.pages[pageNumber].fieldsets[j].fields.length; k++) {
                    var entityContext = entity;
                    var formField = formConfig.pages[pageNumber].fieldsets[j].fields[k];

                    if (key == formField.key) {
                        return formField;
                    }
                }
            }
        }
    }
    return null;
}
function a(){
    // Prevent values dated more than today
    var key = 'date';
    var current  =  Date.now();
    var newDate  =  Date.parse(get(key));
    if (newDate > current){
        set(key,'');
    }
}
function b(){
    // Prevent values dated more than 18 years ago
    var key = 'date';
    var current  =  subtractYearsFromDate(Date.now(), 18);
    var newDate  =  Date.parse(get(key));
    if (newDate > current){
        set(key,'');
    }
}
function date_sub(date, number, type) {
    return moment(date).subtract(number, type);
}
function date_add(date, number, type) {
    return moment(date).add(number, type);
}
function showMessage(message, length){
    var len = length || 'short';
    if (message){
        try {
            window.plugins.toast.show(message, len, 'bottom');
        } catch (e){
            console.log(e.message);
        }
    }
}
function previewForm() {
    $.when(app.form.save(nav_options.formRef, false, 4, true))
        .done(function(){
            var sql = 'SELECT max(ID) as MAX from FORM_DATA';
            $.when(initFunctions.database.execute(sql))
                .done(function(tx, formDataSet){
                    var lastId = formDataSet.rows.item(0).MAX;
                    //$('#form_data_preview').remove();
                    app.form.load(lastId, false, 1, true);
                })
                .fail(function(){});
        })
        .fail(function() {});
}
function gotoFormGroupPage(submittable){
    $.when(app.form.protect(submittable))
        .done(function(){
            if (Activity.isThereAnyActiveFormLeft()) {
                // Get the last formPage
                var previousslug = Activity.getParentStackSlug();
                var previousRef = Activity.getParentFormRef();
                var link = '#'+previousslug + previousRef + '_0';
                bodyContainer.pagecontainer('change', link, {transition: "none"});
                Activity.removeStack();
            } else {
                //alert('No activity exist');
                app.form.clear();
                bodyContainer.pagecontainer("change", "#form_group_list", {transition: "none"});
                resetAllNavIndicators();
                $('ul li a.nav_item_forms span').addClass("nav-active");
                app.currentView = 'form_group_list';
            }
        });
}
function handleLogin(realm_id, _forceFetchfromServer) {
    var forceFetchfromServer = _forceFetchfromServer || false;
    try {
        checkConnection();
        $.when(privateCtlr.fetchRealmConfig(realm_id, forceFetchfromServer))
            .done(function(data){
                config = data;
                SocketController.connect();
                //Update the api_key for the loggedin user
                Users.updateApiKey();
                //alert('Initializing');
                app.initialize();
            })
            .fail(function(error){
                window.plugins.toast.show(error, 'short', 'bottom');
                gotoCompanySplashScreen();
            });
    } catch(e){
        alert(e.message + ' - ' +JSON.stringify(e));
        showMessage('Could not process your request at this monent.');
        gotoCompanySplashScreen();
    }
}
function setOneTimePassword () {
    var txDeferred = $.Deferred();

        $.when(app.constructors.createValidationPage('create'))
            .done(function(){
                txDeferred.resolve();
            });

    return txDeferred.promise();
}
function gotoCompanySplashScreen(forceMove){
    var force = forceMove || false;

    try {
        if (force){
            bodyContainer.pagecontainer('change', '#selector-page', {
                transition: "none"
            });
            return false;
        }
        if (APPLET_MODE == 'private'){
            bodyContainer.pagecontainer('change', '#selector-page', {
                transition: "none"
            });
        } else {
            bodyContainer.pagecontainer('change', '#selector-page', {
                transition: "none"
            });
        }
    } catch (e){
        alert(JSON.stringify(e));
    }
}
function resetAllNavIndicators(){
    $('ul li a.nav_item_featured span').removeClass("nav-active");
    $('ul li a.nav_item_inbox span').removeClass("nav-active");
    $('ul li a.nav_item_saved span').removeClass("nav-active");
    $('ul li a.nav_item_search span').removeClass("nav-active");
    $('ul li a.nav_item_forms span').removeClass("nav-active");
    $('ul li a.nav_item_draft span').removeClass("nav-active");
    $('ul li a.nav_item_submissions span').removeClass("nav-active");
    //nav_item_stats
    $('ul li a.nav_item_stats span').removeClass("nav-active");
}
function showLoginpage(realm_id) {
    if(realm_id){
        privateCtlr.setAsDefaultRealm(realm_id);
    }
    bodyContainer.pagecontainer('change', '#login-page', {
        transition: "none"
    });
    privateCtlr.customiseLoginPage();
}
function navigateToHomePage(){
    if (APPLET_MODE == 'public'){
        createTopChartPage();
    } else {
        bodyContainer.pagecontainer('change', '#form_group_list', {
            transition: "none"
        });
    }
}
function createDashboardPage(specificPage) {
    if (specificPage){
        Activity.reset();
        bodyContainer.pagecontainer('change', '#'+specificPage, {
            transition: "none"
        });
        return;
    }

    $.when(showSliderList())
        .done(function(){
            publicCtlr.showMain('main_page');
            events.subscribe('category.selected', function(data) {
                try {
                    //loader.show('main_page');
                    function aa (){
                        var appletCount = publicCtlr.getAppletCountInGroup(Constants.public.applet_group, data.id);
                        if (appletCount){
                            if(appletCount > 1){
                                var options = {
                                    'category_id'   : data.id,
                                    'category_type' : Constants.public.applet_group
                                };
                                verticalController('applet_list', data.name, 'main_page', options);
                                resetAllNavIndicators();
                                $('ul li a.nav_item_featured span').addClass("nav-active");
                            } else if(appletCount == 1){
                                var appletsIdInCat = publicCtlr.fetchAppletsIDsInConfig(Constants.public.applet_group, data.id);
                                detailsController(appletsIdInCat[0].id, appletsIdInCat[0].name, 'main_page');
                            }
                        } else {
                            showMessage('No Applet in this category');
                        }
                        loader.hide();
                    }
                    aa();
                    //setTimeout(aa, 10);
                } catch (e){
                    Log.e(JSON.stringify(e));
                    showMessage('An error occured and has been reported, kindly try again later');
                }
            });
        })
        .fail(function(){
            showMessage('An error has occured. Please try again later');
        });

    resetAllNavIndicators();
    $('ul li a.nav_item_featured span').addClass("nav-active");
}
function verticalController(source_mode, title, backlink, options){
    try {
        $('#applet-list-placeholder').html();
        $.when(showverticalLists(title, backlink))
            .done(function(){
                if(source_mode == 'favorites') {
                } else if(source_mode == 'applet_list') {
                    publicCtlr.populateAppletList(options.category_id, 'data_lists', options.category_type);
                }
            });
        var aa = events.subscribe('applet.selected', function(data) {
            detailsController(data.id, '','data_lists');
        });
    } catch (e){
        alert(JSON.stringify(e));
        throw new Error(e);
    }
}
function detailsController(id, title, backlink){
    try{
        if(!globals.files.enablePublicDetailView){
            formController(id, backlink);
            return false;
        }
        $.when(showDescription(title, backlink))
            .done(function(){
                publicCtlr.displayAppletDetails(id, 'detail_page', null, backlink);
                events.subscribe('applet.saved', function(data) {
                    try{
                        publicCtlr.saveApplet(data);
                    } catch (e){
                        alert(JSON.stringify(e));
                    }
                });
            });
    } catch(e){
        var errorHtml = '<div class="container-xs-height full-vh">' +
            '<div class="row-xs-height">' +
            '<div class="col-xs-height col-middle">' +
            '<div class="error-container text-center">' +
            '<h1 class="error-number" style="color: grey;">' +
            ':(' +
            '</h1>' +
            '<h4 class="semi-bold" style="color: grey">Well, this is embarrassing.</h4>' +
            '<p class="fs-12 hint-text" style="text-align: center; padding: 0px  10px; text-shadow: none;">An Error has occured. Please try again</p>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $('#description-content-section').html(errorHtml);
        alert(e.message + JSON.stringify(e));
        showMessage('This applet is unavailable at the moment');
        throw new Error('This applet is unavailable at the moment');
    }
}
function formController(id, backlink, mode){
    $.when(publicCtlr.getAppletConfig(id))
        .done(function(data){
            customFunctions.closeNotificationDialog();
            try{
                var configObj = data.applets[id]; // id
                app.initScripts(data);
                if (configObj && configObj.mode && configObj.mode == "form"){
                    app.initDatasets(data);
                    var formValidated = validateConfig(configObj);
                    if  (formValidated.isValid) {
                        customFunctions.displayNotificationDialog('', 'Setting up your Form.');
                        app.initBluetooth();
                        app.constructors.createFormDataEditor(null, id, configObj, backlink,null,null);
                    } else {
                        throw new Error('This applet hasn\'t been configured properly.');
                    }
                } else {
                    app.constructors.createFormDataEditor(null, id, configObj, backlink,null,null);
                }
            } catch (e){
                alert(e.message+": "+ JSON.stringify(e));
                showMessage('An error occured while opening this applet');
                $.mobile.back();
            }
        })
        .fail(function(){
            customFunctions.closeNotificationDialog();
            showMessage('Connection lost. Please try again');
            $.mobile.back();
        });
}
function createTopChartPage() {
    $(document).ready(function() {
        APPLET_MODE = 'public';
        try{
            verticalController('favorites', 'Favorites', null, null);
            publicCtlr.showFavorites('data_lists');
            resetAllNavIndicators();
            $('ul li a.nav_item_saved span').addClass("nav-active");
        }  catch(e){
            alert(JSON.stringify(e));
        }
    });
}
function createSearchPage() {
    var txDeferred  = $.Deferred();
    var globalEndpoint =  globals.files.publicRealmEndpoint;

    var newView     = "search_page";
    var panelName   = 'csvssvvvsdd';

    if ($('#search_page').length) {
        $('#search_page').remove();
    }

    var html = ''+
        '<div data-role="page" id = "'+newView+'" data-id="myPage">' +
            '<div data-role="header" class="bare-header" data-position="fixed" data-tap-toggle="false">' +
                '<div class="form-group form-group-default no-bottom-border">'+
                    '<input type="text" id = "searchBox" class="form-control search-text" placeholder="Start typing. . . "/>'+
                '</div>'+
            '</div>'+
            '<div role="main">'+
                '<div class="row">'+
                    '<div class="col-xs-12 col-sm-12 col-md-12">'+
                        '<div class="card share search" data-social="item" id = "searchResults">'+

                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            app.html_factory.getPublicFooterHTML()+
        '</div>';

    BODY.appends(html).trigger('create');

    bodyContainer.pagecontainer('change', '#search_page', {
        transition: "none"
    });

    $('div.ui-input-text').each(function() {
        var pr = $(this).parent('form-group');
        $(this).children().each(function() {
            pr.appends(this);
        });
        $(this).remove();
    });
    var createErrorHtml =  function(msg){
        return '<div class="container-xs-height full-vh">' +
        '<div class="row-xs-height">'+
        '<div class="col-xs-height col-middle">'+
        '<div class="error-container text-center">'+
        '<h1 class="error-number" style="color: grey;">' +
        ':(' +
        '</h1>'+
        '<h2 class="semi-bold" style="color: grey">Oops</h2>'+
        '<p class="fs-12 hint-text" style="text-align: center; padding: 0px  10px; text-shadow: none;">'+msg+'</p>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';
    };

    $("#searchBox").on('keyup', function(){
        if (!isonline()){
            $('#searchResults').html(createErrorHtml('Kindly connect to the internet and try again.')).trigger('create');
            return false;
        }
        try{
            var searchResults = $('#searchResults');
            if ($(this).val().length < 3){
                searchResults.html('');
                return;
            }
            var searchTermsUrl  = 'https://'+globalEndpoint+'.formelo.com/actions/' + apiVersion + '/applets/terms?q='+$(this).val();
            var tmpListImage    = "img/bg/A.gif";
            var li = '';
            var loadingSuggestionsHtml = '<div class="progress progress-small"><div class="progress-bar-indeterminate"></div></div>';

            searchResults.html(loadingSuggestionsHtml).trigger('create');
            $.when(fetchData(searchTermsUrl, getDeviceInfo()))
                .done(function(data){
                    if (!data || !data.length){
                        searchResults.html('');
                    }
                    for (var i = 0; i < data.length; i++){
                        li +=   '<div class="card-header clearfix searchRecommendaton" applet-id="'+data[i]+'">'+
                                '<h5>'+data[i]+'</h5>'+
                                '</div>';
                    }
                    searchResults.html(li).trigger('create');
                    $('.searchRecommendaton').on('click', function(){
                        try{
                            if (!isonline()) {
                                searchResults.html(createErrorHtml('Results could not be fetched at this time.')).trigger('create');
                                return false;
                            }

                            var searchQuery = $(this).attr('applet-id');
                            var searchAppletUrl = 'https://'+globalEndpoint+'.formelo.com/actions/' + apiVersion + '/applets/config?q='+searchQuery;
                            showMessage('querying:: '+searchAppletUrl);
                            var loadingHtml =   '<div class="container-xs-height full-vh">' +
                                                '<div class="row-xs-height">'+
                                                '<div class="col-xs-height col-middle">'+
                                                '<div class="error-container text-center">'+
                                                '<h1 class="error-number" style="color: grey;">' +
                                                '<div class="progress-circle-indeterminate"></div>' +
                                                '</h1>'+
                                                '</div>'+
                                                '</div>'+
                                                '</div>'+
                                                '</div>';
                            searchResults.html(loadingHtml);
                            adjustHeightsToViewport();
                            $.when(fetchData(searchAppletUrl, getDeviceInfo()))
                                .done(function(data){
                                    var applets = data.applets;
                                    if (!applets || !applets.length){
                                        $('#searchResults').html('');
                                    }
                                    if (data && data.applet_matches && data.applet_matches.length){
                                        var subHtml = '';
                                        for (var i = 0; i < data.applet_matches.length; i++){
                                            var currentId = data.applet_matches[i].id;
                                            var item = applets[currentId];
                                            subHtml +=  '<div animated slideInUp class="card-header clearfix searchResultItem" form-ref="'+item.id+'">'+
                                                            '<div class="user-pic pull-left">'+
                                                                '<img alt="Profile Image" width="33" height="33" data-src-retina="'+item.icon_url+'" data-src="'+item.icon_url+'" src="'+item.icon_url+'">'+
                                                            '</div>'+
                                                            '<div style="margin-left: 40px">'+
                                                                '<h5 style="font-weight:300;">'+item.name+'</h5>'+
                                                                '<h6>'+item.description+'</h6>'+
                                                            '</div>'+
                                                        '</div>';
                                            $('#searchResults').html(subHtml).trigger('create');
                                            $('.searchResultItem').on('click',  function(){
                                                var id = $(this).attr('form-ref');
                                                detailsController(id,'',newView);
                                                resetAllNavIndicators();
                                                $('ul li a.nav_item_search span').addClass("nav-active");
                                            });
                                        }
                                    }
                                })
                                .fail(function(err){
                                    alert(JSON.stringify(err));
                                    //showMessage('An error just occured. Kindly try again');
                                    searchResults.html(createErrorHtml('Results could not be fetched at this time.'));
                                });
                        } catch (e){
                            alert(JSON.stringify(e));
                            //$('#searchResults').html('');
                            showMessage('An error has occured. Kindly try again '+ JSON.stringify(e));
                        }
                    });
                })
                .fail(function(err){
                    searchResults.html(createErrorHtml('Results could not be fetched at this time.'));
                });
        } catch (e){
            alert(JSON.stringify(e));
        }
    });

    app.currentView = newView;
    txDeferred.resolve();

    resetAllNavIndicators();
    $('ul li a.nav_item_search span').addClass("nav-active");

    txDeferred.promise();
}

function openPublicChannel(){
    //return swal("Good job!", "You clicked the button!", "success");
    //$('#modalSlideLeft').modal('show');
    try{
        function aa(){
            APPLET_MODE = 'public';
            Manager.DB.get(Manager.keys.FORM_CONFIG, function(forms){
                if (forms && forms.hasOwnProperty('default_user')){
                    SocketController.connect();
                }
                createDashboardPage();
            });
        }
        validateAccess(aa, function(aa){
            showMessage(aa);
        });
    } catch (e){
        showMessage('An error has occured');
    }
}
function skipRealmSelectionPage(code){
    alert('Skipping realm selection page');

    var currentLSState = Manager.get(Manager.keys.REALMS);
    var result = $.grep(currentLSState, function(e){
        return e.code == code;
    });
    if (result.length){
        alert(JSON.stringify(result));
        window.localStorage.realm_full = JSON.stringify(result[0]);

        if (globals.files.enablePublicDefaultUser){
            skipLoginPage(result[0].code, DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password, DEMO_CREDENTIALS.userId);
            return false;
        } else {
            if(getUserCredentials()){
                $.when(app.revalidateUser())
                    .done(function() {
                        handleLogin(result[0].id);
                    });
            } else {
                showLoginpage(result[0].id);
            }
        }
    } else {
        $('#realm').val(code);
        alert('trigerring click for '+$('#realm').val());
        $('#validateRealm').trigger('click');
    }
}
function skipLoginPage(code, username, password, userId){
    //alert('Skipping login page for '+code);
    var currentLSState = Manager.get(Manager.keys.REALMS);
    var result = $.grep(currentLSState, function(e){
        return e.code.toLowerCase() == code;
    });
    if (result.length){
        //alert(JSON.stringify(result));
        window.localStorage.realm_full = JSON.stringify(result[0]);
        //alert('Current user = '+getUserCredentials().id + ' || Looking for: '+userId);
        //if(getUserCredentials() && getUserCredentials().id == userId){
        //alert('Looking for '+userId+' in '+result[0].id);
        if (Users.setAsCurrentUser(userId, result[0].id)){
            $.when(app.revalidateUser())
                .done(function() {
                    handleLogin(result[0].id);
                });
        } else {
            alert('current user not the user we need: '+userId);
            $('#username').val(username);
            $('#password').val(password);
            $('#login').trigger('click');
        }
    } else {
        throw new Error('realm does not exist');
    }
}
function openPrivateChannel(){
        try {
            APPLET_MODE = 'private';
            if (globals.files.defaultRealm){
                alert('default realm exists: '+globals.files.defaultRealm);
                skipRealmSelectionPage(globals.files.defaultRealm);
                return false;
            }
            bodyContainer.pagecontainer('change', '#realm-page', {
                transition: "none"
            });
            if (getUserCredentials()){
                Users.getLoggedInUserRealms('realm-page', getUserCredentials().id, getUserCredentials().realm);
            } else {
                privateCtlr.displaySavedRealms('realm-page');
            }
            events.subscribe('realm.opened', function(data) {
                if (data.realm.code.toLowerCase().trim() == DEMO_CREDENTIALS.code){
                    skipLoginPage(DEMO_CREDENTIALS.code, DEMO_CREDENTIALS.username, DEMO_CREDENTIALS.password, DEMO_CREDENTIALS.userId);
                    return false;
                } else {
                    window.localStorage.realm_full = JSON.stringify(data.realm);
                    if(getUserCredentials()){
                        $.when(app.revalidateUser())
                            .done(function() {
                                handleLogin(data.realm.id);
                            });
                    } else {
                        showLoginpage(data.realm.id);
                    }
                }
            });
        } catch(e){
            alert(JSON.stringify(e));
            showMessage('An error has occured');
        }
}
function showSettingsPage(){
    var html = ''+

        '<div data-role="page" id = "settings-page">'+
        '<div data-role="header" data-position="fixed" data-tap-toggle="false">' +
        '<a data-rel="back" class="ui-btn-left ui-btn"><i class="pg-arrow_left_line_alt"></i> Back</a>'+
        '</div>'+
        '<div role="main" class="ui-content" data-inset="false">'+
        '<!-- <form>-->'+
        '<div class="row">'+
        '<div class="col-xs-12 col-sm-6 col-md-4">'+
        '<ul data-role="listview" data-icon="false">'+
        '<li class="cool-list">' +
        '<a href="#">'+
        '<h2 style="font-size: small">Logged in as: </h2>' +
        '<p style="font-size: x-small">Daniel Oduonye</p>' +
        '</a>'+
        '</li>'+
        '<li class="cool-list">' +
        '<a href="#">'+
        '<h2 style="font-size: small">Version: </h2>' +
        '<p style="font-size: x-small">2.51</p>' +
        '</a>'+
        '</li>'+
        '<li class="cool-list">' +
        '<a href="#">'+
        '<h2 style="font-size: small">Check for updates </h2>' +
        '</a>'+
        '</li>'+
        '<li class="cool-list">' +
        '<a href="#">'+
        '<h2 style="font-size: small">Logout </h2>' +
        '</a>'+
        '</li>'+
        '</ul>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>';
    BODY.appends(html).trigger('create');

    bodyContainer.pagecontainer('change', '#settings-page', {
        transition: "none"
    });
}
function showverticalLists(title, backlink, _mode, displayMode) {

    var mode = _mode || 'public';
    var footerhtml = '';
    //alert(mode);

    switch (mode){
        case 'browser':
            footerhtml = '';
            break;
        case 'public':
            footerhtml = app.html_factory.getPublicFooterHTML();
            break;
        case 'private':
            footerhtml = app.html_factory.getFooterHTML();
            break;
    }
    var txDeferred = $.Deferred();

    var backIconDirection = backlink ? 'right' : 'left';
    var link = backlink ? backlink : null;
    var linkHtml = backlink ? '<a href="#'+backlink+'" class="ui-btn ui-btn-left header-link"><i class="pg-arrow_left_line_alt"></i> Back</a>' : '';
    linkHtml += (mode == 'browser' || backlink) ? '' : '<a href="#" class="ui-btn ui-btn-'+backIconDirection+' header-link" onclick="gotoCompanySplashScreen()"><img class="home-link" src="img/formelo-icon.png" style="width: 24px;"></a>';
    var formTitle = title || 'formelo';
    $('#data_lists').html('');
    bodyContainer.pagecontainer('change', '#data_lists', {
        transition: "none"
    });
    if (false){//$('#data_lists').length) {
        $('#vertical_header a').remove();
        $('#vertical_header_text').html(title).enhanceWithin();
        $('#vertical_header').appends(linkHtml).enhanceWithin();
        $('.applet-list-placeholder').html('');
        $('#verticalList-intro-image').html('');
        $('#app-footer').remove();
        $('#data_lists').appends(footerhtml);
        $('#data_lists').trigger('create');
    } else {
        var html = ''+
            //'<div data-role="page" id = "data_lists" class = "dashboard" data-id="myPage">' +
            '<div id="vertical_header" data-role="header" class="blue-gradient" data-position="fixed" data-tap-toggle="false">' +
            '<h1 id="vertical_header_text" style="text-align: center !important;">'+title+'</h1>'+
            linkHtml+
            '</div>'+
            '<div role="main">'+
            '<div id="applet-list-placeholder"></div>'+
            '</div>'+
            footerhtml;
            //'</div>';
        $('#data_lists').html(html).trigger('create');
        //BODY.appends(html);//.trigger('create');
    }
    txDeferred.resolve();
    return txDeferred.promise();
}
function showSliderList(){
    var txDeferred = $.Deferred();
    var newView     = "main_page";
    var panelName   = 'dnsdnsasas';
    bodyContainer.pagecontainer('change', '#main_page', {
        transition: "none"
    });
    var main_page = $('#main_page');
    //if (main_page.html().length) {
        main_page.html('');
    //} else {
        var html = ''+
            //'<div data-role="page" id = "main_page" class = "dashboard" data-id="myPage">' +
                '<div data-role="header" id = "main_page_header" data-position="fixed" class="blue-gradient" data-tap-toggle="false" data-hide-during-focus="false">'+
                    '<a class="ui-btn ui-btn-left header-link" onclick="gotoCompanySplashScreen()"><img class="home-link" src="img/formelo-icon.png" style="width: 24px;"></a>'+
                    '<h1 id="xdata-list-header">Explore</h1>'+
                    '<a class="ui-btn ui-btn-right header-link" onclick="showCountries();">'+
                        '<img class="country-link" src="" style="width:32px;">'+
                    '</a>'+
                '</div>'+
                '<div role="main" class="ui-content dashboard" id="slider-list">'+
                    '<div class="refresh-placeholder"></div>'+
                    '<div class="row" id="main_row">'+
                    '</div>'+
                '</div>'+
                app.html_factory.getPublicFooterHTML();
            //'</div>';
            $('#main_page').html(html).trigger('create');
        //BODY.appends(html);//.trigger('create');
    //}

    txDeferred.resolve();
    return txDeferred.promise();
}
function showDescription(title, backlink){
    var txDeferred = $.Deferred();
    var newView     = "detail_page";
    var panelName   = 'csvssvvvsdd';

    var aa = backlink ? 'right' : 'left';
    var bb = backlink ? '<a href="#'+backlink+'" class="ui-btn ui-btn-left"><i class="fa fa-chevron-left"></i></a>' : '';
    bb += '<a class="ui-btn ui-btn-'+backlink+'"><i class="pg-refresh"></i>cc</a>';
    var formTitle = title || 'Please Wait';

    var loadingHtml = '<div class="progress">'+
        '<div class="progress-circle-indeterminate" style="display: block;"></div>'+
        '</div>';

    var element = 'detail_page';
    var ele = $('#'+element);
    ele.html('');
    //if (false) {
    //    ele.html('');
    //}
    bodyContainer.pagecontainer("change", "#detail_page", {transition: "none"});
        var html = ''+
            //'<div data-role="page" id="'+newView+'" data-id="myPage">'+
            '<div data-role="header" class="blue-gradient" data-position="fixed" data-tap-toggle="false">' +
                '<a class="ui-btn ui-btn-left header-link" data-rel="back"><i class="pg-arrow_left_line_alt"></i> Back</a>'+
                '<h1 id="details_heater_text" style="text-align: center !important;">'+formTitle+'</h1>'+
                '<a class="ui-btn ui-btn-right header-link" id = "refreshIndividualConfig">Refresh <i class="pg-refresh"></i></a>'+
            '</div>'+
            '<div role="main" data-inset="false" id="description-content-section" style="padding: 0px;background-color: white">'+
            '</div>'+
            '<div style="height: 40px !important; max-height: 40px !important;" data-position ="fixed" data-tap-toggle="false" data-hide-during-focus="false" data-role="footer" data-position-fixed="true">' +
                '<div style="height: inherit; margin-top: -4px" data-role="navbar">'+
                    '<ul>'+
                        '<li>'+
                        '<a class="nav_item_stats" style="margin-top: -4%; border:none !important;" id="main_detail_favorites">'+
                        '<span class="footer-icon"><i class="fa fa-heart"> </i></span> <p class="footer_p" style="margin-top: -4px; color:grey !important;">Save to Favorites</p></a></li>'+
                        '<li>'+
                        '<a class="nav_item_stats" style="margin-top: -4%; border:none !important; background-color: #00648c !important;" id="main_open_detail" detail_id="">'+
                        '<span class="footer-icon" style="color:white"><i class="pg-arrow_lright_line_alt"> </i></span> <p class="footer_p" style="margin-top: -4px; color:white !important;">Open</p></a></li>'+
                    '</ul>'+
                '</div>'+
            '</div>';
        //BODY.appends('<div data-role="page" id="'+newView+'" data-id="myPage"><div>');
        $('#'+newView).html(html).trigger('create');
    txDeferred.resolve();
    return txDeferred.promise();
}
function getPublicHeaderHtml(_title, _icon, _action, _href, _iconText) {
    var iconText    = _iconText  || '';
    var icon        = _icon      || '';
    var title       = _title     || 'Formelo';
    var action      = _action    || '';
    var href        = _href      || '#';
    var html = '<div id="shared_header" data-role="header" data-position="fixed" class="blue-gradient" data-tap-toggle="false">' +
        '<a class="ui-btn ui-btn-left header-link" onclick="gotoCompanySplashScreen()"><img class="home-link" src="img/formelo-icon.png" style="width: 24px;"></a>'+
        '<h1 class="wow fadeIn" data-wow-delay="0.4s" style="text-align: center !important;">'+title+'</h1>'+
        '<a onclick="'+action+'" href="#'+href+'" class="ui-btn ui-btn-right header-link">'+iconText+' <i class="fa '+icon+'"></i></a>'+
        '</div>';
    return html;
}
function processMessage(data){
    if (data.data){
        window.localStorage.inboxLists = '[]'; //
        DB.helpers.saveToInbox(data.data);
        window.plugins.toast.show('New message!', 'short', 'bottom');
    }
}
function resetData(data){
    try {
        if (data.realms){
            for(var i = 0; i < data.realms.length; i++){
                var realm = data.realms[i];
                privateCtlr.flagRealm(realm.id, realm.reset);
            }
        }
    } catch(e){
        alert(JSON.stringify(e));
    }
}
function addDemoRealm(){
    // Add the demo realm to the list of realms
    var demoRealmConfig = {
        "code": "demo",
        "name": "Formelo Demo ",
        "base_url": "https://demo.formelo.com",
        "description": "",
        "theme": {
            "icon_url": "http://app-cdn.formelo.com/20160131/20/1454271958144-icon_1024x1024.png",
            "is_boxed_layout": false,
            "favicon_url": "https://cdn.formelo.com/20160202/03/1454382670174-icon_512x512.png",
            "logo_url": "https://cdn.formelo.com/20160202/03/1454382641029-logo_398x100_lightbg@2x.png",
            "logo_large_url": "https://cdn.formelo.com/20160202/03/1454382659759-logo_398x100_lightbg@2x.png"
        },
        "id": "d9f3a9a9"
    };

    if (isFirstTime()){
        privateCtlr.saveRealm(demoRealmConfig);
        $('#realm-page').on('pageinit', function(){
            //showMessage('Hold any item to delete it :)');
        });
        window.localStorage.existing_user = true;
    }
}
function showUrl(link){
    cordova.InAppBrowser.open(link, '_blank', 'location=yes');
}
function strip(html) {
    var tmp = $('#testStrip');
    //.html()//document.createElement("DIV");
    tmp[0].innerHTML = html;
    var returnHtml = tmp[0].textContent || tmp[0].innerText || "";
    $('#testStrip').html('');
    return returnHtml;
}
function previewImage(imageElement){
    try {
        var image = $(imageElement).attr('src');
        if (image == "img/camera.png" || image == "img/fingerprint.png" || image == "img/signature.png"){
            return;
        }
        var imageHtml  = '<img id="global-preview-image" src = "'+image+'" xstyle="width:100%" class="col-xs-12 col-sm-12 col-md-12" />';
        showModal('Preview', imageHtml);
    } catch (e){
        alert(JSON.stringify(e));
        showMessage('An error occured...');
    }
}
function isCurrentUserAnAdmin(){
    return getUserCredentials().role.trim().toLowerCase() == 'administrator';
}
var rateApplet = function(appletId){
    // Prepare HTML
    formhtml =  '<div class="form-group form-group-default" style="border-bottom: none !important;">' +
                    '<label for="rating" class = "formelo-form-label">Rating</label>'+
                    '<div id="rating" class="force-rating"></div>'+
                '</div><br/>'+
                '<div class="form-group form-group-default">' +
                    '<label class="formelo-form-label">Add a Review</label>' +
                    '<textarea id="ratingMessage" class="form-control" id="name" placeholder="Write a review here" style="margin-top: 0px; margin-bottom: 0px; height: 185px;"></textarea>'+
                '</div>'+
                '<button id ="sendRating" data-inline="true" type="button" class="btn btn-primary ui-btn-inline">Submit Review</button>';
    var callback = function(){
        $('#rating').raty({
            starType:'img'
        });
    };
    showModal('Rate '+appletId, formhtml, callback);
};
function openSendMessageModal(){
    try {
        var formhtml = '';
        formhtml =  '<div class="form-group form-group-default">' +
                        '<label class="formelo-form-label">Message body</label>' +
                        '<textarea id="messageBody" class="form-control" id="name" placeholder="Write a message" style="margin-top: 0px; margin-bottom: 0px; height: 185px;" aria-invalid="false"></textarea>'+
                    '</div>'+
                    '<button id ="sendMessage" data-inline="true" type="button" class="btn btn-primary ui-btn-inline">Send Message</button>';
        showModal('Contact Admin', formhtml);
        $('#sendMessage').click(function(){
            showMessage('Message has been sent');
            $('#modalSlideLeft').modal('hide');
        });

    } catch (e){
        alert(JSON.stringify(e));
    }
}
function showRating(){
    AppRate.preferences.storeAppURL.ios = '<my_app_id>';
    AppRate.preferences.storeAppURL.android = 'market://details?id=<package_name>';
    AppRate.preferences.storeAppURL.blackberry = 'appworld://content/[App Id]/';
    AppRate.preferences.storeAppURL.windows8 = 'ms-windows-store:Review?name=<the Package Family Name of the application>';
    AppRate.promptForRating();
}
function editProfile(){
    var endPoint = getEndpoint()+'api/users/'+getUserCredentials().id+'.json';
    $('#profile_first_name').val(getUserCredentials().first_name);
    //$('#profile_user_name').val(getUserCredentials().username);
    $('#profile_email_address').val(getUserCredentials().email_address);
    bodyContainer.pagecontainer("change", "#edit-profile-page", {transition: "none"});

    $('#editProfileButton').click(function(){
        var data = {
            id                  : getUserCredentials().id,
            //username            : $('#profile_user_name').val(),
            email_address       : $('#profile_email_address').val(),
            first_name          : $('#profile_first_name').val(),
            phone_number_one    : $('#profile_phone_number').val()
        };
        var headers = {
            "Authorization": "Basic " + btoa(getUserCredentials().username + ":" + getUserCredentials().api_key)
        };

        customFunctions.displayNotificationDialog('Saving your profile');
        $.when(fetchData(endPoint, data,'PUT', headers))
            .done(function(data){
                customFunctions.closeNotificationDialog();
                alert(JSON.stringify(data));
            }).fail(function(){
                customFunctions.closeNotificationDialog();
                showMessage('An error occured. Please try again later :(');
            });
    });
}
function inviteUser(){
    var endpoint = getEndpoint()+'/actions/'+apiVersion+'/applets/invite';
    var inputElement = '<input class="xcustom-tag-input" data-role="tagsinput" id="invite-tag"/>';
    $('#invite-placeholder').html(inputElement).trigger('refresh');
    bodyContainer.pagecontainer("change", "#invite-page", {transition: "none"});
    var elt = $('#invite-tag');
    //elt.tagsinput({
    //    itemValue: 'value',
    //    itemText: 'text'
    //});
    elt.tagsinput('refresh');

    adjustHeightsToViewport();
    $('#invite-button').click(function(){
        var emailObjs = $('#invite-tag').tagsinput('items');
        alert(JSON.stringify(emailObjs));
        $('#invite-loading-item').html('<div class="progress-circle-indeterminate"></div>');
        $.when(fetchData(endpoint, emailObjs, 'POST'))
            .done(function(){
                $('#invite-loading-item').html('');
                showMessage('Your contacts has been invited');
                $.mobile.back();
            })
            .fail(function(){
                $('#invite-loading-item').html('');
                showMessage('Something went wrong. Please try again');
                //$.mobile.back();
            });
    });
    $('#launch-contacts').click(function(){
        try {
            navigator.contacts.pickContact(function(contact){
                if (contact && contact.phoneNumbers && contact.phoneNumbers.length){
                    var phone_number = contact.phoneNumbers[0].value;//displayName
                    if (phone_number){
                        elt.tagsinput('add',phone_number);
                    } else {
                        showMessage('Phone number not attached to this contact');
                    }
                } else {
                    showMessage('Phone number not supplied');
                }
            },function(err){
                alert('Error- ' + err);
                showMessage('An error occured. Please try again.');
            });
        } catch(e){
            alert(e.message);
            showMessage('An error has occured. Please try again');
        }
    });
}

function showModal(_title, _body, _openingCallBack, _closingCallback){
    var title   = _title || 'Untitled';
    var body    = _body  || '';
    var openingCallback     = _openingCallBack || function(){};
    var closingCallback     = _closingCallback || function(){};
    var previewMain     = $('#preview-main');
    var previewTitle    = $('#preview-title');
    previewMain.html(body);
    previewTitle.html(title).trigger('refresh');
    bodyContainer.pagecontainer('change', '#preview', {
        transition: "none"
    });
    openingCallback();
    $('#preview-close').click(function(){
        closingCallback();
        previewMain.html('');
        $.mobile.back();
        BODY.trigger('refresh');
        adjustHeightsToViewport();
    });
    adjustHeightsToViewport();
}

function rgbToHex(r, g, b) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var openModal = function(title, body, type){
    var title = title || '';
    var body = body || '';
    var type = type || '';
    $('#formeloModal').remove();
    var html = '<div class="modal fade stick-up in" id="formeloModal" tabindex="-1" role="dialog" aria-hidden="false" style="display: block; overflow:scroll;>'+
        '<div class="modal-dialog modal-sm">'+
        '<div class="modal-content-wrapper">'+
        '<div class="modal-content">'+
        '<br/>'+
        '<div class="container-xs-height full-height">'+
        '<div class="row-xs-height">'+
        '<div class="modal-body col-xs-height col-middle xtext-center" style="padding: 6px;">'+
        '<h5 class="" style="text-align: center"><span class="semi-bold">'+title+'</span><span class="close-modal" data-dismiss="modal" style="float:right;'+
        'margin-right: 10px; color:grey;"><i class="fa fa-close"></i></span></h5>'+
            body+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '</div>'+
        '<!-- /.modal-content -->'+
        '</div>'+
        '<!-- /.modal-dialog -->'+
        '</div>';
    $('body').append(html);
    $('#formeloModal').modal();
    $('.close-modal').click(function(){
        $('#formeloModal').modal('hide');//.remove();
    });
    return {
        close : function(){
            $('#formeloModal').modal('hide');//.remove();
        }
    }
};

var optionsAdapter = function (items, placeholder) {
    if (!items) throw new Error('Item not specified'); // I am going home now
    var html = '<div class="row">';
    var identifier = str_random(20);
    items.forEach(function (item) {
        var defaults = {
            name: '',
            description: '',
            time: '',
            image: '',
            unique: ''
        };
        var defaultItem = $.extend({}, defaults, item);
        html +=    '<div class="col-xs-4 ' + identifier + '" unique = "' + defaultItem.unique + '">'+
                        '<img class = "donkeyCache" donkey-id="'+defaultItem.image+'" data-src-retina="' + defaultItem.image + '" data-src="' + defaultItem.image + '" src="' + defaultItem.image + '" style="width: 100%;border-radius: 50%;">'+
                        '<p style="text-align: center; font-weight: 400; color: #2c3e50;">' + defaultItem.name + '</p>'+
                    '</div>';
    });
    html += '</div>';
    return {
        attach: function (callback) {
            $(placeholder).html(html);
            //DonkeyCache.grab();
            $(placeholder).find('.' + identifier).click(function () {
                var unique = $(this).attr('unique');
                if (unique) {
                    if (callback) {
                        callback(unique);
                    }
                }
            });
        }
    };
};
