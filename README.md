# 🏛️ Participa DF — Ouvidoria Acessível (PWA)

Protótipo funcional desenvolvido para o **1º Hackathon em Controle Social – Desafio Participa DF**, na **categoria Ouvidoria**, com foco em **participação social**, **acessibilidade**, **multicanalidade**, **proteção de dados pessoais** e **apoio à triagem por inteligência artificial (IZA – simulada)**.

---

## 🔗 Repositório Oficial

Repositório da solução desenvolvida para o  
**1º Hackathon em Controle Social – Desafio Participa DF (Categoria Ouvidoria)**:

👉 https://github.com/Deve-Fabio/pwa-participa-df
---

## 📌 Contexto do Desafio

Este projeto foi desenvolvido em atendimento ao **Edital do 1º Hackathon em Controle Social – Desafio Participa DF**, cujo objetivo é propor **soluções tecnológicas para aprimorar a plataforma Participa DF**, ampliando a **participação social**, a **transparência** e a **efetividade do controle social**, especialmente no âmbito da **Ouvidoria Pública**.

---

## 🎯 Objetivo da Solução

Criar uma **versão PWA (Progressive Web App)** do fluxo de registro e consulta de manifestações da Ouvidoria, priorizando:

- Jornada simples e acessível para o cidadão
- Registro multicanal de manifestações
- Emissão e consulta de protocolo
- Anonimato opcional e proteção de dados pessoais
- Apoio à triagem por meio de inteligência artificial (IZA – simulada)

---

## 🚀 Funcionalidades Implementadas

### 📝 Registro de Manifestação
- Tipos de manifestação (incluindo **“Geral / Não sei classificar”**)
- Campo de relato com **limite de caracteres**
- **Pré-visualização (preview)** antes do envio, com opção de edição
- Emissão automática de **protocolo único**

---

### 🎧📷🎥 Multicanalidade
Atendendo integralmente ao edital, o sistema permite o envio de:
- Texto
- Áudio
- Imagens
- Vídeos  

Com suporte a **múltiplos anexos simultâneos**.

---

### 🕵️‍♂️ Anonimato e Proteção de Dados
- Opção de **manifestação anônima**
- Mascaramento automático de dados pessoais
- Nenhum dado sensível obrigatório
- Princípios de **privacidade by design**

---

### ♿ Acessibilidade (WCAG 2.1 – AA)
- Navegação completa por teclado
- Uso correto de `<label>`, `aria-label`, `aria-live`
- Foco visível
- Contraste adequado
- Modais acessíveis (`<dialog>`)
- Feedback textual compatível com leitores de tela

---

### 🤖 Análise Automática – IZA (Simulada)
> ⚠️ **Observação importante:**  
> A integração com a IZA é **simulada**, conforme permitido pelo edital, e possui caráter **conceitual e demonstrativo**.

A análise automática realiza:
- Identificação do tema da manifestação
- Sugestão de órgão responsável
- Definição de prioridade
- Nível de confiança (simulado)

A triagem automática:
- Não interfere no cadastro do cidadão
- É apresentada **apenas na consulta do protocolo**
- Impacta automaticamente a **linha do tempo** e o **histórico**
- É sempre indicada como **sujeita à revisão manual pela Ouvidoria**

---

### ⏱️ Linha do Tempo e Histórico
- Status da manifestação apresentado de forma clara
- Linha do tempo atualizada conforme triagem automática
- Histórico detalhado de eventos
- Transparência total para o cidadão

---

### 🔍 Consulta de Manifestação
- Consulta por protocolo via **janela modal**
- Resultado exibido em **nova aba**
- Visualização completa:
  - Dados da manifestação
  - Análise automática (IZA)
  - Linha do tempo
  - Histórico
- Exportação da consulta em **PDF**

---

### 🗺️ Seleção de Local no Mapa (Opcional)
- Botão discreto “🗺️ Mapa” ao lado do campo **Local (opcional)**
- Seleção de ponto no mapa (Leaflet + OpenStreetMap)
- Preenchimento automático de:
  - Coordenadas (latitude/longitude)
  - Endereço (quando disponível, via geocodificação reversa)
- Funcionalidade **opt-in**, respeitando a privacidade do usuário

---

## 🧠 Decisões de Design Relevantes
- Foco principal no **registro da manifestação**
- Consulta separada para não poluir o formulário
- Uso de modais acessíveis
- Separação clara de responsabilidades no código
- Privacidade e acessibilidade como premissas centrais

---

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Leaflet
- OpenStreetMap / Nominatim
- Web APIs (LocalStorage, Geolocation, Dialog)

---

## 📂 Estrutura do Projeto

├── index.html   → Interface principal da aplicação (formulário, modais e telas)
├── app.js       → Lógica principal do sistema, fluxo da ouvidoria, protocolo,
│                  persistência local, consulta e análise automática (IZA)
├── mapa.js      → Módulo isolado para seleção opcional de local no mapa
│                  (Leaflet + OpenStreetMap + geocodificação reversa)
├── style.css    → Estilos globais da aplicação
├── mapa.css     → Estilos específicos do modal de mapa
└── assets/      → Ícones e recursos visuais


## ▶️ Como Executar a Solução
	> Esta solução é um protótipo PWA front-end, não exigindo backend, banco de dados ou instalação de dependências.

 *Opção 1 — Execução direta
	1. Baixe ou clone o repositório.
	2. Abra o arquivo index.html diretamente no navegador

 *Opção 2 — Servidor local (recomendado)
	Algumas funcionalidades funcionam melhor com servidor local.

   Exemplo usando VS Code:
	1. Instale a extensão Live Server
	2. Clique com o botão direito em index.html
	3. Selecione “Open with Live Server”
	A aplicação será aberta no navegador e estará pronta para uso.
	
## ⚠️ Limitações Conhecidas
- Persistência local (LocalStorage) apenas para fins de protótipo
- Integração com IZA simulada
- Não há backend ou autenticação real

## 🎥 Vídeo Demonstrativo
https://youtu.be/OK5A0ocGqeE

## 👨 Autoria	
	Projeto desenvolvido por Francisco Fábio de Oliveira

	para o 1º Hackathon em Controle Social – Desafio Participa DF.




