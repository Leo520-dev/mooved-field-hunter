// MOOVED Field Hunter - Auth & Data Scoping Module
// Referenced from index.html via <script src="auth.js"></script>

(function(){
  'use strict';

  let currentUser = null;

  // --- AUTH ---
  window.checkAuth = async function(){
    const s = sessionStorage.getItem('avm_session');
    if(s){
      try{
        currentUser = JSON.parse(s);
        document.body.classList.add('logged-in');
        document.getElementById('loginOverlay').style.display = 'none';
        return true;
      } catch(e){}
    }
    return false;
  };

  window.doLogin = async function(){
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const btn = document.getElementById('loginBtn');
    const err = document.getElementById('loginError');
    if(!u || !p){ err.textContent = 'Please enter username and password'; return; }
    btn.disabled = true; btn.textContent = 'Signing in...'; err.textContent = '';
    try{
      const r = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: u, password: p})
      });
      const d = await r.json();
      if(!r.ok || !d.token){
        err.textContent = d.error || 'Login failed';
        btn.disabled = false; btn.textContent = 'Sign In';
        return;
      }
      currentUser = d.user;
      sessionStorage.setItem('avm_session', JSON.stringify(d.user));
      document.body.classList.add('logged-in');
      document.getElementById('loginOverlay').style.display = 'none';
      toast('Welcome ' + d.user.name);
      initApp();
    } catch(e){
      err.textContent = 'Network error: ' + e.message;
      btn.disabled = false; btn.textContent = 'Sign In';
    }
  };

  window.doLogout = function(){
    sessionStorage.removeItem('avm_session');
    currentUser = null;
    document.body.classList.remove('logged-in');
    location.reload();
  };

  window.getSpId = function(){ return currentUser ? currentUser.id : ''; };
  window.getSpName = function(){ return currentUser ? currentUser.name : ''; };

  // Enter key on login
  document.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      const overlay = document.getElementById('loginOverlay');
      if(overlay && overlay.style.display !== 'none') doLogin();
    }
  });

  // --- DATA SCOPING ---
  window.spKey = function(k){ return getSpId() ? k + '_' + getSpId() : k; };
  window.spGet = function(k, def){
    const v = localStorage.getItem(spKey(k));
    return v === null ? def : JSON.parse(v);
  };
  window.spSet = function(k, v){
    if(getSpId()) localStorage.setItem(spKey(k), typeof v === 'string' ? v : JSON.stringify(v));
  };
  window.setSpField = function(obj){
    if(getSpId()) obj.sp = getSpId();
    return obj;
  };
  window.filterBySp = function(items){
    return getSpId() ? items.filter(function(i){ return i.sp === getSpId(); }) : items;
  };

  // --- INIT APP AFTER LOGIN ---
  window.initApp = function(){
    document.getElementById('loggedInUser').textContent = ' ' + getSpName();
    document.getElementById('logoutBtn').style.display = 'inline-block';
    activeRegion = spGet('avm_region', 'accra');
    visited = spGet('avm_v3_' + activeRegion, []);
    allCheckins = spGet('avm_checkins', {});
    allNotes = spGet('avm_notes', {});
    allAudioMeta = spGet('avm_audiometa', {});
    allPhotosSync = spGet('avm_photos_sync', {});
    render(); renderRegions(); updateSyncUI(); resetSyncTimer(); checkPWA(); renderGSSetupGuide();
  };

})();
