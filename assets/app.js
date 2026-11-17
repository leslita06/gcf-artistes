(function(){
'use strict';
var D=null,S={lieu:'all',statut:'all',rel:'all',q:''};
function ic(n,st){return '<i class="ic" style="-webkit-mask-image:url(assets/icons/'+n+'.svg);mask-image:url(assets/icons/'+n+'.svg)'+(st?';'+st:'')+'"></i>'}
function hydrate(r){Array.prototype.forEach.call((r||document).querySelectorAll('[data-ic]'),function(e){var u='url(assets/icons/'+e.dataset.ic+'.svg)';e.style.webkitMaskImage=u;e.style.maskImage=u})}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function $(i){return document.getElementById(i)}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function pl(n,s,p){return n+' '+(n>1?(p||s+'s'):s)}
function lien(u,t){return '<a href="'+esc(u)+'" target="_blank" rel="noopener">'+t+'</a>'}

function calme(a){return !a.en_cours.length&&!a.a_venir.length&&!a.presse.length&&!a.recentes.length}
function match(a,ignore){
  if(S.lieu!=='all'&&a.lieux.indexOf(S.lieu)<0)return false;
  if(S.rel!=='all'&&a.statut!==S.rel)return false;
  if(S.q&&norm(a.nom).indexOf(norm(S.q))<0)return false;
  if(ignore)return true;
  switch(S.statut){
    case 'en_cours':return a.en_cours.length>0;
    case 'a_venir':return a.a_venir.length>0;
    case 'opp':return a.opportunites.length>0;
    case 'dep':return a.deplacements.length>0;
    case 'dossier':return !a.dossier.a_jour;
    case 'calme':return calme(a);
  }
  return true;
}

function kpis(){
  var L=D.artistes.filter(function(a){return match(a,true)});
  var k=[
    ['en_cours','calendar-check','En exposition',L.filter(function(a){return a.en_cours.length}).length,'artistes avec une exposition ouverte aujourd’hui',0],
    ['a_venir','calendar-clock','Exposition à venir',L.filter(function(a){return a.a_venir.length}).length,'artistes avec une ouverture annoncée',0],
    ['presse','newspaper','Presse, 6 mois',L.reduce(function(s,a){return s+a.presse.length},0),'articles et mentions depuis mai',0],
    ['opp','award','Opportunités ouvertes',L.reduce(function(s,a){return s+a.opportunites.length},0),'appels à candidatures proposés',0],
    ['dep','truck','En déplacement',L.reduce(function(s,a){return s+a.deplacements.length},0),'œuvres en transport, prêt ou exposition',1],
    ['dossier','file-clock','Dossiers à revoir',L.filter(function(a){return !a.dossier.a_jour}).length,'dossiers d’artiste à mettre à jour, sur '+L.length,1]
  ];
  $('kpis').innerHTML=k.map(function(x){
    var on=S.statut===x[0]?' on':'';
    return '<div class="kpi'+(x[5]?' ex':'')+on+'" data-k="'+x[0]+'" role="button" tabindex="0"><div class="h"><span class="bx">'+ic(x[1])+'</span><span class="l">'+x[2]+'</span></div><p class="v">'+x[3]+'</p><p class="d">'+x[4]+'</p>'+(x[5]?'<span class="exb">Exemple</span>':'')+'</div>'}).join('');
  Array.prototype.forEach.call($('kpis').querySelectorAll('.kpi'),function(e){
    function go(){var k=e.dataset.k;if(k==='presse')return;S.statut=S.statut===k?'all':k;$('f-statut').value=S.statut;render()}
    e.addEventListener('click',go);e.addEventListener('keydown',function(ev){if(ev.key==='Enter')go()})});
}

function phrase(L){
  var c=L.filter(function(a){return a.en_cours.length}).length,v=L.filter(function(a){return a.a_venir.length}).length;
  var lieu=S.lieu==='all'?'':' liés à '+S.lieu;
  return '<b>'+pl(L.length,'artiste')+'</b>'+lieu+' : <b>'+c+'</b> en exposition aujourd’hui, <b>'+v+'</b> avec une ouverture annoncée. La Biennale de Dakar ouvre le 19 novembre avec Cheikh Ndiaye, Serigne Ibrahima Dieye et Eva Diallo.';
}

function retenir(){
  var A=D.artistes, out=[];
  function f(n){for(var i=0;i<A.length;i++)if(A[i].nom===n)return A[i]}
  out.push(['calendar-clock','','<b>Dakar, 19 novembre.</b> Ouverture de la Biennale (Cheikh Ndiaye, Serigne Ibrahima Dieye, Eva Diallo) et de « Lu Nëbtu », Kassou Seydou à l’hôtel Sokhamon.','https://cecilefakhoury.com/exhibitions/131-lu-nebtu-kassou-seydou-sokhamon-hotel-dakar/overview/','Site de la galerie']);
  var opps=[];A.forEach(function(a){a.opportunites.forEach(function(o){if(o.jours!=null&&o.jours<=21)opps.push([o,a])})});
  opps.sort(function(x,y){return x[0].jours-y[0].jours});
  if(opps.length){var o=opps[0];out.push(['award','r-down','<b>'+esc(o[0].nom)+'</b> : dossier avant le '+esc(o[0].limite)+', dans '+pl(o[0].jours,'jour')+'. Proposé pour '+esc(o[1].nom)+'.',o[0].url,'Appel à candidatures'])}
  var r=f('Roméo Mivekannin');
  if(r)out.push(['newspaper','r-up','<b>Roméo Mivekannin</b> : trois expositions ouvertes et '+pl(r.presse.length,'article')+' en six mois. Kanal – Centre Pompidou ouvre le 28 novembre à Bruxelles.','https://cecilefakhoury.com/events/521/','Site de la galerie']);
  $('retenir').innerHTML=out.map(function(x){return '<div class="rt '+x[1]+'"><span class="bx">'+ic(x[0])+'</span><p><a href="'+esc(x[3])+'" target="_blank" rel="noopener">'+x[2]+'</a><span class="w">Source : '+x[4]+'</span></p></div>'}).join('');
}

function evLine(e,cls,lab){return '<div class="ev"><span class="st '+cls+'">'+lab+'</span><span class="tx">'+esc(court(e.titre))+' <small>· '+esc(e.periode)+'</small></span></div>'}
function court(t){t=t.replace(/^Dans « (.*?) ».*$/,'$1');return t.length>70?t.slice(0,68)+'…':t}
function num(n,icn,sub,hot){return '<div class="num'+(n?'':' z')+(hot?' hot':'')+'">'+ic(icn)+n+(sub?' <small>'+sub+'</small>':'')+'</div>'}

function liste(){
  var L=D.artistes.filter(function(a){return match(a)});
  $('t-liste').textContent=L.length===D.artistes.length?'Les '+L.length+' artistes':pl(L.length,'artiste')+' sur '+D.artistes.length;
  $('vide').classList.toggle('hidden',L.length>0);
  $('liste').innerHTML=L.map(function(a){
    var i=D.artistes.indexOf(a), evs=[];
    a.en_cours.forEach(function(e){evs.push(evLine(e,'c','En cours'))});
    a.a_venir.forEach(function(e){evs.push(evLine(e,'v','À venir'))});
    var ex=evs.length?evs.slice(0,2).join('')+(evs.length>2?'<p class="more-ev">+ '+(evs.length-2)+' autre'+(evs.length>3?'s':'')+'</p>':''):'<span class="none">'+(a.recentes.length?'Dernière : '+esc(court(a.recentes[0].titre))+', jusqu’au '+esc(a.recentes[0].periode.split(' – ').pop()):'Aucune exposition annoncée')+'</span>';
    var o=a.opportunites, oj=o.length&&o[0].jours!=null?o[0].jours:null;
    var lieux=a.lieux.map(function(x){return '<span class="lp">'+x+'</span>'}).join('');
    return '<div class="row" data-i="'+i+'" role="button" tabindex="0">'+
      '<div class="who"><img class="th-img" src="'+a.img+'?v=20261118a" alt="'+esc(a.legende||a.nom)+'" loading="lazy"><div><p class="n">'+esc(a.nom)+'</p><p class="s">'+(a.statut==='Collaboration'?'<span class="lp coll">Collaboration</span>':'')+lieux+'</p></div></div>'+
      '<div class="ex-cell"><span class="lab">Expositions en cours et à venir</span>'+ex+'</div>'+
      '<div><span class="lab">Presse, 6 mois</span>'+num(a.presse.length,'newspaper',a.presse.length?'dernier : '+a.presse[0].date.replace(/ 2026$/,''):'')+'</div>'+
      '<div><span class="lab">Opportunités</span>'+num(o.length,'award',oj!=null?'dans '+oj+' j':'',oj!=null&&oj<=14)+'</div>'+
      '<div><span class="lab">En déplacement · exemple</span>'+num(a.deplacements.length,'truck',a.deplacements.length?esc(a.deplacements[0].statut.toLowerCase()):'')+'</div>'+
      '<div><span class="lab">Dossier · exemple</span><div class="dos">'+(a.dossier.a_jour?'<span class="b ok">'+ic('circle-check')+'À jour</span>':'<span class="b ko">'+ic('triangle-alert')+'À mettre à jour</span>')+'<span class="d">Mis à jour le '+esc(a.dossier.maj)+'</span></div></div>'+
    '</div>'}).join('');
  Array.prototype.forEach.call($('liste').querySelectorAll('.row'),function(e){
    e.addEventListener('click',function(){ouvrir(+e.dataset.i)});
    e.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ouvrir(+e.dataset.i)}})});
}

function sec(icn,titre,count,body,ex){return '<section class="fi-sec"><h4><span class="bx">'+ic(icn)+'</span>'+titre+(ex?' <span class="tag ex">Exemple</span>':'')+'<span class="c">'+count+'</span></h4>'+body+'</section>'}
function evItem(e){
  var st=e.etat==='en_cours'?'<span class="st c">En cours</span>':(e.etat==='a_venir'?'<span class="st v">À venir</span>':'');
  return '<div class="it"><p class="t">'+lien(e.url,esc(e.titre))+'</p><p class="r">'+st+'</p><p class="m">'+esc(e.type)+(e.lieu?' · '+esc(e.lieu):'')+' · '+esc(e.periode)+'<br>Source : '+lien(e.url,esc(e.source))+'</p></div>'}
function ouvrir(i){
  var a=D.artistes[i], h='';
  h+='<a class="fi-hero" href="'+esc(a.oeuvre_url)+'" target="_blank" rel="noopener"><img src="'+a.img+'?v=20261118a" alt="'+esc(a.legende||a.nom)+'"></a>';
  h+='<p class="fi-cap">'+(a.legende?esc(a.legende)+' · ':'')+lien(a.oeuvre_url,'voir sur le site de la galerie')+'</p>';
  h+='<div class="fi-in"><h3 id="fi-nom">'+esc(a.nom)+'</h3><div class="fi-meta">'+(a.statut==='Collaboration'?'<span class="lp coll">Collaboration</span>':'<span class="lp">Artiste représenté</span>')+a.lieux.map(function(x){return '<span class="lp">'+x+'</span>'}).join('')+'<a class="fi-link" href="'+esc(a.url)+'" target="_blank" rel="noopener">Page de l’artiste '+ic('external-link')+'</a></div>';
  var ev=a.en_cours.concat(a.a_venir);
  h+='<div class="fi-sum"><div><p class="v">'+ev.length+'</p><p class="l">expositions en cours et à venir</p></div><div><p class="v">'+a.presse.length+'</p><p class="l">articles en 6 mois</p></div><div><p class="v">'+a.opportunites.length+'</p><p class="l">opportunités ouvertes</p></div><div><p class="v">'+a.deplacements.length+'</p><p class="l">œuvres en déplacement <span class="tag ex">Exemple</span></p></div></div>';
  h+=sec('calendar-check','Expositions en cours et à venir',ev.length,ev.length?ev.map(evItem).join(''):'<p class="fi-empty">Aucune exposition en cours ni annoncée à ce jour.</p>');
  if(a.recentes.length)h+=sec('clock','Terminées depuis moins de quatre mois',a.recentes.length,a.recentes.map(evItem).join(''));
  h+=sec('newspaper','Presse et publications, six derniers mois',a.presse.length,a.presse.length?a.presse.map(function(p){return '<div class="it"><p class="t">'+lien(p.url,esc(p.titre))+'</p><p class="r">'+esc(p.date)+'</p><p class="m">'+(p.media?esc(p.media)+' · ':'')+'Source : '+esc(p.source)+'</p></div>'}).join(''):'<p class="fi-empty">Aucun article relevé depuis mai 2026'+(a.presse_total?' (dernier plus ancien).':'.')+'</p>');
  h+=sec('award','Opportunités ouvertes',a.opportunites.length,a.opportunites.length?a.opportunites.map(function(o){return '<div class="it"><p class="t">'+lien(o.url,esc(o.nom))+'</p><p class="r'+(o.jours!=null&&o.jours<=14?' alert-red':'')+'">'+(o.jours!=null?'Avant le '+esc(o.limite)+' · '+o.jours+' j':esc(o.limite))+'</p><p class="m">'+esc(o.type)+' · '+esc(o.pays)+' · '+esc(o.contenu)+'<br>Pourquoi cet artiste : '+esc(o.pourquoi)+' <i>(proposition, à valider)</i></p></div>'}).join(''):'<p class="fi-empty">Aucun appel ouvert rapproché de cet artiste.</p>');
  h+=sec('truck','Œuvres en déplacement',a.deplacements.length,a.deplacements.length?a.deplacements.map(function(m){return '<div class="it"><p class="t">'+esc(m.titre)+'</p><p class="r">'+esc(m.statut)+'</p><p class="m">'+esc(m.de)+' → '+esc(m.vers)+' · '+esc(m.motif)+(m.depart?' · départ '+esc(m.depart):'')+(m.arrivee?' · arrivée prévue '+esc(m.arrivee):'')+'</p></div>'}).join(''):'<p class="fi-empty">Aucune œuvre en mouvement.</p>',1);
  if(a.demandes_presse.length)h+=sec('mail-question','Demandes de journalistes en attente',a.demandes_presse.length,a.demandes_presse.map(function(d){return '<div class="it"><p class="t">'+esc(d.objet)+'</p><p class="r'+(d.jours<0?' alert-red':'')+'">'+(d.jours<0?'En retard de '+(-d.jours)+' j':'Échéance '+esc(d.echeance))+'</p><p class="m">'+esc(d.media)+' · '+esc(d.statut)+'</p></div>'}).join(''),1);
  var ds=a.dossier;
  h+=sec('file-clock','Dossier d’artiste',ds.a_jour?'À jour':'À mettre à jour','<div class="it"><p class="t">Dernière mise à jour le '+esc(ds.maj)+'</p><p class="r">'+(ds.a_jour?'<span class="b ok" style="color:var(--up)">À jour</span>':'<span style="color:var(--warn);font-weight:600">'+pl(ds.nouveaux,'fait nouveau','faits nouveaux')+'</span>')+'</p><p class="m">'+(ds.a_jour?'Aucune exposition ni aucun article public postérieur à cette date.':'Expositions ou articles publics postérieurs à la dernière mise à jour'+(ds.dernier_fait?', le plus récent le '+esc(ds.dernier_fait):'')+' : à reporter dans le dossier.')+'</p></div>',1);
  h+='<p class="fi-note">Expositions, presse et opportunités : relevés réels du 17 novembre 2026, chaque ligne renvoie à sa source. Les blocs marqués « Exemple » sont inventés pour la démonstration.</p></div>';
  $('fi-body').innerHTML=h;
  $('fiche').classList.remove('hidden');document.body.classList.add('lock');
  $('fiche').querySelector('.fi-panel').scrollTop=0;
  try{history.replaceState(null,'','#'+encodeURIComponent(norm(a.nom).replace(/[^a-z0-9]+/g,'-')))}catch(e){}
  $('fiche').querySelector('.fi-x').focus();
}
function fermer(){$('fiche').classList.add('hidden');document.body.classList.remove('lock');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}

function render(){
  var L=D.artistes.filter(function(a){return match(a,true)});
  $('phrase').innerHTML=phrase(L);kpis();liste();
}
function init(d){
  D=d;$('arrete').textContent=d.arrete;hydrate();retenir();
  $('f-lieu').addEventListener('change',function(){S.lieu=this.value;render()});
  $('f-statut').addEventListener('change',function(){S.statut=this.value;render()});
  $('f-rel').addEventListener('change',function(){S.rel=this.value;render()});
  $('f-q').addEventListener('input',function(){S.q=this.value.trim();render()});
  $('raz').addEventListener('click',function(){S={lieu:'all',statut:'all',rel:'all',q:''};$('f-lieu').value='all';$('f-statut').value='all';$('f-rel').value='all';$('f-q').value='';render()});
  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'),function(e){e.addEventListener('click',fermer)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')fermer()});
  render();
  if(location.hash){var h=decodeURIComponent(location.hash.slice(1));D.artistes.forEach(function(a,i){if(norm(a.nom).replace(/[^a-z0-9]+/g,'-')===h)ouvrir(i)})}
}
fetch('data/artistes.json?v=20261118a').then(function(r){return r.json()}).then(init);
})();
