# UnicoConfig.swift – Configuração do SDK da Unico no iOS

Esta classe implementa `AcessoBioConfigDataSource`, interface exigida pelo SDK da Unico para prover credenciais de autenticação no iOS.

---

## Objetivo

- Ler valores do `Info.plist` (injetados via `.env`)
- Fornecer `bundle identifier` e `host key` para o SDK
- Suportar múltiplos ambientes (UAT e PROD)

---

## Fonte dos Dados

1. Variáveis definidas em `.env`
2. `react-native-config` processa e injeta no `Info.plist`
3. `Bundle.main.object(forInfoDictionaryKey:)` lê os valores em runtime

---

## Implementação da Classe

```swift
@objc(UnicoConfig)
class UnicoConfig: AcessoBioConfigDataSource {

    func getBundleIdentifier() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_BUNDLE_IDENTIFIER") as? String ?? ""
    }

    func getHostKey() -> String {
        return Bundle.main.object(forInfoDictionaryKey: "UNICO_SDK_KEY") as? String ?? ""
    }
}
````

---

## Explicação dos Métodos

### `getBundleIdentifier()`

- Retorna o identificador do pacote da aplicação
- Deve coincidir com o registrado na Unico
- Lido do `Info.plist` no momento da execução

### `getHostKey()`

- Retorna a chave de autenticação do SDK
- Deve ser única e válida para cada projeto
- Injetada via `.env` no `Info.plist` e lida em runtime

---

## Notas Importantes sobre Segurança

### 1. Proteção das Credenciais

- O `Info.plist` é incluído no bundle do app
- Pode ser acessado por engenharia reversa
- Em produção, considere usar o Keychain ou outro armazenamento seguro

### 2. Validação em Tempo de Execução

- O SDK realiza validação server-side
- Chaves inválidas resultam em erro de autenticação

### 3. Rotação de Chaves

- Tenha um processo de rotação de SDK keys
- Teste a nova chave em UAT antes da produção
- Coordene com a Unico para atualizações

### 4. Ambientes (UAT vs PROD)

- Use chaves distintas para cada ambiente
- Configure diferentes build schemes no Xcode
- Automatize o deployment com as variáveis corretas

---

## Considerações

- Essa classe é fundamental para inicializar corretamente o SDK no iOS
- Toda mudança nas variáveis de ambiente exige rebuild do projeto
- Verifique os logs em caso de falha de autenticação
