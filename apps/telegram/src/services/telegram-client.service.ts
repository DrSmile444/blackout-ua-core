import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createInterface } from 'readline';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

@Injectable()
export class TelegramClientService {
  client: TelegramClient;

  constructor(private configService: ConfigService) {
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
      onError: (err) => console.log(err),
    });
  }

  /**
   * Get the history of the channel
   */
  async getHistory() {
    const channelName = 'ПАТ "Черкасиобленерго"';

    // We need to perform a search to find the channel before asking history
    await this.client.invoke(
      new Api.contacts.Search({
        q: channelName,
        limit: 1,
      }),
    );

    const channelMessages = (await this.client.invoke(
      new Api.messages.GetHistory({
        peer: channelName,
        limit: 15,
      }),
    )) as Api.messages.ChannelMessages;

    const messages = channelMessages.messages as Api.Message[];

    messages
      .filter((message) => message.message)
      .forEach((message) => {
        console.log('message:', message.message);
      });
  }
}
