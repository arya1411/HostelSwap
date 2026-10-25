#!/usr/bin/env bash
set -euo pipefail
# Run after `docker compose up --build -d` reports healthy services.
docker compose exec -T backend node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import sharp from 'sharp';
const base='http://127.0.0.1:3000/api';
async function call(route,options={},expected=200){const r=await fetch(base+route,options);const data=r.status===204?null:await r.json();assert.equal(r.status,expected,`${route}: ${JSON.stringify(data)}`);return data;}
const json=(data,token)=>({method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(data)});
await call('/health');
const {collegeEmailDomains}=await call('/config');
const stamp=Date.now();const email=`smoke-${stamp}@${collegeEmailDomains[0]}`,password='SmokeTestPassword123!';
const student=await call('/auth/register',json({name:'Compose Smoke Student',email,password,hostel_name:'Viva Hostel',block:'Z'}),201);
await call('/auth/login',json({email,password}));
const other=await call('/auth/register',json({name:'Compose Other Student',email:`smoke-other-${stamp}@${collegeEmailDomains[0]}`,password,hostel_name:'Viva Hostel',block:'Z'}),201);
const categories=await call('/categories');const form=new FormData();
for(const[k,v]of Object.entries({title:`Compose smoke lamp ${stamp}`,description:'A temporary listing to verify the running Docker stack.',price:450,condition:'Good',category_id:categories[0].id,hostel_name:'Viva Hostel',block:'Z'}))form.set(k,String(v));
const image=await sharp({create:{width:24,height:24,channels:3,background:'#7766cc'}}).png().toBuffer();
form.set('image',new Blob([image],{type:'image/png'}),'lamp.png');
const listing=await call('/listings',{method:'POST',headers:{Authorization:`Bearer ${student.token}`},body:form},201);
const imageResponse=await fetch('http://127.0.0.1:3000'+listing.image_path);assert.equal(imageResponse.status,200);
const found=await call(`/listings?q=${stamp}&block=Z`);assert.equal(found.total,1);
await call(`/listings/${listing.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${other.token}`}},403);
await call('/admin/reports',{headers:{Authorization:`Bearer ${student.token}`}},403);
await call(`/listings/${listing.id}/status`,{...json({status:'sold'},student.token),method:'PATCH'});
const sold=await call(`/listings/${listing.id}`);assert.equal(sold.status,'sold');
await call(`/listings/${listing.id}`,{method:'DELETE',headers:{Authorization:`Bearer ${student.token}`}},204);
console.log('PASS: live Docker API health, registration, login, upload, search, ownership, admin restriction, sold status, deletion.');
JS
port="${FRONTEND_PORT:-8080}"
if [[ -f .env ]]; then
  configured_port=$(sed -n 's/^FRONTEND_PORT=//p' .env | tail -n 1 | tr -d '\r"\047')
  port="${FRONTEND_PORT:-${configured_port:-8080}}"
fi
curl --fail --silent "http://localhost:${port}/healthz" >/dev/null
curl --fail --silent "http://localhost:${port}/api/health" >/dev/null
printf 'PASS: frontend and Nginx API proxy respond on port %s.\n' "$port"
