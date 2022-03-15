(function () {
    'use strict';

    var csInterface = new CSInterface();
    var current_path = csInterface.getSystemPath(SystemPath.MY_DOCUMENTS) + '/SpotifyCtrl';

    document.oncontextmenu = function () {return false;}

    const fs = require('fs');

    let track_data = window.cep.fs.readFile(current_path + '/track_data.json');
    track_data = JSON.parse(track_data.data);

    let track_name = track_data.TRACK;
    let artists_name = track_data.ARTIST;
    let album_name = track_data.ALBUM;
    let track_url = track_data.URL;

    let track_info_display = [
        'Track: ' + track_name + '\n',
        'Album: ' + album_name + '\n',
        'Artist: ' + artists_name + '\n'
    ].join('')

    $('#artwork_img').attr('src',current_path + '/artwork_original.jpg');

    $("#trackname_span").text('Track: ' + track_name);
    $("#albumname_span").text('Album: ' + album_name);
    $("#artistname_span").text('Artist: ' + artists_name);

    $("#url_span").hide();
    $("#url_span").text(track_url);

    themeManager.init();

    function trackinfo_main() {

        $("#ok_button").click(function () {
            csInterface.closeExtension()
        });

        $("#url_button").click(function () {
            window.cep.util.openURLInDefaultBrowser(track_url)
        });
    }

    trackinfo_main();

}());