# measure voice pitch, pace, and background level in word gaps from a 16k mono wav + YouTube auto-sub vtt
import sys,re,wave,numpy as np
wav,vtt=sys.argv[1],sys.argv[2]
w=wave.open(wav);sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
t=open(vtt,encoding='utf8',errors='replace').read()
def ts(s):h,m,sec=s.split(':');return int(h)*3600+int(m)*60+float(sec)
# word starts: line start time + inline <time> tags
starts=[]
for blk in t.split('\n\n'):
    m=re.search(r'(\d\d:\d\d:\d\d\.\d+) --> (\d\d:\d\d:\d\d\.\d+)',blk)
    if not m or '<c>' not in blk: continue
    starts.append(ts(m.group(1)))
    starts+= [ts(s) for s in re.findall(r'<(\d\d:\d\d:\d\d\.\d+)><c>',blk)]
starts=sorted(set(starts));n=len(starts);dur=len(x)/sr
print(f'words~{n} dur {dur:.1f}s -> {n/dur*60:.0f} wpm (spoken span {n/(starts[-1]-starts[0])*60:.0f})')
fr=int(0.03*sr);hop=int(0.01*sr)
rms=np.array([np.sqrt(np.mean(x[i:i+fr]**2)) for i in range(0,len(x)-fr,hop)])
db=20*np.log10(rms+1e-9)
sp=db>np.percentile(db,60)
print(f'speech-ish frames median {np.median(db[sp]):.1f} dBFS; quietest 10% {np.percentile(db,10):.1f} dBFS; floor gap {np.median(db[sp])-np.percentile(db,10):.1f} dB')
# F0 via autocorrelation on loud frames
f0=[]
for i in range(0,len(x)-1024,hop*3):
    seg=x[i:i+1024]
    if 20*np.log10(np.sqrt(np.mean(seg**2))+1e-9)<np.percentile(db,70):continue
    seg=seg-seg.mean();ac=np.correlate(seg,seg,'full')[1023:]
    lo,hi=int(sr/400),int(sr/70);k=lo+np.argmax(ac[lo:hi])
    if ac[k]>0.4*ac[0]: f0.append(sr/k)
f0=np.array(f0);print(f'F0 median {np.median(f0):.0f} Hz, IQR {np.percentile(f0,25):.0f}-{np.percentile(f0,75):.0f} Hz, n={len(f0)}')
# pauses: long low-energy runs
low=db<np.percentile(db,15);runs=[];c=0
for v in low:
    if v:c+=1
    else:
        if c*0.01>=0.25:runs.append(c*0.01)
        c=0
print(f'pauses >=0.25s: {len(runs)}, mean {np.mean(runs) if runs else 0:.2f}s')
