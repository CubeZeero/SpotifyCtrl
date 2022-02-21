## FAQ

### AfterEffects以外のアプリケーションでも使用できるか

AfterEffects以外のAdobeアプリケーションで IllustratorとPhotoshopに対応していますが、AfterEffects向けに設計されています。

AE以外での完全な動作は保証できません。

また初期のAPI設定はAfterEffects上で行ってください

<br>

### リダイレクトURIは変更可能か

可能です。SpotifyCtrlを一度起動した後、ドキュメントフォルダに作成された「SpotifyCtrl」フォルダ内にある「general_data.json」内のREDIRECT_URIを変更してください。

URIは決められた形式で設定してください。

例えばポート番号を`50000`に設定する場合以下のような形式で保存してください。

    $http://localhost:50000/callback
    
<br>

### 設定は共有されているか

設定は全アプリケーションで共有されています

個々で設定を保存することは出来ません。
