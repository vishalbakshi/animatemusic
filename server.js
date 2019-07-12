/* const express = require('express')
const app = express()
const http = require('https')
const server = http.createServer(app)
const io = require('socket.io').listen(server)
const fs = require('fs')

server.listen(3000)

app.get("/", (req, res) => {
    res.send('hello')
})

io.sockets.on('connection', (socket) => {
    socket.on('render-frame', (data) => {
        data.file = data.file.split(',')[1]
        let buffer = new Buffer(data.file, 'base64')
        fs.writeFile(__dirname + '/tmp/frame-' + data.frame + '.png', buffer.toString('binary'))
    })
}) */

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors')
const fs = require('fs')
const ffmpeg = require('ffmpeg')
const JSZip = require('jszip')

const zip = new JSZip()
const img = zip.folder("images")

app.use(cors())
app.get('/', function(req, res){

  res.header("Access-Control-Allow-Origin", "*");
  res.sendFile(__dirname + '/index.html');
});

let frames = []
io.sockets.on('connection', (socket) => {
    console.log('socket connection!')
    socket.on('render-frame', (data) => {
        console.log('socket render frame!')
        //data.file = data.file.split(',')[1]; // Get rid of the data:image/png;base64 at the beginning of the file data
        //let buffer = new Buffer(data.file, 'base64');
        //fs.writeFile(__dirname + '/tmp/' + data.word + '-frame-' + data.frame + '.png', buffer.toString('binary'), 'binary', (err) => { if (err) console.error(err)});
        console.log('hello')
        frames = data.frame_array
        console.log(frames[0])
        let fileCount = 0;
        frames.forEach((url) => {
            img.file(fileCount + ".png", url, {base64: true})
        })

        zip.generateNodeStream({type: 'nodebuffer', streamFiles: true})
            .pipe(fs.createWriteStream('out.zip'))
            .on('finish', () => {
                console.log('out.zip written')
            })
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});