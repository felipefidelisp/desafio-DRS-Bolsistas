import { useState, useEffect } from "react";
import {
  ScatterChart, Scatter, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "./services/api";
import "./App.css";

function App() {
  const [temperatura, setTemperatura] = useState("");
  const [pressao, setPressao] = useState("");
  const [resultado, setResultado] = useState(null);
  const [dadosGraficos, setDadosGraficos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [status, setStatus] = useState("");
  const [dadosBrutos, setDadosBrutos] = useState(null);

  useEffect(() => {
    carregarDadosGraficos();
  }, []);

  const carregarDadosGraficos = async () => {
    try {
      const response = await api.get("/dados");
      setDadosBrutos(response.data);
      setStatus("✅ Dados carregados");
    } catch (error) {
      console.error("Erro ao carregar:", error);
      setStatus("⚠️ Erro ao carregar dados");
    }
  };

  const gerarDadosGrafico = (dadosBrutos, temp, press, tipo) => {
    if (!dadosBrutos || !dadosBrutos[tipo]) return [];

    const x_vals = dadosBrutos[tipo].x[0];
    const y_vals = dadosBrutos[tipo].y;
    const z_vals = dadosBrutos[tipo].z;

    // Encontrar índice da temperatura
    let idx_temp = x_vals.indexOf(temp);
    if (idx_temp === -1) {
      // Temperatura mais próxima se não exata
      let min_diff = Infinity;
      for (let i = 0; i < x_vals.length; i++) {
        const diff = Math.abs(x_vals[i] - temp);
        if (diff < min_diff) {
          min_diff = diff;
          idx_temp = i;
        }
      }
    }

    // Encontrar índice da pressão exata ou mais próxima
    let idx_press = -1;
    for (let i = 0; i < y_vals.length; i++) {
      if (y_vals[i][0] === press) {
        idx_press = i;
        break;
      }
    }
    if (idx_press === -1) {
      let min_diff = Infinity;
      for (let i = 0; i < y_vals.length; i++) {
        const diff = Math.abs(y_vals[i][0] - press);
        if (diff < min_diff) {
          min_diff = diff;
          idx_press = i;
        }
      }
    }

    if (idx_press === -1) return [];

    const pontos = [];

    // LÓGICA DOS 10 PONTOS A 1°C:
    // Se nos últimos 10 pontos, pega os 10 ANTERIORES
    if (idx_temp >= x_vals.length - 10) {
      // Últimos 10 pontos disponíveis
      for (let i = x_vals.length - 10; i < x_vals.length; i++) {
        const x_grafico = x_vals[i];
        const valor = z_vals[idx_press][i];
        pontos.push({
          x: x_grafico,
          [tipo === 'Momento_Fletor_kNm' ? 'momento' : 
           tipo === 'Tensão_de_Compressão_MPa' ? 'compressao' : 'tracao']: valor,
          valor: valor
        });
      }
    } else {
      // 10 pontos sequenciais: temp até temp+9
      for (let i = 0; i < 10; i++) {
        const idx_x = idx_temp + i;
        if (idx_x >= x_vals.length) break;
        const x_grafico = x_vals[idx_x];
        const valor = z_vals[idx_press][idx_x];
        pontos.push({
          x: x_grafico,
          [tipo === 'Momento_Fletor_kNm' ? 'momento' : 
           tipo === 'Tensão_de_Compressão_MPa' ? 'compressao' : 'tracao']: valor,
          valor: valor
        });
      }
    }

    return pontos;
  };

  const buscarDados = async () => {
    if (!temperatura || !pressao) {
      alert("Por favor, preencha ambos os campos.");
      return;
    }

    setCarregando(true);
    setStatus("🔄 Calculando...");
    
    try {
      const response = await api.get("/calcular", {
        params: {
          temperatura: parseFloat(temperatura),
          pressao: parseFloat(pressao),
        },
      });

      setResultado(response.data);
      
      if (dadosBrutos) {
        const pontosMomento = gerarDadosGrafico(dadosBrutos, parseFloat(temperatura), parseFloat(pressao), "Momento_Fletor_kNm");
        const pontosCompressao = gerarDadosGrafico(dadosBrutos, parseFloat(temperatura), parseFloat(pressao), "Tensão_de_Compressão_MPa");
        const pontosTracao = gerarDadosGrafico(dadosBrutos, parseFloat(temperatura), parseFloat(pressao), "Tensão_de_Tração_MPa");

        setDadosGraficos({
          momento: pontosMomento,
          compressao: pontosCompressao,
          tracao: pontosTracao
        });
      }
      
      setStatus(`✅ Gráficos gerados para ${temperatura}°C e ${pressao} MPa`);
      
    } catch (error) {
      console.error("Erro:", error);
      const msg = error.response?.data?.erro || "Erro ao conectar com o servidor";
      alert(msg);
      setStatus("❌ Erro no cálculo");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛢️ Dutos Rígidos Submarinos</h1>
        <h2>Análise de Flambagem Térmica</h2>
      </header>

      <div className="inputs-container">
        <div className="input-group">
          <label>Temperatura (°C)</label>
          <input
            type="number"
            step="1"
            min="30"
            max="89"
            placeholder="30 a 89"
            value={temperatura}
            onChange={(e) => setTemperatura(e.target.value)}
            className="input"
          />
        </div>

        <div className="input-group">
          <label>Pressão (MPa)</label>
          <input
            type="number"
            step="1"
            min="30"
            max="59"
            placeholder="30 a 59"
            value={pressao}
            onChange={(e) => setPressao(e.target.value)}
            className="input"
          />
        </div>

        <button 
          onClick={buscarDados} 
          disabled={carregando}
          className="btn-calcular"
        >
          {carregando ? "⏳ Calculando..." : "🚀 Calcular"}
        </button>
      </div>

      {status && (
        <div className={`status ${status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {resultado && (
        <div className="resultado">
          <h3>📊 Resultados Calculados</h3>
          <div className="cards">
            <div className="card">
              <h4>🎯 Momento Fletor</h4>
              <span className="valor">{resultado.momento_fletor_kNm} kNm</span>
            </div>
            <div className="card">
              <h4>📉 Compressão</h4>
              <span className="valor">{resultado.tensao_compressao_MPa} MPa</span>
            </div>
            <div className="card">
              <h4>📈 Tração</h4>
              <span className="valor">{resultado.tensao_tracao_MPa} MPa</span>
            </div>
          </div>
        </div>
      )}

      {dadosGraficos.momento && dadosGraficos.momento.length > 0 && (
        <div className="graficos" >
          {/* Gráfico 1: Momento Fletor - CORRIGIDO com 10 ticks (0 a 9) */}
          <div className="grafico">
            <h4>📊 Momento Fletor</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Temperatura" 
                  unit="°C"
                  domain={['auto', 'auto']}
                  ticks={Array.from({length: 12}, (_, i) => dadosGraficos.momento[0]?.x + i)}
                  tickLine={true}
                  axisLine={true}
                  interval={0}
                />
                <YAxis type="number" dataKey="momento" name="Momento" unit="kNm" />
                <Tooltip />
                <Legend />
                <Scatter name="Momento" data={dadosGraficos.momento} fill="#0019fe" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 2: Compressão */}
          <div className="grafico">
            <h4>📉 Tensão de Compressão </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficos.compressao.filter((p, i, arr) => arr.findIndex(t => t.x === p.x) === i)} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Temperatura" unit="°C" />
                <YAxis dataKey="compressao" name="Compressão" unit="MPa" />
                <Tooltip />
                <Legend />
                <Bar dataKey="compressao" fill="#cf1710" name="Compressão" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico 3: Tração */}
          <div className="grafico">
            <h4>📈 Tensão de Tração </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGraficos.tracao.filter((p, i, arr) => arr.findIndex(t => t.x === p.x) === i)} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Temperatura" unit="°C" />
                <YAxis dataKey="tracao" name="Tração" unit="MPa" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="tracao" 
                  stroke="#09a03c" 
                  name="Tração"
                  strokeWidth={3}
                  dot={{ fill: '#09a03c', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;