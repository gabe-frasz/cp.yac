import { Elysia, t } from "elysia";
import type { GetChatHistoryResponse } from "@repo/api-contracts";

import { Message } from "@/app/entities";
import { SendUserMessageUseCase, GetChatHistoryUseCase } from "@/app/use-cases";
import { GeminiAIAgentAdapter, StreamChatAdapter } from "@/app/adapters";
import { DrizzleUserRepository } from "@/infra/database";
import { HttpMessageMapper } from "@/infra/http";
import { jwtPlugin } from "@/infra/http/plugins";
import { AI_AGENT_CHAT_ID, MAX_MESSAGES_OFFSET } from "@/constants";

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
  .get(
    "/:chatId/messages",
    async ({ params, query, userEmail }) => {
      const { chatId } = params;
      const { offset } = query;

      const userRepository = new DrizzleUserRepository();
      const chatAdapter = new StreamChatAdapter();

      const getChatHistoryUseCase = new GetChatHistoryUseCase(
        userRepository,
        chatAdapter,
      );
      const [response, error] = await getChatHistoryUseCase.execute({
        email: userEmail,
        chatId,
        offset,
      });

      if (error) {
        switch (error.name) {
          case "USER_NOT_IN_CHAT":
            return new Response(error.message, { status: 401 });
          case "USER_NOT_FOUND":
            return new Response("Internal Server Error", { status: 500 });
        }
      }

      const responseBody = response.chatHistory.map(
        HttpMessageMapper.toHttp,
      ) satisfies GetChatHistoryResponse;

      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      query: t.Object({
        offset: t.Optional(
          t.Number({ minimum: 0, maximum: MAX_MESSAGES_OFFSET, default: 0 }),
        ),
      }),
    },
  )
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
