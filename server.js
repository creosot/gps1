/**
 * Created by igor on 22.04.14.
 */

var net = require('net');
var moment = require('moment');
moment.lang('ru');
//var streams = Array();
var im;
var count_record;
var length_records;
var longitude;
var latitude;
var altitude;
var sputnik;
var speed;
var data;

var server = net.createServer(function(socket){
    console.log("Connected Client: " + socket.remoteAddress + ":" + socket.remotePort);
    im = '';
    socket.on('data', function(data){
        var buf = new Buffer(data);
        if(im == ''){
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
            length_records = buf.readUInt32BE(4) - 3;
            if(length_records != (buf.length - 15)){
                console.log('difference length record');
                return;
            }
            var length_rec = (length_records/count_record);
            if(length_rec%1 !== 0){
                console.log('length record is float' + length_rec);
                return;
            }
            longitude = buf.readUInt32BE(19)/10000000;
            latitude = buf.readUInt32BE(23)/10000000;
            altitude = buf.readUInt16BE(27);
            sputnik = buf.readUInt8(31);
            speed = buf.readUInt16BE(32);
            var unix_time = parseInt(buf.toString('hex', 10, 18), 16);
            var timestamp = new moment(unix_time).format('MMMM Do YYYY, H:mm:ss');
            console.log('timestamp record: ' + timestamp);
            console.log("length records: " + length_records);
            console.log("count record: " + count_record);
            console.log('length 1 record: ' + length_rec);
            console.log("Широта: " + latitude + "; Долгота: " + longitude + '; Высота: ' + altitude + '; Спутники: ' + sputnik + '; Скорость :' + speed);
            console.log(buf);
            console.log('buf length: ' + buf.length);
            console.log('socket read byte: ' + socket.bytesRead);
            var res = buf.slice(9,10);
            socket.write('\x00' + '\x00' + '\x00' + res);
            data = new Array(count_record);
            for(var i = 0; i < count_record; i++){
                data[i] = buf.toString('hex', 10, 40);
//                data[i] = buf.toString('hex', 10 + (i*length_rec)), ((length_rec + 10) + (i*length_rec));
                console.log(i + ': ' + data[i]);
            }
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