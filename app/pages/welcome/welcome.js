(function(){
    'use strict';
    formelo.event().onCreate(function(){
        // Entry point of this application
        $('#game-link').click(function(){
            formelo.navigation().openActivity('game');
        });
    });

    formelo.event().onIntent(function(params){
        var data = params.detail;
        // Receive parameters from calling page
    });

    formelo.event().onClose(function(){
        // Override close button
        // formelo.navigation.stopPropagation()
    });
}());