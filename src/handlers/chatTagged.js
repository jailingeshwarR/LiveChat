const axios = require("axios");

const api = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: process.env.PAT,
  },
});

module.exports.handler = async (event) => {
  try {
    let secretKey = process.env.SECRET_KEY;
    let body = JSON.parse(event.body);
    let chatId = body.payload.chat_id;
    console.log("entered request");
    console.log("payload=>", chatId);
    // console.log("event", event);

    const chatDetails = async () => {
      const response = await api.post("/v3.4/agent/action/get_chat", {
        chat_id: chatId,
      });

      let users = response.data.users;
      console.log("users=>", JSON.stringify(users));

      let customerData = users
        .filter((items) => items.type === "customer")
        .map((item) => {
          return {
            name: item.name,
            email: item.email,
            countryCode: item.last_visit.geolocation.country_code,
            city: item.last_visit.geolocation.city,
            region: item.last_visit.geolocation.region,
            chatId: item.id,
          };
        });

      customerData[0].FormUrl =
        response.data.thread.properties.routing.start_url;

      return customerData[0];
    };

    if (body.secret_key === secretKey) {
      console.log("triggered");
      let response = await chatDetails();
      console.log("response", response);
      return { statusCode: 200, body: JSON.stringify(response) };
    } else {
      return {
        body: JSON.stringify("unAuthorized"),
      };
    }
  } catch (e) {
    console.error("GET ERROR: ", e);
  }
};
