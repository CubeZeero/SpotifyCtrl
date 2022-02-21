## FAQ

### Can it be used in applications other than After Effects?

It supports Adobe applications other than After Effects, including Illustrator and Photoshop, but it is designed for After Effects.

We cannot guarantee that it will work perfectly on non-AE applications.

The initial API settings should be made in After Effects.

<br>

### Can the redirect URI be changed?

Yes. You can do this by running SpotifyCtrl once and then changing the REDIRECT_URI in the "general_data.json" file in the "SpotifyCtrl" folder created in the document folder.

The URI should be set in a predetermined format.

For example, if you want to set the port number to `50000`, save the file in the following format.

    http://localhost:50000/callback
    
<br>

### Are the settings shared?

Settings are shared by all applications.

It is not possible to save settings individually.
