async function connectToPolarH10() {
    try {
        console.log('Requesting Bluetooth Device...');
        const device = await navigator.bluetooth.requestDevice({
            // filters for devices that should be paired with
            acceptAllDevices: true,
        });

        console.log('Connecting to the GATT Server...');
        const server = await device.gatt.connect();

        console.log('Getting Heart Rate Service...');
        const service = await server.getPrimaryService('heart_rate');

        console.log('Getting Heart Rate Measurement Characteristic...');
        const characteristic = await service.getCharacteristic('heart_rate_measurement');

        // Add event listener to listen for when the heart rate measurement changes
        characteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);

        console.log('Starting Notifications...');
        await characteristic.startNotifications();

        console.log('Connected');
    } catch (error) {
        console.log('Argh! ' + error);
    }
}

let button = document.getElementById('connectBluetooth');
button.addEventListener('click', connectToPolarH10);