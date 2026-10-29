class MediTurnoPcmProcessor extends AudioWorkletProcessor {
 constructor(){super();this.floatBuffer=[];this.cursor=0;this.output=[];this.ratio=sampleRate/16000;this.enabled=true;this.port.onmessage=e=>{if(e.data?.type==='pause')this.enabled=false;if(e.data?.type==='resume')this.enabled=true;};}
 process(inputs){const input=inputs[0]?.[0];if(!input||!this.enabled)return true;
  for(let i=0;i<input.length;i++)this.floatBuffer.push(input[i]);
  while(this.cursor+this.ratio<this.floatBuffer.length){const idx=Math.floor(this.cursor);const frac=this.cursor-idx;const sample=(this.floatBuffer[idx]||0)*(1-frac)+(this.floatBuffer[idx+1]||0)*frac;this.output.push(Math.max(-1,Math.min(1,sample)));this.cursor+=this.ratio;
   if(this.output.length>=3200){const pcm=new Int16Array(3200);for(let j=0;j<3200;j++)pcm[j]=this.output[j]<0?Math.round(this.output[j]*32768):Math.round(this.output[j]*32767);this.port.postMessage(pcm.buffer,[pcm.buffer]);this.output.splice(0,3200);}
  }
  const used=Math.floor(this.cursor);if(used>0){this.floatBuffer.splice(0,used);this.cursor-=used;}
  return true;
 }
}
registerProcessor('mediturno-pcm',MediTurnoPcmProcessor);
