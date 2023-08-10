const { banco, contas, depositos, saques, transferencias } = require("../bancodedados");

const {
  dataAtual,
  dataNascimentoFormatada,
  validacaoSaldoExtrato,
  validacaoAtualizarConta,
  validacaoDeletarConta,
  validacaoDepositar,
  validacaoCriarConta,
  validacaoSacar,
  validacaoTransferencia,
} = require("../auxiliares");

let novoNumero = 1;

function listarContas(req, res) {
  const senha_banco = req.query.senha_banco;

  if (banco.senha !== senha_banco) {
    return res.status(400).json({ mensagem: "Senha incorreta" });
  } else {
    return res.status(200).json(contas);
  }
}

function criarContas(req, res) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  const { status, mensagem } = validacaoCriarConta(
    contas,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha
  );

  if (status !== 200) {
    return res.status(status).json({ mensagem });
  } else {
    const dataNascimento = dataNascimentoFormatada(data_nascimento);

    const novaConta = {
      numero: String(novoNumero++),
      saldo: 0,
      usuario: {
        nome,
        cpf,
        data_nascimento: dataNascimento,
        telefone,
        email,
        senha,
      },
    };

    contas.push(novaConta);

    return res.status(201).json(novaConta);
  }
}

function atualizarConta(req, res) {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const numeroConta = req.params.numeroConta;

  const { status, mensagem } = validacaoAtualizarConta(
    req,
    contas,
    numeroConta,
    nome,
    cpf,
    data_nascimento,
    telefone,
    email,
    senha
  );

  if (status == !200) {
    return res.status(status).json({ mensagem });
  } else {
    return res.status(status).json({ mensagem });
  }
}

function deletarConta(req, res) {
  const numeroConta = req.params.numeroConta;

  const{status, mensagem} = validacaoDeletarConta(contas, numeroConta);

  if (status ==! 200) {
    return res.status(status).json({ mensagem });
  } else {
    return res.status(status).json({ mensagem });
  }
}

function depositar(req, res) {
  const { numero_conta, valor } = req.body;

  const{conta, status, mensagem} = validacaoDepositar(contas, numero_conta, valor);

  if (status > 201) {
    return res.status(status).json({ mensagem });
  } else {
    conta.saldo += Number(valor);
    const data = dataAtual();
    
    const novoDeposito = {
      data,
      numero_conta,
      valor,
    };

    depositos.push(novoDeposito);
    
    return res.status(status).json({ mensagem});
  }
}

function sacar(req, res) {
  const { numero, valor, senha } = req.body;
  const conta = contas.find((conta) => conta.numero === numero);

  const { mensagem, status } = validacaoSacar(conta, numero, valor, senha);

  if (status !== 200) {
    return res.status(status).json({ mensagem });
  } else {
    conta.saldo -= Number(valor);
    const data = dataAtual();

    const novoSaque = {
      data,
      numero_conta: numero,
      valor,
    };

    saques.push(novoSaque);

    return res.status(201).json(novoSaque);
  }
}

function transferir(req, res) {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  const contaOrigem = contas.find(
    (conta) => conta.numero === numero_conta_origem
  );
  const contaDestino = contas.find(
    (conta) => conta.numero === numero_conta_destino
  );

  const { mensagem, status } = validacaoTransferencia(
    contaOrigem,
    contaDestino,
    valor,
    senha
  );

  if (status !== 200) {
    return res.status(status).json({ mensagem: mensagem });
  } else {
    const data = dataAtual();
    contaOrigem.saldo -= Number(valor);
    contaDestino.saldo += Number(valor);

    const transferenciaFeita = {
      data,
      numero_conta_origem,
      numero_conta_destino,
      valor,
    };

    transferencias.push(transferenciaFeita);

    return res
      .status(201)
      .json({ mensagem: "Transferência realizado com sucesso" });
  }
}

function saldo(req, res) {
  const { numero_conta, senha } = req.query;

  const { conta, status, mensagem } = validacaoSaldoExtrato(
    contas,
    numero_conta,
    senha
  );

  if (status !== 200) {
    return res.status(status).json({ mensagem: mensagem });
  } else {
    return res.status(200).json({ saldo: `${conta.saldo}` });
  }
}

function extrato(req, res) {
  const { numero_conta, senha } = req.query;

  const { status, mensagem } = validacaoSaldoExtrato(
    contas,
    numero_conta,
    senha
  );

  if (status !== 200) {
    return res.status(status).json({ mensagem: mensagem });
  } else {
    const depositosFeitos = depositos.filter(
      (deposito) => deposito.numero_conta === numero_conta
    );

    const saquesFeitos = saques.filter(
      (saque) => saque.numero_conta === numero_conta
    );

    const transferenciasEnviadas = transferencias.filter(
      (transferencia) => transferencia.numero_conta_origem === numero_conta
    );

    const transferenciasRecebidas = transferencias.filter(
      (transferencia) => transferencia.numero_conta_destino === numero_conta
    );

    const extratoTotal = {
      depositos: depositosFeitos,
      saques: saquesFeitos,
      transferenciasEnviadas,
      transferenciasRecebidas,
    };

    return res.status(200).json(extratoTotal);
  }
}

module.exports = {
  listarContas,
  criarContas,
  atualizarConta,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};