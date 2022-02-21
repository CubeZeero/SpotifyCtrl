## APIキー取得

まず初めに[Spotify For Developers](https://developer.spotify.com/dashboard/login)へアクセスし **Login** からログインしてください。

<img height="360px" width="640px" src="../img/02_api/01.jpg">

After logging in, select **My New App** from the dashboard to create an API key for your new application.

<img height="360px" width="640px" src="../img/02_api/02.jpg">

**CREATE AN APP** dialog will open, set **App name** and **App description**.

This setting can be set to your preference.

<img height="360px" width="640px" src="../img/02_api/03.jpg">

After agreeing to the terms of use and clicking **CREATE**, the following over view will be opened, and you can open **EDIT SETTING**.

<img height="360px" width="640px" src="../img/02_api/04.jpg">

Enter the following URL in **Redirect URIs** and click **ADD**.

    http://localhost:18647/callback
    
<img height="360px" width="640px" src="../img/02_api/05.jpg">

After adding the settings, scroll down to the bottom and click **SAVE** to save the settings.

<img height="360px" width="640px" src="../img/02_api/06.jpg">

Next, add the **Client ID** and **Client Secret** in the upper left corner of the page to the plugin.

Each of these should be entered on the plugin side.

<img height="360px" width="640px" src="../img/03_plugin/01.jpg">

<img src="../img/03_plugin/02.jpg">

When you click the OK button on the plugin side, an authentication screen will appear in your browser, and you can approve the settings.
