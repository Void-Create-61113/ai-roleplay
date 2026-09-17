(() => {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const TILE = 30, W = 80, H = 60;
  const world = [], mobs = [], keys = {}, mouse = {x:0,y:0,down:false};
  let px=40*TILE+15, py=30*TILE+15, hp=10, day=1, time=0, selected=0, last=performance.now(), saveTimer=0;
  const inv={wood:8,stone:4,iron:0,crystal:0,berry:4,meat:0};
  const gear={tool:'wooden pickaxe',weapon:'wooden sword',armor:'cloth'};
  const slots=[
    ['wood','🪵'],['stone','🪨'],['iron','⛓️'],['crystal','💎'],['berry','🫐'],['meat','🥩']
  ];
  const biomes={meadow:{floor:'#6caa59',accent:'#7fc76b'},forest:{floor:'#477b4b',accent:'#315f39'},desert:{floor:'#d8bb72',accent:'#b99a54'},tundra:{floor:'#c8d7df',accent:'#aabdc8'},swamp:{floor:'#566f55',accent:'#40533f'},crystal:{floor:'#544b79',accent:'#7265a8'}};
  const terrain=['meadow','forest','desert','tundra','swamp','crystal'];
  function noise(x,y){let n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n)}
  function biomeAt(x,y){const n=noise(Math.floor(x/13),Math.floor(y/13)); if(x>52&&y<25)return 'tundra'; if(x<25&&y>37)return 'desert'; if(x>57&&y>37)return 'crystal'; if(n>.82)return 'swamp'; if(n>.54)return 'forest'; return 'meadow'}
  function makeWorld(){world.length=0;mobs.length=0;for(let y=0;y<H;y++){world[y]=[];for(let x=0;x<W;x++){const b=biomeAt(x,y),r=noise(x*2.1,y*3.7);let t='grass';if(b==='desert')t=r>.78?'cactus':'sand';else if(b==='tundra')t=r>.8?'ice':'snow';else if(b==='crystal')t=r>.76?'crystal':'purple';else if(b==='swamp')t=r>.83?'reed':'mud';else t=r>.78?'tree':'grass';world[y][x]={b,t,hp:t==='tree'?3:t==='stone'?4:1};if(r>.88&&['meadow','forest','tundra'].includes(b))world[y][x].t='stone';}}
    for(let i=0;i<20;i++)spawnMob(['slime','goblin','wolf'][Math.floor(Math.random()*3)]);
    px=40*TILE+15;py=30*TILE+15;hp=10;day=1;time=0;log('A new realm has been created. Gather wood and stone!');draw();
  }
  function spawnMob(type){let x=(4+Math.random()*(W-8))*TILE+15,y=(4+Math.random()*(H-8))*TILE+15;mobs.push({type,x,y,hp:type==='goblin'?4:3,hit:0})}
  function tileAt(x,y){return world[Math.floor(y/TILE)]?.[Math.floor(x/TILE)]}
  function currentBiome(){return tileAt(px,py)?.b||'meadow'}
  function screen(){return {x:Math.max(0,Math.min(W*TILE-canvas.width,px-canvas.width/2)),y:Math.max(0,Math.min(H*TILE-canvas.height,py-canvas.height/2))}}
  function draw(){const s=screen(), sx=Math.floor(s.x/TILE),sy=Math.floor(s.y/TILE),ex=Math.ceil((s.x+canvas.width)/TILE),ey=Math.ceil((s.y+canvas.height)/TILE);ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=sy;y<=ey;y++)for(let x=sx;x<=ex;x++){const t=world[y]?.[x];if(!t)continue;const b=biomes[t.b];ctx.fillStyle=b.floor;ctx.fillRect(x*TILE-s.x,y*TILE-s.y,TILE,TILE);ctx.strokeStyle='rgba(0,0,0,.08)';ctx.strokeRect(x*TILE-s.x,y*TILE-s.y,TILE,TILE);ctx.font='20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const icons={tree:'🌲',stone:'🪨',cactus:'🌵',ice:'🧊',reed:'🌿',crystal:'💎'};if(icons[t.t])ctx.fillText(icons[t.t],x*TILE+15-s.x,y*TILE+15-s.y)}
    mobs.forEach(m=>{ctx.font='25px sans-serif';ctx.fillText({slime:'🟢',goblin:'👺',wolf:'🐺'}[m.type],m.x-s.x,m.y-s.y)});
    ctx.font='26px sans-serif';ctx.fillText('🧙',px-s.x,py-s.y);
    updateUI();
  }
  function updateUI(){const b=currentBiome();document.getElementById('gameBiome').textContent=b[0].toUpperCase()+b.slice(1);const phase=time<.25?'Morning':time<.55?'Day':time<.75?'Evening':'Night';document.getElementById('gameClock').textContent=`Day ${day} • ${phase}`;document.getElementById('gameHearts').textContent='♥'.repeat(hp)+'♡'.repeat(Math.max(0,10-hp));document.getElementById('gameStats').textContent=`Wood ${inv.wood} • Stone ${inv.stone} • Iron ${inv.iron} • Crystal ${inv.crystal}`;
    document.getElementById('hotbar').innerHTML=slots.map((s,i)=>`<button class="slot ${i===selected?'selected':''}" data-slot="${i}"><span class="icon">${s[1]}</span><small>${inv[s[0]]||0}</small></button>`).join('');document.querySelectorAll('.slot').forEach(b=>b.onclick=()=>{selected=+b.dataset.slot;draw()});
    document.getElementById('equipmentList').innerHTML=`<div class="equip-item"><span>⚔ Weapon</span><b>${gear.weapon}</b></div><div class="equip-item"><span>⛏ Tool</span><b>${gear.tool}</b></div><div class="equip-item"><span>🛡 Armor</span><b>${gear.armor}</b></div>`;
    const crafts=[['Stone Pickaxe','5 stone','stone','tool'],['Iron Sword','3 iron + 2 wood','iron','weapon'],['Crystal Armor','8 crystal + 4 iron','crystal','armor'],['Torch','1 wood + 1 stone','wood','torch']];document.getElementById('craftingList').innerHTML=crafts.map((c,i)=>`<div class="craft-item"><span>${c[0]}<br><small>${c[1]}</small></span><button class="secondary-btn" onclick="window.realmCraft(${i})">Craft</button></div>`).join('');
  }
  function log(t){document.getElementById('gameLog').textContent=t}
  function craft(i){if(i===0&&inv.stone>=5){inv.stone-=5;gear.tool='stone pickaxe';log('Crafted a stone pickaxe. Mining is faster now!')}else if(i===1&&inv.iron>=3&&inv.wood>=2){inv.iron-=3;inv.wood-=2;gear.weapon='iron sword';log('Crafted an iron sword. Mobs beware!')}else if(i===2&&inv.crystal>=8&&inv.iron>=4){inv.crystal-=8;inv.iron-=4;gear.armor='crystal armor';log('Crystal armor equipped. You feel protected.')}else if(i===3&&inv.wood>=1&&inv.stone>=1){inv.wood--;inv.stone--;log('Crafted a torch.')}else log('Not enough resources for that recipe.');save();draw()}
  window.realmCraft=craft;
  function interact(){const s=screen(), wx=mouse.x+s.x,wy=mouse.y+s.y,dx=wx-px,dy=wy-py;if(Math.hypot(dx,dy)>TILE*3)return;const t=tileAt(wx,wy);if(!t)return;if(['tree','stone','cactus','crystal','ice','reed'].includes(t.t)){t.hp--;if(t.hp<=0){const gain={tree:'wood',stone:'stone',cactus:'berry',crystal:'crystal',ice:'stone',reed:'berry'}[t.t];inv[gain]=(inv[gain]||0)+1;t.t='grass';log(`Collected ${gain}.`);save()}}else{mobs.forEach(m=>{if(Math.hypot(m.x-wx,m.y-wy)<24){m.hp-=gear.weapon==='iron sword'?2:1;if(m.hp<=0){inv.meat++;log(`Defeated a ${m.type}! +1 meat`);mobs.splice(mobs.indexOf(m),1);spawnMob(m.type)}}})}}
  canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*canvas.width/r.width;mouse.y=(e.clientY-r.top)*canvas.height/r.height});canvas.addEventListener('mousedown',()=>{mouse.down=true;interact()});canvas.addEventListener('mouseup',()=>mouse.down=false);window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(/^\d$/.test(e.key)&&+e.key>=1&&+e.key<=6){selected=+e.key-1;draw()}if(e.key.toLowerCase()==='e')craft(0);if(e.key.toLowerCase()==='r'&&inv.berry>0&&hp<10){inv.berry--;hp=Math.min(10,hp+2);log('You ate a berry and recovered health.')}});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
  function update(dt){let vx=(keys.d?1:0)-(keys.a?1:0),vy=(keys.s?1:0)-(keys.w?1:0),len=Math.hypot(vx,vy)||1,speed=125;if(vx||vy){px+=vx/len*speed*dt;py+=vy/len*speed*dt;px=Math.max(15,Math.min(W*TILE-15,px));py=Math.max(15,Math.min(H*TILE-15,py))}time+=dt/70;if(time>=1){time=0;day++;mobs.push({type:'goblin',x:Math.random()*W*TILE,y:Math.random()*H*TILE,hp:4,hit:0});log(`Night ${day} begins. More creatures emerge...`)}mobs.forEach(m=>{const dx=px-m.x,dy=py-m.y,d=Math.hypot(dx,dy);if(d<240){m.x+=dx/(d||1)*18*dt;m.y+=dy/(d||1)*18*dt;if(d<28){m.hit-=dt;if(m.hit<=0){hp=Math.max(0,hp-1);m.hit=1.3;if(hp===0){hp=10;px=40*TILE+15;py=30*TILE+15;log('You were knocked out and returned to the meadow.')}}}}});saveTimer+=dt;if(saveTimer>5){save();saveTimer=0}}
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop)}
  document.getElementById('newWorldBtn').onclick=()=>{if(confirm('Create a new world? Your current Realmcraft world will be replaced.'))makeWorld()};
  makeWorld();requestAnimationFrame(loop);
})();
