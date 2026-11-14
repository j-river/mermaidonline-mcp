#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {createServer,VERSION} from './server.js';
const args=process.argv.slice(2);
if(args.length===1&&['--help','-h'].includes(args[0]))console.log('mermaidonline-mcp\nLocal MCP stdio server. Node.js 22+. No API key or paid service calls.\nRun without arguments from an MCP client. Inputs are tool arguments, not shell commands.\nWebsite: https://mermaidonline.org/');
else if(args.length===1&&args[0]==='--version')console.log(VERSION);
else if(args.length){console.error('Unknown arguments. Use --help.');process.exitCode=2;}
else{const server=createServer();process.once('SIGINT',()=>server.close());process.once('SIGTERM',()=>server.close());try{await server.connect(new StdioServerTransport());}catch{console.error('MCP server startup failed.');process.exitCode=1;}}
