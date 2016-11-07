(function() {

    var config = {};
    /*
    *  Load properties to this class
    *  config.findAll = function(){
    *      // Do stuff
    *  }
    */
    config.store = {
       name : null
    };
    config.keys = {
        clientID : null,
        clientSecret : null,
        xclientID : '14nNKisLLvQ65xGrdWTLXnbDw2k09NpVNxARscrMEC',
        xclientSecret : 'bGLJchUtx3gSXVcqUDaiV7KIyFFSIlBv3gjtUcYhl9'
    };
    config.isAdmin = false;
    config.getStoreEndpoint = function(){
        return config.inProductionMode() ? "http://abc191a7.ngrok.io/api/" : "http://localhost:8000/api/";
    };
    config.inProductionMode = function(){
        return true;
    };
    config.isFirstTime = function(){
        return false;
    };
    config.network = function(endpoint, _data, _method){
        var data    = _data      || {};
        var method  = _method    || 'GET';
        var txDeferred = $.Deferred();
        $.ajax({
            url : endpoint,
            type : method,
            data : data,
            cache: false,
            success : function(data){
                txDeferred.resolve(data);
            },
            error: function(xhr){
                console.log(xhr);
                txDeferred.reject(xhr);
            },
            timeout: TIMEOUT
        });
        return txDeferred.promise();
    };
    config.isAppletExist = function(appletID, successCB, errorCB){
        var url = config.getStoreEndpoint()+"applet/"+appletID+'/';
        config.network(url, {}, 'GET')
            .done(function(data){
                successCB(data);
            })
            .fail(function(err){
                errorCB(err);
            });
    };
    config.registerApplet = function(data, successCB, errorCB){
        var url = config.getStoreEndpoint()+"applet/create";
        config.network(url, data, 'POST')
            .done(function(data){
                successCB(data);
            })
            .fail(function(err){
                errorCB(err);
            });
    };
    config.appletID = "moltin";
    config.inPrivateMode = function(){
        // TODO Change this
        return false;
        return formelo.getMode() == "private";
    };
    formelo.exports('config', config);
})();