/**
 * Created by igor on 22.04.14.
 */

var net = require('net');
var moment = require('moment');
//var streams = Array();
var im;
var count_record;
var length_record;

var server = net.createServer(function(socket){
    console.log("Connected Client: " + socket.remoteAddress + ":" + socket.remotePort);
    im = 'undefined';
    socket.on('data', function(data){
        var buf = new Buffer(data);
        if(im == 'undefined'){
            if(buf.length != 17){
                return;
            }
            im = buf.toString('ascii', 2, 17);
            console.log('IMEI: ' + im);
            socket.write('\x01');
        }
        else{
            if(buf.readUInt32BE(0) != 0 || buf.readUInt8(8) != 8){
                console.log('bad AVL packet');
                return;
            }
            length_record = buf.readUInt32BE(4);
            count_record = buf.readUInt8(9);
            var t = parseInt(buf.toString('hex', 10, 18), 16);
            var d = new moment(t).format('MMMM Do YYYY, h:mm:ss');
            console.log('timestamp record: ' + d);
            console.log("length record: " + length_record);
            console.log("count record: " + count_record);
            console.log(buf);
            console.log('buf length: ' + buf.length);
            console.log('socket read byte: ' + socket.bytesRead);
            var res = buf.slice(9,10);
            socket.write('\x00' + '\x00' + '\x00' + res);
        }
    });

    socket.on('close', function(){
        console.log('client CLOSE');
    });

    socket.on('end', function(){
        console.log('client submit END');
    });

    socket.on('disconnect', function(){
        console.log('client disconnect');
    });

    socket.on('error', function(error){
        console.log(error);
    });
}).listen(3000);