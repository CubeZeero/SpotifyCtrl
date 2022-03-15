(async function () {
    'use strict';

    let csInterface = new CSInterface();
    let current_path_raw = csInterface.getSystemPath(SystemPath.MY_DOCUMENTS);
    let current_path = current_path_raw + '/SpotifyCtrl';

    const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    document.oncontextmenu = function () {return false;}

    themeManager.init();
    
    const fs = require('fs');
    const SpotifyWebApi = require('spotify-web-api-node');
    const express = require('express');
    const app = express();
    const download = require('download');

    if(!fs.existsSync(current_path)){
        window.cep.fs.makedir(current_path);
    }

    if(!fs.existsSync(current_path + '/api_data')){
        window.cep.fs.makedir(current_path + '/api_data');
    }

    const volume_slider_ele = document.getElementById('ctrl_slider_volume');

    let flyoutmenu_xml = [
        '<Menu>\n',
            '<MenuItem Id="id_use_slider" Label="Use volume slider" Enabled="true" Checked="false"/>\n',
            '<MenuItem Id="id_status_sync" Label="Sync status" Enabled="true" Checked="false"/>\n',
            '<MenuItem Id="id_api_reset" Label="API Reset" Enabled="true" Checked="false"/>\n',
            '<MenuItem Label="---" />\n',
            '<MenuItem Id="id_open_preference" Label="Preference" Enabled="true" Checked="false"/>\n',
            '<MenuItem Id="id_open_about" Label="About" Enabled="true" Checked="false"/>\n',
        '</Menu>\n'
    ].join('')

    csInterface.setPanelFlyoutMenu(flyoutmenu_xml);
    csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuClickedHandler);
    csInterface.addEventListener('com.cubezeero.spotifyctrl.preference', get_preference_data);

    var spotifyApi;

    let clientId;
    let clientSecret;
    let redirectUri;

    let api_state = 'SPOTIFY_CTRL_SCRIPT_ADOBE_CEP';
    let api_scopes = ['user-read-playback-state', 'user-modify-playback-state'];

    let spotify_access_token;
    let spotify_refresh_token;

    let spotify_status_isplaying;
    let spotify_status_volume;
    let spotify_status_repeat;
    let spotify_status_shuffle;

    let spotify_status_volume_step = 10;
    let spotify_status_volume_mute;

    let spotify_track_name;
    let spotify_track_url;
    let spotify_artwork_url;
    let spotify_artists_name;
    let spotify_album_name;
    let spotify_track_info;

    let slider_use_check = false;

    csInterface.updatePanelMenuItem("Use volume slider", slider_use_check, false);

    async function get_preference_data(event){

        spotify_status_volume_step = event.data.volume_step

        var general_data_init = {
            'USE_VOLUME': slider_use_check,
            'VOLUME_STEP': spotify_status_volume_step,
            'REDIRECT_URI': redirectUri
        }

        await window.cep.fs.writeFile(current_path + '/general_data.json', JSON.stringify(general_data_init));
    }

    async function flyoutMenuClickedHandler(event) {
        
        switch (event.data.menuId){

            case 'id_use_slider':
                slider_use_check = !slider_use_check;
                csInterface.updatePanelMenuItem("Use volume slider", true, slider_use_check);
                if(slider_use_check){
                    $('.ctrl_slider_volume_div').show();
                }else{
                    $('.ctrl_slider_volume_div').hide();
                }

                var general_data_init = {
                    'USE_VOLUME': slider_use_check,
                    'VOLUME_STEP': spotify_status_volume_step,
                    'REDIRECT_URI': redirectUri
                }
        
                window.cep.fs.writeFile(current_path + '/general_data.json', JSON.stringify(general_data_init));
                break;

            case 'id_status_sync':
                await get_spotifyStatus();
                player_sync();
                break;
            
            case 'id_api_reset':
                var result = window.confirm('Do you want to reset the API setting?');
                if(result){
                    window.cep.fs.deleteFile(current_path + '/api_data/api_data.json');
                    alert('Restart the plugin or the application you are using.');
                }
                break;
            
            case 'id_open_preference':
                csInterface.requestOpenExtension('com.cubezeero.spotifyctrl.preference','');
                break;

            case 'id_open_about':
                csInterface.requestOpenExtension('com.cubezeero.spotifyctrl.about','');
                break;
                
        }
    }

    async function apiForm(){
        
        await $("#api_form_button").click(async function () {
            clientId = $('#input_client_id').val();
            clientSecret = $('#input_client_secret').val();
            await spotifyOauth();

        });

        await $("#howtouse_button").click(async function () {
            window.cep.util.openURLInDefaultBrowser('https://github.com/CubeZeero/SpotifyCtrl')

        });
        
    }

    async function setAccessToken_from_json(){

        var api_data = await window.cep.fs.readFile(current_path + '/api_data/api_data.json');
        api_data = JSON.parse(api_data.data);

        clientId = api_data.CLIENT_ID;
        clientSecret = api_data.CLIENT_SECRET;
        redirectUri = api_data.REDIRECT_URI;

        spotifyApi = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: redirectUri
        });

        var token_data = await window.cep.fs.readFile(current_path + '/api_data/token_data.json');
        token_data = JSON.parse(token_data.data);

        spotify_access_token = token_data.ACCESS_TOKEN;
        spotify_refresh_token = token_data.REFRESH_TOKEN;
        
        await spotifyApi.setAccessToken(spotify_access_token);
        await spotifyApi.setRefreshToken(spotify_refresh_token);

    }

    async function getGeneraldata(){
        var general_data = await window.cep.fs.readFile(current_path + '/general_data.json');
        general_data = JSON.parse(general_data.data);

        slider_use_check = general_data.USE_VOLUME;
        spotify_status_volume_step = general_data.VOLUME_STEP;
        redirectUri = general_data.REDIRECT_URI;

        if(slider_use_check){
            $('.ctrl_slider_volume_div').show();
        }else{
            $('.ctrl_slider_volume_div').hide();
        }

        csInterface.updatePanelMenuItem("Use volume slider", true, slider_use_check);
    }
    
    async function spotifyOauth(){

        var result_oath;
        
        if(clientId != '' && clientSecret != ''){
            
            spotifyApi = new SpotifyWebApi({
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri
            });

            var authorizeURL = spotifyApi.createAuthorizeURL(api_scopes, api_state);

            window.cep.util.openURLInDefaultBrowser(authorizeURL)

            var callback_server = app.listen(parseInt(redirectUri.replace('http://localhost:','').replace('/callback','')));

            await app.get('/callback', async function(req, res) {

                var code  = req.query.code;
                var state = req.query.state;

                try{
                    var data = await spotifyApi.authorizationCodeGrant(code);

                    spotify_access_token = data.body.access_token;
                    spotify_refresh_token = data.body.refresh_token;

                    var apidatainit = {
                        'ACCESS_TOKEN': spotify_access_token,
                        'REFRESH_TOKEN': spotify_refresh_token,
                    }
                    await window.cep.fs.writeFile(current_path + '/api_data/token_data.json', JSON.stringify(apidatainit));

                    spotifyApi.setAccessToken(spotify_access_token);
                    spotifyApi.setRefreshToken(spotify_refresh_token);

                    result_oath = "OK";

                    var apidatainit = {
                        'CLIENT_ID': clientId,
                        'CLIENT_SECRET': clientSecret,
                        'REDIRECT_URI': redirectUri
                    }

                    await window.cep.fs.writeFile(current_path + '/api_data/api_data.json', JSON.stringify(apidatainit));

                    $('.api_form').hide();
                    $('.btn_content').show();

                    await get_spotifyStatus();

                    csInterface.updatePanelMenuItem("Use volume slider", true, false);
                    csInterface.updatePanelMenuItem("Sync status", true, false);
                    csInterface.updatePanelMenuItem("API Reset", true, false);
                    csInterface.updatePanelMenuItem("Preference", true, false);

                    slider_use_check = false;
                    player_sync();
                    
                }catch(err){
                    result_oath = err.code + err.message;
                    alert(result_oath);
                }

                res.send("<script>window.close();</script > ")
                res.end();

            });

            //callback_server.close();

        }else{
            csInterface.evalScript("alertMsg('Please enter a valid key.')");
        }

        return result_oath;
    }

    async function replay_status(){
        var data = await spotifyApi.getMyDevices();
        var device_id_data = data.body.devices[0].id;

        var replay_body = {
            device_ids: [
                device_id_data
            ]
        }

        var replay_res = await fetch('https://api.spotify.com/v1/me/player/', {
            method: "PUT",
            headers: { "Authorization": "Bearer " + spotify_access_token},
            body: JSON.stringify(replay_body)
        })

    }

    async function get_spotifyStatus(){

        try{
            var data = await spotifyApi.getMyCurrentPlaybackState();

            spotify_status_isplaying = data.body.is_playing;
            spotify_status_volume = data.body.device.volume_percent;
            spotify_status_repeat = data.body.repeat_state;
            spotify_status_shuffle = data.body.shuffle_state;

        }catch(err){

            var errMsg = String(err);

            if(errMsg.includes('The access token expired.')){
                var token_data = await spotifyApi.refreshAccessToken();
                
                spotify_access_token = token_data.body.access_token;

                await spotifyApi.setAccessToken(spotify_access_token);

                var apidatainit = {
                    'ACCESS_TOKEN': spotify_access_token,
                    'REFRESH_TOKEN': spotify_refresh_token,
                }

                await window.cep.fs.writeFile(current_path + '/api_data/token_data.json', JSON.stringify(apidatainit));

            }

            await replay_status();

            var data = await spotifyApi.getMyCurrentPlaybackState();
            
            spotify_status_isplaying = data.body.is_playing;
            spotify_status_volume = data.body.device.volume_percent;
            spotify_status_repeat = data.body.repeat_state;
            spotify_status_shuffle = data.body.shuffle_state;
        }
    }

    function player_sync(){

        switch (spotify_status_isplaying){
            case true:
                $('#btn_playpause_img').attr('src','img/btn_icon/icon_pause.png');
                break;

            case false:
                $('#btn_playpause_img').attr('src','img/btn_icon/icon_play.png');
                break;
        }

        switch (spotify_status_repeat){
            case 'off':
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_off.png');
                break;

            case 'context':
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_track.png');
                break;

            case 'track':
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_context.png');
                break;
        }

        switch (spotify_status_shuffle){
            case true:
            $('#btn_shuffle_img').attr('src','img/btn_icon/icon_shuffle_on.png');
            break;

            case false:
            $('#btn_shuffle_img').attr('src','img/btn_icon/icon_shuffle_off.png');
            break;
        }

        volume_slider_ele.value = spotify_status_volume;
        
    }
    
    async function mainFunction(){
                
        
        $("#btn_playpause").click(function () {
            
            var img_attr = $('#btn_playpause_img').attr('src');

            if (img_attr == 'img/btn_icon/icon_pause.png'){
                $('#btn_playpause_img').attr('src','img/btn_icon/icon_play.png');
                spotifyApi.pause().then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }

            if (img_attr == 'img/btn_icon/icon_play.png'){
                $('#btn_playpause_img').attr('src','img/btn_icon/icon_pause.png');
                spotifyApi.play().then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
        });

        $("#btn_next").click(function () {

            spotifyApi.skipToNext().then(function() {
            }, async function(err) {
                await replay_status();
            });
        });

        $("#btn_prev").click(function () {

            spotifyApi.skipToPrevious().then(function() {
            }, async function(err) {
                await replay_status();
            });
        });

        $("#btn_shuffle").click(function () {
            
            var img_attr = $('#btn_shuffle_img').attr('src');

            if (img_attr == 'img/btn_icon/icon_shuffle_off.png'){
                $('#btn_shuffle_img').attr('src','img/btn_icon/icon_shuffle_on.png');
                spotifyApi.setShuffle(true).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }

            if (img_attr == 'img/btn_icon/icon_shuffle_on.png'){
                $('#btn_shuffle_img').attr('src','img/btn_icon/icon_shuffle_off.png');
                spotifyApi.setShuffle(false).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
        });

        $("#btn_repeat").click(function () {
            
            var img_attr = $('#btn_repeat_img').attr('src');

            if (img_attr == 'img/btn_icon/icon_repeat_off.png'){
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_track.png');
                spotifyApi.setRepeat('context').then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }

            if (img_attr == 'img/btn_icon/icon_repeat_track.png'){
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_context.png');
                spotifyApi.setRepeat('track').then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }

            if (img_attr == 'img/btn_icon/icon_repeat_context.png'){
                $('#btn_repeat_img').attr('src','img/btn_icon/icon_repeat_off.png');
                spotifyApi.setRepeat('off').then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
        });

        $("#btn_vlmp").click(function () {
            
            var img_attr = $('#btn_mute_img').attr('src');

            if(spotify_status_volume < 100){

                if (img_attr == 'img/btn_icon/icon_mute_on.png'){
                    spotify_status_volume = 0 + spotify_status_volume_step;
                    volume_slider_ele.value = spotify_status_volume;
                    $('#btn_mute_img').attr('src','img/btn_icon/icon_mute_off.png');

                }else{
                    if(spotify_status_volume > (100 - spotify_status_volume_step)){
                        spotify_status_volume = 100;
                        volume_slider_ele.value = spotify_status_volume;
                    }else{
                        spotify_status_volume += spotify_status_volume_step;
                        volume_slider_ele.value = spotify_status_volume;
                    }
                }

                spotifyApi.setVolume(spotify_status_volume).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
            
        });

        $("#btn_vlmm").click(function () {

            var img_attr = $('#btn_mute_img').attr('src');

            if(spotify_status_volume > 0 && img_attr == 'img/btn_icon/icon_mute_off.png'){

                if(spotify_status_volume < spotify_status_volume_step){
                    spotify_status_volume = 0;
                    volume_slider_ele.value = spotify_status_volume;
                }else{
                    spotify_status_volume -= spotify_status_volume_step;
                    volume_slider_ele.value = spotify_status_volume;
                }

                spotifyApi.setVolume(spotify_status_volume).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
            
        });

        $("#btn_mute").click(function () {

            var img_attr = $('#btn_mute_img').attr('src');

            if (img_attr == 'img/btn_icon/icon_mute_off.png'){
                $('#btn_mute_img').attr('src','img/btn_icon/icon_mute_on.png');
                volume_slider_ele.value = 0;
                spotify_status_volume_mute = spotify_status_volume;

                spotifyApi.setVolume(0).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }else{
                $('#btn_mute_img').attr('src','img/btn_icon/icon_mute_off.png');
                volume_slider_ele.value = spotify_status_volume_mute;
                spotifyApi.setVolume(spotify_status_volume_mute).then(function() {
                }, async function(err) {
                    await replay_status();
                });
            }
            
        });

        $("#btn_track_info").click(function () {
        
            spotifyApi.getMyCurrentPlayingTrack().then(async function(data) {

                if(!data.body.item.is_local){

                    if (spotify_artwork_url != data.body.item.album.images[0].url){

                        spotify_artists_name = "";

                        spotify_track_name = data.body.item.name;
                        spotify_album_name = data.body.item.album.name;
                        spotify_artwork_url = data.body.item.album.images[0].url;

                        spotify_track_url = data.body.item.external_urls.spotify;

                        var spotify_artists_item = data.body.item.artists;

                        await download(spotify_artwork_url,current_path,undefined,false,'artwork_original')

                        window.cep.fs.deleteFile(current_path + '/artwork_original.jpg');

                        window.cep.fs.rename(current_path + '/' + spotify_artwork_url.replace('https://i.scdn.co/image/','') + '.jpg', current_path + '/artwork_original.jpg')

                        for(var i=0; i<spotify_artists_item.length; i++){
                            if(i == (spotify_artists_item.length-1)){
                                spotify_artists_name = spotify_artists_name + spotify_artists_item[i].name;
                            }else{
                                spotify_artists_name = spotify_artists_name + spotify_artists_item[i].name + ' / ';
                            }
                        }

                        spotify_track_info = {
                            'TRACK': spotify_track_name,
                            'ALBUM': spotify_album_name,
                            'ARTIST': spotify_artists_name,
                            'URL': spotify_track_url
                        }

                        await window.cep.fs.writeFile(current_path + '/track_data.json', JSON.stringify(spotify_track_info));

                        _sleep(300);

                    }

                    csInterface.requestOpenExtension('com.cubezeero.spotifyctrl.trackinfo','');

                    spotify_artists_name = '';

                }else{
                    csInterface.evalScript("alertMsg('The music information cannot be displayed because it is a local file.')");
                }

            }, async function(err) {
                await replay_status();
            });
            
        });

        volume_slider_ele.addEventListener('change', function(){

            spotify_status_volume = parseInt(volume_slider_ele.value, 10);
	    
            spotifyApi.setVolume(volume_slider_ele.value).then(function() {
            }, async function(err) {
                await replay_status();
            });
        });
        
    }

    if(fs.existsSync(current_path + '/api_data/api_data.json')){
        $('.api_form').hide();
        await setAccessToken_from_json();
        await getGeneraldata();
        await get_spotifyStatus();
        player_sync();

    }else{
        if(!fs.existsSync(current_path + '/general_data.json')){
            var general_data_init = {
                'USE_VOLUME': false,
                'VOLUME_STEP': 10,
                'REDIRECT_URI': 'http://localhost:18647/callback'
            }
            await window.cep.fs.writeFile(current_path + '/general_data.json', JSON.stringify(general_data_init));
        }
        
        await getGeneraldata();

        csInterface.updatePanelMenuItem("Use volume slider", false, false);
        csInterface.updatePanelMenuItem("Sync status", false, false);
        csInterface.updatePanelMenuItem("API Reset", false, false);
        csInterface.updatePanelMenuItem("Preference", false, false);

        $('.btn_content').hide();
        $('.ctrl_slider_volume_div').hide();
        await apiForm();
    }
    
    mainFunction();

}());
    
