(function () {
    'use strict';

    var csInterface = new CSInterface();
    var current_path = csInterface.getSystemPath(SystemPath.MY_DOCUMENTS) + '/SpotifyCtrl';

    document.oncontextmenu = function () {return false;}

    themeManager.init();

    function about_main() {

        $("#ok_button").click(function () {
            csInterface.closeExtension()
        });

        $("#userpage").click(function () {
            window.cep.util.openURLInDefaultBrowser('http://cubezeero.com/')
        });
    }

    about_main();

}());