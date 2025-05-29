# UnicoTheme.kt – Personalização Visual do SDK da Unico

Este arquivo define a classe `UnicoTheme`, responsável pela personalização visual da interface do SDK da Unico IDCloud.  
A classe implementa a interface `IAcessoBioTheme`, permitindo configurar as cores dos elementos utilizados nas telas de captura.

## Pacote

```kotlin
package com.pocsdkunico.unico
````

## Importações

```kotlin
import com.acesso.acessobio_android.onboarding.IAcessoBioTheme
```

## Descrição

A personalização permite definir cores utilizando:

* Strings hexadecimais (`"#FF0000"`)
* Resource IDs (`R.color.primary_color`)
* Cores do sistema Android

### Elementos personalizáveis

* Fundo das telas
* Textos e mensagens
* Botões e elementos interativos
* Silhuetas de captura (sucesso, erro, neutro)
* Mensagens de erro e sucesso

---

## Implementação da Classe `UnicoTheme`

### Cor de fundo das telas de captura

```kotlin
override fun getColorBackground(): Any {
    return "#F1F0F8"
}
```

Cor neutra para o fundo das telas do SDK.

---

### Cor de fundo das caixas de mensagem

```kotlin
override fun getColorBoxMessage(): Any {
    return "#FFFFFF"
}
```

Fundo branco para as mensagens instrucionais.

---

### Cor do texto das mensagens

```kotlin
override fun getColorTextMessage(): Any {
    return "#322E50"
}
```

Texto escuro para legibilidade.

---

### Cor de fundo do popup de erro

```kotlin
override fun getColorBackgroundPopupError(): Any {
    return "#ED2326"
}
```

Fundo vermelho para alertas.

---

### Cor do texto no popup de erro

```kotlin
override fun getColorTextPopupError(): Any {
    return "#FFFFFF"
}
```

Texto branco para contraste.

---

### Cor do botão no popup de erro (fundo)

```kotlin
override fun getColorBackgroundButtonPopupError(): Any {
    return "#DB1619"
}
```

Botão com vermelho mais escuro.

---

### Cor do botão no popup de erro (texto)

```kotlin
override fun getColorTextButtonPopupError(): Any {
    return "#FFFFFF"
}
```

Texto branco para o botão.

---

### Cor de fundo do botão de captura manual

```kotlin
override fun getColorBackgroundTakePictureButton(): Any {
    return "#365CEF"
}
```

Azul primário da marca.

---

### Cor do ícone do botão de captura

```kotlin
override fun getColorIconTakePictureButton(): Any {
    return "#FFFFFF"
}
```

Ícone branco sobre botão azul.

---

### Cor de fundo da área inferior em captura de documentos

```kotlin
override fun getColorBackgroundBottomDocument(): Any {
    return "#322E50"
}
```

Roxo escuro para destacar instruções.

---

### Cor do texto na área inferior de documentos

```kotlin
override fun getColorTextBottomDocument(): Any {
    return "#FFFFFF"
}
```

Texto branco para contraste.

---

### Cor da silhueta (sucesso)

```kotlin
override fun getColorSilhouetteSuccess(): Any {
    return "#2E806E"
}
```

Verde indicando captura correta.

---

### Cor da silhueta (erro)

```kotlin
override fun getColorSilhouetteError(): Any {
    return "#ED2326"
}
```

Vermelho indicando erro de posicionamento.

---

### Cor da silhueta (neutra)

```kotlin
override fun getColorSilhouetteNeutral(): Any {
    return "#81EFBD"
}
```

Verde claro para estado inicial ou em processamento.

---

### Cor da barra de progresso

```kotlin
override fun getColorProgressBar(): Any {
    return "#365CEF"
}
```

Azul primário da marca para indicar progresso.

---

## Considerações

* As cores devem garantir contraste e acessibilidade.
* É possível substituir os valores hexadecimais por recursos Android (`R.color.nome`) se desejado.
* A personalização visual melhora a experiência e a identidade da marca no uso do SDK.
