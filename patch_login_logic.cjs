const fs = require('fs');
let file = 'src/pages/recrutador.astro';
let code = fs.readFileSync(file, 'utf8');

const oldLogin = `document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLogin'); btn.textContent='Verificando...'; btn.disabled=true;
  showLoader();
  try {
    // 1. Autenticação no Firebase
    const uc = await firebase.auth().signInWithEmailAndPassword(this.email.value, this.senha.value);
    const idToken = await uc.user.getIdToken();
    
    // 2. Chamar o servidor para validar o token e buscar os dados do usuário
    // Aqui definimos a variável 'res' que estava faltando
    const res = await gsRun('getDashboardData', { idToken });

    hideLoader(); 
    btn.textContent = 'ENTRAR'; 
    btn.disabled = false;

    if (res.success) { 
      storeDashboardSession(idToken, res.data);
      nav('Dashboard'); 
    }
    else { 
      globalAlert('Acesso Negado', res.msg, 'error'); 
      firebase.auth().signOut(); 
    }
  } catch (error) {
    hideLoader(); 
    btn.textContent = 'ENTRAR'; 
    btn.disabled = false;
    let msg = "E-mail ou senha incorretos.";
    // Se quiser ver o erro real no console para debugar: console.error(error);
    globalAlert('Erro no Login', msg, 'error');
  }
};`;

const newLogin = `/* ============================================================
   SECURE LOGIN HANDLERS (2FA & BRUTE FORCE PROTECTION)
   ============================================================ */
let tempLoginToken = null;
let tempLoginEmail = null;

document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btnLogin'); 
  const emailVal = this.email.value.trim();
  btn.textContent = 'Verificando...'; 
  btn.disabled = true;
  showLoader();
  
  try {
    // 1. Tenta Autenticação no Firebase
    const uc = await firebase.auth().signInWithEmailAndPassword(emailVal, this.senha.value);
    const idToken = await uc.user.getIdToken();
    
    // 2. Antes de liberar o Dashboard, verifica bloqueio na planilha e envia 2FA
    const secRes = await gsRun('checkAccountStatusAndSend2FA', { email: emailVal });
    
    if (secRes && secRes.isBlocked) {
      // Conta suspensa por segurança
      hideLoader(); btn.textContent = 'ENTRAR'; btn.disabled = false;
      await firebase.auth().signOut();
      globalAlert('Conta Bloqueada', secRes.msg, 'error');
      return;
    }
    
    if (secRes && secRes.success) {
      // E-mail enviado, vai para a tela de 2FA
      tempLoginToken = idToken;
      tempLoginEmail = emailVal;
      hideLoader(); btn.textContent = 'ENTRAR'; btn.disabled = false;
      nav('2FA');
    } else {
      // Falha genérica ou banco de dados indisponível (Fallback)
      hideLoader(); btn.textContent = 'ENTRAR'; btn.disabled = false;
      globalAlert('Aviso de Segurança', 'Não foi possível enviar o código 2FA. Tente novamente mais tarde.', 'error');
      await firebase.auth().signOut();
    }
    
  } catch (error) {
    hideLoader(); 
    btn.textContent = 'ENTRAR'; 
    btn.disabled = false;
    
    // REGISTRA A FALHA NA PLANILHA (Proteção Brute Force)
    gsRun('registerFailedLogin', { email: emailVal }).then(res => {
      if (res && res.isBlocked) {
        globalAlert('Bloqueio Preventivo', res.msg, 'error');
      } else {
        globalAlert('Erro no Login', 'E-mail ou senha incorretos.', 'error');
      }
    });
  }
};

// HANDLER DO FORMULÁRIO 2FA
const form2FA = document.getElementById('form2FA');
if(form2FA) {
  form2FA.onsubmit = async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn2FA');
    btn.textContent = 'Validando...';
    btn.disabled = true;
    showLoader();
    
    const codeVal = this.code.value;
    
    try {
      const verifyRes = await gsRun('verify2FA', { email: tempLoginEmail, code: codeVal });
      
      if (verifyRes && verifyRes.success) {
        // 2FA Válido! Busca os dados do Dashboard
        const res = await gsRun('getDashboardData', { idToken: tempLoginToken });
        hideLoader(); btn.textContent = 'VERIFICAR CÓDIGO'; btn.disabled = false;
        
        if (res.success) {
          storeDashboardSession(tempLoginToken, res.data);
          tempLoginToken = null;
          tempLoginEmail = null;
          this.reset();
          nav('Dashboard');
        } else {
          globalAlert('Acesso Negado', res.msg, 'error');
          firebase.auth().signOut();
          nav('Login');
        }
      } else {
        // Código Inválido
        hideLoader(); btn.textContent = 'VERIFICAR CÓDIGO'; btn.disabled = false;
        const alertBox = document.getElementById('2fa-alert');
        alertBox.textContent = verifyRes.msg || 'Código incorreto.';
        alertBox.style.display = 'block';
        alertBox.style.background = '#fef2f2';
        alertBox.style.color = '#dc2626';
      }
    } catch(err) {
      hideLoader(); btn.textContent = 'VERIFICAR CÓDIGO'; btn.disabled = false;
      globalAlert('Erro', 'Ocorreu um erro ao validar o código.', 'error');
    }
  };
}`;

code = code.replace(oldLogin, newLogin);

fs.writeFileSync(file, code);
console.log("Patched login logic");
