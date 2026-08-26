const fs = require('fs');
let file = 'src/components/views/Auth.astro';
let code = fs.readFileSync(file, 'utf8');

const view2FA = `
    <div id="view-2FA" class="view view-container view-public view-auth" data-view="2FA" data-public="true">
      <div class="auth-wrapper">
        <div class="auth-card auth-card-reset">
          <h2 class="auth-title">Verificação de Segurança</h2>
          <p class="auth-subtitle">Enviamos um código de 6 dígitos para o seu e-mail. Digite-o abaixo para acessar.</p>
          <div id="2fa-alert" style="display:none;margin-bottom:15px;padding:12px;border-radius:10px;font-size:.85rem;font-weight:600"></div>
          <form id="form2FA">
            <input type="text" name="code" placeholder="Código de 6 dígitos" required maxlength="6" style="text-align:center; font-size: 1.5rem; letter-spacing: 5px; font-weight: bold;">
            <button type="submit" class="btn" id="btn2FA" style="margin-top:15px">VERIFICAR CÓDIGO</button>
          </form>
          <div style="margin-top:20px"><a onclick="nav('Login'); firebase.auth().signOut();" style="color:var(--gray);font-weight:600;cursor:pointer">Cancelar e Voltar</a></div>
        </div>
      </div>
    </div>
`;

// Insert after view-Redefinir
code = code.replace(
  /<\/div>\s*<\/div>\s*<\/div>\s*$/,
  `</div>\n      </div>\n    </div>\n\n${view2FA}`
);

fs.writeFileSync(file, code);
console.log("Patched Auth.astro with 2FA view");
