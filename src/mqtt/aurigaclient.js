import mqtt from 'mqtt';
import AWS from 'aws-sdk';
 
export async function aurigaclient() {
  // Configure Cognito credentials
  AWS.config.region = 'ca-central-1'; // Your region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ca-central-1:8c88db8c-dd21-453d-bafe-77502c44bf1d',
  });
 
  await AWS.config.credentials.getPromise();
 
  const credentials = AWS.config.credentials;
  const requestUrl = createSignedUrl({
    accessKey: credentials.accessKeyId,
    secretKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
    endpoint:'ai7ylehkeodwh-ats.iot.ca-central-1.amazonaws.com',
    region: 'ca-central-1',
  });
 
  const client = mqtt.connect(requestUrl);
 
  return client;
}
 
// Helper to sign MQTT WebSocket URL
function createSignedUrl({ accessKey, secretKey, sessionToken, endpoint, region }) {
  const signed = AWS.util.signUrl(
    `wss://${endpoint}/mqtt`,
    {
      method: 'GET',
      service: 'iotdevicegateway',
      region,
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      sessionToken,
      protocol: 'wss',
    }
  );
  return signed;
}
export default aurigaclient;