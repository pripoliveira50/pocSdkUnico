# Configuração do `Info.plist` para SDK Unico (iOS)

Este arquivo define as permissões, capacidades e configurações necessárias para que a aplicação iOS funcione corretamente com o SDK da Unico.

---

## 📋 Estrutura e Finalidade

O `Info.plist` é lido pelo sistema iOS em tempo de execução e contém configurações essenciais como:

* Metadados da aplicação
* Permissões (ex: uso da câmera)
* Requisitos de segurança de rede
* Informações sobre orientação de tela e arquitetura
* Variáveis injetadas via `react-native-config`

---

## 🔐 Permissões

### Uso da Câmera

```xml
<key>NSCameraUsageDescription</key>
<string>Este aplicativo precisa de acesso à câmera para capturar selfies e documentos</string>
```

Essa permissão **é obrigatória** para o SDK funcionar. A ausência ou má descrição resultará em rejeição na App Store.

---

## 🌐 Segurança de Rede (ATS)

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

* `NSAllowsArbitraryLoads = false`: mantém a segurança, exigindo HTTPS.
* `NSAllowsLocalNetworking = true`: necessário apenas durante o desenvolvimento com Metro bundler.

---

## 🌎 Variáveis de Ambiente (via `.env`)

Injetadas automaticamente durante o build pelo `react-native-config`.

| Chave                     | Descrição                                       |
| ------------------------- | ----------------------------------------------- |
| `UNICO_SDK_KEY`           | Chave do SDK da Unico                           |
| `UNICO_BUNDLE_IDENTIFIER` | Identificador usado na autenticação com a Unico |
| `UNICO_ENVIRONMENT`       | Ambiente atual (ex: UAT ou PROD)                |

Exemplo no `.env`:

```env
UNICO_SDK_KEY=sua_chave_aqui
UNICO_BUNDLE_IDENTIFIER=com.seuprojeto.nome
UNICO_ENVIRONMENT=UAT
```

---

## 🧭 Orientações Suportadas

```xml
<key>UISupportedInterfaceOrientations</key>
<array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
</array>
```

> **Recomendado:** Portrait.
> **Permitido:** Landscape (com possíveis perdas de qualidade nas capturas).

---

## 📌 Considerações Importantes

1. **Segurança**

   * Nunca habilite `NSAllowsArbitraryLoads = true` em produção.
   * Use criptografia se as variáveis do `.env` contiverem dados sensíveis.

2. **Compatibilidade**

   * Suporte necessário para dispositivos `arm64`.
   * O SDK da Unico requer iOS 12+.

3. **App Store**

   * Descrições de permissões devem ser claras e localizadas.
   * Rejeições podem ocorrer se não estiverem em conformidade.
