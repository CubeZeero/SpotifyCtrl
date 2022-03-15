## APIキー取得

まず初めに[Spotify For Developers](https://developer.spotify.com/dashboard/login)へアクセスし **Login** からログインしてください。

<img height="360px" width="640px" src="../img/02_api/01.jpg">

ログイン完了後ダッシュボードから **My New App** を選択し新しいアプリケーション用APIキーを作成します。

<img height="360px" width="640px" src="../img/02_api/02.jpg">

**CREATE AN APP** ダイアログが開かれるので **App name** と **App description** を設定します。

この設定はお好みの設定で構いません。

<img height="360px" width="640px" src="../img/02_api/03.jpg">

利用規約に同意し **CREATE** をクリックしたら以下のようなオーバービューが開かれるので **EDIT SETTING** を開きます。

<img height="360px" width="640px" src="../img/02_api/04.jpg">

**Redirect URIs** に以下のURLを入力し **ADD** をクリックしてください。

    http://localhost:18647/callback
    
<img height="360px" width="640px" src="../img/02_api/05.jpg">

追加したら下までスクロールし **SAVE** で設定を保存します。

<img height="360px" width="640px" src="../img/02_api/06.jpg">

次にページ左上にある **Client ID** と **Client Secret** をプラグインに追加します。

それぞれプラグイン側に入力してください。

<img height="360px" width="640px" src="../img/03_plugin/01.jpg">

<img src="../img/03_plugin/02.jpg">

プラグイン側のOKボタンをクリックするとブラウザで認証画面が表示されるので、承認して設定完了です。
