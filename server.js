const rpio = require('rpio');
const bme280 = require('bme280');
const AHT20 = require( "aht20" );

// Constants
const PCA9548A_ADDR = 0x70;
const BME280_ADDR = 0x76;
const TOTAL_CHANNELS = 4;

// RPIO Init
rpio.init({ gpiomem: false, close_on_exit: true });
rpio.i2cBegin();

async function poll() {

  const currentData = {};
  currentData.time = new Date();

//outside sensors
//poll 1st BME

  var mask = 1 << 0;
  rpio.i2cSetSlaveAddress(PCA9548A_ADDR);
  rpio.i2cWrite(Buffer.from([mask]));

  sleep(300); // Short delay after switching

  //console.log(`\n1st BME - 0`);
  try {
    const sensor = await bme280.open({ i2cBusNo: 1, i2cAddress: BME280_ADDR });
    const data = await sensor.read();
    currentData.outsideTemp = data.temperature;
    currentData.outsideHum = data.humidity;
    await sensor.close();
  } catch (err) {
    console.log(`No sensor or read failed`);
  }

//poll 1st aht
	
  //mask = 1 << 1;
//  rpio.i2cSetSlaveAddress(PCA9548A_ADDR);
  //rpio.i2cWrite(Buffer.from([mask]));

  //sleep(300); // Short delay after switching

  //console.log("\n1st aht");
  //try {
    //const sensor = new AHT20(1);
    //const data = await sensor.readData();
    //console.write(data);
  //} catch (err) {
    //console.log(err);
    //console.log('Failed to open bus');
  //}

//poll 2nd BME

  mask = 1 << 2;
  rpio.i2cSetSlaveAddress(PCA9548A_ADDR);
  rpio.i2cWrite(Buffer.from([mask]));

  sleep(300); // Short delay after switching

  //console.log(`\n2nd BME - 2`);
  try {
    const sensor = await bme280.open({ i2cBusNo: 1, i2cAddress: BME280_ADDR });
    const data = await sensor.read();
    currentData.insideTemp = data.temperature;
    currentData.insideHum = data.humidity;
    await sensor.close();
  } catch (err) {
    console.log(`No sensor or read failed`);
  }
  return currentData;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  while (true) {
    try {
      const data = await poll();
      console.log(data);
    } catch (err) {
      console.error("Polling failed:", err.message || err);
    }
    await sleep(10000);
  };
  rpio.i2cEnd();
})();

