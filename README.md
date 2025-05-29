# 📦 SDK Unico Bridge para React Native

> ⚠️ **PROJETO INDEPENDENTE**: Este é um projeto **não-oficial** desenvolvido por mim (Priscila Oliveira) para a para ajudar a comunidade. **Não tenho nenhum envolvimento com a Unico** e criei esta implementação por não encontrar recursos similares disponíveis na internet.

Uma implementação completa de bridge nativa para integração do SDK da Unico IDCloud em aplicações React Native, permitindo captura de selfies e documentos com validação biométrica.

---

## 🎯 Motivação do Projeto

**Por que criei este projeto?**

Durante o desenvolvimento de uma aplicação que precisava integrar o SDK da Unico com React Native, enfrentei diversos desafios:

- ❌ **Falta de documentação** específica para React Native
- ❌ **Ausência de exemplos práticos** de implementação de bridge nativa
- ❌ **Dificuldades** para integrar corretamente em ambas as plataformas (iOS e Android)
- ❌ **Problemas de configuração** que consumiram semanas de desenvolvimento

**Como posso ajudar a comunidade?**

- ✅ **Documentação completa** e detalhada para implementação
- ✅ **Guias passo-a-passo** para iOS e Android
- ✅ **Código de exemplo** funcional e testado
- ✅ **Troubleshooting** de problemas reais
- ✅ **Arquitetura limpa** e escalável

🎯 **Objetivo**: Evitar que outros desenvolvedores passem pelas mesmas dificuldades que enfrentei.

---

## 🤝 Importante: Projeto da Comunidade

### ⚖️ **Disclaimer Legal**

- Este projeto **NÃO é oficial** da Unico
- **NÃO tenho afiliação** com a empresa Unico
- O SDK da Unico continua sendo **propriedade da Unico**
- Esta implementação é uma **ponte (bridge)** criada independentemente

### 🎯 **Objetivo da Comunidade**

- **Compartilhar conhecimento** sobre implementação de bridges nativas
- **Documentar processo** de integração com React Native
- **Ajudar desenvolvedores** que enfrentam os mesmos desafios
- **Promover boas práticas** de desenvolvimento

### 📢 **Para a Unico**

Se representantes da Unico encontrarem este projeto:

- **Objetivo é sempre ajudar** a comunidade de desenvolvedores

---

## 🏗️ Visão Geral

Este projeto demonstra como integrar o SDK da Unico em aplicações React Native através de uma bridge nativa robusta, implementando:

- **Captura de Selfie** com biometria facial
- **Captura de Documentos** (CNH, RG, CPF) com frames guiados
- **Fluxo Guiado** completo de verificação
- **Gerenciamento de Permissões** nativo
- **Arquitetura Clean** com separação de responsabilidades
- **Envio em Lote** para backend

---

## 🏗️ Arquitetura

### 📱 **Plataformas Nativas**

#### Android (Kotlin)

- `UnicoSdkModule`: Bridge principal com SDK Android
- `UnicoConfig`: Configuração de credenciais
- `UnicoTheme`: Personalização visual
- `UnicoSdkPackage`: Registro do módulo

#### iOS (Swift)

- `UnicoSdkModule`: Bridge principal com SDK iOS
- `UnicoConfig`: Configuração de credenciais
- `UnicoTheme`: Personalização visual
- Bridge Header para interoperabilidade

### ⚛️ **React Native (TypeScript)**

- **Clean Architecture** com camadas bem definidas
- **Domain**: Entidades, casos de uso e contratos
- **Data**: Implementação de repositórios
- **Infrastructure**: Serviços nativos
- **Presentation**: Hooks e interfaces

---

## 📚 Documentação Completa

### 🤖 Android

- [doc-geral-android](doc/android/doc-geral-android.md) - Documentação a nível geral da implementação
- [guia-implementacao-nativa](doc/android/guia-implementacao-nativa.md) - Passo a passo para implementação nativa no android
- [build.gradle (app)](<doc/android/build.gradle-(app).md>) - Configuração do módulo Android
- [build.gradle (projeto)](<doc/android/build.gradle-(projeto).md>) - Configuração global
- [MainApplication](doc/android/MainApplication.md) - Classe principal da aplicação
- [AndroidManifest](doc/android/AndroidManifest.md) - Permissões e configurações
- [UnicoConfig](doc/android/UnicoConfig.md) - Configuração de credenciais
- [UnicoSdkModule](doc/android/UnicoSdkModule.md) - Bridge nativa principal
- [UnicoSdkPackage](doc/android/UnicoSdkPackage.md) - Registro do módulo
- [UnicoTheme](doc/android/UnicoTheme.md) - Personalização visual

### 🍎 iOS

- [doc-geral-ios](doc/ios/doc-geral-ios.md) - Documentação a nível geral da implementação
- [guia-implementacao-nativa](doc/ios/guia-implementacao-nativa.md) - Passo a passo para implementação nativa no ios
- [Info.plist](doc/ios/Info-plist.md) - Permissões e configurações
- [Podfile](doc/ios/Podfile.md) - Dependências CocoaPods
- [UnicoConfig](doc/ios/UnicoConfig.md) - Configuração de credenciais
- [UnicoSdkModule.m](doc/ios/UnicoSdkModule-m.md) - Bridge header Objective-C
- [UnicoSdkModule](doc/ios/UnicoSdkModule.md) - Bridge nativa principal
- [UnicoTheme](doc/ios/UnicoTheme.md) - Personalização visual
- [Bridge Header](doc/ios/Bridge-Header.md) - Header de interoperabilidade

### ⚛️ React Native

- [Arquitetura](doc/react-native/guia-completo) - Guia completo da estrutura React Native

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- React Native 0.72+
- Node.js 18+
- Android Studio (para Android)
- Xcode 14+ (para iOS)
- **Credenciais da Unico** (Bundle ID e Host Key) - obtidas diretamente com a Unico

### 1. **Configuração de Ambiente**

```bash
# Clone o projeto
git clone [seu-repositorio]
cd poc-sdk-unico

# Instale dependências
yarn install

# iOS - Instale pods
cd ios && pod install && cd ..
```

### 2. **Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Credenciais da Unico (obter diretamente com a Unico)
UNICO_BUNDLE_ID=com.seuapp.exemplo
UNICO_HOST_KEY=sua_chave_da_unico
UNICO_ENVIRONMENT=UAT

# Para iOS também
UNICO_BUNDLE_IDENTIFIER=com.seuapp.exemplo
UNICO_SDK_KEY=sua_chave_da_unico
```

### 3. **Configuração Android**

Verifique se o `applicationId` no `android/app/build.gradle` corresponde ao registrado na Unico:

```groovy
defaultConfig {
    applicationId // Deve coincidir com UNICO_BUNDLE_ID
    // ...
}
```

### 4. **Configuração iOS**

Verifique o Bundle Identifier no Xcode:

- Abra `ios/PocUnico.xcworkspace`
- Em Project Settings > Identity, confirme o Bundle Identifier

---

## 🎮 Como Usar

### **Teste Básico**

```typescript
import { NativeModules } from 'react-native';
const { UnicoSdk } = NativeModules;

// Teste de conectividade
const result = await UnicoSdk.testConnection();
console.log(result); // "Bridge Android funcionando! Activity: true"
```

### **Captura de Selfie**

```typescript
try {
  const result = await UnicoSdk.captureSelfie();
  console.log('Base64:', result.base64);
  console.log('Dados criptografados:', result.encrypted);
} catch (error) {
  console.error('Erro:', error.message);
}
```

### **Captura de Documento**

```typescript
const documentTypes = [
  'CNH_FRENTE',
  'CNH_VERSO',
  'RG_FRENTE',
  'RG_VERSO',
  'CPF',
];

try {
  const result = await UnicoSdk.captureDocument('CNH_FRENTE');
  console.log('Documento capturado:', result);
} catch (error) {
  console.error('Erro:', error.message);
}
```

### **Fluxo Guiado Completo**

O app implementa um fluxo guiado que orienta o usuário:

1. 🤳 Captura de Selfie
2. 🪪 CNH Frente
3. 🔄 CNH Verso
4. 📤 Envio em Lote

---

## 🔧 Funcionalidades

### ✅ **Implementado**

- [x] Bridge nativa Android (Kotlin)
- [x] Bridge nativa iOS (Swift)
- [x] Captura de selfie com biometria
- [x] Captura de documentos com frames guiados
- [x] Gerenciamento de permissões
- [x] Personalização visual (tema)
- [x] Eventos nativos para JavaScript
- [x] Fluxo guiado de verificação
- [x] Arquitetura Clean no React Native
- [x] Envio em lote para backend
- [x] Verificação de status de processamento

---

## 🐛 Troubleshooting

### **Android**

```bash
# Limpar build
cd android && ./gradlew clean && cd ..

# Verificar repositório Unico
grep -r "maven-sdk.unico.run" android/
```

### **iOS**

```bash
# Limpar pods
cd ios && pod deintegrate && pod install && cd ..

# Verificar dependências
pod list | grep unico
```

### **React Native**

```bash
# Reset cache
npx react-native start --reset-cache

# Rebuild
npx react-native run-android
npx react-native run-ios
```

---

## 📱 Testando

### **Android**

```bash
npx react-native run-android
```

### **iOS**

```bash
npx react-native run-ios
```

### **Fluxo de Teste Recomendado**

1. **Teste Bridge**: Verifique conectividade
2. **Permissões**: Confirme acesso à câmera
3. **Selfie**: Capture uma selfie
4. **Documentos**: Capture CNH frente e verso
5. **Envio**: Teste o envio em lote
6. **Status**: Verifique o processamento

---

## 🤝 Contribuições

Este é um projeto **open source da comunidade**! Contribuições são muito bem-vindas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### **Tipos de Contribuição Desejadas:**

- 📝 **Melhorias na documentação**
- 🐛 **Correções de bugs**
- ✨ **Novas funcionalidades**
- 🧪 **Testes adicionais**
- 🌍 **Traduções**
- 💡 **Sugestões de melhorias**

---

## 📄 Licença

Este projeto é uma **demonstração técnica (POC)** desenvolvida por mim (Priscila Oliveira) para integração com o SDK da Unico.

- **Use como referência** para implementar em seus próprios projetos
- **Adapte conforme necessário** para suas necessidades
- **Contribua** com melhorias para ajudar outros desenvolvedores

---

## 📞 Suporte

### **Para questões sobre o SDK da Unico:**

- [Documentação oficial da Unico](https://docs.unico.io)
- Suporte oficial da Unico

### **Para questões sobre esta implementação:**

- Abra uma **issue** no repositório
- Consulte a **documentação detalhada** em `doc/`
- Participe das **discussões** da comunidade

### **Para contribuir:**

- Leia o **guia de contribuição**
- Participe das **discussões** abertas
- Compartilhe sua **experiência** com outros desenvolvedores

---

## 🎬 Videos

### Vídeo 1 – iOS - [Click na thumbnail e veja no youtube]
[![Assista no YouTube](https://img.youtube.com/vi/Apf5ssFwojE/0.jpg)](https://youtube.com/shorts/Apf5ssFwojE?si=FfOvsMiNyXVlC16w)

### Vídeo 2 –  Android - [Click na thumbnail e veja no youtube]
[![Assista no YouTube](https://img.youtube.com/vi/j0mKUI8jjZI/0.jpg)](https://youtube.com/shorts/j0mKUI8jjZI?si=ZItjfiFZKHfUlDW2)

Made with ❤️ by [Priscila Oliveira](https://github.com/pripoliveira50/)
