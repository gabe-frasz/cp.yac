import { Elysia, t } from "elysia";

import { Message } from "@/app/entities";
import { SendUserMessageUseCase } from "@/app/use-cases";
import { GeminiAIAgentAdapter, StreamChatAdapter } from "@/app/adapters";
import { DrizzleUserRepository } from "@/infra/database";
import { jwtPlugin } from "@/infra/http/plugins";
import { AI_AGENT_CHAT_ID } from "@/constants";

export const chatsRoute = new Elysia({ prefix: "/chats" })
  .use(jwtPlugin)
  .guard({
    cookie: t.Cookie({ auth: t.String() }),

    async beforeHandle({ cookie, jwt }) {
      const result = await jwt.verify(cookie.auth.value);
      if (!result) return new Response("Unauthorized", { status: 401 });
    },
  })
  .derive(async ({ cookie, jwt }) => {
    const result = await jwt.verify(cookie.auth.value);
    return { userEmail: !result ? "" : result.sub };
  })
  .get("/:chatId/messages", async ({ params }) => {
    console.log(params);
  })
  .post(
    "/:chatId?/messages",
    async function* ({ params, body, userEmail }) {
      const { chatId } = params;
      const { text } = body;

      const userRepository = new DrizzleUserRepository();
      const chatAdapter = new StreamChatAdapter();
      const aiAgentAdapter = new GeminiAIAgentAdapter();

      const sendUserMessageUseCase = new SendUserMessageUseCase(
        userRepository,
        chatAdapter,
        aiAgentAdapter,
      );
      const [response, error] = await sendUserMessageUseCase.execute({
        chatId,
        email: userEmail,
        message: { text },
      });

      if (error) {
        switch (error.name) {
          case "USER_NOT_IN_CHAT":
            return new Response(error.message, { status: 401 });
          case "USER_NOT_FOUND":
            return new Response("Internal Server Error", { status: 500 });
        }
      }

      let aiResponseText: string = "";

      for await (const chunk of response.aiResponse) {
        aiResponseText += chunk.text;
        yield chunk.text;
      }

      const aiMessage = new Message({
        senderId: AI_AGENT_CHAT_ID,
        text: aiResponseText,
      });

      await chatAdapter.sendMessage(response.chatId, aiMessage);
    },
    {
      body: t.Object({ text: t.String() }),
    },
  );
