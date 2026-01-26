# Multiplica IA - Analisador de Candidatos LinkedIn 🚀

O **Multiplica IA** é uma ferramenta inteligente projetada para agilizar processos de recrutamento. Ela realiza buscas automatizadas no LinkedIn, extrai detalhes de perfis via scraping e utiliza Inteligência Artificial para ranquear candidatos com base em uma descrição de vaga específica.

## 🛠️ Tecnologias Utilizadas

* **Front-end**: HTML5, CSS3 (variáveis modernas e Flexbox) e JavaScript Vanilla.
* **Automação**: [n8n](https://n8n.io/) hospedado via Easypanel.
* **IA**: Agentes LangChain (via OpenRouter).
* **Scraping**: Apify (Google Search Scraper e LinkedIn Profile Scraper).

## 📋 Funcionalidades

* **Busca em Tempo Real**: Envio de cargo e localização para busca direta no LinkedIn.
* **Análise Profunda**: A IA avalia experiência, habilidades técnicas, educação e progressão de carreira.
* **Cards Interativos**: Exibição visual do ranking (0 a 5), recomendação e um resumo profissional detalhado.
* **Monitoramento**: Indicador de status (Online/Offline) do Webhook integrado.
* **Interface Assíncrona**: Suporte a processamentos longos (até 5 minutos) com indicadores de carregamento.

## 🏗️ Arquitetura do Sistema

1. **Interface**: O usuário preenche os requisitos da vaga no formulário web.
2. **Workflow n8n**: O Webhook recebe os dados e inicia uma busca no Google via Apify para encontrar perfis de LinkedIn.
3. **Processamento**: O sistema limita os resultados aos 10 melhores perfis, extrai os detalhes de cada um e os envia para o Agente de IA.
4. **Resposta Síncrona**: A IA gera um JSON estruturado para cada candidato, que é retornado em uma única resposta para o site.

---
**Frontend:**
 - [Linkedln: Victor Alex Moreira Gouveia](https://www.linkedin.com/in/victor-alex-moreira-gouveia-8aa170357?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

**N8N, IA e Scraping:**
- [Linkedln: Jit Guard](https://www.linkedin.com/in/jit-guard-422093294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)