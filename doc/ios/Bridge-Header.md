# Bridge Header - `PocUnico-Bridging-Header.h`

Este arquivo é o **bridge header** do iOS, responsável por conectar o código Objective-C com o Swift no projeto React Native. É um componente essencial para que módulos nativos escritos em ambas as linguagens possam coexistir e interagir.

---

## 🎯 Finalidade

O bridge header permite que:

* Código Swift acesse classes e funções Objective-C
* Headers do React Native sejam importados para uso em módulos Swift
* A ponte entre JavaScript e código nativo funcione corretamente
* Diferentes linguagens nativas coexistam no mesmo projeto

---

## 📋 Imports Essenciais

```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>
```

### Explicação dos Headers

#### `RCTBridgeModule`
* **Função**: Interface principal para criar módulos nativos no React Native
* **Uso**: Permite que classes Swift implementem `RCTBridgeModule` para expor métodos ao JavaScript
* **Essencial para**: Comunicação JS ↔ Nativo

#### `RCTEventEmitter`
* **Função**: Classe base para emitir eventos do código nativo para JavaScript
* **Uso**: Permite que o módulo Swift envie notificações assíncronas para o JS
* **Essencial para**: Callbacks, notificações de status, eventos de erro

#### `RCTViewManager`
* **Função**: Gerencia componentes de interface nativa customizados
* **Uso**: Embora não seja usado diretamente neste projeto, é importado para compatibilidade
* **Essencial para**: Componentes UI nativos (futuras extensões)

#### `RCTUtils`
* **Função**: Utilitários diversos do React Native
* **Uso**: Funções auxiliares para thread management, conversões, etc
* **Essencial para**: Operações auxiliares e compatibilidade

---

## 🔧 Como Funciona

### 1. **Configuração Automática**
Quando você cria um projeto React Native com Swift e Objective-C, o Xcode sugere criar este arquivo automaticamente.

### 2. **Importação Global**
Todos os headers listados ficam disponíveis em **todos os arquivos Swift** do projeto, sem necessidade de import individual.

### 3. **Exemplo Prático**
```swift
// Sem bridge header, isso NÃO funcionaria:
@objc(UnicoSdkModule)
class UnicoSdkModule: RCTEventEmitter {
    // RCTEventEmitter só fica disponível através do bridge header
}
```

---

## ⚠️ Considerações Importantes

### **Localização**
* Deve estar na pasta raiz do projeto iOS
* Nome deve seguir o padrão: `[NomeDoProjeto]-Bridging-Header.h`
* Path configurado automaticamente nas Build Settings

### **Build Settings**
O Xcode configura automaticamente:
```
Objective-C Bridging Header: $(PROJECT_DIR)/PocUnico-Bridging-Header.h
```

### **Manutenção**
* **Adicione** novos headers conforme necessário
* **Remova** headers não utilizados para otimizar build
* **Mantenha** apenas imports essenciais

---

## 🚨 Problemas Comuns

### **Erro: "Bridging header not found"**
**Solução**: Verificar se o path nas Build Settings está correto

### **Erro: "Use of undeclared type"**
**Solução**: Adicionar o header necessário ao bridging header

### **Build lento**
**Solução**: Remover imports desnecessários

---

## 📚 Headers Adicionais (Opcionais)

Para projetos mais complexos, você pode precisar adicionar:

```objc
#import <React/RCTLog.h>          // Para logging avançado
#import <React/RCTConvert.h>      // Para conversões de tipos
#import <React/RCTUIManager.h>    // Para manipulação de UI
```

---

## ✅ Verificação

Para confirmar que está funcionando:

1. **Build bem-sucedido**: Projeto compila sem erros
2. **IntelliSense**: Xcode sugere classes RCT* no Swift
3. **Runtime**: Módulo nativo funciona corretamente

---

## 🔗 Relação com Outros Arquivos

* **UnicoSdkModule.swift**: Usa `RCTEventEmitter` através deste header
* **UnicoSdkModule.m**: Exporta o módulo Swift para React Native
* **Info.plist**: Contém configurações que podem ser acessadas via `RCTUtils`

Este arquivo é a **fundação** que permite toda a integração nativa funcionar corretamente.