
function irParaCadastro() {
    window.location.href = 'cadas.html';
}

function fazerLogin() {
    const nome = document.getElementById('nomeLogin').value;
    const senha = document.getElementById('senhaLogin').value;
    const msg = document.getElementById('mensagem');
    const nomeSalvo = localStorage.getItem('nome');
    const senhaSalva = localStorage.getItem('senha');

    if (nome === nomeSalvo && senha === senhaSalva) {
        msg.style.color = 'green';
        msg.textContent = 'Login feito com sucesso! Redirecionando...';
        localStorage.setItem('logado', 'true');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
    } else {
        msg.style.color = 'red';
        msg.textContent = 'Usuário ou senha inválidos!';
    }
}

function cadastrarUsuario() {
    const nome = document.getElementById('nomeCadastro').value;
    const senha = document.getElementById('senhaCadastro').value;
    const msg = document.getElementById('mensagem');
    localStorage.setItem('nome', nome);
    localStorage.setItem('senha', senha);
    msg.style.color = 'green';
    msg.textContent = 'Usuário cadastrado com sucesso!';
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function DeslogarEVoltar() {
    localStorage.removeItem('logado');
    window.location.href = 'index.html';
}

function verificaLogin() {
    if (localStorage.getItem('logado') !== 'true') {
        window.location.href = 'login.html';
    } else {
        document.getElementById('userNome').textContent = localStorage.getItem('nome');
    }
}


  window.onload = () => {
    const nomeUsuario = localStorage.getItem('nome');
    if (nomeUsuario) {
      const userNomeSpan = document.getElementById('userNome');
      if (userNomeSpan) {
        userNomeSpan.textContent = nomeUsuario;
      }
    }
  };


