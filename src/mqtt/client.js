import mqtt from "mqtt";
import { useEffect, useState } from "react";

function Client(){
    // const [client, setClient] = useState(null);
    const mqttBroker = ""
    const topic = 'iot/+/+/ingestdriverbehaviorData';
    useEffect(() => {
        const mqttClient = mqtt.connect(mqttBroker);

        if(mqttClient){
            console.log(mqttClient);

            mqttClient.on("connect", () => {
                mqttClient.subscribe(topic, (error) => {
                    if(!error){
                        alert('Topic Subscribed');
                    }
                    else{
                        console.error(error);
                    }
                })
            })

            mqttClient.on('message', (topic, messgae) => {
                const payload = {topic, 'message': messgae.toString()};
                console.log(payload);
            })
        }

        return () => {
            mqttClient.end();
        }
    }, [])
}

export default Client;