export const replyMarkup = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Start mining", callback_data: "/start" }],
      [
        { text: "Create an account", callback_data: "/create" },
        { text: "Visit Website", url: "https://google.com" },
      ],
      [
        { text: "Check balance", callback_data: "/balance" },
        { text: "Mining History", callback_data: "/history" },
        { text: "Withdraw", callback_data: "/withdraw" },
      ],
      [{ text: "Get Help", callback_data: "/help" }],
    ],
  },
};

export const QUES = {
  LOG: "log",
  START_MINING: "start_mining",
};
