# MatrixOps

MatrixOps is an agent-native personal decision engine that turns natural-language requests into structured requirements, searches available options, compares trade-offs, and helps users make decisions.

## Key Features

- Natural-language requirement understanding
- WebMCP-powered food, grocery and service search
- Multi-constraint ranking and recommendations
- Explainable "Why MatrixOps recommends this"
- Requirement negotiation
- What-if scenario simulation
- Multi-person decision support
- Multilingual interface
- Human-confirmed action and handoff

## WebMCP

MatrixOps exposes structured WebMCP tools that an AI agent can discover and call directly from the website.

Current tools include:

- `search_food_options`
- `search_grocery_options`
- `search_service_options`
- `compare_matrix_options`
- `prepare_food_order`

The project demonstrates how WebMCP can turn a normal website into an agent-accessible decision layer.

## Demo Data

The current prototype uses synthetic demonstration data stored locally in `data.js`.

It does not process real purchases or payments. Consequential actions remain under human confirmation.

## Running Locally

1. Clone this repository.
2. Open the project folder.
3. Start a local HTTP server.
4. Open the website in Chrome.
5. Enable WebMCP testing if required.

## Project Structure

- `index.html` — MatrixOps interface
- `style.css` — interface styling
- `app.js` — application logic and WebMCP tools
- `data.js` — demonstration data

## License

MIT License