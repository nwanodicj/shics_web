// Toggle password visibility for registration and login forms
(function() {
  const password = document.getElementById('password')
  const toggle = document.getElementById('togglePassword')
  if (!password || !toggle) return
  toggle.addEventListener('click', () => {
    const show = password.type === 'password'
    password.type = show ? 'text' : 'password'
    toggle.textContent = show ? 'Hide Password' : 'Show Password'
  })
})();

// Toggle login password visibility for login page
(function() {
  const password = document.getElementById('loginPassword')
  const toggle = document.getElementById('togglePassword')
  if (!password || !toggle) return
  toggle.addEventListener('click', () => {
    const show = password.type === 'password'
    password.type = show ? 'text' : 'password'
    toggle.textContent = show ? 'Hide Password' : 'Show Password'
  })
})()

// Show error notice if present 
(function(){
  function showErrorNotice(){
    const n = document.getElementById('errorNotice')
    if(!n) return
    try{
      console.log('[register] showErrorNotice', new Date().toISOString())
      n.scrollIntoView({behavior:'smooth', block:'center'})
      n.style.display = 'block'
      n.style.visibility = 'visible'
      n.style.opacity = '1'
      n.style.position = 'static'
    } catch (e) { console.warn('[register] showErrorNotice error', e) }
  }
  function observeNotice(){
    const n = document.getElementById('errorNotice')
    if(!n) return
    if (window.__reg_notice_observer) return
    const obs = new MutationObserver(mutations=>{
      mutations.forEach(m=>{
        // Lightweight logging for diagnostics only
        console.log('[register] notice mutation', m.type, m.attributeName || '', new Date().toISOString())
        if(m.type === 'attributes'){
          console.log('[register] attributes:', n.style.display, n.style.visibility, n.style.opacity)
        }
        if(m.type === 'childList' && !document.getElementById('errorNotice')){
          console.warn('[register] errorNotice removed from DOM')
        }
      })
    })
    obs.observe(n, { attributes: true, attributeFilter: ['style','class'], childList: true })
    window.__reg_notice_observer = obs
  }
  document.addEventListener('DOMContentLoaded', ()=>{ showErrorNotice(); observeNotice(); })
  window.addEventListener('load', ()=>{ showErrorNotice(); })
  setTimeout(showErrorNotice, 500)
  setTimeout(showErrorNotice, 1500)
  setTimeout(showErrorNotice, 3000)
})();
