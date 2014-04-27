/**
 * Created by igor on 22.04.14.
 */

var net = require('net');
var moment = require('moment');
moment.lang('ru');
//var streams = Array();
var im;
var count_record;
var length_record;
var longitude;
var latitude;
var altitude;
var sputnik;
var speed;

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
            count_record = buf.readUInt8(9);
            console.log(buf.length);
            if(count_record != buf.readUInt8(buf.length - 5)){
                console.log('difference count record');
                return;
            }
            length_record = buf.readUInt32BE(4);
            if((length_record - 3) != (buf.length - 15)){
                console.log('difference length record');
                return;
            }
            var dd = ((buf.length - 15)/count_record);
            console.log('length: ' + dd);
            if(dd%1 !== 0){
                console.log('length record is float' + dd);
                return;
            }
            console.log('length: ' + (length_record - 3));
            console.log('buf length: ' + (buf.length - 15));
            longitude = buf.readUInt32BE(19)/10000000;
            latitude = buf.readUInt32BE(23)/10000000;
            altitude = buf.readUInt16BE(27);
            sputnik = buf.readUInt8(31);
            speed = buf.readUInt16BE(32);
            //longitude = parseInt(buf.toString('hex', 19, 23), 16)/10000000;
            //latitude = parseInt(buf.toString('hex', 23, 27), 16)/10000000;
            //altitude = parseInt(buf.toString('hex', 27, 29), 16);
            var unix_time = parseInt(buf.toString('hex', 10, 18), 16);
            var timestamp = new moment(unix_time).format('MMMM Do YYYY, H:mm:ss');
            console.log('timestamp record: ' + timestamp);
            console.log("length record: " + length_record);
            console.log("count record: " + count_record);
            console.log("Широта: " + latitude + "; Долгота: " + longitude + '; Высота: ' + altitude + '; Спутники: ' + sputnik + '; Скорость :' + speed);
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