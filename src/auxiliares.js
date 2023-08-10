const { format, parse } = require("date-fns");

function dataNascimentoFormatada(data) {
  const dataNascimentoFormatada = format(parse(data, "dd/MM/yyyy", new Date()), "yyyy-MM-dd");

  return dataNascimentoFormatada;
}

function dataAtual() {
  const momentoAtualFormatado = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  return momentoAtualFormatado;
}

function validacaoCriarConta(
  contas,
  nome,
  cpf,
  data_nascimento,
  telefone,
  email,
  senha
) {
  const regexDataEsperada = /^\d{2}\/\d{2}\/\d{4}$/;

  const cpfUnico = contas.filter((conta) => conta.usuario.cpf === cpf);
  const emailUnico = contas.filter((conta) => conta.usuario.email === email);

  if (!nome) {
    return { status: 400, mensagem: "O nome é obrigatório" };
  } else if (!cpf) {
    return { status: 400, mensagem: "O CPF é obrigatório" };
  } else if (emailUnico.length === 1) {
    return { status: 400, mensagem: "Conta com esse email já existente" };
  } else if (cpfUnico.length === 1) {
    return { status: 400, mensagem: "Conta com esse CPF já existente" };
  } else if (!data_nascimento) {
    return { status: 400, mensagem: "A data de nascimento é obrigatória" };
  } else if (data_nascimento < 18) {
    return {
      status: 400,
      mensagem: "Você precisa ter pelo o menos 18 anos para criar uma conta",
    };
  } else if (!regexDataEsperada.test(data_nascimento)) {
    return {
      status: 400,
      mensagem: "A data deve seguir esse formato dd/MM/yyyy.",
    };
  } else if (!telefone) {
    return { status: 400, mensagem: "O telefone é obrigatório." };
  } else if (!email) {
    return { status: 400, mensagem: "O email é obrigatório." };
  } else if (!senha) {
    return { status: 400, mensagem: "A senha é obrigatória." };
  } else {
    return { status: 200 };
  }
}

function validacaoAtualizarConta(
  req,
  contas,
  numeroConta,
  nome,
  cpf,
  data_nascimento,
  telefone,
  email,
  senha
) {
  const contaAtualizada = contas.find((conta) => conta.numero === numeroConta);
  const cpfUnico = contas.filter((conta) => conta.usuario.cpf === cpf);
  const emailUnico = contas.filter((conta) => conta.usuario.email === email);

  if (!contaAtualizada) {
    return { status: 404, mensagem: "O usuário não foi encontrado." };
  }
  if (emailUnico.length === 1) {
    return { status: 400, mensagem: "Conta com esse email já existente" };
  }
  if (cpfUnico.length === 1) {
    return { status: 400, mensagem: "Conta com esse CPF já existente" };
  }

  let atualizacao = 0;

  if (req.body.nome) {
    contaAtualizada.usuario.nome = nome;
    atualizacao++;
  }
  if (req.body.cpf) {
    contaAtualizada.usuario.cpf = cpf;
    atualizacao++;
  }
  if (req.body.data_nascimento) {
    contaAtualizada.usuario.data_nascimento = data_nascimento;
    atualizacao++;
  }
  if (req.body.telefone) {
    contaAtualizada.usuario.telefone = telefone;
    atualizacao++;
  }
  if (req.body.email) {
    contaAtualizada.usuario.email = email;
    atualizacao++;
  }
  if (req.body.senha) {
    contaAtualizada.usuario.senha = senha;
    atualizacao++;
  }

  if (atualizacao === 0) {
    return {
      status: 400,
      mensagem: "Não identificamos qual propriedade você deseja atualizar",
    };
  } else {
    return { status: 200, mensagem: "Conta atualizada com sucesso" };
  }
}

function validacaoDeletarConta(contas, numeroConta) {
  const conta = contas.find((conta) => conta.numero === numeroConta);

  const posicaoConta = contas.findIndex(
    (conta) => conta.numero === numeroConta
  );

  if (!conta) {
    return { status: 400, mensagem: "Conta não encontrada" };
  } else if (conta.saldo !== 0) {
    return {
      status: 400,
      mensagem: "Conta não pode ser excluída, verifique seu saldo",
    };
  } else {
    contas.splice(posicaoConta, 1);
    return { status: 200, mensagem: "Conta excluída com sucesso" };
  }
}

function validacaoDepositar(contas, numero, valor) {
  const conta = contas.find((conta) => conta.numero === numero);

  if (!conta) {
    return { status: 404, mensagem: "Conta não encontrada" };
  } else if (Number(valor) <= 0) {
    return {
      status: 400,
      mensagem: "O valor a ser depositado deve ser maior que 0 reais",
    };
  } else {
    return {status: 201, mensagem: "Depósito realizado com sucesso", conta};
  }
}

function validacaoSacar(conta, numero, valor, senha) {
  if (!numero) {
    return { status: 404, mensagem: "Falta digitar o número da conta" };
  } else if (!conta) {
    return { status: 404, mensagem: "Conta não encontrada" };
  } else if (!senha) {
    return { status: 404, mensagem: "Falta digitar a senha" };
  } else if (conta.usuario.senha !== senha) {
    return { status: 400, mensagem: "Senha incorreta" };
  } else if (Number(conta.saldo) < Number(valor)) {
    return { status: 403, mensagem: "Saldo insuficiente" };
  } else if (Number(valor) <= 0) {
    return { status: 403, mensagem: "Saque apenas de valores acima de 0 reais" };
  } else {
    return { status: 200 };
  }
}

function validacaoTransferencia(contaOrigem, contaDestino, valor, senha) {
  if (!contaOrigem) {
    return { status: 404, mensagem: "Conta origem não encontrada" };
  } else if (contaOrigem.usuario.senha !== senha) {
    return { status: 404, mensagem: "Senha incorreta" };
  } else if (!contaDestino) {
    return { status: 404, mensagem: "Conta destino não encontrada" };
  } else if (contaOrigem === contaDestino) {
    return {
      status: 401,
      mensagem: "Você não pode transferir para a mesma conta",
    };
  } else if (contaOrigem.saldo < Number(valor)) {
    return { status: 401, mensagem: "Saldo insuficiente" };
  } else {
    return { status: 200 };
  }
}

function validacaoSaldoExtrato(contas, numero, senha) {
  const conta = contas.find((conta) => conta.numero === numero);

  if (!numero) {
    return { status: 401, mensagem: "Falta digitar o número da conta" };
  } else if (!conta) {
    return { status: 401, mensagem: "Conta não encontrada" };
  } else if (!senha) {
    return { status: 401, mensagem: "Falta digitar a senha" };
  } else if (conta.usuario.senha !== senha) {
    return { status: 400, mensagem: "Senha incorreta" };
  } else {
    return { status: 200, conta };
  }
}

module.exports = {
  dataAtual,
  dataNascimentoFormatada,
  validacaoSaldoExtrato,
  validacaoAtualizarConta,
  validacaoDeletarConta,
  validacaoDepositar,
  validacaoCriarConta,
  validacaoSacar,
  validacaoTransferencia,
};