/* ===== Utilidades ===== */
function $(id) { return document.getElementById(id); }

// ===== Avisos de anexos (UI) =====
function showAttachmentWarnings(messages) {
  const box = document.getElementById("anexosAvisos");
  const ul = document.getElementById("anexosAvisosLista");
  if (!box || !ul) return;

  ul.innerHTML = "";
  (messages || []).forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    ul.appendChild(li);
  });

  box.hidden = (messages || []).length === 0;
}

function clearAttachmentWarnings() {
  showAttachmentWarnings([]);
}

function computePrazoTextoForStatus(statusIndex) {
  const dias = STATUS_FLOW[statusIndex]?.prazoDias ?? 0;
  const base = new Date();
  const prazo = new Date(base.getTime() + dias * 24 * 60 * 60 * 1000);
  return dias === 0 ? "Imediato" : `${dias} dia(s) (estimado até ${prazo.toLocaleDateString("pt-BR")})`;
}

function updateConfirmationStatusUI(statusIndex) {
  const statusEl = $("statusAtual");
  const prazoEl = $("prazoEstimado");
  if (statusEl) statusEl.textContent = STATUS_FLOW[statusIndex]?.label || "—";
  if (prazoEl) prazoEl.textContent = computePrazoTextoForStatus(statusIndex);
}



function setGlobalStatus(message) {
  const el = $("statusGlobal");
  if (el) el.textContent = message;
}

// ===== Exportação em PDF (via impressão) =====
// Abre uma janela com um resumo e chama window.print().
// O usuário pode escolher "Salvar como PDF".
function exportConsultaAsPDF() {
  try {
    const proto = ($("crProto")?.textContent || "").trim();

    if (!proto) {
      setGlobalStatus("Nada para exportar: faça uma consulta válida pelo protocolo.");
      return;
    }

    // Dados da tela
    const status = ($("crStatus")?.textContent || "—").trim();
    const prazo = ($("crPrazo")?.textContent || "—").trim();

    const tipo = ($("crTipo")?.textContent || "—").trim();
    const descricao = ($("crDescricao")?.textContent || "—").trim();
    const orgao = ($("crOrgao")?.textContent || "—").trim();
    const local = ($("crLocal")?.textContent || "—").trim();
    const identificacao = ($("crIdentificacao")?.textContent || "—").trim();

    // Anexos: mantém <br> (já vem do innerHTML)
    const anexosHtml = ($("crAnexos")?.innerHTML || "Nenhum anexo").trim();

    // IZA
    const izaTema = ($("crIzaTema")?.textContent || "—").trim();
    const izaOrgao = ($("crIzaOrgao")?.textContent || "—").trim();
    const izaPrioridade = ($("crIzaPrioridade")?.textContent || "—").trim();
    const izaConfianca = ($("crIzaConfianca")?.textContent || "—").trim();

    const izaAlertasLis = [...($("crIzaAlertas")?.querySelectorAll("li") || [])];
    const izaAlertasHtml =
      izaAlertasLis.length > 0
        ? `<ul>${izaAlertasLis.map(li => `<li>${escapeHtml(li.textContent || "")}</li>`).join("")}</ul>`
        : `<p class="muted">Sem alertas.</p>`;

    // Timeline com base no registro salvo (mais confiável)
    const rec = findManifestacaoByProtocolo(proto);
    const statusIndex = rec?.statusIndex ?? 0;

    const timelineHtml = STATUS_FLOW
      .map((s, idx) => `${idx <= statusIndex ? "●" : "○"} ${escapeHtml(s.label)}`)
      .join("<br>");

    // Histórico
    const histLis = [...($("crHistorico")?.querySelectorAll("li") || [])];
    const histItemsHtml =
      histLis.length > 0
        ? histLis.map(li => `<li>${escapeHtml(li.textContent || "")}</li>`).join("")
        : `<li>Sem histórico.</li>`;

    // HTML do “PDF”
    const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Consulta - ${escapeHtml(proto)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 18px; }
    h1 { margin: 0 0 12px; }
    h2 { margin: 0 0 8px; font-size: 16px; }
    .box { border: 1px solid #ccc; border-radius: 10px; padding: 12px; margin: 12px 0; }
    .muted { color: #555; font-size: 12px; }
    ul { padding-left: 18px; }
    p { margin: 6px 0; }
  </style>
</head>
<body>
  <h1>Consulta de Manifestação</h1>

  <div class="box">
    <p><strong>Protocolo:</strong> ${escapeHtml(proto)}</p>
    <p><strong>Status:</strong> ${escapeHtml(status)}</p>
    <p><strong>Prazo estimado:</strong> ${escapeHtml(prazo)}</p>
  </div>

  <div class="box">
    <h2>Resumo da manifestação</h2>
    <p><strong>Tipo:</strong> ${escapeHtml(tipo)}</p>
    <p><strong>Relato:</strong> ${escapeHtml(descricao)}</p>
    <p><strong>Órgão/assunto:</strong> ${escapeHtml(orgao)}</p>
    <p><strong>Local:</strong> ${escapeHtml(local)}</p>
    <p><strong>Anexos:</strong><br>${anexosHtml}</p>
    <p><strong>Identificação:</strong> ${escapeHtml(identificacao)}</p>
  </div>

  <div class="box">
    <h2>Análise automática (IZA)</h2>
    <p><strong>Tema:</strong> ${escapeHtml(izaTema)}</p>
    <p><strong>Órgão sugerido:</strong> ${escapeHtml(izaOrgao)}</p>
    <p><strong>Prioridade:</strong> ${escapeHtml(izaPrioridade)}</p>
    <p><strong>Confiança (simulada):</strong> ${escapeHtml(izaConfianca)}</p>
    <div class="muted">Observação: triagem automática (protótipo), sujeita a revisão pela Ouvidoria.</div>
    <div style="margin-top:8px;">
      <strong>Alertas:</strong>
      ${izaAlertasHtml}
    </div>
  </div>

  <div class="box">
    <h2>Linha do tempo</h2>
    <p>${timelineHtml}</p>
  </div>

  <div class="box">
    <h2>Histórico</h2>
    <ul>${histItemsHtml}</ul>
  </div>

  <script>
    window.onload = function () {
      window.print();
      setTimeout(function () { window.close(); }, 250);
    };
  </script>
</body>
</html>`;

    // Abre e escreve
    const w = window.open("about:blank", "_blank");
  if (!w) {
  setGlobalStatus("Não foi possível abrir a janela de impressão (bloqueio de pop-up).");
  return;
  }

  // Segurança: evita que a nova aba consiga acessar a aba original
  try { w.opener = null; } catch (_) {}

  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();

  } catch (err) {
    console.error("Erro ao exportar PDF:", err);

    // Fallback: imprime a própria aba (funciona mesmo se pop-up der problema)
    setGlobalStatus("Falha ao abrir a janela de exportação. Abrindo impressão nesta aba.");
    window.print();
  }
}

// Utilitário: evita quebrar HTML ao imprimir
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== Navegação entre telas (UI) =====
// Simula páginas sem recarregar. Como o foco é CADASTRO, a tela inicial será o formulário.
function showSection(sectionIdToShow) {
  const ids = ["secConsulta", "secPreview", "secResultado"]; // secHome/secConsulta podem existir ou não
  const formCard = $("formManifestacao")?.closest(".card");
  
 
  // Oculta telas conhecidas (se existirem)
  ids.forEach((id) => {
    const el = $(id);
    if (el) el.hidden = true;
  });

  // Oculta formulário por padrão
  if (formCard) formCard.hidden = true;

  // Mostra somente o que foi pedido
  if (sectionIdToShow === "form") {
    if (formCard) formCard.hidden = false;
    return;
  }

  const target = $(sectionIdToShow);
  if (target) target.hidden = false;
}

// Mascara e-mail para exibição na consulta (proteção de dados por padrão)
function maskEmailForDisplay(email) {
  if (!email || !email.includes("@")) return "—";
  const [user, domain] = email.split("@");
  const safeUser =
    user.length <= 2
      ? user[0] + "*"
      : user[0] + "*".repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
  return `${safeUser}@${domain}`;
}

// Renderiza o resumo completo (dados do cadastro) na tela de consulta
function renderConsultaResumo(rec) {
  const sub = rec?.submission || {};

  $("crTipo").textContent = sub.tipo ? getTipoLabelFromValue(sub.tipo) : "—";
  $("crDescricao").textContent = sub.descricao || "—";
  $("crOrgao").textContent = sub.orgao || "—";
  $("crLocal").textContent = sub.local || "—";

  // Identificação: mostra anônimo ou exibe nome + e-mail mascarado
  if (sub.anonimo) {
    $("crIdentificacao").textContent = "Manifestação anônima";
  } else {
    const nome = sub.nome || "—";
    const email = maskEmailForDisplay(sub.email || "");
    $("crIdentificacao").textContent = `${nome} (${email})`;
  }

  // Anexos (nomes): no protótipo armazenamos só metadados
  const atts = Array.isArray(rec.attachments) ? rec.attachments : [];
  if (atts.length === 0) {
    $("crAnexos").textContent = "Nenhum anexo";
  } else {
    $("crAnexos").innerHTML = atts
      .map(a => `${a.name} (${Math.round((a.size || 0) / 1024)} KB)`)
      .join("<br>");
  }
}
    
// ===== Consulta: render da IZA =====
function renderConsultaIZA(iza) {
  if (!iza) {
    if ($("crIzaTema")) $("crIzaTema").textContent = "—";
    if ($("crIzaOrgao")) $("crIzaOrgao").textContent = "—";
    if ($("crIzaPrioridade")) $("crIzaPrioridade").textContent = "—";
    if ($("crIzaConfianca")) $("crIzaConfianca").textContent = "—";
    if ($("crIzaAlertasWrap")) $("crIzaAlertasWrap").hidden = true;
    if ($("crIzaAlertas")) $("crIzaAlertas").innerHTML = "";
    return;
  }

  if ($("crIzaTema")) $("crIzaTema").textContent = iza.tema || "—";
  if ($("crIzaOrgao")) $("crIzaOrgao").textContent = iza.orgao || "—";
  if ($("crIzaPrioridade")) $("crIzaPrioridade").textContent = iza.prioridade || "—";
  if ($("crIzaConfianca")) $("crIzaConfianca").textContent = iza.confianca || "—";

  const alertas = Array.isArray(iza.alertas) ? iza.alertas : [];
  const wrap = $("crIzaAlertasWrap");
  const ul = $("crIzaAlertas");

  if (!wrap || !ul) return;

  ul.innerHTML = "";
  if (alertas.length === 0) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  alertas.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a;
    ul.appendChild(li);
  });
}


// ===== Renderização da consulta completa (GLOBAL) =====
function renderConsultaTimeline(statusIndex) {
  const ol = $("crTimeline");
  if (!ol) return;

  ol.innerHTML = "";

  STATUS_FLOW.forEach((s, idx) => {
    const li = document.createElement("li");
    li.classList.toggle("active", idx <= statusIndex);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = s.label;

    li.appendChild(dot);
    li.appendChild(label);
    ol.appendChild(li);
  });
}

function renderConsultaHistorico(historyArray) {
  const ul = $("crHistorico");
  if (!ul) return;

  ul.innerHTML = "";

  const arr = Array.isArray(historyArray) ? historyArray : [];
  if (arr.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Sem histórico registrado neste protótipo.";
    ul.appendChild(li);
    return;
  }

  arr.forEach((txt) => {
    const li = document.createElement("li");
    li.textContent = txt;
    ul.appendChild(li);
  });
}

// Converte o value interno do tipo para um rótulo “bonito”.
// Como a consulta pode acontecer depois, não dá para confiar no select atual.
// Por isso usei um mapeamento fixo.
function getTipoLabelFromValue(value) {
  const v = (value || "").toLowerCase();
  const map = {
    "geral": "Geral / Não sei classificar",
    "reclamacao": "Reclamação",
    "denuncia": "Denúncia",
    "solicitacao": "Solicitação",
    "elogio": "Elogio",
    "sugestao": "Sugestão"
  };
  return map[v] || value || "—";
}


function updateDescricaoCounter() {
  const ta = $("descricao");
  const counter = $("descricaoContador");
  if (!ta || !counter) return;

  counter.textContent = `${ta.value.length} / ${MAX_DESC_CHARS} caracteres`;
}


function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const rnd = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `DF-${ano}-${rnd}`;
}

/* ===== Detecção simples de PII (dados pessoais) ===== */
const patterns = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
  telefone: /(\+?\d{2}\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/
};

function contemPII(texto) {
  if (!texto) return false;
  return patterns.email.test(texto) || patterns.cpf.test(texto) || patterns.telefone.test(texto);
}

function mascararPII(texto) {
  if (!texto) return texto;

  texto = texto.replace(patterns.email, (m) => {
    const [user, domain] = m.split("@");
    if (!user) return m;
    const safeUser =
      user.length <= 2
        ? user[0] + "*"
        : user[0] + "*".repeat(Math.max(1, user.length - 2)) + user[user.length - 1];
    return `${safeUser}@${domain}`;
  });

  texto = texto.replace(patterns.cpf, (m) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length !== 11) return m;
    return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
  });

  texto = texto.replace(patterns.telefone, (m) => {
    const digits = m.replace(/\D/g, "");
    if (digits.length < 8) return m;
    // máscara simples mantendo 2 primeiros e 2 últimos
    let seen = 0;
    return m.replace(/\d/g, (d) => {
      seen += 1;
      return (seen <= 2 || seen > digits.length - 2) ? d : "*";
    });
  });

  return texto;
}

/* ===== Triagem IZA (simulada) ===== Aqui pode ser acrescentados outros itens */
const IZA_KB = [
  {
    tema: "Transporte público",
    orgao: "Secretaria de Transporte / DFTrans",
    prioridadeBase: "Alta",
    keywords: ["ônibus", "metro", "metrô", "parada", "linha", "tarifa", "passagem", "rodoviaria", "rodoviária", "lotação"]
  },
  {
    tema: "Saúde",
    orgao: "Secretaria de Saúde",
    prioridadeBase: "Alta",
    keywords: ["hospital", "upa", "posto", "médico", "medico", "remédio", "remedio", "exame", "fila", "ambulância", "ambulancia", "vacina"]
  },
  {
    tema: "Educação",
    orgao: "Secretaria de Educação",
    prioridadeBase: "Alta",
    keywords: ["escola", "professor", "merenda", "matrícula", "matricula", "creche", "aluno", "sala de aula", "transporte escolar"]
  },
  {
    tema: "Segurança / Ordem pública",
    orgao: "Secretaria de Segurança Pública",
    prioridadeBase: "Alta",
    keywords: ["assalto", "roubo", "furto", "violência", "violencia", "ameaça", "ameaça", "drogas", "tráfico", "trafico", "barulho", "perturbação", "perturbacao"]
  },
  {
    tema: "Urbanismo e manutenção",
    orgao: "Administração Regional / Novacap",
    prioridadeBase: "Alta",
    keywords: ["buraco", "asfalto", "iluminação", "iluminacao", "lâmpada", "lampada", "poda", "árvore", "arvore", "calçada", "calcada", "lixo", "entulho", "esgoto"]
  },
  {
    tema: "Atendimento ao cidadão",
    orgao: "Órgão responsável pelo serviço",
    prioridadeBase: "Alta",
    keywords: ["atendimento", "demora", "fila", "servidor", "site", "aplicativo", "erro", "não funciona", "nao funciona", "protocolo"]
  },
  {
    tema: "Trânsito",
    orgao: "Departamento de trânsito",
    prioridadeBase: "Alta",
    keywords: ["Quebra mola", "lombada", "radar", "semáforo", "faixa de pedestre", "estacionamento", "vaga de idoso", "lombada", "sinalização vertical", "sinalização horizontal"]
  }
  
];

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove acentos
}

function computeIZA(texto, tipoSelecionado) {
  const t = normalizeText(texto);

  // Alertas baseados em conteúdo (exemplos)
  const alertas = [];
  if (contemPII(texto)) alertas.push("Possível dado pessoal detectado no relato (recomenda-se minimizar/mascarar).");
  if (t.length < 40) alertas.push("Relato muito curto — pode dificultar análise e encaminhamento.");
  if (t.includes("urgente") || t.includes("imediato") || t.includes("socorro")) alertas.push("Usuário indicou urgência no texto.");

  // Scoring por tema
  let best = null;
  for (const item of IZA_KB) {
    let score = 0;
    for (const kw of item.keywords) {
      const nkw = normalizeText(kw);
      if (nkw && t.includes(nkw)) score += 1;
    }
    if (!best || score > best.score) best = { ...item, score };
  }

  // fallback se não bateu keyword
  if (!best || best.score === 0) {
    best = {
      tema: "Geral / Outros",
      orgao: "Triagem manual",
      prioridadeBase: "Baixa",
      score: 0
    };
  }

  // Prioridade final (regras simples)
  let prioridade = best.prioridadeBase;

  // Ajusta prioridade com base no tipo informado pelo cidadão.
  // Observação: "geral" (não sei classificar) NÃO deve aumentar prioridade automaticamente.
  const tipo = (tipoSelecionado || "").toLowerCase();

  if (tipo.includes("denuncia")) {
  // Denúncia tende a exigir maior atenção (triagem mais rápida)
  prioridade = "Alta";
  } else if (tipo.includes("geral")) {
  // Mantém prioridade na base do tema, pois o cidadão não classificou
  prioridade = best.prioridadeBase;
  }

  // palavras que sobem prioridade
  if (t.includes("risco") || t.includes("criança") || t.includes("crianca") || t.includes("idoso")) prioridade = "Alta";

  // “confiança” simulada baseada no score
  const confianca = best.score === 0 ? 0.35 : Math.min(0.95, 0.55 + best.score * 0.10);

  return {
    tema: best.tema,
    orgao: best.orgao,
    prioridade,
    confianca: `${Math.round(confianca * 100)}%`,
    alertas
  };
}

function renderIZA(iza) {
  if (!iza) return;

  if ($("izaTema")) $("izaTema").textContent = iza.tema;
  if ($("izaOrgao")) $("izaOrgao").textContent = iza.orgao;
  if ($("izaPrioridade")) $("izaPrioridade").textContent = iza.prioridade;
  if ($("izaConfianca")) $("izaConfianca").textContent = iza.confianca;

  const box = $("izaAlertasBox");
  const ul = $("izaAlertas");
  if (!box || !ul) return;

  ul.innerHTML = "";
  if (!iza.alertas || iza.alertas.length === 0) {
    box.hidden = true;
    return;
  }

  iza.alertas.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a;
    ul.appendChild(li);
  });
  box.hidden = false;
}


/* ===== Validação acessível ===== */
function showError(fieldId, message) {
  const err = $(fieldId + "Erro");
  if (!err) return;
  err.hidden = false;
  err.textContent = message;
}

function clearError(fieldId) {
  const err = $(fieldId + "Erro");
  if (!err) return;
  err.hidden = true;
  err.textContent = "";
}

/* ===== Anexos ===== */
function formatKB(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

function renderSelectedFiles() {
  const resumo = $("anexosResumo");
  const ul = $("listaAnexos");
  if (!resumo || !ul) return;

  ul.innerHTML = "";

  if (!selectedFiles || selectedFiles.length === 0) {
    resumo.textContent = "Nenhum anexo selecionado.";
    return;
  }

  resumo.textContent = `${selectedFiles.length} anexo(s) selecionado(s).`;

  selectedFiles.forEach((f, idx) => {
    const li = document.createElement("li");
    li.className = "attachment-item";

    const meta = document.createElement("div");
    meta.className = "attachment-meta";

    const name = document.createElement("p");
    name.className = "attachment-name";
    name.textContent = f.name;

    const details = document.createElement("p");
    details.className = "attachment-details";
    details.textContent = `${f.type || "tipo desconhecido"} • ${formatKB(f.size)}`;

    meta.appendChild(name);
    meta.appendChild(details);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-small";
    btn.textContent = "Remover";
    btn.setAttribute("aria-label", `Remover anexo ${f.name}`);
    btn.addEventListener("click", () => {
      const removed = selectedFiles[idx];
      selectedFiles.splice(idx, 1);
      renderSelectedFiles();
      setGlobalStatus(`Anexo removido: ${removed?.name || "arquivo"}.`);
      // Mantém foco no lugar certo (acessibilidade)
      $("anexos")?.focus();
    });

    li.appendChild(meta);
    li.appendChild(btn);
    ul.appendChild(li);
  });

  updateTotalUI();

  function showAttachmentWarnings(messages) {
  const box = $("anexosAvisos");
  const ul = $("anexosAvisosLista");
  if (!box || !ul) return;

  ul.innerHTML = "";
  (messages || []).forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    ul.appendChild(li);
  });

  box.hidden = (messages || []).length === 0;
}

}

function renderAnexos(files) {
  // Mantemos por compatibilidade, mas agora só chama o render do estado
  // (não usamos mais diretamente "files")
  renderSelectedFiles();
}


/* ===== Anonimato ===== */
function setAnonimoUI(isAnonimo) {
  const box = $("anonimoAviso");
  const campos = $("identificacaoCampos");
  if (box) box.hidden = !isAnonimo;
  if (campos) campos.hidden = isAnonimo;

  if (isAnonimo) {
    const nome = $("nome");
    const email = $("email");
    if (nome) nome.value = "";
    if (email) email.value = "";
  }
}

/* ===== Rascunho local ===== */
const DRAFT_KEY = "participa_ouvidoria_rascunho_v1";

function getFormData() {
  return {
    tipo: $("tipo")?.value.trim() || "",
    descricao: $("descricao")?.value.trim() || "",
    orgao: $("orgao")?.value.trim() || "",
    local: $("local")?.value.trim() || "",
    anonimo: $("anonimo")?.checked || false,
    nome: $("nome")?.value.trim() || "",
    email: $("email")?.value.trim() || ""
  };
}
 /* Função para Exibir o preview */
function renderPreview(data) {
  $("pvTipo").textContent = getTipoLabel();
  $("pvDescricao").textContent = data.descricao || "—";
  $("pvOrgao").textContent = data.orgao || "—";
  $("pvLocal").textContent = data.local || "—";

  if (selectedFiles.length === 0) {
    $("pvAnexos").textContent = "Nenhum anexo";
  } else {
    $("pvAnexos").innerHTML = selectedFiles
      .map(f => `${f.name} (${Math.round(f.size / 1024)} KB)`)
      .join("<br>");
  }

  $("pvIdentificacao").textContent = data.anonimo
    ? "Manifestação anônima"
    : `${data.nome || "—"} (${data.email || "—"})`;
}
// Retorna o texto da opção selecionada no select de "tipo".
// Isso evita mostrar valores internos como "reclamacao" no preview.
  function getTipoLabel() {
  const sel = $("tipo");
  if (!sel) return "—";
  return sel.options[sel.selectedIndex]?.textContent || "—";
}

 
function saveDraft() {
  const data = getFormData();
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  setGlobalStatus("Rascunho salvo localmente.");
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    if ($("tipo")) $("tipo").value = data.tipo || "";
    if ($("descricao")) $("descricao").value = data.descricao || "";
    if ($("orgao")) $("orgao").value = data.orgao || "";
    if ($("local")) $("local").value = data.local || "";
    if ($("anonimo")) $("anonimo").checked = !!data.anonimo;
    if ($("nome")) $("nome").value = data.nome || "";
    if ($("email")) $("email").value = data.email || "";

    setAnonimoUI(!!data.anonimo);
    setGlobalStatus("Rascunho carregado.");
  } catch {
    // ignora
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/* ===== Status / Transparência ===== */
const STATUS_FLOW = [
  { key: "recebido", label: "Recebido", prazoDias: 0 },
  { key: "triagem", label: "Triagem", prazoDias: 2 },
  { key: "encaminhado", label: "Encaminhado ao órgão", prazoDias: 7 },
  { key: "resposta", label: "Resposta", prazoDias: 20 }
];

let currentStatusIndex = 0;
let currentProto = null;
let currentSubmission = null;
// ===== Anexos selecionados (fonte da verdade) =====
let selectedFiles = [];
let currentHistory = []; // fonte da verdade do histórico (não depende da UI)


const MAX_FILE_BYTES = 20 * 1024 * 1024;   // 20 MB
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;  // 50 MB
const MAX_DESC_CHARS = 2000;

// ===== "Banco" local (simulado) =====
// isso demonstra persistência sem exigir servidor.
// Armazena manifestações no localStorage para permitir consulta por protocolo.
const STORAGE_KEY = "participa_manifestacoes_v2";

function loadManifestacoes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveManifestacoes(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function upsertManifestacao(record) {
  const list = loadManifestacoes();
  const idx = list.findIndex((x) => x.protocolo === record.protocolo);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  saveManifestacoes(list);
}

function findManifestacaoByProtocolo(proto) {
  const list = loadManifestacoes();
  return list.find((x) => x.protocolo === proto) || null;
}

// ===== Persistência do estado (status + histórico) =====
// Constrói um array de histórico a partir da UL atual do resultado (#historico).
function getHistoricoFromUI() {
  return Array.isArray(currentHistory) ? currentHistory : [];
}


// Salva/atualiza a manifestação atual no localStorage.
// Isso permite consultar depois com timeline + histórico.
function persistCurrentManifestacao(extra = {}) {
  if (!currentProto) return;

  // Captura histórico e status a partir do que está na tela
  const history = Array.isArray(currentHistory) ? currentHistory : [];


  // Monta o registro completo
  const record = {
    protocolo: currentProto,
    statusIndex: currentStatusIndex,
    statusLabel: STATUS_FLOW[currentStatusIndex].label,
    prazoTexto: $("prazoEstimado")?.textContent || "",
    criadoEm: extra.criadoEm || new Date().toISOString(),
    submission: currentSubmission || null,
    history,
    // espaço para evoluções futuras (IZA, anexos, etc.)
    iza: extra.iza || null,
    // Guarda metadados dos anexos (sem conteúdo do arquivo)
    attachments: selectedFiles.map(f => ({
    name: f.name,
    type: f.type || "",
    size: f.size || 0
  }))

  };

  upsertManifestacao(record);
}


function bytesToHuman(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function allowedType(file) {
  // aceita: audio/*, image/*, video/*, application/pdf
  if (!file || !file.type) return false;
  return (
    file.type.startsWith("audio/") ||
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type === "application/pdf"
  );
}

function totalSelectedBytes() {
  return selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
}

function updateTotalUI() {
  const el = $("anexosTotal");
  if (!el) return;
  el.textContent = `Tamanho total: ${bytesToHuman(totalSelectedBytes())}`;
}


function formatDateTime(d = new Date()) {
  return d.toLocaleString("pt-BR");
}

function addHistoryItem(text) {
  const entry = `${formatDateTime()} — ${text}`;

  // 1) salva sempre em memória
  currentHistory.unshift(entry);

  // 2) se existir UI de histórico, atualiza também
  const ul = $("historico");
  if (!ul) return;

  const li = document.createElement("li");
  li.textContent = entry;
  ul.prepend(li);
}


function updateTimelineUI() {
  const timeline = $("timeline");
  const statusEl = $("statusAtual");
  const prazoEl = $("prazoEstimado");
  const btnBack = $("btnVoltarStatus");
  const btnNext = $("btnAvancarStatus");

  if (!timeline || !statusEl || !prazoEl || !btnBack || !btnNext) return;

  const items = [...timeline.querySelectorAll("li")];
  items.forEach((li, idx) => li.classList.toggle("active", idx <= currentStatusIndex));

  statusEl.textContent = STATUS_FLOW[currentStatusIndex].label;

  const dias = STATUS_FLOW[currentStatusIndex].prazoDias;
  const base = new Date();
  const prazo = new Date(base.getTime() + dias * 24 * 60 * 60 * 1000);
  prazoEl.textContent =
    dias === 0 ? "Imediato" : `${dias} dia(s) (estimado até ${prazo.toLocaleDateString("pt-BR")})`;

  btnBack.disabled = currentStatusIndex === 0;
  btnNext.disabled = currentStatusIndex === STATUS_FLOW.length - 1;
}

function exportReceiptJSON() {
  const ul = $("historico");
  const history = ul ? [...ul.querySelectorAll("li")].map(li => li.textContent) : [];

  const payload = {
    protocolo: currentProto,
    status: STATUS_FLOW[currentStatusIndex],
    exportadoEm: formatDateTime(),
    manifestacao: currentSubmission,
    historico: history
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `recibo-${currentProto || "sem-protocolo"}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  setGlobalStatus("Recibo exportado em JSON.");
}

/* ===== Envio simulado + protocolo ===== */
function simulateSubmit() {
  currentProto = gerarProtocolo();
  currentSubmission = getFormData();
  currentStatusIndex = 0;
  // Zera histórico da submissão atual
currentHistory = [];
if ($("historico")) $("historico").innerHTML = "";


// Triagem IZA (simulada) com base no relato e no tipo selecionado
  const iza = computeIZA(currentSubmission.descricao, currentSubmission.tipo);
  // Regra de pré-triagem:
// Se a IZA sugeriu um órgão específico (diferente de "Triagem manual"),
// consideramos que já houve Triagem + Encaminhamento (prévia automática).
const orgaoSugerido = (iza.orgao || "").toLowerCase();
const preTriagem = orgaoSugerido && orgaoSugerido !== "triagem manual";

currentStatusIndex = preTriagem ? 2 : 0; // 0=Recebido, 2=Encaminhado ao órgão

  renderIZA(iza);
  addHistoryItem(`Triagem automática (IZA): tema "${iza.tema}", órgão "${iza.orgao}", prioridade "${iza.prioridade}".`);

  const protoEl = $("protocolo");
  if (protoEl) protoEl.textContent = currentProto;

  // limpa histórico anterior
  if ($("historico")) $("historico").innerHTML = "";
  addHistoryItem("Manifestação registrada com sucesso.");
  addHistoryItem(`Status definido como: ${STATUS_FLOW[currentStatusIndex].label}.`);

  addHistoryItem(`Triagem automática (IZA): tema "${iza.tema}", órgão "${iza.orgao}", prioridade "${iza.prioridade}".`);

  if (preTriagem) {
  addHistoryItem("Pré-triagem automática concluída.");
  addHistoryItem(`Encaminhamento automático sugerido ao órgão: "${iza.orgao}" (sujeito a revisão pela Ouvidoria).`);
  }

  updateTimelineUI();
  // Salva no "banco local" para permitir consulta completa depois
  persistCurrentManifestacao({ iza, criadoEm: new Date().toISOString() });


  const secResultado = $("secResultado");
  const formCard = $("formManifestacao")?.closest(".card");
  if (secResultado) secResultado.hidden = false;
  if (formCard) formCard.hidden = true;

  setGlobalStatus(`Manifestação registrada. Protocolo ${currentProto}.`);

  const titulo = $("tituloResultado");
  if (titulo) {
    titulo.setAttribute("tabindex", "-1");
    titulo.focus();
  }

   
   updateConfirmationStatusUI(currentStatusIndex);
   // Mostra a tela de confirmação (resultado) após gerar protocolo
  showSection("secResultado");

}

/* ===== Inicialização ===== */
document.addEventListener("DOMContentLoaded", () => {

  // Inicializa UI do mapa (arquivo mapa.js)
  window.MapaLocal?.initMapUI();

  window.addEventListener("mapa:selecionado", (ev) => {
  // ev.detail = { lat, lng, endereco }
  // Aqui você pode, por exemplo, registrar no histórico:
  // addHistoryItem(`Local selecionado no mapa: ${ev.detail.lat.toFixed(6)}, ${ev.detail.lng.toFixed(6)}`);
});

// ===== Consulta por protocolo (Modal) =====
function openConsultaModal() {
  const dlg = $("dlgConsulta");
  if (!dlg) return;

  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "open");

  // limpa erro e foca
  const err = $("consultaProtocoloErroModal");
  if (err) { err.hidden = true; err.textContent = ""; }

  $("consultaProtocoloModal")?.focus();
}

function closeConsultaModal() {
  const dlg = $("dlgConsulta");
  if (!dlg) return;

  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");

  // devolve foco ao botão
  $("btnAbrirConsulta")?.focus();
}

$("btnAbrirConsulta")?.addEventListener("click", openConsultaModal);
$("btnFecharConsulta")?.addEventListener("click", closeConsultaModal);

// Submit do modal: abre nova aba no modo consulta
$("formConsultaModal")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const err = $("consultaProtocoloErroModal");
  if (err) { err.hidden = true; err.textContent = ""; }

  const proto = ($("consultaProtocoloModal")?.value || "").trim().toUpperCase();
  if (!proto) {
    if (err) { err.hidden = false; err.textContent = "Informe o protocolo."; }
    $("consultaProtocoloModal")?.focus();
    return;
  }

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("view", "consulta");
  url.searchParams.set("protocolo", proto);

  window.open(url.toString(), "_blank");
  closeConsultaModal();
  setGlobalStatus("Consulta aberta em nova aba.");
});


// ===== Modo consulta (aba separada) =====
// Se a página abrir com ?view=consulta&protocolo=..., mostramos SOMENTE a consulta e saímos (return).
{
  const params = new URLSearchParams(window.location.search);
  const view = (params.get("view") || "").toLowerCase();
  const protoFromUrl = (params.get("protocolo") || "").trim().toUpperCase();

  // Código para visualizar dados da consulta
  if (view === "consulta") {
    // Esconde o card do cadastro (onde está o formManifestacao)
    if ($("formManifestacao")) $("formManifestacao").hidden = true;
    $("tituloForm") && ($("tituloForm").hidden = true);

    // Esconde preview e resultado do cadastro (se existirem)
    if ($("secPreview")) $("secPreview").hidden = true;
    if ($("secResultado")) $("secResultado").hidden = true;

     // Tenta localizar no "banco local"
    const rec = protoFromUrl ? findManifestacaoByProtocolo(protoFromUrl) : null;

    if (rec) {
      $("crProto").textContent = rec.protocolo;
      $("crStatus").textContent = rec.statusLabel || "—";
      $("crPrazo").textContent = rec.prazoTexto || "—";
      renderConsultaIZA(rec.iza || null);

      // Preenche partes completas (só chama se existir, para não quebrar)
      if (typeof renderConsultaResumo === "function") renderConsultaResumo(rec);
      renderConsultaIZA(rec.iza || null);
      if (typeof renderConsultaTimeline === "function") renderConsultaTimeline(rec.statusIndex ?? 0);
      if (typeof renderConsultaHistorico === "function") renderConsultaHistorico(rec.history || []);

      if ($("consultaResultado")) $("consultaResultado").hidden = false;
      

      document.title = `Consulta ${protoFromUrl} – Participa DF`;
      setGlobalStatus(`Consulta carregada para o protocolo ${protoFromUrl}.`);

      $("consultaResultado")?.setAttribute("tabindex", "-1");
      $("consultaResultado")?.focus();
    } else {
      // Se não achar, mostra uma mensagem (e reabilita o formConsulta para tentar outro, se você quiser)
      const err = $("consultaProtocoloErro");
      if (err) {
        err.hidden = false;
        err.textContent = protoFromUrl
          ? "Protocolo não encontrado neste protótipo (verifique se foi gerado neste navegador)."
          : "Nenhum protocolo informado na URL.";
      }
      document.title = "Consulta – Participa DF";
    }
    // Botão exportar para PDF
    $("btnExportarConsultaPDF")?.addEventListener("click", exportConsultaAsPDF);

    return;
  }
 }
 
// Limpar consulta (na aba principal)
$("btnLimparConsulta")?.addEventListener("click", () => {
  if ($("consultaProtocolo")) $("consultaProtocolo").value = "";
  if ($("consultaResultado")) $("consultaResultado").hidden = true;
  const err = $("consultaProtocoloErro");
  if (err) { err.hidden = true; err.textContent = ""; }
  setGlobalStatus("Consulta limpa.");
  $("consultaProtocolo")?.focus();
});

 
  updateDescricaoCounter();

  // PWA: registra service worker
  //if ("serviceWorker" in navigator) {
   // navigator.serviceWorker.register("service-worker.js").catch(() => {});
 // }

  loadDraft();

  // Eventos incluir anexos
  $("anexos")?.addEventListener("change", (e) => {
  const newFiles = [...(e.target.files || [])];
  if (newFiles.length === 0) return;

  const key = (f) => `${f.name}__${f.size}__${f.type}__${f.lastModified}`;
  const existing = new Set(selectedFiles.map(key));

  let added = 0;
  let rejected = 0;
  const reasons = [];

  for (const f of newFiles) {
    // tipo
    if (!allowedType(f)) {
      rejected += 1;
      reasons.push(`"${f.name}" recusado: tipo não permitido (${f.type || "desconhecido"}).`);
      continue;
    }

    // tamanho por arquivo
    if (f.size > MAX_FILE_BYTES) {
      rejected += 1;
      reasons.push(`"${f.name}" recusado: ${bytesToHuman(f.size)} excede o limite de ${bytesToHuman(MAX_FILE_BYTES)}.`);
      continue;
    }

    // deduplicação
    const k = key(f);
    if (existing.has(k)) {
      rejected += 1;
      reasons.push(`"${f.name}" ignorado: arquivo duplicado.`);
      continue;
    }

    // tamanho total
    const totalIfAdd = totalSelectedBytes() + f.size;
    if (totalIfAdd > MAX_TOTAL_BYTES) {
      rejected += 1;
      reasons.push(`"${f.name}" recusado: ultrapassa o limite total de ${bytesToHuman(MAX_TOTAL_BYTES)}.`);
      continue;
    }

    selectedFiles.push(f);
    existing.add(k);
    added += 1;
  }

  // limpa o input para permitir selecionar o mesmo arquivo novamente depois
  e.target.value = "";

  renderSelectedFiles();

 // Mostra motivos na interface (se houver)
  showAttachmentWarnings(reasons);

 // Mensagem acessível resumida
  if (added > 0 && rejected === 0) {
  setGlobalStatus(`${added} anexo(s) adicionado(s). Total: ${selectedFiles.length}.`);
  } else if (added > 0 && rejected > 0) {
  setGlobalStatus(`${added} adicionado(s) e ${rejected} recusado(s).`);
  } else {
  setGlobalStatus(`Nenhum anexo adicionado. ${rejected} arquivo(s) recusado(s).`);
  }

 });

  $("anonimo")?.addEventListener("change", (e) => {
    setAnonimoUI(e.target.checked);
    setGlobalStatus(e.target.checked ? "Anonimato ativado." : "Anonimato desativado.");
  });

  // Detecção PII ao digitar
  let piiIgnored = false;

  $("descricao")?.addEventListener("input", () => {
    updateDescricaoCounter();
    const text = $("descricao")?.value || "";
    const has = contemPII(text);
    if (piiIgnored) return;
    if ($("piiAviso")) $("piiAviso").hidden = !has;
    if (has) setGlobalStatus("Atenção: possível dado pessoal detectado no texto.");
  });

  $("btnMascarar")?.addEventListener("click", () => {
    const desc = $("descricao");
    if (desc) desc.value = mascararPII(desc.value);
    if ($("piiAviso")) $("piiAviso").hidden = true;
    piiIgnored = false;
    setGlobalStatus("Texto mascarado para reduzir exposição de dados pessoais.");
    $("descricao")?.focus();
  });

  $("btnIgnorarPii")?.addEventListener("click", () => {
    if ($("piiAviso")) $("piiAviso").hidden = true;
    piiIgnored = true;
    setGlobalStatus("Aviso de dados pessoais ignorado. Revise o texto antes de enviar.");
    $("descricao")?.focus();
  });

  $("btnRascunho")?.addEventListener("click", saveDraft);

  $("btnLimpar")?.addEventListener("click", () => {
    $("formManifestacao")?.reset();
    selectedFiles = [];
    if ($("anexos")) $("anexos").value = "";
    renderSelectedFiles();

    if ($("piiAviso")) $("piiAviso").hidden = true;
    piiIgnored = false;
    setAnonimoUI(false);
    clearDraft();
    setGlobalStatus("Formulário limpo.");
    $("tipo")?.focus();
  });

  $("btnNova")?.addEventListener("click", () => {
    $("secResultado") && ($("secResultado").hidden = true);
    const formCard = $("formManifestacao")?.closest(".card");
    if (formCard) formCard.hidden = false;
  
  


    $("formManifestacao")?.reset();
    selectedFiles = [];
    if ($("anexos")) $("anexos").value = "";
    renderSelectedFiles();

    if ($("piiAviso")) $("piiAviso").hidden = true;
    piiIgnored = false;
    setAnonimoUI(false);
    setGlobalStatus("Pronto para registrar nova manifestação.");
    $("tipo")?.focus();
});

// ===== Confirmação: Enviar por e-mail (mailto) =====
// Observação: em protótipo, usei mailto: (sem backend). Em produção seria envio via servidor.
$("btnEnviarEmail")?.addEventListener("click", () => {
  const rec = currentProto ? findManifestacaoByProtocolo(currentProto) : null;

  // Só envia se a pessoa informou e-mail e não marcou anônimo
  const sub = rec?.submission || currentSubmission || {};
  const email = (sub.email || "").trim();

  if (!email) {
    setGlobalStatus("Para enviar por e-mail, informe um e-mail no cadastro (ou não marque anônimo).");
    return;
  }

  const assunto = `Participa DF — Protocolo ${currentProto || ""}`;
  const corpo =
`Olá!

Segue a confirmação da manifestação registrada no Participa DF (protótipo):

Protocolo: ${currentProto || "—"}
Status: ${$("statusAtual")?.textContent || "Recebido"}
Prazo estimado: ${$("prazoEstimado")?.textContent || "—"}

Resumo:
Tipo: ${sub.tipo || "—"}
Relato: ${sub.descricao || "—"}

Observação: Este é um protótipo de hackathon. Em produção, o envio seria feito por sistema oficial.

Atenciosamente.`;

  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  window.location.href = mailto;
  setGlobalStatus("Abrindo seu aplicativo de e-mail para envio da confirmação.");
});


// ===== Confirmação: Imprimir / Salvar PDF =====
$("btnImprimirConfirmacao")?.addEventListener("click", () => {
  // Imprime a página atual. O usuário pode escolher "Salvar como PDF".
  window.print();
});
  // Fechar avisos de anexos (fica disponível sempre)
  $("btnFecharAvisosAnexos")?.addEventListener("click", () => {
  clearAttachmentWarnings();
  setGlobalStatus("Avisos de anexos fechados.");
  });

  // Exportar PDF (consulta)
  $("btnExportarConsultaPDF")?.addEventListener("click", () => {
  exportConsultaAsPDF();
  });



  $("btnLimparAnexos")?.addEventListener("click", () => {
    selectedFiles = [];
    if ($("anexos")) $("anexos").value = ""; // limpa input
    renderSelectedFiles();
    clearAttachmentWarnings();
    setGlobalStatus("Todos os anexos foram removidos.");
  $("anexos")?.focus();
 });

 $("btnEditarPreview")?.addEventListener("click", () => {
  $("secPreview").hidden = true;
  $("formManifestacao").closest(".card").hidden = false;
    setGlobalStatus("Você pode editar a manifestação.");
  $("tipo")?.focus();
  });

  $("btnConfirmarEnvio")?.addEventListener("click", () => {
  $("secPreview").hidden = true;
    clearDraft();
    simulateSubmit(); // envio definitivo
  });
   
    // ===== Tela inicial (Home) =====
  $("btnIrCriar")?.addEventListener("click", () => {
    setGlobalStatus("Você está criando uma nova manifestação.");
    $("tipo")?.focus();
  });

  $("btnIrConsultar")?.addEventListener("click", () => {
    showSection("secConsulta");
    setGlobalStatus("Informe o protocolo para consultar a manifestação.");
    $("consultaProtocolo")?.focus();
  });


  // Submit
 // ===== Cadastro: submit abre Preview (não envia direto) =====
$("formManifestacao")?.addEventListener("submit", (e) => {
  e.preventDefault(); // impede submit padrão (que jogava dados na URL)

  // (Opcional) log para depuração: pode remover depois
  // console.log("SUBMIT CAPTURADO - abrindo preview");

  // Limpa erros básicos (mantenha seus clears adicionais, se tiver)
  clearError("tipo");
  clearError("descricao");

  const data = getFormData();
  let ok = true;

  // Validações mínimas (mantenha suas validações atuais se já estiverem melhores)
  if (!data.tipo) {
    showError("tipo", "Selecione o tipo de manifestação.");
    ok = false;
  }
  if (!data.descricao) {
    showError("descricao", "Descreva sua manifestação no campo de relato.");
    ok = false;
  }
  if (data.descricao && typeof MAX_DESC_CHARS === "number" && data.descricao.length > MAX_DESC_CHARS) {
    showError("descricao", `O relato excede o limite de ${MAX_DESC_CHARS} caracteres.`);
    ok = false;
  }

  if (!ok) {
    setGlobalStatus("Há campos com erro. Revise as informações.");
    return;
  }

  // Abre tela de preview em vez de enviar direto
  renderPreview(data);

  // Garante que só o preview fique visível
  showSection("secPreview");

  // Foco acessível
  $("tituloPreview")?.setAttribute("tabindex", "-1");
  $("tituloPreview")?.focus();

  setGlobalStatus("Confira os dados antes de enviar.");
});
 
 // ===== Consulta por protocolo (abre em nova aba) =====
 // ===== Consulta por protocolo (abre em nova aba no modo consulta) =====
$("formConsulta")?.addEventListener("submit", (e) => {
  e.preventDefault();

  // Limpa erro visual
  const err = $("consultaProtocoloErro");
  if (err) {
    err.hidden = true;
    err.textContent = "";
  }

  // Lê e normaliza o protocolo
  const proto = ($("consultaProtocolo")?.value || "").trim().toUpperCase();

  if (!proto) {
    if (err) {
      err.hidden = false;
      err.textContent = "Informe o protocolo.";
    }
    $("consultaProtocolo")?.focus();
    return;
  }

  // Monta uma URL COMPLETA para a mesma página, adicionando parâmetros.
  // Usamos window.location.origin + window.location.pathname para não depender de hash/rota.
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("view", "consulta");
  url.searchParams.set("protocolo", proto);

  // Abre em nova aba (noopener por segurança)
  window.open(url.toString(), "_blank", "noopener");

  setGlobalStatus("Consulta aberta em nova aba.");
});


 // Botão limpa consulta 
 $("btnLimparConsulta")?.addEventListener("click", () => {
  if ($("consultaProtocolo")) $("consultaProtocolo").value = "";
  if ($("consultaResultado")) $("consultaResultado").hidden = true;
  const err = $("consultaProtocoloErro");
  if (err) { err.hidden = true; err.textContent = ""; }
  setGlobalStatus("Consulta limpa.");
  $("consultaProtocolo")?.focus();
 });

  
  // Inicia o app direto no formulário.
  setGlobalStatus("Pronto para registrar uma nova manifestação.");
  
 
function renderConsultaHistorico(historyArray) {
  const ul = $("crHistorico");
  if (!ul) return;

  ul.innerHTML = "";

  const arr = Array.isArray(historyArray) ? historyArray : [];
  if (arr.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Sem histórico registrado neste protótipo.";
    ul.appendChild(li);
    return;
  }

  arr.forEach((txt) => {
    const li = document.createElement("li");
    li.textContent = txt;
    ul.appendChild(li);
  });
}


 // Inicia o app direto no formulário (principal do hackathon)
showSection("form");
setGlobalStatus("Pronto para registrar uma nova manifestação.");


}); // Fim do DOMContentLoaded
