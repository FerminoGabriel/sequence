/* Cinco instrumentais originais, compostos e sintetizados em código. */
const Synth=(()=>{
 const tracks={varanda:{title:'Luzes da varanda',bpm:108,key:60,melody:[0,4,7,9,7,4,2,4,5,9,7,4,2,0,2,7],chords:[0,9,5,7]},cafe:{title:'Café depois das oito',bpm:116,key:62,melody:[7,4,2,0,2,4,7,11,9,7,4,5,4,2,0,7],chords:[0,5,9,7]},cartas:{title:'Cartas na mesa',bpm:112,key:65,melody:[0,2,4,7,4,2,9,7,5,4,2,5,4,7,11,7],chords:[0,7,9,5]},estrelas:{title:'Entre estrelas e risadas',bpm:104,key:67,melody:[4,7,12,11,9,7,4,2,0,4,9,7,5,4,2,0],chords:[0,9,5,0]},revanche:{title:'Só mais uma revanche',bpm:122,key:60,melody:[7,7,9,7,4,2,0,4,5,5,9,7,11,9,7,0],chords:[0,5,7,0]}};
 function render(key){const song=tracks[key]||tracks.varanda,rate=22050,beat=60/song.bpm,bars=32,length=bars*4*beat,samples=new Float32Array(Math.ceil((length+1)*rate));
 function note(midi,start,duration,amp,bass=false){const freq=440*2**((midi-69)/12),begin=Math.floor(start*rate),count=Math.min(Math.ceil((duration+.16)*rate),samples.length-begin);for(let i=0;i<count;i++){const t=i/rate,env=Math.min(1,t/.009)*Math.max(0,Math.min(1,(duration+.16-t)/.2))*Math.exp(-t/(bass?.8:.48)),p=2*Math.PI*freq*t;samples[begin+i]+=amp*env*(Math.sin(p)+(bass?.08:.22)*Math.sin(2*p)+.055*Math.sin(3*p));}}
 function drum(start,kick){const begin=Math.floor(start*rate),len=Math.floor(rate*(kick?.18:.055));let seed=1709;for(let i=0;i<len&&begin+i<samples.length;i++){const t=i/rate;seed=(seed*1664525+1013904223)>>>0;samples[begin+i]+=(kick?Math.sin(2*Math.PI*(65*t-80*t*t)):.25*(seed/2147483648-1))*Math.exp(-t*(kick?24:70))*(kick?.09:.06);}}
 for(let bar=0;bar<bars;bar++){const offset=song.chords[bar%4],base=song.key+offset,minor=offset===9,triad=[base,base+(minor?3:4),base+7];for(let b=0;b<4;b++){const start=(bar*4+b)*beat;note(base-24+(b%2?7:0),start,beat*.7,.13,true);drum(start,b%2===0);drum(start+beat*.5,false);triad.forEach((n,i)=>note(n,start+beat*.5+i*.018,beat*.3,.045));const ix=(bar*4+b)%song.melody.length,pitch=song.key+12+song.melody[ix]+(bar>=16&&bar<24?12:0);if(bar%8!==7||b<2)note(pitch,start+(b%2?.06:0),beat*(b===3?.85:.55),.18);}}
 const buf=new ArrayBuffer(44+samples.length*2),v=new DataView(buf),str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+samples.length*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){const fade=Math.min(1,i/rate*.8,(samples.length-i)/rate);v.setInt16(44+i*2,Math.tanh(samples[i])*fade*32767,true);}return buf;}return {render};
})();

self.onmessage=event=>{
 const {key}=event.data;
 try{const buffer=Synth.render(key);self.postMessage({key,buffer},[buffer]);}
 catch(error){self.postMessage({key,error:error.message});}
};
