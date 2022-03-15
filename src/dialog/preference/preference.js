(function () {
    'use strict';

    var csInterface = new CSInterface();
    var current_path = csInterface.getSystemPath(SystemPath.MY_DOCUMENTS) + '/SpotifyCtrl';

    document.oncontextmenu = function () {return false;}

    themeManager.init();

    let send_event_data = new CSEvent('com.cubezeero.spotifyctrl.preference', 'APPLICATION')

    var general_data = window.cep.fs.readFile(current_path + '/general_data.json');
    general_data = JSON.parse(general_data.data);
    
    $('#volume_step_spin').attr('value',String(general_data.VOLUME_STEP));

    function preference_main() {

        $("#ok_button").click(function () {

            var volume_step = $('#volume_step_spin').val();

            if(parseInt(volume_step, 10)>=5 && parseInt(volume_step, 10)<=50){
                var send_data = {
                    'volume_step': parseInt(volume_step, 10)
                }
    
                send_event_data.data = send_data
    
                csInterface.dispatchEvent(send_event_data)
                csInterface.closeExtension()
            }else{
                csInterface.evalScript("alertMsg('The value should be set between 5 and 50')");
                //alert('The value should be set between 5 and 50')
            }
        });

        $("#close_button").click(function () {
            csInterface.closeExtension()
        });
    }

    preference_main();

}());