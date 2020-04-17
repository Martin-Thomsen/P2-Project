//#region Header

let BCC = require(__dirname + "/BasicCalls.js").BCC;

class Sensor {
    constructor(SensorID, Types) {
        this.SensorID = SensorID;
        this.Types = Types;
    }
}

class Room {
    constructor(RoomID, RoomName, Sensors) {
        this.RoomID = RoomID;
        this.RoomName = RoomName;
        this.Sensors = Sensors;
    }
}

//#endregion

//#region Public
// SSIC, Simple Sensor Info Class

module.exports.SSIC = class {
    static async getSensorInfoQuery() {
        let sensorInfo = [];

        let allRooms = await getAllRooms();
        await BCC.asyncForEach(allRooms, async function (v) {
            let sensorsInRoom = await getSensorsInRoom(v.RoomID);
            let RoomInfo = new Room(v.RoomID, v.RoomName, sensorsInRoom);
            sensorInfo.push(RoomInfo);
        });

        return new BCC.ReturnMessage(200, sensorInfo);;
    }
}
//#endregion

//#region Private

async function getAllRooms() {
    let rooms = [];
    
    let queryTable = await BCC.MakeQuery("SELECT * FROM SensorRooms", []);
    queryTable.recordset.forEach(v => rooms.push(v));

    return rooms;
}

async function getSensorsInRoom(room) {
    let sensors = [];

    let queryTable = await BCC.MakeQuery("SELECT SensorID FROM SensorInfo WHERE RoomID=?", [room]);
    await BCC.asyncForEach(queryTable.recordset, async function (v) {
        let ReturnTypes = await getSensorTypes(v.SensorID);
        sensors.push(new Sensor(v.SensorID, ReturnTypes))
    });

    return sensors;
}

async function getSensorTypes(sensorID) {
    let sensorTypes = [];
    let sensorTypeNames = [];

    let queryTable = await BCC.MakeQuery("SELECT * FROM SensorThresholds WHERE SensorID=?", [sensorID]);

    queryTable.recordset.forEach(v => sensorTypes.push(v.SensorType));

    await BCC.asyncForEach(sensorTypes, async function (v) {
        sensorTypeNames.push((await getSensorTypeName(v))[0]);
    });

    return sensorTypeNames;
}

async function getSensorTypeName(sensorType) {
    let sensorTypeName = [];

    let queryTable = await BCC.MakeQuery("SELECT TypeName FROM SensorTypes WHERE SensorType=?", [sensorType]);
    queryTable.recordset.forEach(v => sensorTypeName.push(v.TypeName));

    return sensorTypeName;
}

//#endregion