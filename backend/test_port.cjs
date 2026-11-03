const Docker = require('dockerode');
const http = require('http');
const docker = new Docker();

async function test() {
  try {
    const c = await docker.createContainer({
      Image: 'vocodeai/universal-dev:latest',
      name: 'vocodeai-curl-test',
      Tty: true,
      ExposedPorts: { '5000/tcp': {} },
      HostConfig: {
        PortBindings: {
          '5000/tcp': [{ HostPort: '5000' }]
        }
      }
    });
    await c.start();
    console.log('CONTAINER STARTED');

    const exec = await c.exec({
      Cmd: ['node', '-e', 'require("http").createServer((req, res) => res.end("HELLO FROM DOCKER ON PORT 5000!")).listen(5000)'],
      AttachStdout: true,
      AttachStderr: true
    });
    await exec.start({});

    await new Promise(r => setTimeout(r, 1500));

    http.get('http://localhost:5000', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        console.log('SUCCESSFUL RESPONSE FROM LOCALHOST:5000 -> ' + data);
        await c.stop();
        await c.remove();
        console.log('CLEANED UP');
      });
    }).on('error', async (err) => {
      console.error('HTTP ERROR:', err.message);
      await c.stop();
      await c.remove();
    });
  } catch (err) {
    console.error('TEST ERROR:', err.message);
  }
}

test();

