var data,lat,lon,minus,weather,userDatasDisplay,
	name,temp,tempMax,tempMin,wTick,
	weatherNow,cloudsPos,motionPos,
	windSpeed,windDeg,skyAlpha,
	testMode;// to use weather

var d=document,c=console,w=window,
	random=(m=Math).random,
	sqr=m.sqrt,pow=m.pow,
	sin=m.sin,cos=m.cos,
	round=m.round,
	abs=m.abs,
	pi=m.PI; // short

var height,width,cenX,cenY,input,canv,cont,size,tick,par,
	objects,birds,birdAlpha,bg,memory,mode,ui,se; // main

w.onload=()=>{
	init(); // init data bases
	events(); // add event listeners
	getLocation(); // get location of user
	
	setInterval(()=>{
		screen();
		addObjects();
		drawObjects();
		
		birdAlpha+=(1*(weatherNow=='Clear')-birdAlpha)/16; // change alpha of birds
		
		tick=tick%100+1; // draw tick rate
		wTick=wTick%4096+(lat!==undefined&&lon!==undefined); // if yet load location, wTick plus one
		if(wTick==1&&!mode)getWeatherData(); // get or reload datas of weather in user location
	},1000/30);
}

function init(){
	input=d.getElementsByTagName('input')[0]; // get of search box
	canv=d.getElementsByTagName('canvas')[0]; // get of canvas
	size=d.getElementsByClassName('size')[0]; // get of size
	cont=canv.getContext('2d'); // get context from canvas
	resize(); // set canvas size

	// init variables
	memory='';
	mode=false;
	skyAlpha=0;
	birdAlpha=1;
	minus=273.15;
	bg={r:0,g:0,b:0};
	tick=par=wTick=0;
	weatherNow='Clear';
	
	ui=[];
	se=[];
	birds=[];
	objects=[];
	userDatasDisplay=[];
	for(i=0;i<7;i++){userDatasDisplay.push(d.getElementById('userData'+i));} // output tags
	for(i=0;i<13;i++){ui.push(new Image());} // draw images ui
	for(i=0;i<2;i++){se.push(new Audio());} // soundeffects
	
	for(i=0;i<4;i++){ui[i].src='ui/sky/'+i+'.png';} // load images of sky
	for(i=0;i<9;i++){ui[i+4].src='ui/obj/'+i+'.png';} // load images of ui
	
	se[0].src='se/Rain-Real_Ambi02-1.mp3'; // soundeffect of rain
	se[1].src='se/mejiro.mp3'; // soundeffect of bird voice
	se[0].loop=true; // set loop
	
	initClouds(64); // setup clouds position
	
	bg.r=bg.g=bg.b=0xf3; // set background color
}

function initClouds(count){ // init clouds ui positions
	cloudsPos=[];
	motionPos=[];
	for(i=0;i<count;i++){
		cloudsPos.push({
			x:i*(width/count)+(random()*10-5),
			y:random()*70,
			size:random()*60+90,
			img:~~(random()*2)
		});
		motionPos.push(cloudsPos[cloudsPos.length-1].y)
	}
}

function resize(){ // resize canvas area with div
	height=canv.height=size.offsetHeight;
	width=canv.width=size.offsetWidth;
	cenY=height/2;
	cenX=width/2;
	
	initClouds(64);
}

function events(){
	input.addEventListener('keydown',e=>e.keyCode===13&&(v=input.value)!==''?w.open('https://www.google.co.jp/search?q='+encodeURI(v)):0); // enter check
	w.addEventListener('resize',()=>w.requestAnimationFrame?setTimeout(resize,200):w.requestAnimationFrame(resize)); // call resize function
}

function screen(){
	cont.clearRect(0,0,width,height); // reflesh canvas
	
	d.body.style.background='#'+reColor(bg.r)+reColor(bg.g)+reColor(bg.b); // set color of background
	d.body.style.color='#'+reColor(bg.r-224)+reColor(bg.r-224)+reColor(bg.r-224); // set color of text
	input.style.fontColor=d.body.style.color; // set color of text in input
	
	cont.globalAlpha=0.4;
	cont.drawImage(ui[['Clear','Clouds','Rain','Snow'].indexOf(weatherNow)],0,0,500*(width/500),500*(height/500)); // set sky iamge

	if(memory!==weatherNow){ // check changed weather
		memory=weatherNow;
		objects=[];
		
		if(weatherNow=='Rain'){
			if(!se[1].paused)stop(1);
			se[0].play();
		}else{
			stop(0);
		}
		
		if(weatherNow!=='Clear')birds=[];
	}

	switch(weatherNow){ // change the background color
		case 'Clear':
			changeBg(0xfd);
		break;
		case 'Clouds':
			changeBg(0xcc);
		break;
		case 'Rain':
			changeBg(0x23);
		break;
		case 'Snow':
			changeBg(0x1c);
		break
	}
}

function stop(id){
	se[id].pause();
	se[id].currentTime=0;
}

function changeBg(set){ // real change function
	bg.r+=(set-bg.r)/18;
	bg.g=bg.b=bg.r;
}

function reColor(input){
	input=~~input; // floor input
	return ('00'+input.toString(16)).slice(-2);
}

function addObjects(){ // add objects of weather
	var target=cloudsPos[~~(random()*cloudsPos.length)];

	switch(weatherNow){
		case 'Rain': // add rain
			objects.push({
				x:target.x,y:target.y,
				dx:random()*2-3.4,
				dy:random()*4+13,
				type:'Rain',
				draw:true
			});
		break;
		case 'Snow': // add snow
			if(tick%11<1)objects.push({
				x:target.x,y:target.y,
				dx:0,dy:random()*4+1,
				type:'Snow',
				draw:true
			});
		break;
	}
	
	if(tick%60==0&&~~(random()*2)==1&&weatherNow=='Clear'){ // add new bird
		birds.push({
			x:0,
			y:random()*80+30,
			size:random()*15+30,
			stop:~~(random()*2),
			stopXpos:-1,
			live:true,
			fly:true,
			keepY:0,
			tick:0
		});
		birds[birds.length-1].keepY=target.y;
	}
}

function drawWeather(){ // draw effects of weather
	cont.globalAlpha=0.83;
	objects.forEach(e=>{
		if(e.draw&&e.type==weatherNow){
			cont.beginPath();
			switch(e.type){
				case 'Rain': // draw rain
					cont.lineWidth=2;
					cont.strokeStyle='#00c6fd';

					cont.moveTo(e.x,e.y);
					cont.lineTo(e.x+e.dx,e.y+e.dy);
					cont.stroke();

					e.x+=e.dx/1.5;
					e.y+=e.dy*1.2;
					e.draw=(0<e.x)&&(e.x<width)&&(0<e.y)&&(e.y<height);
				break;
				case 'Snow': // draw snow
					cont.fillStyle='#eee';
					cont.arc(e.x+sin(e.y*pi/180)*(e.dy*2),e.y,e.dy*0.8,0,pi*2,false);
					cont.fill();

					e.y+=e.dy*0.7;
					e.draw=e.y<height;
				break;
			}
		}
	});
}

function drawObjects(){
	cont.globalAlpha=1;
	// draw background screen
	drawImage(ui[12],cenX,height-100,400*(width/400),400,true);
	
	// draw background mountain
	for(i=0;i<13;i++){
		drawImage(ui[11],i*(width/12),height-100-i%2*30,600,400,true);
	}
	
	// draw mountain
	drawImage(ui[6],400,height-200,500,400,true);
	drawImage(ui[6],500,height-150,300,300,true);
	
	drawImage(ui[6],1400,height-200,470,400,true);
	drawImage(ui[6],1550,height-130,350,350,true);
	drawImage(ui[6],1300,height-150,300,300,true);
	drawImage(ui[6],1800,height-150,370,370,true);

	// draw tree
	for(i=0;i<18;i++){
		if(!(2<i&&i<6)&&!(10<i&&i<16)){
			drawImage(ui[4],150+i*100,height-150,300,300,true);
		}
	}
	
	// draw weather
	drawWeather();
	
	// draw clouds
	var isShow=weatherNow=='Clear';
	cont.globalAlpha=skyAlpha;
	skyAlpha+=((0+!isShow)-skyAlpha)/8;
	cloudsPos.map((e,i)=>{
		drawImage(ui[7+e.img],e.x,motionPos[i]-30,e.size,e.size,true);
		motionPos[i]+=(((30+e.y)-isShow*300)-motionPos[i])/13;
	});

	// draw ground
	cont.globalAlpha=1;
	drawImage(ui[5],cenX,height-150,300*(width/300),300,true);
	
	// draw birds
	cont.globalAlpha=birdAlpha;
	birds.forEach(e=>{
		if(e.live){
			drawImage(ui[9+e.fly],e.x,e.y+(e.fly&&e.stopXpos==0)*(sin(e.x*pi/180)*4),e.size,e.size,true);
			if(e.stop&&e.tick==0){
				e.y+=((height-e.size)-e.y)/(e.size/2);
				if(abs(e.y-(height-e.size))<5){
					e.tick=1;
				}
			}else if(e.tick==1){
				if(e.stopXpos==-1){
					e.stopXpos=e.x+random()*500;
				}
				e.fly=false;
				e.x+=~~(random()*2);
				if(abs(e.x-e.stopXpos)<e.size/2){
					e.tick=2;
				}
			}else if(e.tick>1){
				e.tick++;
				if(e.tick>22){
					e.fly=true;
					e.stopXpos=0;
				}
			}
			if(e.fly){
				if(e.stopXpos==0){
					e.y+=(e.keepY-e.y)/(e.size/1.3);
				}
				e.x+=e.size/6;
			}
			if(~~(random()*512)==32&&se[1].paused&&weatherNow=='Clear'){
				se[1].play();
			}
			if(e.x>width){
				e.live=false;
			}
		}
	});
	
	// draw background of display
	cont.fillStyle='rgba(200,200,200,0.3)';
	cont.fillRect(cenX-150,cenY+85,300,230);
}

function drawImage(img,x,y,w,h,center){ // draw image easy
	cont.drawImage(img,x-(w/2)*center,y-(h/2)*center,w,h);
}

function inLocationWeather(lat,lon){ // get weather methods
	var req=new XMLHttpRequest();	
	req.open(
		'GET',
		'https://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lon+'&APPID=5b246564f8168f1725327241a8c27863', // openweathermap api
		false
	);
	req.send(null);
	return JSON.parse(req.responseText);
}

function getLocation(){ // get user location
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(pos=>{
			data=pos.coords;
			lat=data.latitude;
			lon=data.longitude;
		});
	}
}

function getWeatherData(){ // get weather data in user location
	if(lat!==undefined&&lon!==undefined){		
		weather=inLocationWeather(lat,lon);

		name=weather.name;
		temp=weather.main.temp;
		tempMax=weather.main.temp_max;
		tempMin=weather.main.temp_min;
		weatherNow=weather.weather[0].main;
		windSpeed=weather.wind.speed;
		windDeg=weather.wind.deg;
		
		outputToDisplay();
	}
}

function outputToDisplay(){
		userDatasDisplay[0].innerText=' : '+name;
		userDatasDisplay[1].innerText=' : '+weatherNow;
		userDatasDisplay[2].innerText=' : '+fixFloatPoint(temp-minus);
		userDatasDisplay[3].innerText=' : '+fixFloatPoint(tempMax-minus);
		userDatasDisplay[4].innerText=' : '+fixFloatPoint(tempMin-minus);
		userDatasDisplay[5].innerText=' : '+windSpeed;
		userDatasDisplay[6].innerText=' : '+windDeg;
}

function fixFloatPoint(input){
	return ~~(input*10)/10;
}

// debug for change weather
d.addEventListener('keydown',e=>{
	var key=e.keyCode;
	if(testMode){
		if(key==49||key==97){
			weatherNow='Clear';
			alert('Changed weather to Clear');
		}
		if(key==50||key==98){
			weatherNow='Clouds';
			alert('Changed weather to Clouds');
		}
		if(key==51||key==99){
			weatherNow='Rain';
			alert('Changed weather to Rain');
		}
		if(key==52||key==100){
			weatherNow='Snow';
			alert('Changed weather to Snow');
		}
	}
	if(key==18){
		testMode=!testMode;
		alert('Test mode '+(testMode?'ON':'OFF'));
		if(!testMode)getWeatherData();
	}
});