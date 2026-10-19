# RepuSense - Radar de Reputación en Crisis 📊🚀

> **Simulación Laboral Abierta - NoCountry**  
> **Sector:** Marketing Digital / Relaciones Públicas (B2B SaaS)  
> **Especialidad:** Prospección Automatizada  

---

## 🏢 Contexto del Negocio

**RepuSense** es una agencia de relaciones públicas y marketing digital enfocada en ayudar a pequeñas y medianas empresas (restaurantes, clínicas, servicios locales) a recuperar su reputación en internet y mitigar el impacto de campañas de difamación o malas rachas de servicio.

### El Problema
Hoy en día, el principal cuello de botella de la agencia es la prospección comercial. Un equipo de tres vendedores pasa alrededor de **30 horas semanales** buscando manualmente en Google Maps, TripAdvisor y Yelp negocios que tengan entre 1.5 y 3.5 estrellas. Posteriormente, leen las reseñas para confirmar que sigan operando y buscan los datos de contacto para ofrecerles servicios de *"limpieza y gestión reputacional"*.

Este proceso manual es lento, desmotivador e ineficiente. La empresa necesita pasar de prospectar 40 leads semanales a **generar cientos de contactos calificados** listos para ser abordados.

---

## 🎯 La Necesidad de la Empresa

Automatizar la detección de negocios locales con baja calificación y extraer sus datos básicos de contacto, centralizando esta información para que el equipo de ventas pueda prospectar de forma ágil, masiva y segmentada.

---

## 💡 Solución Sugerida (Approach)

Construir un pipeline de extracción de datos (scraper) que reciba como input una ciudad y un rubro (ej. *"clínicas dentales en Bogotá"*), y recolecte negocios que cumplan ciertas reglas de negocio (ej. menos de 3.5 estrellas y más de 10 reseñas).

Para aportar más valor al lead:
* **Análisis con LLM:** Integrar un modelo de lenguaje que lea las últimas 5 reseñas negativas y etiquete el problema principal (ej. *"mala atención al cliente"*, *"precios caros"*, *"problemas de higiene"*).
* **Dashboard interno:** Visualización centralizada para el equipo de ventas con filtros, exportación a CSV y copia de drafts de correos en frío personalizados.

---

## 🔄 Flujo Funcional

```
[Input: Ciudad + Rubro + Filtros]
            │
            ▼
[Scraper: Google Maps / TripAdvisor / Yelp]
            │
            ▼
[Enriquecimiento IA: Etiquetado de problema principal via LLM]
            │
            ▼
[Enriquecimiento Contacto: Web Scraping / LinkedIn para Email]
            │
            ▼
[Dashboard Ventas: Tabla de Leads + Filtros + Exportación]
            │
            ▼
[Feature IA: Generación de Asunto + Primer Párrafo de Email]
```

---

## 🧠 Desafíos Técnicos a Resolver

1. **Manejo de bloqueos y recolección eficiente:** Plataformas como Google Maps o Yelp tienen estrictas políticas anti-bot. Se debe estructurar el scraper (rotación de IPs, tiempos de espera, *headless browsers*) para extraer cientos de negocios diarios sin ser bloqueados en un entorno MVP sin presupuesto para proxies premium.
2. **Enriquecimiento del dato de contacto:** Los directorios rara vez muestran el correo directo del dueño. Implementar estrategias para cruzar el negocio encontrado con un email o perfil de LinkedIn válido de forma automatizada.
3. **Gestión de estado y duplicidad:** Diseñar el modelo de datos para actualizar las calificaciones de negocios existentes en lugar de duplicar leads en búsquedas recurrentes.

---

## 📦 Entregables Esperados

* [ ] **Motor de extracción funcional:** Script, API o pipeline capaz de recibir parámetros (rubro, ubicación) y devolver un listado de negocios afectados de una plataforma.
* [ ] **Interfaz de prospección (Dashboard):** Web app interna básica para lanzar búsquedas, visualizar los leads en una tabla interactiva y consultar contactos.
* [ ] **Base de datos poblada:** Al menos 200 "leads" reales extraídos para demostración en el Demo Day.
* [ ] **Feature diferenciador (IA):** Generación automática de "asunto" y "primer párrafo" para un correo en frío basado en las quejas reales del negocio.

---

## 🛠️ Stack Tecnológico Sugerido

* **Data / Scraping:** Python (BeautifulSoup, Selenium, Playwright, Scrapy) o Node.js (Puppeteer, Crawlee)
* **Backend:** FastAPI (Python) o Express/NestJS (Node.js)
* **Frontend:** React, Next.js o Vue.js
* **Base de Datos:** PostgreSQL o MongoDB
* **IA / LLM:** OpenAI API, Anthropic o modelos locales mediante Ollama / LangChain

---

*Documento generado para Simulación Laboral Abierta - NoCountry | Proyecto: Radar de Reputación en Crisis - B2B SaaS*