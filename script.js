let registrosFinanceiros = [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', () => {
    carregarRegistros();
    exibirRegistros();
    document.getElementById('mes-atual').textContent = `${obterNomeMes(mesAtual)} ${anoAtual}`;

    document.getElementById('adicionar').addEventListener('click', adicionarRegistro);
    document.getElementById('mes-anterior').addEventListener('click', () => mudarMes(-1));
    document.getElementById('mes-proximo').addEventListener('click', () => mudarMes(1));
});

function obterNomeMes(mes) {
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return meses[mes];
}

function adicionarRegistro() {
    const dataRegistro = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;

    if (!dataRegistro || !descricao || isNaN(valor) || valor <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const dataFormatada = new Date(dataRegistro);
    
    const registro = {
        data: dataFormatada.toLocaleDateString(),
        descricao,
        valor,
        tipo,
        mes: dataFormatada.getMonth(),
        ano: dataFormatada.getFullYear()
    };

    registrosFinanceiros.push(registro);
    salvarRegistros();
    exibirRegistros();
    limparCampos();
}

function mudarMes(direcao) {
    mesAtual += direcao;
    if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    } else if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    }
    document.getElementById('mes-atual').textContent = `${obterNomeMes(mesAtual)} ${anoAtual}`;
    exibirRegistros();
}

function exibirRegistros() {
    const historicosMeses = document.getElementById('historicos-meses');
    historicosMeses.innerHTML = '';

    const registrosFiltrados = registrosFinanceiros.filter(registro => registro.mes === mesAtual && registro.ano === anoAtual);

    if (registrosFiltrados.length === 0) {
        historicosMeses.innerHTML = `<p class="text-light"><h5>Nenhum registro encontrado para ${obterNomeMes(mesAtual)} ${anoAtual}.</p>`;
        return;
    }

    const tabela = document.createElement('div');
    tabela.classList.add('table-container');
    tabela.innerHTML = `
        <table class="table table-dark">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
            ${registrosFiltrados.map((registro, index) => `
                <tr class="${registro.tipo === 'entrada' ? 'historico-entrada' : 'historico-saida'}">
                    <td>${registro.data}</td>
                    <td>${registro.descricao}</td>
                    <td>R$ ${registro.valor.toFixed(2)}</td>
                    <td>${registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)}</td>
                    <td>
                        <button class="btn btn-warning btn-editar" onclick="editarRegistro(${index})">Editar</button>
                        <button class="btn btn-danger btn-excluir" onclick="confirmarExcluirRegistro(${index})">Excluir</button>
                    </td>
                </tr>
            `).join('')}
            </tbody>
        </table>
    `;
    historicosMeses.appendChild(tabela);

    atualizarTotais(registrosFiltrados);
}

function editarRegistro(index) {
    const registro = registrosFinanceiros[index];
    document.getElementById('data').value = registro.data;
    document.getElementById('descricao').value = registro.descricao;
    document.getElementById('valor').value = registro.valor;
    document.querySelector(`input[name="tipo"][value="${registro.tipo}"]`).checked = true;

    excluirRegistro(index);
}

function confirmarExcluirRegistro(index) {
    const confirmar = confirm('Você tem certeza que deseja excluir este registro?');
    if (confirmar) {
        excluirRegistro(index);
    }
}

function excluirRegistro(index) {
    registrosFinanceiros.splice(index, 1);
    salvarRegistros();
    exibirRegistros();
}

function atualizarTotais(registrosFiltrados) {
    const totalEntradas = registrosFiltrados.reduce((acc, registro) => acc + (registro.tipo === 'entrada' ? registro.valor : 0), 0);
    const totalSaidas = registrosFiltrados.reduce((acc, registro) => acc + (registro.tipo === 'saida' ? registro.valor : 0), 0);
    const saldo = totalEntradas - totalSaidas;

    const totaisDiv = document.createElement('div');
    totaisDiv.classList.add('totais');
    totaisDiv.innerHTML = `
        <h5>Entradas: <span class="valor total-entrada">${formatarValor(totalEntradas)}</span></h5>
        <h5>Saídas: <span class="valor total-saida">${formatarValor(totalSaidas)}</span></h5>
        <h3>Saldo: <span class="valor saldo" style="color: ${saldo >= 0 ? '#0877e5' : 'red'};">${formatarValor(saldo)}</span></h3>
    `;

    const container = document.querySelector('.table-container');
    container.appendChild(totaisDiv);
}

function formatarValor(valor) {
    return `R$ ${valor.toFixed(2)}`;
}

function limparCampos() {
    document.getElementById('data').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('entrada').checked = true;
}

function salvarRegistros() {
    localStorage.setItem('registrosFinanceiros', JSON.stringify(registrosFinanceiros));
}

function carregarRegistros() {
    const registrosSalvos = JSON.parse(localStorage.getItem('registrosFinanceiros'));
    if (registrosSalvos) {
        registrosFinanceiros = registrosSalvos;
    }
}
