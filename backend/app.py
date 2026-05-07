import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# CARREGAR DATA.JSON
def carregar_dados():
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        caminho = os.path.join(base_dir, 'data.json')

        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)

    except Exception as e:
        print(f"Erro ao carregar data.json: {e}")
        return None

# BUSCAR VALOR EXATO
def buscar_valor(dados, chave, temperatura, pressao):
    try:
        x_vals = dados[chave]["x"][0]
        y_vals = dados[chave]["y"]
        z_vals = dados[chave]["z"]

        if temperatura not in x_vals:
            return None
        idx_temp = x_vals.index(temperatura)

        idx_press = None
        for i, linha in enumerate(y_vals):
            if linha[0] == pressao:
                idx_press = i
                break

        if idx_press is None:
            return None

        return z_vals[idx_press][idx_temp]

    except Exception as e:
        print(f"Erro ao buscar {chave}: {e}")
        return None

# ROTA HOME
@app.route('/')
def home():
    return jsonify({
        "mensagem": "O servidor de dutos rigidos esta funcionando"
    })

# ROTA CALCULAR
@app.route('/calcular', methods=['GET'])
def calcular():
    try:
        temperatura = request.args.get('temperatura')
        pressao = request.args.get('pressao')

        if temperatura is None or pressao is None:
            return jsonify({"erro": "Informe temperatura e pressao"}), 400

        temperatura = float(temperatura)
        pressao = float(pressao)

        if not (30 <= temperatura <= 89):
            return jsonify({"erro": "Temperatura: 30 a 89°C"}), 400

        if not (30 <= pressao <= 59):
            return jsonify({"erro": "Pressão: 30 a 59 MPa"}), 400

        dados = carregar_dados()
        if not dados:
            return jsonify({"erro": "Erro ao carregar data.json"}), 500

        momento = buscar_valor(dados, "Momento_Fletor_kNm", temperatura, pressao)
        compressao = buscar_valor(dados, "Tensão_de_Compressão_MPa", temperatura, pressao)
        tracao = buscar_valor(dados, "Tensão_de_Tração_MPa", temperatura, pressao)

        if momento is None or compressao is None or tracao is None:
            return jsonify({
                "erro": "Valor exato não encontrado no data.json (sem interpolação)"
            }), 404

        return jsonify({
            "temperatura": temperatura,
            "pressao": pressao,
            "momento_fletor_kNm": round(momento, 2),
            "tensao_compressao_MPa": round(compressao, 2),
            "tensao_tracao_MPa": round(tracao, 2)
        })

    except ValueError:
        return jsonify({"erro": "Valores devem ser numéricos"}), 400

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# ROTA DADOS (PARA GRÁFICOS)
@app.route('/dados', methods=['GET'])
def dados():
    dados = carregar_dados()

    if not dados:
        return jsonify({"erro": "Erro ao carregar data.json"}), 500

    return jsonify(dados)

# EXECUÇÃO
if __name__ == '__main__':
    app.run(debug=True, port=5000)