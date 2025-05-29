# Configuração do `Podfile` para SDK da Unico (iOS)

Este documento descreve a estrutura e as configurações essenciais do `Podfile` para aplicações iOS em React Native que utilizam o SDK da Unico.

---

## 🎯 Objetivo

O `Podfile` define as dependências nativas que serão gerenciadas pelo CocoaPods. Ele é equivalente ao `package.json` no Node.js e ao `build.gradle` no Android.

---

## 📦 Dependências obrigatórias

| Pod                   | Finalidade                                                             |
| --------------------- | ---------------------------------------------------------------------- |
| `unicocheck-ios`      | SDK da Unico (captura de selfie e documentos com validação biométrica) |
| `react-native-config` | Injeta variáveis do `.env` no ambiente nativo (ex: `UNICO_SDK_KEY`)    |

---

## 📸 Permissões via `react-native-permissions`

Configuração simplificada para ativar apenas a permissão necessária:

```ruby
setup_permissions([
  'Camera',
])
```

---

## ⚙️ Configurações essenciais

* **Mínimo iOS:** `12.0`
* **Versão Swift:** `5.0+`
* **Bitcode:** desativado para evitar conflitos com o SDK
* **Arquiteturas:** `arm64` desativado no simulador (problemas com M1)

---

## 🛠 Pós-instalação (`post_install`)

No bloco `post_install`, são aplicadas configurações automáticas:

```ruby
config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
config.build_settings['SWIFT_VERSION'] = '5.0'
config.build_settings['ENABLE_BITCODE'] = 'NO'
```

Essas definições garantem a compatibilidade com o SDK da Unico e evitam falhas no build.

---

## 🧪 Solução de problemas comuns

| Problema                   | Solução                                               |
| -------------------------- | ----------------------------------------------------- |
| Erro de linking            | Execute `pod install --clean` ou `pod deintegrate`    |
| Erro de deployment target  | Confirme que todas as libs usam iOS 12+               |
| Incompatibilidade de Swift | Atualize o Xcode ou defina manualmente a versão Swift |
| SDK falha no simulador     | Sempre teste em dispositivos reais                    |

---

## 📚 Comandos úteis

```bash
cd ios && pod install            # Instala dependências
cd ios && pod deintegrate        # Remove pods
cd ios && pod update             # Atualiza tudo
cd ios && pod outdated           # Verifica versões desatualizadas
```
