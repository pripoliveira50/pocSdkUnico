# UnicoTheme.swift – Personalização Visual do SDK da Unico no iOS

Classe responsável por definir o tema visual da interface de captura do SDK da Unico no iOS, implementando `AcessoBioThemeDelegate`.

---

## Objetivo

Permitir a personalização visual de:

- Cores de fundo
- Mensagens e textos
- Botões e ícones
- Silhuetas de captura (neutro, sucesso, erro)
- Compatibilidade com modo escuro (opcional)

---

## Tipos de Cores Suportados

- `UIColor` com valores RGB  
- `UIColor` com string hexadecimal (`#RRGGBB`)  
- Cores do sistema (`.systemBlue`, `.label`)  
- Cores definidas por asset catalog (`UIColor(named:)`)

---

## Implementação

### Cor de fundo da tela

```swift
func getColorBackground() -> Any! {
    return UIColor(red: 0.94, green: 0.94, blue: 0.97, alpha: 1.0) // #F1F0F8
}
````

### Fundo das mensagens

```swift
func getColorBoxMessage() -> Any! {
    return UIColor.white
}
```

### Texto das mensagens

```swift
func getColorTextMessage() -> Any! {
    return UIColor(red: 0.2, green: 0.18, blue: 0.31, alpha: 1.0) // #322E50
}
```

### Fundo dos popups de erro

```swift
func getColorBackgroundPopupError() -> Any! {
    return UIColor(red: 0.93, green: 0.14, blue: 0.15, alpha: 1.0) // #ED2326
}
```

### Texto dos popups de erro

```swift
func getColorTextPopupError() -> Any! {
    return UIColor.white
}
```

### Fundo do botão nos popups de erro

```swift
func getColorBackgroundButtonPopupError() -> Any! {
    return UIColor(red: 0.86, green: 0.09, blue: 0.10, alpha: 1.0) // #DB1619
}
```

### Texto do botão nos popups de erro

```swift
func getColorTextButtonPopupError() -> Any! {
    return UIColor.white
}
```

### Fundo do botão de captura manual

```swift
func getColorBackgroundTakePictureButton() -> Any! {
    return UIColor(red: 0.21, green: 0.36, blue: 0.94, alpha: 1.0) // #365CEF
}
```

### Ícone do botão de captura

```swift
func getColorIconTakePictureButton() -> Any! {
    return UIColor.white
}
```

### Fundo da área inferior da captura de documentos

```swift
func getColorBackgroundBottomDocument() -> Any! {
    return UIColor(red: 0.2, green: 0.18, blue: 0.31, alpha: 1.0) // #322E50
}
```

### Texto da área inferior da captura de documentos

```swift
func getColorTextBottomDocument() -> Any! {
    return UIColor.white
}
```

### Silhueta de sucesso

```swift
func getColorSilhouetteSuccess() -> Any! {
    return UIColor(red: 0.18, green: 0.50, blue: 0.43, alpha: 1.0) // #2E806E
}
```

### Silhueta de erro

```swift
func getColorSilhouetteError() -> Any! {
    return UIColor(red: 0.93, green: 0.14, blue: 0.15, alpha: 1.0) // #ED2326
}
```

### Silhueta neutra

```swift
func getColorSilhouetteNeutral() -> Any! {
    return UIColor(red: 0.51, green: 0.94, blue: 0.74, alpha: 1.0) // #81EFBD
}
```

---

## Suporte a Cores Hexadecimais

A extensão abaixo permite utilizar strings hexadecimais para definir cores:

```swift
extension UIColor {
    convenience init(hexString: String, alpha: CGFloat = 1.0) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt64()
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: alpha)
    }
}
```

---

## Notas sobre Acessibilidade e Modo Escuro

- **Dark Mode**:

  - Testar cores em modo claro e escuro
  - Usar `UIColor.dynamic` para adaptabilidade

- **Acessibilidade**:

  - Garantir contraste mínimo de 4.5:1 para textos
  - Usar 3:1 para elementos gráficos
  - Testar com VoiceOver e modos de contraste elevado

- **Consistência Visual**:

  - Seguir paleta da identidade visual do app
  - Utilizar tokens de design se disponíveis

- **Performance**:

  - Cores são recriadas a cada uso
  - Avaliar cache de instâncias para melhorar desempenho
