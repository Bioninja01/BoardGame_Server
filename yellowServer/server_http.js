//step 1) require the modules we need
const http = require('http'); //helps with http methods
const path = require('path'); //helps with file paths
const fs = require('fs'); //helps with file system tasks

const hostname = '127.0.0.1';
const port = 8080;

//helper function handles file verification
function getFile(filePath, res, page404) {
  //does the requested file exist?

  fs.access(filePath, fs.constants.R_OK, function (error) {
    if (error) {
      fs.readFile(page404, function (err, contents) {
        //if there was no error
        if (!err) {
          //send the contents with a 404/not found header
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(contents);
        } else {
          //for our own troubleshooting
          console.dir(err);
        }
      });
    } else {
      fs.readFile(filePath, function (err, contents) {
        if (!err) {
          //if there was no error
          //send the contents with the default 200/ok header
          res.end(contents);
        } else {
          //for our own troubleshooting
          console.dir(err);
        }
      });
    }
  });
}

//a helper function to handle HTTP requests
function requestHandler(req, res) {
  var content = '',
    fileName = path.basename(req.url) || 'index.html', //the file that was requested
    localFolder = __dirname + '/public/', //where our public files are located
    page404 = localFolder + '404.html';

  getFile(localFolder + fileName, res, page404);
  //NOTE: __dirname returns the root folder that
  //this javascript file is in.

  //   if (fileName === 'index.html') {
  //     //if index.html was requested...
  //     content = localFolder + fileName; //setup the file name to be returned

  //     //reads the file referenced by 'content'
  //     //and then calls the anonymous function we pass in
  //     fs.readFile(content, function (err, contents) {
  //       //if the fileRead was successful...
  //       if (!err) {
  //         //send the contents of index.html
  //         //and then close the request
  //         res.end(contents);
  //       } else {
  //         //otherwise, let us inspect the eror
  //         //in the console
  //         console.dir(err);
  //       }
  //     });
  //   } else {
  //     //if the file was not found, set a 404 header...
  //     res.writeHead(404, { 'Content-Type': 'text/html' });
  //     //send a custom 'file not found' message
  //     //and then close the request
  //     res.end('<h1>Sorry, the page you are looking for cannot be found.</h1>');
  //   }
}

const server = http.createServer();
server.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
server.on('request', requestHandler);
