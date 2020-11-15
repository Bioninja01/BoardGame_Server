const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 8080;

const server = http.createServer();

server.on('request', (request, res) => {
  const { headers, method, url } = request;
  let body = [];
  request.on('error', (err) => {
    console.error(err);
  });
  request.on('data', (chunk) => {
    body.push(chunk);
  });
  request.on('end', () => {
    body = Buffer.concat(body).toString();
    // At this point, we have the headers, method, url and body, and can now
    // do whatever we need to in order to respond to this request.
  });

  console.log('here' + request.url);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  // The filename is simple the local directory and tacks on the requested url
  var filename = __dirname + request.url;

  // let body = [];
  // request
  //   .on('data', (chunk) => {
  //     body.push(chunk);
  //   })
  //   .on('end', () => {
  //     body = Buffer.concat(body).toString();
  //     // at this point, `body` has the entire request body stored in it as a string
  //   });

  // // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename);
  // This will wait until we know the readable stream is actually valid before piping
  readStream.on('open', function () {
    // This just pipes the read stream to the response object (which goes to the client)
    readStream.pipe(res);
  });

  // This catches any errors that happen while creating the readable stream (usually invalid names)
  readStream.on('error', function (err) {
    // res.end(err);
    console.error(err.stack);
    res.write('error');
    res.end(); //end the response
  });
});

server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
