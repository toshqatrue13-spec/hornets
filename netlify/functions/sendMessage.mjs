export const handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body);

    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.CHAT_ID;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

<<<<<<< HEAD
   return {
  statusCode: 200,
  body: JSON.stringify({
    success: true,
    message: "sent"
  }),
};
=======
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, telegram: data }),
    };
>>>>>>> 77584c159bedbe7a1ca662c864b8698666dcdcd9

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
