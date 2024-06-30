import { createInterface } from 'node:readline';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

import { UkraineTelegramService } from '@ukraine/ukraine-base';

@Injectable()
export class TelegramClientService {
  client: TelegramClient;

  constructor(
    private configService: ConfigService,
    private ukraineTelegramService: UkraineTelegramService,
  ) {
    this.initClient().then(this.getHistory.bind(this));
  }

  /**
   * Initialize the Telegram client
   */
  async initClient() {
    const stringSession = new StringSession(
      this.configService.get('PHONE_SESSION') || '',
    );

    this.client = new TelegramClient(
      stringSession,
      +this.configService.get('API_ID'),
      this.configService.get('API_HASH'),
      {
        connectionRetries: 5,
      },
    );

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await this.client.start({
      phoneNumber: this.configService.get('PHONE_NUMBER'),
      password: async () =>
        new Promise((resolve) =>
          rl.question('Please enter your password: ', resolve),
        ),
      phoneCode: async () =>
        new Promise((resolve) =>
          rl.question('Please enter the code you received: ', resolve),
        ),
      onError: (error) => console.log(error),
    });
  }

  /**
   * Get the history of the channel
   */
  async getHistory() {
    for (const {
      chatName,
      convert,
    } of this.ukraineTelegramService.getAllConfigs()) {
      // We need to perform a search to find the channel before asking history
      await this.client.invoke(
        new Api.contacts.Search({
          q: chatName,
          limit: 1,
        }),
      );

      const channelMessages = (await this.client.invoke(
        new Api.messages.GetHistory({
          peer: chatName,
          limit: 15,
        }),
      )) as Api.messages.ChannelMessages;

      const messages = channelMessages.messages as Api.Message[];

      messages
        .filter((message) => message.message)
        .forEach((message) => {
          const outrage = convert(message.message);
          console.log('message:', outrage);
        });
    }
  }
}
