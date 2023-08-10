const express = require("express");
const rotas = express();


const {
    listarContas,
    criarContas,
    atualizarConta,
    deletarConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato,
} = require("./controladores/banco");


rotas.get("/contas", listarContas);
rotas.get("/contas/saldo", saldo);
rotas.get("/contas/extrato", extrato);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.post("/contas", criarContas);
rotas.put("/contas/:numeroConta/usuario", atualizarConta);
rotas.delete("/contas/:numeroConta", deletarConta);

module.exports = rotas;