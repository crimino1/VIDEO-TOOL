# F0 on band-passed voice (250-3000 Hz) using autocorrelation; harmonics let AC recover the fundamental
import sys,wave,numpy as np
w=wave.open(sys.argv[1]);sr=w.getframerate();x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)
hop=480;f0=[];e=[]
for i in range(0,len(x)-1024,hop): e.append(np.sqrt(np.mean(x[i:i+1024]**2)))
th=np.percentile(e,70)
for k,i in enumerate(range(0,len(x)-1024,hop)):
    if e[k]<th: continue
    s=x[i:i+1024]-x[i:i+1024].mean();ac=np.correlate(s,s,'full')[1023:]
    lo,hi=int(sr/350),int(sr/70);j=lo+np.argmax(ac[lo:hi])
    if ac[j]>0.5*ac[0]: f0.append(sr/j)
f0=np.array(f0);print(f'{sys.argv[1]}: F0 median {np.median(f0):.0f} Hz IQR {np.percentile(f0,25):.0f}-{np.percentile(f0,75):.0f} n={len(f0)}')
