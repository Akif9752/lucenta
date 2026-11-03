# Auswertung zu wege.sh: Zeitversatz Aufnahme/Klicks abgleichen, dann Bewegungsphasen je Klick.
import re
d=[tuple(map(float,l.split())) for l in open('/tmp/bew.txt')]
start=int(open('/tmp/bew-start.txt').read())
kl=[(m.group(1),int(m.group(2))) for m in re.finditer(r'KLICK (\w+) (\d+)',open('/tmp/bew-konsole.txt').read())]
# Abgleich: der Versatz, bei dem die meiste Bewegung direkt nach den Klicks liegt
best=None
for k in range(-3000,3000,5):
    o=k/1000; s=0
    for n,ms in kl:
        t0=(ms-start)/1000+o
        s+=sum(x for t,x in d if t0<=t<=t0+0.05)
    if not best or s>best[0]: best=(s,o)
off=best[1]
for i,(n,ms) in enumerate(kl):
    t0=(ms-start)/1000+off
    z=[(round((t-t0)*1000),x) for t,x in d if t0-0.02<=t<=t0+1.5 and x>0.05]
    ph=[];c=[]
    for t,x in z:
        if c and t-c[-1][0]>60: ph.append(c); c=[]
        c.append((t,x))
    if c: ph.append(c)
    print('%-22s %s'%(n, '  '.join('[%d-%d ms max %.1f]'%(p[0][0],p[-1][0],max(x for _,x in p)) for p in ph if max(x for _,x in p)>0.4)))
