// Material de estudo "Meu Estudo": mapas mentais técnicos.
// Os PDFs ficam em public/estudos/ (um arquivo por tópico + o volume completo).
// Gerado a partir dos mapas; edite aqui o texto exibido no app.

export const COLECOES = [
 {
  "id": "refrigeracao",
  "titulo": "Automação de Refrigeração",
  "pdf": "/estudos/refrigeracao/refrigeracao-completo.pdf",
  "topicos": [
   {
    "id": "ciclo",
    "titulo": "Ciclo de refrigeração",
    "resumo": "Componentes, estados do fluido, capacidade e eficiência.",
    "tag": "CF",
    "pdf": "/estudos/refrigeracao/01-ciclo.pdf",
    "dica": "Pressão sozinha não diz nada: converta sempre na tabela P×T do fluido para saber a temperatura de saturação.",
    "ramos": [
     {
      "titulo": "Componentes",
      "itens": [
       "Compressor: eleva pressão e temperatura",
       "Condensador: rejeita calor",
       "Dispositivo de expansão: reduz a pressão",
       "Evaporador: absorve calor do ambiente"
      ]
     },
     {
      "titulo": "Estados do fluido",
      "itens": [
       "Sucção: vapor superaquecido, baixa pressão",
       "Descarga: vapor superaquecido, alta pressão",
       "Linha de líquido: líquido sub-resfriado",
       "Após a expansão: mistura líquido + vapor"
      ]
     },
     {
      "titulo": "Capacidade",
      "itens": [
       "1 TR = 12 000 BTU/h ≈ 3,517 kW",
       "1 kW ≈ 3 412 BTU/h",
       "1 kcal/h ≈ 3,968 BTU/h",
       "Depende da evaporação e da condensação"
      ]
     },
     {
      "titulo": "Eficiência",
      "itens": [
       "COP = capacidade / potência elétrica",
       "EER = BTU/h ÷ W",
       "IDRS: índice sazonal dos splits (Inmetro)",
       "Cada 1 K a menos na evaporação ≈ 2 % a 4 % mais consumo"
      ]
     },
     {
      "titulo": "Fluidos refrigerantes",
      "itens": [
       "R-22 (HCFC): em eliminação",
       "R-410A: splits e VRF",
       "R-32: splits inverter (A2L, levemente inflamável)",
       "R-404A → R-448A / R-449A no comercial",
       "R-290 e R-744 (CO₂): fluidos naturais"
      ]
     },
     {
      "titulo": "Faixas típicas de evaporação",
      "itens": [
       "Climatização: ~ +5 a +7 °C",
       "Resfriados (0 a +5 °C): ~ −8 a −10 °C",
       "Congelados (−18 a −25 °C): ~ −28 a −35 °C",
       "ΔT ar × evaporação: ~6 a 10 K"
      ]
     }
    ]
   },
   {
    "id": "sensores",
    "titulo": "Sensores",
    "resumo": "Temperatura, pressão e onde instalar cada um.",
    "tag": "TE",
    "pdf": "/estudos/refrigeracao/02-sensores.pdf",
    "dica": "NTC 10 kΩ: a 25 °C mede 10 kΩ e a 0 °C fica entre ~27 e 33 kΩ, conforme o modelo. Infinito = aberto; perto de zero = em curto.",
    "ramos": [
     {
      "titulo": "NTC",
      "itens": [
       "O mais usado em controladores de câmara",
       "10 kΩ a 25 °C (padrão comum)",
       "Resistência cai quando a temperatura sobe",
       "Faixa típica −50 a +105 °C"
      ]
     },
     {
      "titulo": "PTC, Pt1000 e Pt100",
      "itens": [
       "PTC: resistência sobe com a temperatura",
       "Pt1000: 1 000 Ω a 0 °C, bom para distâncias longas",
       "Pt100 em chillers e processos",
       "Confira o tipo no parâmetro do controlador"
      ]
     },
     {
      "titulo": "Posição dos sensores",
      "itens": [
       "Ambiente: no retorno de ar do evaporador",
       "Fim de degelo: entre as aletas, no ponto mais frio",
       "Sucção: tubo < 7/8″ às 12 h; maior, às 4 ou 8 h",
       "Isole o sensor de sucção"
      ]
     },
     {
      "titulo": "Transdutores de pressão",
      "itens": [
       "Ratiométrico 0,5–4,5 V (alimentação 5 V)",
       "4–20 mA para distâncias longas",
       "Faixa adequada ao lado (baixa / alta) e ao fluido",
       "Instale em cima do tubo, nunca embaixo (óleo)"
      ]
     },
     {
      "titulo": "Outros sensores",
      "itens": [
       "Umidade relativa (UR %)",
       "CO₂ para renovação de ar",
       "Detector de vazamento de refrigerante (ppm)",
       "Sensor de porta (reed switch)"
      ]
     },
     {
      "titulo": "Diagnóstico",
      "itens": [
       "Meça a resistência com o sensor desligado",
       "Compare com a tabela R×T do fabricante",
       "Erro de sensor: geralmente aberto ou em curto",
       "Offset (calibração) no parâmetro do controlador"
      ]
     }
    ]
   },
   {
    "id": "superaquecimento",
    "titulo": "Superaquecimento e sub-resfriamento",
    "resumo": "As duas medidas que mostram como está o ciclo.",
    "tag": "SA",
    "pdf": "/estudos/refrigeracao/03-superaquecimento.pdf",
    "dica": "R-410A com sucção em ~8,3 bar (man.) satura a ~+5 °C. Tubo de sucção a +12 °C → SA = 7 K.",
    "ramos": [
     {
      "titulo": "Superaquecimento (SA)",
      "itens": [
       "SA = T sucção − T saturação (evaporação)",
       "Útil: na saída do evaporador",
       "Total: na entrada do compressor",
       "Típico com VET: ~3 a 7 K (ajuste de fábrica)",
       "Garante que só vapor chegue ao compressor"
      ]
     },
     {
      "titulo": "Sub-resfriamento (SR)",
      "itens": [
       "SR = T saturação (condensação) − T linha de líquido",
       "Medido na saída do condensador",
       "Típico: ~4 a 10 K (veja o fabricante)",
       "Garante líquido puro na expansão"
      ]
     },
     {
      "titulo": "SA alto",
      "itens": [
       "Falta de fluido (vazamento)",
       "Filtro secador ou expansão restrita",
       "Válvula de expansão fechando demais",
       "Descarga do compressor muito quente"
      ]
     },
     {
      "titulo": "SR alto",
      "itens": [
       "Excesso de carga de fluido",
       "Restrição na linha de líquido ou na expansão",
       "Condensador alagado de líquido"
      ]
     },
     {
      "titulo": "SA baixo",
      "itens": [
       "Expansão alimentando demais",
       "Bulbo solto ou mal isolado",
       "Evaporador sujo ou com gelo, pouca carga térmica",
       "Risco de retorno de líquido"
      ]
     },
     {
      "titulo": "Carga de fluido",
      "itens": [
       "Capilar ou orifício fixo: carregue pelo SA",
       "VET ou EEV: carregue pelo SR",
       "Fluido com glide: orvalho no SA, bolha no SR",
       "Mistura zeotrópica: carregue sempre como líquido"
      ]
     }
    ]
   },
   {
    "id": "expansao",
    "titulo": "Válvulas de expansão",
    "resumo": "Capilar, termostática e eletrônica.",
    "tag": "EXV",
    "pdf": "/estudos/refrigeracao/04-expansao.pdf",
    "dica": "Antes de mexer no ajuste da VET, meça o SA e confira o filtro secador. A maioria das “válvulas ruins” é falta de fluido ou restrição.",
    "ramos": [
     {
      "titulo": "Capilar e orifício fixo",
      "itens": [
       "Restrição fixa, sem ajuste",
       "Equaliza as pressões na parada",
       "Refrigeradores e splits pequenos",
       "Muito sensível à carga de fluido"
      ]
     },
     {
      "titulo": "VET (termostática)",
      "itens": [
       "Bulbo lê a temperatura da sucção",
       "Mantém o SA constante (ajuste na haste)",
       "Equalização interna: pouca perda de carga",
       "Equalização externa: com distribuidor"
      ]
     },
     {
      "titulo": "EEV (eletrônica)",
      "itens": [
       "Motor de passo ou PWM",
       "Driver lê transdutor de pressão + sensor de temperatura",
       "SA menor e estável → mais eficiência",
       "Pode fechar totalmente na parada"
      ]
     },
     {
      "titulo": "Seleção",
      "itens": [
       "Capacidade no ponto real (evap., cond., SR)",
       "Orifício certo para o fluido",
       "Superdimensionada → oscilação (hunting)",
       "Subdimensionada → SA alto"
      ]
     },
     {
      "titulo": "Problemas comuns",
      "itens": [
       "SA oscilando (hunting)",
       "Bulbo com perda de carga: válvula fecha",
       "Umidade congelando no orifício",
       "Tela de filtro obstruída"
      ]
     },
     {
      "titulo": "Solenoide da linha de líquido",
      "itens": [
       "Pump-down: recolhe o fluido antes de parar",
       "Comandada pelo controlador de temperatura",
       "Seta do corpo no sentido do fluxo",
       "Confira a tensão da bobina"
      ]
     }
    ]
   },
   {
    "id": "pressostatos",
    "titulo": "Pressostatos e proteções",
    "resumo": "O que desliga o sistema e por quê.",
    "tag": "PSH",
    "pdf": "/estudos/refrigeracao/05-pressostatos.pdf",
    "dica": "Scroll girando ao contrário faz barulho alto, não bombeia e esquenta. Use relé de sequência de fase em todo compressor trifásico.",
    "ramos": [
     {
      "titulo": "Pressostato de baixa (LP)",
      "itens": [
       "Desliga com sucção baixa (falta de fluido, gelo)",
       "Usado no pump-down",
       "Rearme automático",
       "Diferencial evita partidas curtas"
      ]
     },
     {
      "titulo": "Pressostato de alta (HP)",
      "itens": [
       "Desliga com descarga alta",
       "Condensador sujo, ventilador parado, excesso de carga",
       "Rearme manual (segurança)",
       "Ajuste abaixo da pressão máxima do sistema"
      ]
     },
     {
      "titulo": "Pressostato de óleo",
      "itens": [
       "Semi-herméticos com bomba de óleo",
       "Mede o diferencial óleo − cárter",
       "Temporiza ~120 s antes de desarmar",
       "Rearme manual"
      ]
     },
     {
      "titulo": "Proteções do compressor",
      "itens": [
       "Disjuntor-motor ou relé térmico",
       "Termostato de descarga",
       "Protetor interno (klixon) nos herméticos",
       "Módulo com PTC no enrolamento (scroll e semi)"
      ]
     },
     {
      "titulo": "Proteções elétricas",
      "itens": [
       "Relé de falta e sequência de fase",
       "Relé de sub e sobretensão",
       "Temporizador anti-reciclagem (3 a 5 min)",
       "DPS e aterramento"
      ]
     },
     {
      "titulo": "Controle de condensação",
      "itens": [
       "Pressostato liga e desliga ventiladores",
       "Ou varia a velocidade (inversor / EC)",
       "Mantém pressão mínima para a expansão",
       "Essencial em clima frio"
      ]
     }
    ]
   },
   {
    "id": "controlador",
    "titulo": "Controlador digital",
    "resumo": "Parâmetros e funções do controlador de câmara.",
    "tag": "TIC",
    "pdf": "/estudos/refrigeracao/06-controlador.pdf",
    "dica": "Configure o modo de emergência (ciclo liga/desliga fixo) para falha de sensor: o produto não fica sem frio até a visita técnica.",
    "ramos": [
     {
      "titulo": "Funções",
      "itens": [
       "Termostato com diferencial (histerese)",
       "Controle de degelo",
       "Ventiladores do evaporador",
       "Alarmes de temperatura"
      ]
     },
     {
      "titulo": "Temperatura",
      "itens": [
       "Setpoint e diferencial (ex.: SP 2 °C, dif. 2 K)",
       "Limites do SP (trava contra ajuste errado)",
       "Offset do sensor",
       "Tempo mínimo entre partidas do compressor"
      ]
     },
     {
      "titulo": "Ventiladores do evaporador",
      "itens": [
       "Atraso após o degelo (gotejamento)",
       "Param com a porta aberta",
       "Ligam só com o evaporador frio",
       "Contínuos ou junto com o compressor"
      ]
     },
     {
      "titulo": "Alarmes",
      "itens": [
       "Alta e baixa temperatura, com atraso",
       "Porta aberta",
       "Falha de sensor (modo de emergência)",
       "Saída para sirene e para supervisório"
      ]
     },
     {
      "titulo": "Comunicação",
      "itens": [
       "RS-485 com Modbus RTU",
       "Supervisório local, nuvem ou app",
       "Registro de temperatura (boas práticas sanitárias)",
       "Relatórios de data logger"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Relé interno até a corrente indicada; acima, contator",
       "Cabo de sensor longe de cabo de potência",
       "Alimentação conforme o modelo",
       "Emenda de sensor soldada e isolada"
      ]
     }
    ]
   },
   {
    "id": "degelo",
    "titulo": "Degelo",
    "resumo": "Tipos, início, fim e falhas mais comuns.",
    "tag": "DEG",
    "pdf": "/estudos/refrigeracao/07-degelo.pdf",
    "dica": "Resistência de degelo: R = U² / P. Ex.: 1 000 W em 220 V → ~48 Ω. Infinito = queimada.",
    "ramos": [
     {
      "titulo": "Por que degelar",
      "itens": [
       "Gelo isola o evaporador e bloqueia o ar",
       "Cai a capacidade e a pressão de sucção",
       "Necessário com evaporação abaixo de ~0 °C"
      ]
     },
     {
      "titulo": "Tipos",
      "itens": [
       "Natural (parada): câmaras acima de ~+2 °C",
       "Resistência elétrica: comum em congelados",
       "Gás quente: mais rápido, usa a descarga",
       "Ciclo reverso: bombas de calor e splits"
      ]
     },
     {
      "titulo": "Início",
      "itens": [
       "Por intervalo de tempo (ex.: a cada 6 h)",
       "Por tempo de compressor ligado",
       "Sob demanda: ΔT ar × evaporador ou pressão",
       "Por horário, fora da ponta"
      ]
     },
     {
      "titulo": "Fim",
      "itens": [
       "Por temperatura do evaporador (~+8 a +12 °C)",
       "Por tempo máximo (segurança)",
       "Gotejamento: pausa para escoar a água",
       "Atraso dos ventiladores até o evaporador esfriar"
      ]
     },
     {
      "titulo": "Componentes",
      "itens": [
       "Resistências no evaporador e na bandeja",
       "Resistência no dreno (câmara negativa)",
       "Termostato de segurança",
       "Contatores para a carga resistiva"
      ]
     },
     {
      "titulo": "Falhas comuns",
      "itens": [
       "Bloco de gelo: dreno congelado ou resistência queimada",
       "Gelo em parte do evaporador: resistência aberta",
       "Degelos demais: gasto de energia e temperatura instável",
       "Umidade entrando: porta, cortina, vedação"
      ]
     }
    ]
   },
   {
    "id": "quadro",
    "titulo": "Quadro de comando",
    "resumo": "Montagem do painel elétrico de câmara fria.",
    "tag": "QC",
    "pdf": "/estudos/refrigeracao/08-quadro.pdf",
    "dica": "Pressostato de alta com rearme manual em série no comando: se desarmar, alguém precisa ir ver o motivo antes de religar.",
    "ramos": [
     {
      "titulo": "Potência",
      "itens": [
       "Disjuntor geral e por circuito",
       "Disjuntor-motor do compressor",
       "Contatores: compressor, ventiladores, degelo",
       "Relé de falta e sequência de fase"
      ]
     },
     {
      "titulo": "Comando",
      "itens": [
       "Controlador digital (TIC)",
       "Circuito de comando 24 V ou 220 V",
       "Seletora Manual – 0 – Automático",
       "Botão de emergência"
      ]
     },
     {
      "titulo": "Sinalização",
      "itens": [
       "Lâmpadas: ligado, degelo, falha",
       "Sirene de alarme",
       "Iluminação da câmara com interruptor externo",
       "Alarme de pessoa presa dentro da câmara"
      ]
     },
     {
      "titulo": "Intertravamentos",
      "itens": [
       "Compressor só com ventilador do condensador",
       "Pressostatos de alta e baixa em série no comando",
       "Degelo elétrico desliga o compressor",
       "Porta aberta desliga os ventiladores"
      ]
     },
     {
      "titulo": "Dimensionamento (NBR 5410)",
      "itens": [
       "Cabo por corrente e queda de tensão",
       "Queda máx. de 4 % nos circuitos terminais",
       "IDR 30 mA em tomadas e iluminação",
       "DPS no quadro e aterramento TN-S"
      ]
     },
     {
      "titulo": "Documentação",
      "itens": [
       "Diagrama de força e de comando atualizado",
       "Bornes e cabos identificados",
       "ART de projeto e execução",
       "Isolação do motor medida com megômetro"
      ]
     }
    ]
   },
   {
    "id": "partida",
    "titulo": "Partida de compressores",
    "resumo": "Métodos de partida e seus efeitos na rede.",
    "tag": "M",
    "pdf": "/estudos/refrigeracao/09-partida.pdf",
    "dica": "Hermético monofásico: R(C-S) + R(C-R) deve dar R(S-R). Se não fechar, há enrolamento aberto ou em curto.",
    "ramos": [
     {
      "titulo": "Partida direta",
      "itens": [
       "Simples e barata",
       "Corrente de partida 5 a 8× a nominal",
       "Limite de potência definido pela concessionária",
       "Herméticos pequenos"
      ]
     },
     {
      "titulo": "Monofásico",
      "itens": [
       "Capacitor de partida + relé (potencial ou PTC)",
       "Capacitor de marcha (permanente)",
       "Terminais: C comum, S partida, R marcha",
       "R(C-S) + R(C-R) = R(S-R)"
      ]
     },
     {
      "titulo": "Estrela-triângulo",
      "itens": [
       "Corrente de partida cai para ~1/3",
       "Motor de 6 terminais, tensão de Δ = rede",
       "Torque também cai para ~1/3",
       "Temporizador de comutação Y → Δ"
      ]
     },
     {
      "titulo": "Part-winding",
      "itens": [
       "Comum em semi-herméticos",
       "Liga metade do enrolamento, depois a outra",
       "Atraso de ~1 s entre contatores",
       "Corrente ~60 % da partida direta"
      ]
     },
     {
      "titulo": "Soft-starter",
      "itens": [
       "Rampa de tensão por tiristores",
       "Reduz o pico de corrente e o golpe mecânico",
       "Contator de bypass após a partida",
       "Não varia a velocidade em regime"
      ]
     },
     {
      "titulo": "Inversor de frequência",
      "itens": [
       "Partida com corrente perto da nominal",
       "Varia a capacidade do compressor",
       "Compressor precisa ser compatível",
       "Detalhes no mapa 10"
      ]
     }
    ]
   },
   {
    "id": "inversor",
    "titulo": "Inversor de frequência",
    "resumo": "Velocidade variável em compressores, bombas e ventiladores.",
    "tag": "SIC",
    "pdf": "/estudos/refrigeracao/10-inversor.pdf",
    "dica": "Em bombas e ventiladores, rodar a 80 % da rotação consome ~51 % da potência: 0,8³ = 0,512.",
    "ramos": [
     {
      "titulo": "Princípio",
      "itens": [
       "Retifica a rede, filtra no barramento CC, gera PWM",
       "n = 120 · f / p (rpm)",
       "Controle V/f ou vetorial",
       "Capacidade do compressor ∝ rotação"
      ]
     },
     {
      "titulo": "Aplicações",
      "itens": [
       "Compressor de velocidade variável",
       "Ventiladores do condensador",
       "Bombas de água gelada e de condensação",
       "Ventiladores de fan coil e AHU"
      ]
     },
     {
      "titulo": "Economia de energia",
      "itens": [
       "Bombas e ventiladores: potência ∝ rotação³",
       "80 % da rotação → ~51 % da potência",
       "Menos partidas e paradas",
       "Temperatura mais estável"
      ]
     },
     {
      "titulo": "Parâmetros",
      "itens": [
       "Frequência mínima e máxima",
       "Rampas de aceleração e desaceleração",
       "PID interno com transmissor 4–20 mA",
       "Corrente nominal do motor"
      ]
     },
     {
      "titulo": "Instalação",
      "itens": [
       "Cabo blindado entre inversor e motor",
       "Reator ou filtro contra harmônicos",
       "Aterramento curto, em ponto único",
       "Ventilação do painel (perdas ~2 a 3 %)"
      ]
     },
     {
      "titulo": "Falhas comuns",
      "itens": [
       "Sobrecorrente: rampa curta ou motor travado",
       "Subtensão no barramento CC",
       "Sobretemperatura: painel sem ventilação",
       "Fuga à terra: isolação do cabo ou do motor"
      ]
     }
    ]
   },
   {
    "id": "chiller",
    "titulo": "Chillers, HVAC e PMOC",
    "resumo": "Água gelada, supervisão predial e obrigações legais.",
    "tag": "BMS",
    "pdf": "/estudos/refrigeracao/11-chiller.pdf",
    "dica": "Chiller com ΔT de água muito baixo (ex.: 2 K) indica vazão excessiva: energia gasta no bombeamento e capacidade mal aproveitada.",
    "ramos": [
     {
      "titulo": "Chiller",
      "itens": [
       "Água gelada típica: 7 °C ida / 12 °C retorno",
       "TR ≈ vazão (m³/h) · ΔT / 3,02",
       "Chave de fluxo obrigatória",
       "Proteção anticongelamento na saída"
      ]
     },
     {
      "titulo": "Sistema de água",
      "itens": [
       "Bombas primárias e secundárias",
       "Válvulas de 2 ou 3 vias nos fan coils",
       "Torre de resfriamento (condensação a água)",
       "Tratamento químico e purga"
      ]
     },
     {
      "titulo": "Controle de ambiente",
      "itens": [
       "Sensor de ambiente por zona",
       "Fan coil: válvula + velocidade do ventilador",
       "Renovação de ar controlada por CO₂",
       "ABNT NBR 16401: conforto e qualidade do ar"
      ]
     },
     {
      "titulo": "Supervisão (BMS)",
      "itens": [
       "BACnet (IP e MS/TP)",
       "Modbus RTU e TCP",
       "Agendamento horário e setpoints",
       "Tendências e histórico de alarmes"
      ]
     },
     {
      "titulo": "VRF e splits inverter",
      "itens": [
       "Rede própria do fabricante (gateway para o BMS)",
       "Controle central por zonas",
       "Endereçamento das unidades internas",
       "Rateio de consumo por unidade"
      ]
     },
     {
      "titulo": "PMOC e legislação",
      "itens": [
       "Lei 13.589/2018: PMOC em ambientes de uso coletivo",
       "Portaria MS 3.523/1998",
       "RE ANVISA nº 9/2003: qualidade do ar",
       "Responsável técnico com ART",
       "Registros de manutenção rastreáveis"
      ]
     }
    ]
   },
   {
    "id": "diagnostico",
    "titulo": "Diagnóstico de falhas",
    "resumo": "Do sintoma à causa, com as medições certas.",
    "tag": "ALM",
    "pdf": "/estudos/refrigeracao/12-diagnostico.pdf",
    "dica": "Antes de condenar o compressor, meça tensão, corrente e isolação e confira capacitor e relé. Muita troca desnecessária começa sem essas medidas.",
    "ramos": [
     {
      "titulo": "Câmara não gela",
      "itens": [
       "Confira setpoint e parâmetros",
       "Compressor ligado? Meça a corrente",
       "Evaporador com gelo (degelo falhando)",
       "Porta, vedação e carga de produto"
      ]
     },
     {
      "titulo": "Descarga alta",
      "itens": [
       "Condensador sujo ou ventilador parado",
       "Excesso de carga de fluido",
       "Ar ou incondensáveis no sistema",
       "Ar quente recirculando no condensador"
      ]
     },
     {
      "titulo": "Sucção baixa",
      "itens": [
       "Falta de fluido (vazamento)",
       "Filtro secador ou expansão restrita",
       "Evaporador congelado ou ventilador parado",
       "Pouca carga térmica"
      ]
     },
     {
      "titulo": "Compressor desarmando",
      "itens": [
       "Tensão e desequilíbrio entre fases (≤ 2 %)",
       "Corrente acima da nominal (RLA)",
       "Isolação medida com megômetro",
       "Partidas curtas: diferencial pequeno"
      ]
     },
     {
      "titulo": "Ferramentas",
      "itens": [
       "Manifold digital (calcula SA e SR)",
       "Alicate amperímetro true RMS",
       "Termômetro de contato",
       "Detector eletrônico de vazamento",
       "Megômetro, bomba de vácuo e vacuômetro"
      ]
     },
     {
      "titulo": "Boas práticas",
      "itens": [
       "Vácuo ≤ 500 mícrons com teste de subida",
       "Nitrogênio passando durante a brasagem",
       "Teste de estanqueidade com N₂",
       "Registre as leituras na OS e no PMOC"
      ]
     }
    ]
   }
  ],
  "desc": "Ciclo, sensores, superaquecimento, expansão, proteções, degelo, quadro, partidas, inversor, chillers/PMOC e diagnóstico.",
  "cor": "from-cyan-500 to-teal-700"
 }
];

// Temas da antiga coleção de mapas de instrumentação (substituída pelas fichas visuais).
// As questões continuam em estudosPratica.js e alimentam o simulado das fichas.
export const TEMAS_INSTRUMENTACAO = [{"id": "fundamentos", "titulo": "Fundamentos"}, {"id": "simbologia", "titulo": "Simbologia ISA 5.1"}, {"id": "pressao", "titulo": "Pressão"}, {"id": "temperatura", "titulo": "Temperatura"}, {"id": "vazao", "titulo": "Vazão"}, {"id": "nivel", "titulo": "Nível"}, {"id": "analiticos", "titulo": "Analíticos"}, {"id": "sinais", "titulo": "Sinais e comunicação"}, {"id": "pid", "titulo": "Controle PID"}, {"id": "valvulas", "titulo": "Válvulas de controle"}, {"id": "calibracao", "titulo": "Calibração"}, {"id": "areas-classificadas", "titulo": "Áreas classificadas"}];
