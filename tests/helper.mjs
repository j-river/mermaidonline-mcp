import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
export async function connect(env={}){
 let stderr='';
 const baseEnv=Object.fromEntries(Object.entries(process.env).filter(([k])=>['PATH','Path','SYSTEMROOT','SystemRoot','WINDIR','TEMP','TMP','HOME','USERPROFILE'].includes(k)));
 const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../src/cli.js',import.meta.url))],env:{...baseEnv,...env},stderr:'pipe'});
 transport.stderr?.on('data',d=>{stderr+=d;});
 const client=new Client({name:'real-protocol-check',version:'1.0.0'});await client.connect(transport);
 return {client,call:(name,args)=>client.callTool({name,arguments:args}),close:async()=>{await client.close();assert.equal(stderr,'');}};
}
export function data(result){assert.notEqual(result.isError,true,JSON.stringify(result.content));assert.deepEqual(JSON.parse(result.content[0].text),result.structuredContent);return result.structuredContent;}
export async function expectError(call,name,args){const r=await call(name,args).catch(()=>({isError:true}));assert.equal(r.isError,true);return r;}
