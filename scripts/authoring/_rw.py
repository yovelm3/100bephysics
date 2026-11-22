def rw(f, body, extra=''):
    s=open(f).read(); i=s.index('E(id=')
    head=s[:i]
    if 'STRICT["on"]' not in head:
        head=head.replace('from mk import *','from mk import *\nfrom lib import fbd\nSTRICT["on"] = True',1)
    open(f,'w').write(head+extra+body)
MOM=r'm_A\vec v_A + m_B\vec v_B = m_A\vec u_A + m_B\vec u_B'
EN=r'E_k = \tfrac{1}{2}mv^2,\quad U_G = mgh'
NEWTON=r'\Sigma\vec F = m\vec a'
GRAV=r'F = \frac{GMm}{r^2}'
UGR=r'U = -\frac{GMm}{r}'
KEP=r'\frac{r^3}{T^2} = \frac{GM}{4\pi^2}'
CIRC=r'\Sigma F_R = m\frac{v^2}{r}'
GS=r'g^* = \frac{GM}{r^2}'
TS=r'T = 2\pi\sqrt{\frac{m}{K}}'
TP=r'T = 2\pi\sqrt{\frac{L}{g}}'
VM=r'v_{\max} = A\omega'
OM=r'\omega = \frac{2\pi}{T}'
EH=r'E = \tfrac{1}{2}KA^2'
AH=r'a = -\omega^2 x'
