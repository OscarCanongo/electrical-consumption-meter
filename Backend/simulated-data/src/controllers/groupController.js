const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const moment = require('moment');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');

exports.devicesMonthly = async (req, res) => {

    try{
        let response = await fetch('http://localhost:5000/devices');
        response = await response.json();

        const devices = response.items;
        let columns = ['day'];
        
        const records = devices.filter((device) => {
            return req.query.room == -1 || device.room_id == req.query.room;
        }).map((device) => {
            var getData = (filename) =>{
                const filePath = path.join(__dirname, `../data/${filename}.csv`);
                const fileBuffer = fs.readFileSync(filePath);
                const fileString = fileBuffer.toString()
                    .split('\n')
                    .map(e => e.trim())
                    .map(e => e.split(',').map(e => e.trim()))
                    .flat();
                return fileString
            }
            var arr = [];
            let type;
            switch(device.type){
                case 1:
                    type = 'Bocinas';
                    break;
                case 2:
                    type = 'Consola';
                    break;
                case 3:
                    type = 'Luces';
                    break;
                case 4:
                    type = 'Televisiones';
                    break;
                case 5:
                    type = 'Clima';
                    arr = getData('aireAcondicionado');
                    break;
                case 6:
                    type = 'Impresora';
                    break;
                case 7:
                    type = 'Lavadoras';
                    break;
                case 8:
                    type = 'Licuadoras';
                    break;
                case 10:
                    type = 'Computadoras';
                    break;
                case 11:
                    type = 'Refrigeradores';
                    break;
                case 13:
                    type = 'Cafeteras';
                    break;
                case 14: //simulados
                    type = 'Microondas';
                    break;
                case 15: //Reales
                    type = 'Calefactor';
                    arr = getData('calefactor');
                    break;
                case 16: //Reales
                    type = 'Secadora';
                    arr = getData('secadora')
                    break;
                case 17: //Reales
                    type = 'Ventilador';
                    arr = getData('ventilador');
                    break;
            }
            if(!columns.includes(type)){
                columns.push(type);
            }
            var recordPath = path.join(__dirname, `../data/${req.query.month}-${device.id}.csv`);
            var recordBuffer = fs.readFileSync(recordPath);
            var recordString = recordBuffer.toString();

            var record = parse(recordString, {
                columns: true
            });
            
            return record.map((entry, index) => {
                if(arr.length === 0){
                    return {
                        date: new Date(parseInt(entry.date)),
                        consumption: parseInt(entry.consumption),
                        type
                    };
                }else{
                    return {
                        date: new Date(parseInt(entry.date)),
                        consumption: parseInt(arr[index]),
                        type
                    };
                }
                
            });
        });
        const days = {};
        
        records.flat().forEach((entry) => {
            const day = moment(entry.date).startOf('day').format('DD');
            days[day] = days[day] || {};
            days[day][entry.type] = (days[day][entry.type] || 0) + entry.consumption;
        });
        
        Object.keys(days).forEach((day) => {
            const sorted = {};

            Object.keys(days[day]).sort((type1, type2) => {
                return days[day][type2] - days[day][type1];
            }).forEach((type) => {
                sorted[type] = days[day][type];
            });

            days[day] = sorted;
        });
        columns = [columns[0]].concat(columns.slice(1).sort((column1, column2) => {
            return Object.keys(days).reduce((acc, day) => {
                return acc + days[day][column2];
            }, 0) - Object.keys(days).reduce((acc, day) => {
                return acc + days[day][column1];
            }, 0)
        }));

        const formatted = Object.keys(days).sort().map((day) => {
            return {
                day,
                ...days[day]
            };
        });
        
        const result = {
            data: formatted,
            columns
        }
        //console.log(result);
        res.send(result);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
};

exports.devicesWeekly = async (req, res) => {

    console.log("Hola estoy en devices Weekly");
    try{
        let response = await fetch('http://localhost:5000/devices');
        response = await response.json();

        const weekStart = moment(req.query.week);
        const weekEnd = moment(req.query.week).add(6, 'days');
    
        const startMonth = weekStart.format('YYYY-MM');
        const endMonth = weekEnd.format('YYYY-MM')
        const months = [startMonth];
        if(endMonth != startMonth){
            months.push(endMonth); 
        }
        
        const devices = response.items;

        var getData = (filename) =>{
            const filePath = path.join(__dirname, `../data/${filename}.csv`);
            const fileBuffer = fs.readFileSync(filePath);
            const fileString = fileBuffer.toString()
                .split('\n')
                .map(e => e.trim())
                .map(e => e.split(',').map(e => e.trim()))
                .flat();
            return fileString
        }

        let columns = ['day'];
        
        const records = months.map((month) => {
            return devices.filter((device) => {
                return req.query.room == -1 || device.room_id == req.query.room;
            }).map((device) => {
                var arr = [];
                let type;
                switch(device.type){
                    case 1:
                        type = 'Bocinas';
                        break;
                    case 2:
                        type = 'Consolas';
                        break;
                    case 3:
                        type = 'Luces';
                        break;
                    case 4:
                        type = 'Televisiones';
                        break;
                    case 5:
                        type = 'Clima';
                        arr = getData('aireAcondicionado');
                        break;
                    case 6:
                        type = 'Impresoras';
                        break;
                    case 7:
                        type = 'Lavadoras';
                        break;
                    case 8:
                        type = 'Licuadoras';
                        break;
                    case 10:
                        type = 'Computadoras';
                        break;
                    case 11:
                        type = 'Refrigeradores';
                        break;
                    case 13:
                        type = 'Cafeteras';
                        break;
                    case 14:
                        type = 'Microondas';
                        break;
                    case 15:
                        type = 'Calefactor';
                        arr = getData('calefactor');
                        break;
                    case 16:
                        type = 'Secadora';
                        arr = getData('secadora')
                        break;
                    case 17:
                        type = 'Ventilador';
                        arr = getData('ventilador');
                        break;
                }
                if(!columns.includes(type)){
                    columns.push(type);
                }

                const recordPath = path.join(__dirname, `../data/${month}-${device.id}.csv`);
                const recordBuffer = fs.readFileSync(recordPath);
                const recordString = recordBuffer.toString();
    
                const record = parse(recordString, {
                    columns: true
                });
    
                return record.map((entry, index) => {
                    if(arr.length === 0){
                        return {
                            date: new Date(parseInt(entry.date)),
                            consumption: parseInt(entry.consumption),
                            type
                        };
                    }else{
                        return {
                            date: new Date(parseInt(entry.date)),
                            consumption: parseInt(arr[index]),
                            type
                        };
                    }
                });
            });
        }).flat();
        const days = {};
        records.flat().forEach((entry) => {
            const date = moment(entry.date).startOf('day');
            
            if(date.isBetween(weekStart, weekEnd, null, '[]')){
                const day = date.format('MM-DD');
                days[day] = days[day] || {};
                days[day][entry.type] = (days[day][entry.type] || 0) + entry.consumption;
            }
        })
        if(Object.keys(days).length == 0){
            throw new Error('no data');
        }

        Object.keys(days).forEach((day) => {
            const sorted = {};

            Object.keys(days[day]).sort((type1, type2) => {
                return days[day][type2] - days[day][type1];
            }).forEach((type) => {
                sorted[type] = days[day][type];
            });

            days[day] = sorted;
        });
        columns = [columns[0]].concat(columns.slice(1).sort((column1, column2) => {
            return Object.keys(days).reduce((acc, day) => {
                return acc + days[day][column2];
            }, 0) - Object.keys(days).reduce((acc, day) => {
                return acc + days[day][column1];
            }, 0)
        }));

        const formatted = Object.keys(days).map((day) => {
            return {
                day,
                ...days[day]
            };
        });

        const result = {
            data: formatted,
            columns
        }
        
        res.send(result);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
};

exports.roomsMonthly = async (req, res) => {

    try{
        let response = await fetch('http://localhost:5000/devices');
        console.log("La respuesta mo: %O", response);
        response = await response.json();
         
        const devices = response.items;
        const rooms = {};
        let total = 0;
        devices.forEach((device) => {
            const recordPath = path.join(__dirname, `../data/${req.query.month}-${device.id}.csv`);
            const recordBuffer = fs.readFileSync(recordPath);
            const recordString = recordBuffer.toString();

            const record = parse(recordString, {
                columns: true
            });

            record.forEach((entry) => {
                const consumption = parseInt(entry.consumption);

                rooms[device.room] = (rooms[device.room] || 0) + consumption;
                total += consumption;
            });
        });

        const formatted = Object.keys(rooms).map((room) => {
            return {
                room,
                consumption: rooms[room],
                percentage: Math.round(rooms[room] / total * 100)
            };
        }).sort((room1, room2) => {
            return room2.consumption - room1.consumption;
        });

        res.send(formatted);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
}

exports.roomsWeekly = async (req, res) => {

    try{
        let response = await fetch('http://localhost:5000/devices');
        response = await response.json();
        console.log(req.query);
        const weekStart = moment(req.query.week);
        const weekEnd = moment(req.query.week).add(6, 'days');
    
        const startMonth = weekStart.format('YYYY-MM');
        const endMonth = weekEnd.format('YYYY-MM')
        const months = [startMonth];
        if(endMonth != startMonth){
            months.push(endMonth);
        }

        const devices = response.items;
        const rooms = {};
        let total = 0;
        months.forEach((month) => {
            devices.forEach((device) => {
                const recordPath = path.join(__dirname, `../data/${month}-${device.id}.csv`);
                const recordBuffer = fs.readFileSync(recordPath);
                const recordString = recordBuffer.toString();
    
                const record = parse(recordString, {
                    columns: true
                });
    
                record.forEach((entry) => {
                    if(moment(new Date(parseInt(entry.date))).startOf('day').isBetween(weekStart, weekEnd, null, '[]')){
                        const consumption = parseInt(entry.consumption);

                        rooms[device.room] = (rooms[device.room] || 0) + consumption;
                        total += consumption;
                    }
                });
            });
        });

        const formatted = Object.keys(rooms).map((room) => {
            return {
                room,
                consumption: rooms[room],
                percentage: Math.round(rooms[room] / total * 100)
            };
        }).sort((room1, room2) => {
            return room2.consumption - room1.consumption;
        });

        res.send(formatted);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
}