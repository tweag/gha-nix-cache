import{g as G,i as H}from"./index-w1dbetra.js";var Y=await import("./cache-xxrnqw90.js"),N=await import("node:child_process"),I=await import("node:fs/promises"),O=await import("node:http"),J=await import("./io-v21dydqq.js"),C=await import("node:process");C.default.on("uncaughtException",(x)=>{console.error(x&&x.stack?x.stack:x),C.exit(1)});async function P(){let x=await I.open("stderr.log","a");C.stdout.write=C.stderr.write=x.createWriteStream().write.bind(x);let z="bin";await J.mkdirP(z);for(let E of["bash","ln"])await I.symlink(await J.which(E),`${z}/${E}`);await I.symlink(`${import.meta.dirname}/../tarshim.sh`,`${z}/tar`),C.env.PATH=z,await J.mkdirP("upload"),delete C.env.GITHUB_WORKSPACE}async function Q(x){let z=N.fork(`${import.meta.dirname}/restore.js`,[],{env:{...C.env,TARGET_FILE_NAME:x}});await new Promise((E,B)=>{z.on("close",(L,M)=>{if(L===0)E();else if(M)B(new Error(`Child process stopped because of signal ${M}`));else B(new Error(`Child process exited with code ${L}`))})})}function R(x){if(x.startsWith("/nar/"))return x.slice(5);return x.slice(1)}async function T(x,z){if(x.method!=="GET"){z.writeHead(400),z.end();return}let E=R(x.url);try{await Q(E);let B=await I.open(E);z.writeHead(200),await B.createReadStream().pipe(z)}catch(B){if(B.code==="ENOENT"){z.writeHead(404),z.end();return}z.writeHead(500),console.error(B&&B.stack?B.stack:B),z.end(B.message)}}function V(){O.createServer(T).listen(8080,()=>{C.send("started")})}async function W(){let x=I.watch("upload",{recursive:!0});for await(let z of x)console.log(z)}async function X(){await P(),W(),V()}await X();

//# debugId=B0E48E9E9DB5713464756E2164756E21
//# sourceMappingURL=server.js.map
