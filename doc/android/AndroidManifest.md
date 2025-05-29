# AndroidManifest.xml – Estrutura e Permissões da Aplicação Android

Arquivo essencial para toda aplicação Android. Define permissões, configurações de `application`, `activity` principal e recursos exigidos pelo app.

---

## Permissões Necessárias

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
````

* **INTERNET**: Necessária para APIs, upload de dados e bundler.
* **CAMERA**: Obrigatória para selfies, documentos e biometria (requer permissão do usuário).
* **READ\_PHONE\_STATE**: Identificação do dispositivo e validações de segurança.
* **ACCESS\_NETWORK\_STATE**: Verifica conexão de rede.

---

## Recursos de Hardware

```xml
<uses-feature 
  android:name="android.hardware.camera" 
  android:required="true" />
```

* Garante que o app só será instalado em dispositivos com câmera.

---

## Configuração da Application

```xml
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:roundIcon="@mipmap/ic_launcher_round"
  android:allowBackup="false"
  android:theme="@style/AppTheme"
  android:supportsRtl="true">
```

* **android\:name**: Classe que estende `Application`. Registra pacotes e inicializações.
* **android\:label**: Nome do app (definido em `strings.xml`).
* **android\:icon** e **roundIcon**: Ícones em `res/mipmap`.
* **allowBackup**: Desativa backup automático.
* **theme**: Tema visual global.
* **supportsRtl**: Suporte a idiomas da direita para esquerda (ex: árabe).

---

## Activity Principal

```xml
<activity
  android:name=".MainActivity"
  android:label="@string/app_name"
  android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
  android:launchMode="singleTask"
  android:windowSoftInputMode="adjustResize"
  android:exported="true">
  
  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LAUNCHER" />
  </intent-filter>
</activity>
```

### Explicação dos Atributos

* **configChanges**: Impede recriação da activity em mudanças como rotação de tela.
* **launchMode="singleTask"**: Garante que apenas uma instância da activity exista.
* **windowSoftInputMode="adjustResize"**: Redimensiona o conteúdo quando o teclado aparece.
* **exported="true"**: Necessário para activities com `intent-filter` a partir do Android 12 (API 31).
* **intent-filter**: Define a `MainActivity` como ponto de entrada e tela inicial do app.

---

## Estrutura Completa do Manifest

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_PHONE_STATE" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

  <uses-feature android:name="android.hardware.camera" android:required="true" />

  <application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:supportsRtl="true">

    <activity
      android:name=".MainActivity"
      android:label="@string/app_name"
      android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
      android:launchMode="singleTask"
      android:windowSoftInputMode="adjustResize"
      android:exported="true">
      
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
