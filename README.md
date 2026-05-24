[README.md](https://github.com/user-attachments/files/28195456/README.md)
<div align="center">

```
███████╗██████╗ ██████╗  ██████╗██╗██████╗  ██████╗██╗   ██╗██╗████████╗ ██████╗ ███████╗
██╔════╝██╔══██╗██╔══██╗██╔════╝██║██╔══██╗██╔════╝██║   ██║██║╚══██╔══╝██╔═══██╗██╔════╝
█████╗  ██████╔╝██████╔╝██║     ██║██████╔╝██║     ██║   ██║██║   ██║   ██║   ██║███████╗
██╔══╝  ██╔═══╝ ██╔══██╗██║     ██║██╔══██╗██║     ██║   ██║██║   ██║   ██║   ██║╚════██║
██║     ██║     ██████╔╝╚██████╗██║██║  ██║╚██████╗╚██████╔╝██║   ██║   ╚██████╔╝███████║
╚═╝     ╚═╝     ╚═════╝  ╚═════╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝   ╚═╝    ╚═════╝ ╚══════╝
```

**Simulador Interativo de Circuitos Lógicos**

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-00d4ff?style=for-the-badge)
![License](https://img.shields.io/badge/Licença-MIT-00ff88?style=for-the-badge)

> Construa, conecte e simule circuitos lógicos diretamente no navegador — sem instalação, sem complicação.

</div>

---

## 📋 Sobre o Projeto

O **FPBCIRCUITOS** nasceu como projeto acadêmico do curso de **Análise e Desenvolvimento de Sistemas** no **UC HUB / Ânima Lab**, com o objetivo de tornar o aprendizado de lógica digital mais acessível, interativo e visual.

A ideia é simples: ao invés de desenhar circuitos no papel ou instalar softwares pesados, o aluno abre o navegador e começa a montar — arrastando portas lógicas, conectando fios e vendo o resultado em tempo real.

---

## ✨ Funcionalidades

- 🖱️ **Drag & Drop** — arraste componentes da barra lateral para o canvas
- ⚡ **Simulação em tempo real** — resultados calculados instantaneamente
- 💡 **LED de saída animado** — feedback visual imediato (0 ou 1)
- 📊 **Tabela Verdade automática** — gerada para até 4 entradas
- 🔌 **7 portas lógicas** — AND, OR, NOT, NAND, NOR, XOR, XNOR
- 🎛️ **Switches de entrada** — controle manual de A, B e C
- 📂 **Circuito de exemplo** — carrega um circuito demonstrativo com 1 clique
- 📘 **Tutorial embutido** — guia completo para iniciantes
- 🗑️ **Delete de componentes** — selecione e pressione `Delete`
- 📦 **Zero dependências** — funciona com um único arquivo `.html`

---

## 🚀 Como Usar

### Opção 1 — Arquivo único (recomendado)
```bash
# Baixe o arquivo e abra no navegador
fpbcircuitos_tudo.html  →  duplo clique  →  pronto!
```

### Opção 2 — Três arquivos separados
```bash
# Clone ou baixe os arquivos na mesma pasta
index.html
style.css
script.js

# Abra o index.html no navegador
```

> ⚠️ **VS Code Preview:** use sempre o `fpbcircuitos_tudo.html` (versão tudo-em-um), pois o Live Preview do VS Code pode bloquear arquivos externos.

---

## 🧠 Portas Lógicas Disponíveis

| Porta  | Operação     | Símbolo   | Descrição                        |
|--------|--------------|-----------|----------------------------------|
| AND    | E lógico     | A · B     | Saída 1 somente se A=1 e B=1    |
| OR     | OU lógico    | A + B     | Saída 1 se A=1 ou B=1           |
| NOT    | NÃO lógico   | ¬A        | Inverte a entrada                |
| NAND   | NÃO-E        | ¬(A·B)    | Inverso do AND                   |
| NOR    | NÃO-OU       | ¬(A+B)    | Inverso do OR                    |
| XOR    | OU exclusivo | A ⊕ B     | Saída 1 se entradas diferentes   |
| XNOR   | Equivalência | ¬(A⊕B)   | Saída 1 se entradas iguais       |

---

## 🖥️ Interface

```
┌─────────────────────────────────────────────────────────────┐
│  ⬅ Início    ● FPBCIRCUITOS — Editor    [Limpar] [Exemplo] [▶]  │  ← Topbar
├──────────────┬──────────────────────────────┬───────────────┤
│              │                              │  Entradas     │
│  Entradas    │                              │  [A] ○──── 0  │
│  ○ Entrada A │      CANVAS INTERATIVO       │  [B] ○──── 1  │
│  ○ Entrada B │                              │               │
│  ○ Entrada C │   (arraste, conecte,         │  Resultado    │
│              │    simule aqui)              │  ◉  1  HIGH   │
│  Portas      │                              │               │
│  AND  OR     │                              │  Tabela       │
│  NOT  NAND   │                              │  A B │ OUT    │
│  NOR  XOR    │                              │  0 0 │  0     │
│  XNOR        │                              │  0 1 │  0     │
│              │                              │  1 0 │  0     │
│  Saída       │                              │  1 1 │  1 ◀   │
│  💡 LED      │                              │               │
├──────────────┴──────────────────────────────┴───────────────┤
│  Pronto. Arraste componentes para começar.      3 componentes│  ← Status
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
fpbcircuitos/
│
├── 📄 index.html          # Estrutura HTML + telas (Home, Editor, Tutorial)
├── 🎨 style.css           # Tema dark tech, animações, layout responsivo
├── ⚙️  script.js           # Motor de simulação, canvas, drag-drop, lógica
│
└── 📦 fpbcircuitos_tudo.html  # Versão standalone (tudo embutido em 1 arquivo)
```

---

## 🔧 Fluxo de Uso

```
 Problema lógico
       │
       ▼
 Interpretação do enunciado
       │
       ▼
 Identificar entradas e saídas
       │
       ▼
 Montar no simulador (drag & drop)
       │
       ▼
 Simulação automática ──────────────┐
       │                            │
       ▼                            │ Resultado incorreto
 Resultado correto?                 │
    Sim │         Não ──────────────┘
        ▼
   Finalizar / Salvar
```

---

## 👥 Equipe

| Nome | RA | Curso |
|------|----|-------|
| Rennan Carlos da Silva Pereira | 1362619551 | ADS |
| Felipe Gonçalves da Silva | 1362522016 | ADS |
| Antônio Pereira da Silva Filho | 1362520996 | ADS |
| Lucas David Hermínio de Oliveira | 1362522017 | ADS |
| Isaac Mateus Silva Dos Santos | 1362613091 | ADS |

---

## 🎯 Público-Alvo

- 🎓 Estudantes de ensino médio, técnico e graduação (Eng. Elétrica, Computação, ADS)
- 👨‍🏫 Professores de eletrônica e lógica digital
- 🔧 Hobbyistas e entusiastas de eletrônica
- 🧑‍💻 Pessoas aprendendo lógica digital de forma independente

---

## 🆚 Diferenciais frente à concorrência

|  | FPBCIRCUITOS | CircuitVerse | Logisim Evolution |
|--|----------|--------------|-------------------|
| Funciona offline | ✅ | ❌ | ✅ |
| Zero instalação | ✅ | ✅ | ❌ |
| Interface moderna | ✅ | ⚠️ | ❌ |
| Tabela verdade automática | ✅ | ⚠️ | ⚠️ |
| Arquivo único | ✅ | ❌ | ❌ |
| Foco educacional | ✅ | ✅ | ⚠️ |

---

## 🛣️ Próximos Passos

- [ ] Salvar e carregar circuitos (JSON)
- [ ] Gamificação com desafios e pontuação
- [ ] Suporte a circuitos sequenciais (flip-flops)
- [ ] Exportar circuito como imagem
- [ ] Modo professor: criar exercícios e avaliações
- [ ] Versão mobile responsiva

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Sinta-se livre para usar, modificar e distribuir.

---

<div align="center">

Desenvolvido com ⚡ por **Squad 7235** · UC HUB / Ânima Lab · 2026

</div>
