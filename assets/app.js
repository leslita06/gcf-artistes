(function(){
'use strict';
var D=null,IDX={},P='all',TAB='fil',F={type:'all',lieu:'all',art:'all'},C={lieu:'all',rel:'all',q:''};
var V='?v=20261118c';
var TYIC={Exposition:'calendar-check',Presse:'newspaper',Prix:'trophy',Résidence:'tent',Foire:'presentation',Publication:'book-open',Rencontre:'mic-vocal'};
var MN=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function $(i){return document.getElementById(i)}
function ic(n){return '<i class="ic" style="-webkit-mask-image:url(assets/icons/'+n+'.svg);mask-image:url(assets/icons/'+n+'.svg)"></i>'}
function hydrate(r){Array.prototype.forEach.call((r||document).querySelectorAll('[data-ic]'),function(e){var u='url(assets/icons/'+e.dataset.ic+'.svg)';e.style.webkitMaskImage=u;e.style.maskImage=u})}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function pl(n,s,p){return n+' '+(n>1?(p||s+'s'):s)}
function day(s){var p=s.split('-');return Date.UTC(+p[0],+p[1]-1,+p[2])/864e5}
var TODAY;
/* image à dimensions fixes, fond gris, priorité aux premières */
function img(src,wh,alt,eager){
  return '<img src="'+src+V+'" width="'+wh[0]+'" height="'+wh[1]+'" alt="'+esc(alt)+'" decoding="async" '+(eager?'loading="eager" fetchpriority="high"':'loading="lazy"')+' onload="this.classList.add(\'ok\')">';
}
function inPer(x){
  if(P==='all')return true;
  var w=P==='sem'?7:31,d=day(x.date),f=x.fin?day(x.fin):d;
  if(d>=TODAY-w&&d<=TODAY+w)return true;
  return false;
}
function etat(x){var d=day(x.date),f=x.fin?day(x.fin):null;if(d>TODAY)return 'v';if(f!==null&&f>=TODAY)return 'c';return ''}
function lieuOk(x,l){return l==='all'||x.villes.indexOf(l)>=0}
/* chiffres du haut */
function kpis(){
  var A=D.artistes,ec=A.filter(function(a){return a.en_cours.length}).length;
  var fil=D.fil.filter(inPer);
  var av=D.fil.filter(function(x){return etat(x)==='v'&&inPer(x)});
  var avu={};av.forEach(function(x){avu[x.url+x.phrase]=1});
  var pr={},prP={};D.fil.forEach(function(x){if(x.type!=='Presse')return;if(x.date>=D.presse_depuis_iso)pr[x.url]=1;if(P!=='all'&&inPer(x)&&day(x.date)<=TODAY)prP[x.url]=1});
  var npr=Object.keys(pr).length,nprP=Object.keys(prP).length;
  var opp=A.reduce(function(s,a){return s+a.opportunites.length},0),dep=A.reduce(function(s,a){return s+a.deplacements.length},0);
  var lab=P==='sem'?'cette semaine':(P==='mois'?'ce mois':'');
  var k=[
    ['rss','Nouveautés',fil.length,P==='all'?'faits datés et sourcés dans le fil':(P==='sem'?'faits datés à 7 jours près, avant ou après aujourd’hui':'faits datés à 31 jours près, avant ou après aujourd’hui')],
    ['calendar-check','En exposition',ec,'artistes avec une exposition ouverte aujourd’hui'],
    ['calendar-clock','Ouvertures à venir',Object.keys(avu).length,P==='all'?'expositions, foires et rencontres annoncées':'annoncées '+lab],
    ['newspaper','Presse, 6 mois',P==='all'?npr:nprP,P==='all'?'articles distincts depuis le 18 mai, chacun compté une fois':'articles parus '+lab+' · '+npr+' depuis le 18 mai'],
    ['award','Opportunités ouvertes',opp,'appels à candidatures proposés'],
    ['truck','En déplacement',dep,'œuvres en transport, prêt ou exposition',1]
  ];
  $('kpis').innerHTML=k.map(function(x){return '<div class="kpi"><div class="h"><span class="bx">'+ic(x[0])+'</span><span class="l">'+x[1]+'</span></div><p class="v">'+x[2]+'</p><p class="d">'+x[3]+'</p>'+(x[4]?'<span class="tag ex">Exemple</span>':'')+'</div>'}).join('');
}
function phrase(){
  var A=D.artistes;
  if(TAB==='catalogue'){
    var c=A.filter(function(a){return a.en_cours.length}).length;
    $('phrase').innerHTML='<b>'+A.length+' artistes</b> représentés ou en collaboration. <b>'+c+'</b> ont une exposition ouverte aujourd’hui. Cliquer sur un artiste ouvre sa fiche : biographie, expositions, presse, opportunités et œuvres.';
    return;
  }
  var L=D.fil.filter(inPer),av=L.filter(function(x){return etat(x)==='v'}).length,pr=L.filter(function(x){return x.type==='Presse'}).length;
  var per=P==='sem'?'Cette semaine':(P==='mois'?'Ce mois-ci':'Depuis janvier');
  $('phrase').innerHTML=per+' : <b>'+pl(L.length,'fait')+'</b>, dont <b>'+av+'</b> à venir et <b>'+pl(pr,'article')+'</b> de presse. Dakar, 19 novembre : ouverture de la Biennale avec Cheikh Ndiaye, Serigne Ibrahima Dieye et Eva Diallo, et de « Lu Nëbtu » de Kassou Seydou.';
}
/* fil */
function dateLab(x){return x.periode}
function filtreFil(){
  return D.fil.filter(function(x){
    if(!inPer(x))return false;
    if(F.type!=='all'&&x.type!==F.type)return false;
    if(!lieuOk(x,F.lieu))return false;
    if(F.art!=='all'&&x.artistes.indexOf(F.art)<0)return false;
    return true});
}
function noms(x){return x.artistes.map(function(n){return '<button data-a="'+esc(IDX[n].id)+'">'+esc(n)+'</button>'}).join(', ')}
function fil(){
  var L=filtreFil(),h='',mo='',n=0;
  L.forEach(function(x){
    var m=x.date.slice(0,7);
    if(m!==mo){mo=m;var p=m.split('-');h+='<p class="mo">'+MN[+p[1]-1]+' '+p[0]+'</p>'}
    var e=etat(x),st=e==='v'?'<span class="st v">À venir</span>':(e==='c'?'<span class="st c">En cours</span>':'');
    var dom=x.url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
    h+='<article class="card"><a class="ph" href="'+esc(x.url)+'" target="_blank" rel="noopener" tabindex="-1">'+img(x.img,x.wh,x.artistes[0],n<6)+'</a>'+
      '<div class="bd"><div class="rw"><span class="ty t-'+x.type+'">'+ic(TYIC[x.type]||'sparkles')+x.type+'</span>'+st+'<span class="dt">'+esc(dateLab(x))+'</span></div>'+
      '<p class="who">'+noms(x)+'</p>'+
      '<p class="ph-t">'+esc(x.phrase)+(x.media?' <span style="color:var(--mute)">· '+esc(x.media)+'</span>':'')+'</p>'+
      (x.lieu&&x.lieu!=='en ligne'?'<p class="lieu">'+ic('map-pin')+esc(x.lieu)+'</p>':'')+
      '<a class="src" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+ic('external-link')+'Source : '+esc(dom)+'</a></div></article>';
    n++;
  });
  $('fil').innerHTML=h;$('fil-vide').classList.toggle('hidden',L.length>0);
  bindA($('fil'));
}
function bindA(r){Array.prototype.forEach.call(r.querySelectorAll('[data-a]'),function(b){b.addEventListener('click',function(ev){ev.preventDefault();ouvrir(b.dataset.a)})})}
/* catalogue */
function grille(){
  var L=D.artistes.filter(function(a){
    if(C.lieu!=='all'&&a.lieux.indexOf(C.lieu)<0)return false;
    if(C.rel!=='all'&&a.statut!==C.rel)return false;
    if(C.q&&norm(a.nom).indexOf(norm(C.q))<0)return false;return true});
  $('grille').innerHTML=L.length?L.map(function(a,i){
    var ev=a.en_cours.length+a.a_venir.length;
    return '<button class="ac" data-a="'+a.id+'"><span class="ph">'+img(a.hero.t,a.hero.wh,a.nom,i<8)+'</span><span class="bd"><span class="n">'+esc(a.nom)+'</span><span class="s">'+(a.en_cours.length?'<span class="lp live">En exposition</span>':'')+(a.statut==='Collaboration'?'<span class="lp coll">Collaboration</span>':'')+a.lieux.map(function(x){return '<span class="lp">'+x+'</span>'}).join('')+'</span>'+
      '<span class="k"><span>'+ic('calendar-check')+'<b>'+ev+'</b> expo.</span><span>'+ic('newspaper')+'<b>'+a.presse.length+'</b> presse</span>'+(a.opportunites.length?'<span>'+ic('award')+'<b>'+a.opportunites.length+'</b></span>':'')+'</span></span></button>'}).join(''):'<p class="empty">Aucun artiste ne correspond.</p>';
  bindA($('grille'));
}
/* fiche */
function sec(icn,t,c,body,ex){return '<section class="fi-sec"><h4><span class="bx">'+ic(icn)+'</span>'+t+(ex?'<span class="tag ex">Exemple</span>':'')+'<span class="c">'+c+'</span></h4>'+body+'</section>'}
function lien(u,t){return '<a href="'+esc(u)+'" target="_blank" rel="noopener">'+t+'</a>'}
function ouvrir(id){
  var a=null;D.artistes.forEach(function(x){if(x.id===id)a=x});if(!a)return;
  var h='',hero=a.hero,w0=a.works[0];
  var big=hero;
  h+='<div class="fi-head"><div><a class="ph" href="'+esc(a.bio_url)+'" target="_blank" rel="noopener"><img class="lo ok" src="'+big.t+V+'" alt="" width="'+big.wh[0]+'" height="'+big.wh[1]+'"><img src="'+big.g+V+'" alt="'+esc(a.nom)+'" onload="this.classList.add(\'ok\')" style="position:relative"></a>'+
     '<p class="cap">'+(hero.portrait?'Portrait de l’artiste':'Image de la page Biographie')+' · '+lien(a.bio_url,'site de la galerie')+'</p></div>';
  h+='<div class="fi-id"><h3 id="fi-nom">'+esc(a.nom)+'</h3><div class="fi-meta">'+(a.statut==='Collaboration'?'<span class="lp coll">Collaboration</span>':'<span class="lp">Artiste représenté</span>')+a.lieux.map(function(x){return '<span class="lp">'+x+'</span>'}).join('')+'</div>';
  h+='<div class="facts">'+(a.naissance?'<div>'+ic('user')+'<span><b>Naissance</b> · '+esc(a.naissance)+'</span></div>':'')+(a.vit?'<div>'+ic('map-pin')+'<span><b>Vit et travaille</b> · '+esc(a.vit)+'</span></div>':'')+'</div>';
  h+='<p class="fi-bio">'+esc(a.bio)+'</p>';
  h+='<div class="links">'+'<a class="lk" href="'+esc(a.url)+'" target="_blank" rel="noopener">'+ic('globe')+'Page de l’artiste</a><a class="lk" href="'+esc(a.bio_url)+'" target="_blank" rel="noopener">'+ic('book-open')+'Biographie complète</a>'+
     (a.reseaux||[]).map(function(r){return '<a class="lk" href="'+esc(r.url)+'" target="_blank" rel="noopener">'+ic(r.type==='instagram'?'instagram':'link')+esc(r.label)+'</a>'}).join('')+'</div></div></div>';
  h+='<div class="fi-in">';
  var ev=a.en_cours.concat(a.a_venir);
  // faits du fil non déjà présents
  var vus={};ev.forEach(function(e){vus[e.url]=1});
  var autres=D.fil.filter(function(x){return x.artistes.indexOf(a.nom)>=0&&x.type!=='Presse'&&etat(x)&&!vus[x.url]});
  h+='<div class="fi-sum"><div><p class="v">'+(ev.length+autres.length)+'</p><p class="l">expositions et rendez-vous en cours ou à venir</p></div><div><p class="v">'+a.presse.length+'</p><p class="l">articles en 6 mois</p></div><div><p class="v">'+a.opportunites.length+'</p><p class="l">opportunités ouvertes</p></div><div><p class="v">'+a.deplacements.length+'</p><p class="l">œuvres en déplacement <span class="tag ex">Exemple</span></p></div></div>';
  var items=ev.map(function(e){return {t:e.titre,u:e.url,st:e.etat==='en_cours'?'c':'v',m:e.type+(e.lieu?' · '+e.lieu:''),p:e.periode,s:e.source}}).concat(autres.map(function(x){return {t:x.phrase,u:x.url,st:etat(x),m:x.type+(x.lieu?' · '+x.lieu:''),p:x.periode,s:'Veille du 17 nov. 2026'}}));
  h+=sec('calendar-check','Expositions et rendez-vous, en cours et à venir',items.length,items.length?items.map(function(e){return '<div class="it"><p class="t">'+lien(e.u,esc(e.t))+'</p><p class="r"><span class="st '+e.st+'">'+(e.st==='c'?'En cours':'À venir')+'</span></p><p class="m">'+esc(e.m)+' · '+esc(e.p)+'<br>Source : '+lien(e.u,esc(e.s))+'</p></div>'}).join(''):'<p class="fi-empty">Aucune exposition en cours ni annoncée à ce jour.</p>');
  var faits=D.fil.filter(function(x){return x.artistes.indexOf(a.nom)>=0&&/Prix|Résidence|Publication|Foire|Rencontre/.test(x.type)&&!etat(x)});
  if(faits.length)h+=sec('trophy','Prix, résidences, foires et publications récents',faits.length,faits.map(function(x){return '<div class="it"><p class="t">'+lien(x.url,esc(x.phrase))+'</p><p class="r">'+esc(x.periode)+'</p><p class="m">'+esc(x.type)+(x.lieu?' · '+esc(x.lieu):'')+'</p></div>'}).join(''));
  h+=sec('newspaper','Presse, six derniers mois',a.presse.length,a.presse.length?a.presse.map(function(p){return '<div class="it"><p class="t">'+lien(p.url,esc(p.titre))+'</p><p class="r">'+esc(p.date)+'</p><p class="m">'+(p.media?esc(p.media)+' · ':'')+'Source : '+esc(p.source)+'</p></div>'}).join(''):'<p class="fi-empty">Aucun article relevé depuis le 18 mai 2026.</p>');
  h+=sec('award','Opportunités ouvertes',a.opportunites.length,a.opportunites.length?a.opportunites.map(function(o){return '<div class="it"><p class="t">'+lien(o.url,esc(o.nom))+'</p><p class="r'+(o.jours!=null&&o.jours<=14?' alert-red':'')+'">'+(o.jours!=null?'Avant le '+esc(o.limite)+' · '+o.jours+' j':esc(o.limite))+'</p><p class="m">'+esc(o.type)+' · '+esc(o.pays)+' · '+esc(o.contenu)+'<br>Pourquoi cet artiste : '+esc(o.pourquoi)+' <i>(proposition, à valider)</i></p></div>'}).join(''):'<p class="fi-empty">Aucun appel ouvert rapproché de cet artiste.</p>');
  h+=sec('truck','Œuvres en déplacement',a.deplacements.length,a.deplacements.length?a.deplacements.map(function(m){return '<div class="it"><p class="t">'+esc(m.titre)+'</p><p class="r">'+esc(m.statut)+'</p><p class="m">'+esc(m.de)+' → '+esc(m.vers)+' · '+esc(m.motif)+(m.depart?' · départ '+esc(m.depart):'')+(m.arrivee?' · arrivée prévue '+esc(m.arrivee):'')+'</p></div>'}).join(''):'<p class="fi-empty">Aucune œuvre en mouvement.</p>',1);
  var ds=a.dossier;
  h+=sec('file-clock','Dossier et book',ds.a_jour?'À jour':'À mettre à jour','<div class="it"><p class="t">Dossier mis à jour le '+esc(ds.maj)+'</p><p class="r">'+(ds.a_jour?'<span style="color:var(--up);font-weight:600">À jour</span>':'<span style="color:var(--warn);font-weight:600">'+pl(ds.nouveaux,'fait nouveau','faits nouveaux')+' à reporter</span>')+'</p><p class="m">'+(ds.a_jour?'Aucune exposition ni aucun article public postérieur à cette date.':'Expositions ou articles publics postérieurs à la dernière mise à jour'+(ds.dernier_fait?', le plus récent le '+esc(ds.dernier_fait):'')+'.')+'</p></div>'+
     (a.book?'<div class="it"><p class="t">'+lien(a.book,'Book de l’artiste (version française)')+'</p><p class="r"><span style="color:var(--up);font-weight:600">Disponible</span></p><p class="m">Document partagé de la galerie, ouvert dans un nouvel onglet.</p></div>':''),1);
  if(a.works.length)h+=sec('palette','Œuvres',a.works.length,'<div class="oeuvres">'+a.works.map(function(w){return '<a class="oe" href="'+esc(w.url)+'" target="_blank" rel="noopener"><span class="ph">'+img(w.t,w.wh,a.nom+', '+w.cap,true)+'</span><p>'+esc(w.cap)+'</p></a>'}).join('')+'</div>');
  h+='<p class="fi-note">Biographie, œuvres, expositions, presse et opportunités : relevés réels du 17 novembre 2026, chaque ligne renvoie à sa source. Les blocs marqués « Exemple » sont inventés pour la démonstration.</p></div>';
  $('fi-body').innerHTML=h;
  $('fiche').classList.remove('hidden');document.body.classList.add('lock');
  $('fiche').querySelector('.fi-panel').scrollTop=0;
  try{history.replaceState(null,'','#'+a.id)}catch(e){}
}
function fermer(){$('fiche').classList.add('hidden');document.body.classList.remove('lock');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
function render(){
  $('titre').textContent=TAB==='fil'?'Ce qui bouge autour des artistes':'Les artistes de la galerie';
  $('v-fil').classList.toggle('hidden',TAB!=='fil');$('v-catalogue').classList.toggle('hidden',TAB!=='catalogue');
  document.querySelector('.per').classList.toggle('hidden',TAB!=='fil');
  kpis();phrase();
  if(TAB==='fil')fil();else grille();
}
function init(d){
  D=d;TODAY=day(d.aujourdhui);d.artistes.forEach(function(a){IDX[a.nom]=a});
  hydrate();
  var ty={};d.fil.forEach(function(x){ty[x.type]=(ty[x.type]||0)+1});
  ['Exposition','Presse','Prix','Résidence','Foire','Publication','Rencontre'].forEach(function(t){if(ty[t])$('f-type').insertAdjacentHTML('beforeend','<option value="'+t+'">'+t+' ('+ty[t]+')</option>')});
  d.artistes.slice().sort(function(a,b){return a.nom.localeCompare(b.nom,'fr')}).forEach(function(a){$('f-art').insertAdjacentHTML('beforeend','<option>'+esc(a.nom)+'</option>')});
  $('f-type').addEventListener('change',function(){F.type=this.value;render()});
  $('f-lieu').addEventListener('change',function(){F.lieu=this.value;render()});
  $('f-art').addEventListener('change',function(){F.art=this.value;render()});
  $('raz').addEventListener('click',function(){F={type:'all',lieu:'all',art:'all'};$('f-type').value=$('f-lieu').value=$('f-art').value='all';render()});
  $('c-lieu').addEventListener('change',function(){C.lieu=this.value;render()});
  $('c-rel').addEventListener('change',function(){C.rel=this.value;render()});
  $('c-q').addEventListener('input',function(){C.q=this.value.trim();render()});
  Array.prototype.forEach.call(document.querySelectorAll('.per button'),function(b){b.addEventListener('click',function(){P=b.dataset.p;Array.prototype.forEach.call(document.querySelectorAll('.per button'),function(x){x.classList.toggle('on',x===b)});render()})});
  Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(b){b.addEventListener('click',function(){TAB=b.dataset.tab;Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(x){x.classList.toggle('on',x===b)});render();window.scrollTo(0,0)})});
  Array.prototype.forEach.call(document.querySelectorAll('[data-close]'),function(e){e.addEventListener('click',fermer)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')fermer()});
  render();
  if(location.hash){var h=decodeURIComponent(location.hash.slice(1));if(h==='artistes'){document.querySelector('[data-tab=catalogue]').click()}else ouvrir(h)}
}
fetch('data.json'+V).then(function(r){return r.json()}).then(init);
})();
