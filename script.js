
// ===== SISTEMA DE ARMAZENAMENTO DE USUÁRIOS =====
function obterUsuarios() {
    const usuarios = localStorage.getItem('usuarios');
    return usuarios ? JSON.parse(usuarios) : [];
}

function salvarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

function usuarioExiste(nome) {
    const usuarios = obterUsuarios();
    return usuarios.some(u => u.nome.toLowerCase() === nome.toLowerCase());
}

function buscarUsuario(nome, senha) {
    const usuarios = obterUsuarios();
    return usuarios.find(u => u.nome === nome && u.senha === senha);
}

// ===== NAVEGAÇÃO =====
function irParaCadastro() {
    window.location.href = 'cadas.html';
}

// ===== LOGIN =====
function fazerLogin() {
    const nome = document.getElementById('nomeLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;
    const msg = document.getElementById('mensagem');

    // Validações
    if (!nome || !senha) {
        msg.style.color = 'red';
        msg.textContent = '❌ Por favor, preencha todos os campos!';
        return;
    }

    // Buscar usuário
    const usuario = buscarUsuario(nome, senha);

    if (usuario) {
        msg.style.color = 'green';
        msg.textContent = '✅ Login feito com sucesso! Redirecionando...';
        localStorage.setItem('logado', 'true');
        localStorage.setItem('usuarioAtual', nome);
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } else {
        msg.style.color = 'red';
        msg.textContent = '❌ Usuário ou senha inválidos!';
    }
}

// ===== CADASTRO =====
function cadastrarUsuario() {
    const nome = document.getElementById('nomeCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value;
    const confirmarSenha = document.getElementById('confirmarSenha')?.value;
    const msg = document.getElementById('mensagem');

    // Validações
    if (!nome || !senha) {
        msg.style.color = 'red';
        msg.textContent = '❌ Por favor, preencha todos os campos!';
        return;
    }

    if (nome.length < 3) {
        msg.style.color = 'red';
        msg.textContent = '❌ O nome deve ter pelo menos 3 caracteres!';
        return;
    }

    if (senha.length < 4) {
        msg.style.color = 'red';
        msg.textContent = '❌ A senha deve ter pelo menos 4 caracteres!';
        return;
    }

    if (confirmarSenha && senha !== confirmarSenha) {
        msg.style.color = 'red';
        msg.textContent = '❌ As senhas não correspondem!';
        return;
    }

    if (usuarioExiste(nome)) {
        msg.style.color = 'red';
        msg.textContent = '❌ Este usuário já existe! Escolha outro nome.';
        return;
    }

    // Adicionar novo usuário
    const usuarios = obterUsuarios();
    const novoUsuario = {
        nome: nome,
        senha: senha,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        id: Date.now()
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    msg.style.color = 'green';
    msg.textContent = '✅ Usuário cadastrado com sucesso!';
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// ===== LOGOUT =====
function DeslogarEVoltar() {
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtual');
    window.location.href = 'index.html';
}

// ===== VERIFICAÇÃO DE LOGIN =====
function verificaLogin() {
    if (localStorage.getItem('logado') !== 'true') {
        window.location.href = 'login.html';
    } else {
        const usuarioAtual = localStorage.getItem('usuarioAtual');
        const userNome = document.getElementById('userNome');
        if (userNome) {
            userNome.textContent = usuarioAtual || 'Usuário';
        }
    }
}

// ===== INICIALIZAÇÃO =====
window.onload = () => {
    const usuarioAtual = localStorage.getItem('usuarioAtual');
    if (usuarioAtual) {
        const userNomeSpan = document.getElementById('userNome');
        if (userNomeSpan) {
            userNomeSpan.textContent = usuarioAtual;
        }
    }
};

// ===== FUNÇÃO PARA LISTAR TODOS OS USUÁRIOS (OPCIONAL) =====
function listarUsuarios() {
    const usuarios = obterUsuarios();
    console.log('Usuários cadastrados:', usuarios);
    return usuarios;
}


