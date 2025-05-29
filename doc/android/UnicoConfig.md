# UnicoConfig.kt – Configuração do SDK da Unico

Este arquivo define a classe `UnicoConfig`, responsável por fornecer as configurações de autenticação utilizadas pelo SDK da Unico.  
A classe implementa a interface `AcessoBioConfigDataSource`, exigida pelo SDK para obter as credenciais necessárias.

## Pacote

```kotlin
package com.pocsdkunico.unico
````

## Importações

```kotlin
import com.acesso.acessobio_android.onboarding.AcessoBioConfigDataSource
import com.pocsdkunico.BuildConfig
```

## Descrição

A classe `UnicoConfig` fornece:

* O identificador do pacote da aplicação (bundle identifier).
* A chave de autenticação (host key) do SDK da Unico.

Esses valores são injetados via `BuildConfig`, que por sua vez é populado com as variáveis de ambiente definidas no arquivo `.env`.

## Classe `UnicoConfig`

```kotlin
class UnicoConfig : AcessoBioConfigDataSource {
```

### Método `getBundleIdentifier()`

```kotlin
override fun getBundleIdentifier(): String {
    return BuildConfig.UNICO_BUNDLE_ID ?: ""
}
```

**Descrição**:
Retorna o Bundle Identifier da aplicação.

**Observações**:

* Este identificador precisa estar registrado na plataforma Unico.
* Deve corresponder exatamente ao `applicationId` definido no `build.gradle`.

**Retorno**:
`String` com o identificador ou uma string vazia se não definido.

### Método `getHostKey()`

```kotlin
override fun getHostKey(): String {
    return BuildConfig.UNICO_HOST_KEY ?: ""
}
```

**Descrição**:
Retorna a chave de autenticação do SDK da Unico.

**Observações**:

* Esta chave é fornecida pela Unico.
* É única para cada projeto/aplicação e usada para autenticar chamadas aos serviços da Unico.

**Retorno**:
`String` com a chave do SDK ou uma string vazia se não definida.

## Considerações

Certifique-se de que os valores `UNICO_BUNDLE_ID` e `UNICO_HOST_KEY` estejam definidos corretamente no arquivo `.env` e configurados no `build.gradle` para que estejam disponíveis no `BuildConfig`.
