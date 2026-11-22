def rw(f, body, extra=''):
    s=open(f).read(); i=s.index('E(id=')
    head=s[:i]
    if 'STRICT["on"]' not in head:
        head=head.replace('from mk import *','from mk import *\nfrom lib import fbd\nSTRICT["on"] = True',1)
    open(f,'w').write(head+extra+body)
MOM=r'm_A\vec v_A + m_B\vec v_B = m_A\vec u_A + m_B\vec u_B'
EN=r'E_k = \tfrac{1}{2}mv^2,\quad U_G = mgh'
NEWTON=r'\Sigma\vec F = m\vec a'
