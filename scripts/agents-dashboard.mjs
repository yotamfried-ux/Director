#!/usr/bin/env node
// Builds one self-contained dark RTL dashboard page from the agent metric logs.
// Usage: node scripts/agents-dashboard.mjs [out.html] [--data-url <raw url of runs.jsonl dir>]
// With --data-url the page re-reads runs.jsonl/outcomes.jsonl every 60s and redraws; if that fetch fails it keeps the embedded snapshot and says so.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const di = args.indexOf("--data-url");
const dataUrl = di >= 0 ? args[di + 1] : "";
const out = args.find((a, i) => !a.startsWith("--") && (di < 0 || i !== di + 1)) ?? "business/reports/agents-dashboard.html";
const dir = process.env.METRICS_DIR ?? "business/metrics";
const read = f => existsSync(`${dir}/${f}`) ? readFileSync(`${dir}/${f}`, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)) : [];
const reg = JSON.parse(readFileSync("agents/registry.json", "utf8"));
const data = {
  generated: new Date().toISOString(),
  agents: reg.agents.map(a => ({ id: a.id, role: a.role, trigger: a.trigger.kind === "cron" ? a.trigger.cron : "event", status: a.status, heartbeat_hours: a.heartbeat_hours ?? null })),
  runs: read("runs.jsonl"), outcomes: read("outcomes.jsonl"),
  report: JSON.parse(execFileSync("node", ["scripts/agent-metrics.mjs", "report", "--json"], { encoding: "utf8" })),
};
const html = `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>סוכנים: דשבורד</title>
<style>:root{color-scheme:dark}body{margin:0;background:#0f1115;color:#e8eaed;font:15px/1.5 system-ui,Heebo,Arial,sans-serif;padding:20px}h1{font-size:20px;margin:0 0 4px}.sub{color:#9aa0a6;font-size:13px;margin-bottom:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.card{background:#181b22;border:1px solid #2a2f3a;border-radius:12px;padding:14px}
.h{display:flex;justify-content:space-between;align-items:center}.name{font-weight:600}.pill{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid}.ok{color:#6fd08c;border-color:#2f6b45}.warn{color:#f2c14e;border-color:#7a6224}.bad{color:#ff7b72;border-color:#7a2f2a}.mute{color:#9aa0a6;border-color:#3a3f4b}
.role{color:#9aa0a6;font-size:13px;margin:4px 0 10px}.row{display:flex;justify-content:space-between;font-size:13px;padding:2px 0;border-bottom:1px dashed #262b35}.row b{font-weight:600}.note{color:#9aa0a6;font-size:12px;margin-top:8px}
.spark{display:flex;gap:3px;margin-top:10px;align-items:flex-end;height:26px}.spark i{flex:1;border-radius:2px;min-width:6px}table{width:100%;border-collapse:collapse;margin-top:18px;font-size:13px}td,th{padding:6px 8px;border-bottom:1px solid #262b35;text-align:right}th{color:#9aa0a6;font-weight:500}</style>
<h1>הסוכנים של יותם</h1><div class="sub" id="sub"></div><div class="grid" id="g"></div><h1 style="margin-top:22px;font-size:16px">ריצות אחרונות</h1><table id="t"></table>
<div class="note" style="margin-top:16px">ציון איכות הוא של בודק עצמאי ונחשב אינדיקציה בלבד. פחות מ-5 ריצות או פסקי דין = "מעט נתונים". פסקי הדין שלך (אישרתי / ערכתי / דחיתי) הם האמת.</div>
<script>
let D=${JSON.stringify(data)};const URL_=${JSON.stringify(dataUrl)};
const H={ok:["תקין","ok"],"NEVER-RAN":["לא רץ","mute"],SILENT:["שותק","warn"],FAILING:["נכשל","bad"]};
const f=(v,s="")=>v==null?"אין נתון":v+s;
function draw(){const r=Object.fromEntries(D.report.rows.map(x=>[x.agent,x]));
document.getElementById("sub").textContent="נכון ל-"+new Date(D.generated).toLocaleString("he-IL")+(URL_?" · מתרענן כל דקה":" · תמונת מצב (לא חיה)");
document.getElementById("g").innerHTML=D.agents.map(a=>{const x=r[a.id]||{};const h=H[x.health]||["?","mute"];const runs=D.runs.filter(q=>q.agent===a.id).slice(-12);
const sp=runs.map(q=>'<i title="'+q.status+'" style="height:'+(q.status==="ok"?26:q.status==="partial"?16:8)+'px;background:'+(q.status==="ok"?"#3fa564":q.status==="partial"?"#c9a227":"#d4504a")+'"></i>').join("");
return '<div class="card"><div class="h"><span class="name">'+a.id+'</span><span class="pill '+h[1]+'">'+h[0]+'</span></div><div class="role">'+a.role+'</div>'
+'<div class="row"><span>ריצות (28 יום)</span><b>'+f(x.runs)+'</b></div><div class="row"><span>אחוז הצלחה</span><b>'+f(x.ok_rate,"%")+'</b></div><div class="row"><span>זמן חציוני</span><b>'+f(x.median_seconds," ש׳")+'</b></div>'
+'<div class="row"><span>תוצרים</span><b>'+f(x.outputs)+'</b></div><div class="row"><span>בדיקות קשיחות שעברו</span><b>'+f(x.check_pass_rate,"%")+'</b></div><div class="row"><span>איכות (בודק עצמאי)</span><b>'+(x.quality_mean==null?"אין נתון":x.quality_mean+" (n="+x.quality_n+")")+'</b></div>'
+'<div class="row"><span>אישור שלך</span><b>'+(x.verdicts?f(x.approval_rate,"%")+" (n="+x.verdicts+")":"אין פסקי דין")+'</b></div>'
+'<div class="spark">'+sp+'</div><div class="note">'+(x.enough_data?"":"מעט נתונים לשיפוט · ")+'טריגר: '+a.trigger+' · סטטוס: '+a.status+'</div></div>'}).join("");
document.getElementById("t").innerHTML="<tr><th>זמן</th><th>סוכן</th><th>סטטוס</th><th>תוצרים</th><th>בדיקות</th><th>הערה</th></tr>"+D.runs.slice(-25).reverse().map(q=>"<tr><td>"+new Date(q.finished).toLocaleString("he-IL")+"</td><td>"+q.agent+"</td><td>"+q.status+"</td><td>"+(q.outputs??"")+"</td><td>"+(q.checks_pass!=null?q.checks_pass+"/"+((q.checks_pass||0)+(q.checks_fail||0)):"")+"</td><td>"+(q.note||"")+"</td></tr>").join("")}
draw();
if(URL_)setInterval(async()=>{try{const g=async n=>(await (await fetch(URL_+n,{cache:"no-store"})).text()).split("\\n").filter(Boolean).map(JSON.parse);D.runs=await g("runs.jsonl");try{D.outcomes=await g("outcomes.jsonl")}catch{}D.generated=new Date().toISOString();draw()}catch(e){document.getElementById("sub").textContent+=" · רענון נכשל, מוצג המצב האחרון"}},60000);
</script></html>`;
writeFileSync(out, html);
console.log("wrote", out, `(${data.runs.length} runs)`);
