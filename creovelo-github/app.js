const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reduced.matches) {
 document.documentElement.classList.add('motion-ready');
 const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); } }),{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
const menu=document.querySelector('.menu-toggle'), nav=document.querySelector('#navigation');
function closeMenu(){nav.classList.remove('open');document.documentElement.classList.remove('nav-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');document.documentElement.classList.toggle('nav-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav.querySelectorAll('a').forEach(el=>el.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
let ticking=false;const progress=document.querySelector('.progress');
function updateProgress(){document.querySelector('.header').classList.toggle('has-scrolled',scrollY>12);const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;ticking=false;}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateProgress);}}, {passive:true});addEventListener('resize',updateProgress);updateProgress();
const dialog=document.querySelector('#contact-dialog'),form=document.querySelector('#contact-form');let trigger;
document.querySelectorAll('[data-contact]').forEach(button=>button.addEventListener('click',()=>{trigger=button;closeMenu();form.elements.service.value=button.dataset.contact||"Let's find the right fit";document.querySelector('#form-status').textContent='';dialog.showModal();}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});dialog.addEventListener('close',()=>trigger?.focus());
form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const subject=`Creovelo inquiry — ${data.get('service')}`;const body=`Hello Creovelo,\n\nI'm ${data.get('name')} from ${data.get('brand')}.\n\nI'm interested in: ${data.get('service')}\n\nWhat we're looking to test:\n${data.get('goals')||'I would love to discuss the right creative direction.'}\n\nThanks,\n${data.get('name')}`;location.href=`mailto:hello@creovelo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-status').textContent='Your email app should open with a draft. If it does not, email hello@creovelo.com directly. Your inquiry has not been sent from this site.';});
document.querySelector('#year').textContent=new Date().getFullYear();

const projects={
 serein:{image:'studio-concept.webp',alt:'Serein fictional skincare concept in warm sunlight',brand:'serein',headline:'A little<br><em>less rush.</em>',type:'01 / Skincare · Lifestyle angle',statement:'Sell the moment.<br><em>Not just the bottle.</em>',insight:'An everyday routine can be a small moment of calm. The product becomes part of something more personal.',direction:'Warm light, tactile materials, and a quiet invitation. Lead with the ritual, then let the product make it tangible.',question:'Does an emotional ritual angle create more interest than a product-first message?'},
 mora:{image:'mora-concept.webp',alt:'Mora fictional cherry beverage campaign in vivid red',brand:'mora',headline:'Your usual.<br><em>Unusual.</em>',type:'02 / Beverage · Discovery angle',statement:'Make familiar<br><em>feel unexpected.</em>',insight:'A familiar daily choice is an opportunity for a small discovery. Curiosity can give someone a reason to try something new.',direction:'Confident colour, tactile condensation, and a playful contrast in the headline. Let the visual create appetite before the copy asks for attention.',question:'Does a playful discovery angle generate more interest than a straightforward flavour message?'},
 onda:{image:'onda-concept.webp',alt:'Onda fictional silver headphones campaign on an icy blue background',brand:'onda',headline:'Find your<br><em>frequency.</em>',type:'03 / Audio · Identity angle',statement:'Beyond the product.<br><em>Into their world.</em>',insight:'Personal audio belongs to personal moments. The product can express how someone wants to feel, not only what they want to hear.',direction:'Sculptural metal, open space, and fluid light. Position the product as a considered part of the listener’s everyday environment.',question:'Does an identity-led message create more interest than a product-design message?'}
};
const projectKeys=Object.keys(projects),projectTabs=[...document.querySelectorAll('[data-project]')],panel=document.querySelector('#project-panel');let activeProject=0;
function selectProject(key,focusTab=false){
 const data=projects[key];if(!data)return;activeProject=projectKeys.indexOf(key);
 projectTabs.forEach(tab=>{const selected=tab.dataset.project===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focusTab)tab.focus();});
 panel.className='project-panel theme-'+key;panel.setAttribute('aria-labelledby','project-'+key);
 const img=document.querySelector('#project-image');img.src=data.image;img.alt=data.alt;if(!reduced.matches){img.animate([{opacity:.5,transform:'scale(1.025)'},{opacity:1,transform:'scale(1)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});}
 document.querySelector('#project-brand').textContent=data.brand;
 document.querySelector('#project-headline').innerHTML=data.headline;
 document.querySelector('#project-statement').innerHTML=data.statement;
 for(const field of ['type','insight','direction','question'])document.querySelector('#project-'+field).textContent=data[field];
 document.querySelector('#project-count').textContent=String(activeProject+1).padStart(2,'0')+' / 03';
}
projectTabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectProject(tab.dataset.project));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;else if(e.key==='ArrowLeft')n=(i+2)%3;else if(e.key==='Home')n=0;else if(e.key==='End')n=2;else return;e.preventDefault();selectProject(projectKeys[n],true);});});
document.querySelector('.project-prev').addEventListener('click',()=>selectProject(projectKeys[(activeProject+2)%3]));
document.querySelector('.project-next').addEventListener('click',()=>selectProject(projectKeys[(activeProject+1)%3]));
document.querySelectorAll('[data-select]').forEach(a=>a.addEventListener('click',()=>selectProject(a.dataset.select)));
const chapter=document.querySelector('.image-chapter');let sceneTick=false;
function updateScene(){if(!reduced.matches){const r=chapter.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight){const progress=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)));chapter.style.setProperty('--scene-offset',((progress-.5)*35).toFixed(2)+'px');chapter.style.setProperty('--chapter-inset',Math.max(0,4-progress*8).toFixed(2)+'%');}}sceneTick=false;}
addEventListener('scroll',()=>{if(!sceneTick){sceneTick=true;requestAnimationFrame(updateScene);}},{passive:true});
addEventListener('resize',()=>{if(innerWidth>720)closeMenu();updateScene();});updateScene();
document.querySelector('.header').addEventListener('keydown',event=>{if(event.key!=='Tab'||!nav.classList.contains('open'))return;const items=[...nav.querySelectorAll('a,button')],first=items[0],last=items[items.length-1],active=document.activeElement;if(active===menu){event.preventDefault();(event.shiftKey?last:first).focus();}else if(event.shiftKey&&active===first){event.preventDefault();menu.focus();}else if(!event.shiftKey&&active===last){event.preventDefault();menu.focus();}});
