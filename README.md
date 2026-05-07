# README.md - Desafio DRS Bolsistas

# Desafio: Análise Estrutural de Dutos Rígidos

Objetivo: Interface web para análise do momento fletor, tensões de compressão e tensões de tração em dutos rígidos sob condições de temperatura (30 à 89°C) e pressão (30 à 59 MPa).

Critérios Atendidos:
- 3 Gráficos (dispersão, barra e linha)
- Validação rigorosa de entrada de dados
- 2 Elementos UX (Loading + Error Alerts)
- Array com 10+ registros da API
- Integração Full-Stack React + Flask + JSON
- README completo

# Estrutura do Projeto

desafio-DRS-Bolsistas/
├── backend/                  # API Flask + Gerador de Dados
│   ├── app.py                # Endpoints REST
│   ├── data.json             # Dados reais do API
│   └── requirements.txt      # Dependências Python
├── frontend/                 # React + Vite + Recharts
│   ├── src/
│   │   ├── App.jsx           # Componente principal
│   │   ├── main.jsx          # Ponto de entrada
│   │   ├── index.css         # Configuração visual
│   │   └── App.css           # Estilos do app
│   ├── vite.config.js        # Config Vite + Proxy
│   ├── eslint.config.js      # Lint React
│   └── package.json
└── README.md                

# Bibliotecas (Instaladas Automaticamente) 
BACKEND:  Flask 2.3.3 + Flask-CORS + NumPy
FRONTEND: React 18 + Vite + Recharts + Axios + ESLint

# BACKEND (Terminal)
cd backend
# Criar ambiente virtual
python -m venv venv
# ATIVAR ambiente virtual
# Windows:
venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate
# INSTALAR o flash
pip install flask-cors
# INSTALAR dependências
pip install -r requirements.txt
# EXECUTAR API
python app.py

Backend: http://127.0.0.1:5000

# FRONTEND (Terminal 2)
cd frontend
# Instalar dependências
npm install
# Executar aplicação
npm run dev

Frontend: http://localhost:5173/