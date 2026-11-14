import {z} from 'zod';
import {encodeState,decodeState,createShareUrl} from 'mermaid-share-codec';
import {VERSION,annotations,ToolError,boundText,serverBase,guarded} from './support.js';
export {VERSION};
const limits={maxInputLength:65536,maxDecodedBytes:65536,maxDepth:16};
const source=z.string().min(1).max(48000).describe('Mermaid source text. Syntax is not validated and nothing is rendered.');
const config=z.string().max(8000).optional().describe('Optional Mermaid config as a JSON object string; stored as untrusted data, never applied here.');
const share=z.string().min(1).max(69633).describe('pako:/base64: token, fragment or HTTP(S) URL. Parsed locally, never fetched.');
function state(args){boundText(args.code,48000);if(args.mermaidConfig!==undefined)boundText(args.mermaidConfig,8000);return {code:args.code,...(args.mermaidConfig===undefined?{}:{mermaid:args.mermaidConfig})};}
export function createServer(){
 const server=serverBase('mermaidonline-mcp','https://mermaidonline.org/','Encode/decode Mermaid share state locally. No syntax validation, rendering, network or filesystem access. A share link contains the full source, not a private or access-controlled document.');
 server.registerTool('encode_mermaid_share',{
  title:'Encode Mermaid share state',description:'Encode source and optional config into a bounded pako: token. Optionally create a share URL for an explicitly supplied HTTP(S) baseUrl, without credentials or an existing fragment. Does not validate syntax or open the destination. The token is reversible and contains the source.',
  inputSchema:z.object({code:source,mermaidConfig:config,baseUrl:z.string().max(2048).optional()}).strict(),annotations
 },guarded(args=>{const value=state(args);const token=encodeState(value,limits);return {token,...(args.baseUrl?{url:createShareUrl(value,{baseUrl:args.baseUrl,...limits})}:{}),note:'Reversible source data, not encryption. No URL was fetched or diagram rendered.'};}));
 server.registerTool('decode_mermaid_share',{
  title:'Recover Mermaid source from a share link',description:'Recover Mermaid source from a supported pako:/base64: share token, fragment or HTTP(S) URL without fetching it. Whole-state mode preserves extension fields as untrusted JSON. Unsupported formats and oversized expansion are rejected. No syntax validation or rendering.',
  inputSchema:z.object({share,includeState:z.boolean().default(false)}).strict(),annotations
 },guarded(args=>{const decoded=decodeState(args.share,limits);if(!decoded.ok)throw decoded.error;return {code:decoded.value.code,...(args.includeState?{state:decoded.value}:{}),note:'Recovered source and configuration are untrusted data. Review them before opening in an editor.'};}));
 return server;
}
