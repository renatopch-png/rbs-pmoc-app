/**
 * Serviço de integração WhatsApp
 * Envia PDFs e mensagens automaticamente para clientes
 */

// Configuração do WhatsApp Business API
const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0"; // URL correta da API oficial do WhatsApp Business
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.REACT_APP_WHATSAPP_BUSINESS_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.REACT_APP_WHATSAPP_ACCESS_TOKEN;

/**
 * Envia mensagem de texto via WhatsApp
 * @param {string} telefone - Número com código país (ex: 5521964581719)
 * @param {string} mensagem - Texto da mensagem
 * @returns {Promise}
 */
export async function enviarMensagemWhatsApp(telefone, mensagem) {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_BUSINESS_ACCOUNT_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: telefone,
          type: "text",
          text: {
            body: mensagem,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao enviar mensagem WhatsApp:", error);
    throw error;
  }
}

/**
 * Envia notificação de nova OS via WhatsApp
 * @param {string} telefone - Telefone do cliente
 * @param {object} ordem - Dados da ordem de serviço
 * @param {object} cliente - Dados do cliente
 * @param {object} equipamento - Dados do equipamento
 */
export async function notificarNovaOS(telefone, ordem, cliente, equipamento) {
  const mensagem = `
🔧 *NOVA ORDEM DE SERVIÇO*

*Cliente:* ${cliente.nome}
*Equipamento:* ${equipamento.nome}
*Data:* ${new Date(ordem.dataExecucao).toLocaleDateString("pt-BR")}
*Técnico:* ${ordem.tecnicoNome}

Acesse o link abaixo para visualizar os documentos:
https://rbs-pmoc.web.app/ordens-servico

Geradores disponíveis:
📄 PDF PMOC
📜 ART (Anotação de Responsabilidade Técnica)

RBS Engenharia Térmica
WhatsApp Business API
  `.trim();

  return enviarMensagemWhatsApp(telefone, mensagem);
}

/**
 * Envia lembrete de manutenção atrasada
 * @param {string} telefone - Telefone do cliente
 * @param {string} equipamento - Nome do equipamento
 * @param {string} ultimaData - Data da última manutenção
 */
export async function notificarManutencaoAtrasada(telefone, equipamento, ultimaData) {
  const mensagem = `
🚨 *MANUTENÇÃO ATRASADA*

Seu equipamento *${equipamento}* está com manutenção vencida!

Última manutenção: ${new Date(ultimaData).toLocaleDateString("pt-BR")}

Para agendar uma manutenção, entre em contato:
📞 (21) 96458-1719
💬 https://wa.me/5521964581719

RBS Refrigeração Elétrica • Engenharia Térmica
  `.trim();

  return enviarMensagemWhatsApp(telefone, mensagem);
}

/**
 * Envia link para abrir chamado via WhatsApp
 * Método simples: gera URL do WhatsApp com mensagem pré-preenchida
 * IMPORTANTE: quando o telefone não for informado, usa SEMPRE o número da
 * RBS — assim o chamado do cliente cai no nosso WhatsApp, e não no dele.
 * @param {string} telefone - Telefone de destino (com código país)
 * @param {string} mensagem - Mensagem inicial
 * @returns {string} - URL para abrir WhatsApp
 */
export function gerarLinkWhatsApp(telefone, mensagem = "Olá! Gostaria de agendar uma manutenção.") {
  const destino = String(telefone || "").replace(/\D/g, "") || "5521964581719";
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/${destino}?text=${mensagemCodificada}`;
}

/**
 * Abre WhatsApp com mensagem pré-preenchida (método simples sem API)
 * @param {string} telefone - Telefone de destino
 * @param {string} mensagem - Mensagem inicial
 */
export function abrirWhatsApp(telefone, mensagem = "Olá! Gostaria de agendar uma manutenção.") {
  const link = gerarLinkWhatsApp(telefone, mensagem);
  window.open(link, "_blank");
}

/**
 * Abre o WhatsApp DA RBS, ignorando qualquer telefone de cliente.
 * Use este nas páginas públicas (QR Code), onde quem clica é o cliente
 * e a mensagem precisa chegar na RBS.
 * @param {string} mensagem - Mensagem inicial
 */
export function abrirWhatsAppRBS(mensagem = "Olá! Gostaria de agendar uma manutenção.") {
  const mensagemCodificada = encodeURIComponent(mensagem);
  window.open(`https://wa.me/5521964581719?text=${mensagemCodificada}`, "_blank");
}

/**
 * Exporta nome da empresa e dados de contato para mensagens
 */
export const DADOS_RBS = {
  empresa: "RBS Refrigeração Elétrica",
  slogan: "Engenharia Térmica • Energia Solar",
  cnpj: "33.632.222/0001-86",
  endereco: "Rua Capitão Ferreira, 86 - Rio de Janeiro",
  telefone: "5521964581719", // Com código país, sem formatação
  telefoneFmt: "(21) 96458-1719",
  whatsappLink: "https://wa.me/5521964581719",
  // Responsável técnico, exibido nos relatórios (PMOC/ART/Contrato) junto
  // ao CNPJ — é o registro que dá respaldo legal ao serviço prestado.
  responsavelTecnico: "Renato Batista Soutinho",
  tituloTecnico: "Técnico em Eletromecânica",
  registroTecnico: "CRT-RJ Nº 08482058711",
};
