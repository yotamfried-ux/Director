#!/usr/bin/env python3
"""Open sealed blind keys, map judge A/B to shell/reference, compute scores vs reference and vs standard.
usage: bench-compare.py <agent> <judgeout.json>"""
import json,sys
a,jf=sys.argv[1],sys.argv[2]
std=json.load(open(f'agents/benchmarks/{a}/standard.json')); R=std['rubric']; T=std['target']
J=json.load(open(jf)); out={}
for t in ['dev','holdout']:
    key=json.load(open(f'business/benchmarks/{a}/blind-key-{t}.sealed.json'))
    # key['A'] is 'a' (reference dir passed as --a) or 'b' (shell dir passed as --b)
    side={lab:('reference' if key[lab]=='a' else 'shell') for lab in 'AB'}
    sc={side[l]:J[t][l]['scores'] for l in 'AB'}
    res={}
    for who,s in sc.items():
        tot=sum(s.get(i['id'],0) for i in R); mx=5*len(R)
        gl=[i['id'] for i in R if i.get('gating') and s.get(i['id'],0)<T['min_gating']]
        res[who]={'pct':round(100*tot/mx),'total':tot,'max':mx,'gating_low':gl,'passes_standard':round(100*tot/mx)>=T['min_total_pct'] and not gl}
    res['shell_beats_reference']=res['shell']['pct']>res['reference']['pct'] and len(res['shell']['gating_low'])<=len(res['reference']['gating_low'])
    res['lines_removed_by_scrub']=len(key.get('lines_removed',[]))
    out[t]=res
print(json.dumps(out,ensure_ascii=False,indent=1))
