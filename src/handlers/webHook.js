const axios = require("axios");

const api = axios.create({
  baseURL: process.env.LIVE_CHAT_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: process.env.LIVE_CHAT_PAT,
  },
});

module.exports.handler = async (event) => {
  try {


    console.log("event=>",event);

    let webhookURL = event.body.WEBHOOK_URL;

    console.log("webhook=>",webhookURL);
    
    const checkWebHookExists = async () => {
        console.log("ENTERED TO CHECK WEBHOOK EXIST=>");
        console.log("clientId=>",process.env.LIVE_CHAT_CLIENT_ID);

      const response = await api.post("/v3.5/configuration/action/list_webhooks", {
        owner_client_id: process.env.LIVE_CHAT_CLIENT_ID,
      });
      console.log(JSON.stringify(response.data));
      return response.data.length > 0;
    };

    const registerWebHook = async () => {
        console.log("ENTERED TO REGISTER WEBHOOK=>")
      const response = await api.post("/v3.3/configuration/action/register_webhook", {
        url: webhookURL,
        description: "Webhook informing about thread tagged",
        action: "thread_tagged",
        secret_key: process.env.LIVE_CHAT_SECRET_KEY,
        owner_client_id: process.env.LIVE_CHAT_CLIENT_ID,
        type: "license",
      });
      console.log(JSON.stringify("registered webhook=>",response.data));
    };

    const enableWebHook = async () => {
        console.log("ENTERED TO ENABLE WEBHOOK=>")
      const response = await api.post("/v3.3/configuration/action/enable_license_webhooks", {
        owner_client_id: process.env.LIVE_CHAT_CLIENT_ID
      });
      console.log(JSON.stringify("webhook enabled=>",response.data));
    };

    const exist = await checkWebHookExists();
    console.log("exist=>", exist);

    if (!exist) {
    //   await Promise.all([registerWebHook(), enableWebHook()]);
    await registerWebHook();
    await enableWebHook();
      console.log("ACTION=>");
    }
    return {statusCode:JSON.stringify(200)}
      
  } catch (error) {
    console.error(error);
  }
};