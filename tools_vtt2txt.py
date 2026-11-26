import re,sys,glob,os
# collapse YouTube auto-sub VTT into plain text with start times per line
for f in sorted(glob.glob(sys.argv[1]+'/*.en-orig.vtt')):
    t=open(f,encoding='utf8').read()
    out=[];seen=set()
    for blk in t.split('\n\n'):
        m=re.search(r'(\d\d:\d\d:\d\d\.\d+) -->',blk)
        if not m: continue
        lines=[re.sub(r'<[^>]+>','',l).strip() for l in blk.split('\n')[1:]]
        for l in lines:
            if l and l not in seen and '-->' not in l:
                seen.add(l);out.append(f"{m.group(1)[3:8]} {l}")
    print('##',os.path.basename(f).split('.')[0]);print('\n'.join(out));print()
