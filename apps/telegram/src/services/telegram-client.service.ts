/* eslint-disable no-await-in-loop */
import { createInterface } from 'node:readline';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

import type { Outrage } from '@app/shared';
import { OutrageService } from '@app/shared';

import { UkraineTelegramService } from '@ukraine/ukraine-base';

@Injectable()
export class TelegramClientService {
  client: TelegramClient;

  constructor(
    private outrageService: OutrageService,
    private configService: ConfigService,
    private ukraineTelegramService: UkraineTelegramService,
  ) {
    this.initClient()
      .then(() => this.getHistory())
      .catch(console.error);
  }

  /**
   * Initialize the Telegram client
   */
  async initClient() {
    const stringSession = new StringSession(this.configService.get('PHONE_SESSION') || '');

    this.client = new TelegramClient(stringSession, +this.configService.get('API_ID'), this.configService.get('API_HASH'), {
      connectionRetries: 5,
    });

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await this.client.start({
      phoneNumber: this.configService.get('PHONE_NUMBER'),
      password: async () =>
        new Promise((resolve) => {
          rl.question('Please enter your password: ', resolve);
        }),
      phoneCode: async () =>
        new Promise((resolve) => {
          rl.question('Please enter the code you received: ', resolve);
        }),
      onError: (error) => console.error(error),
    });
  }

  /**
   * Get the history of the channel
   */
  async getHistory(): Promise<Outrage[]> {
    let updatedOutrages: Outrage[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const config of this.ukraineTelegramService.getAllConfigs()) {
      const { convert, chatName } = config.telegramConfig;
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

      const newOutrages = messages
        .filter((message) => message.message)
        .map((message) => {
          const outrage = convert(message.message);

          if (!outrage.date && outrage.shifts.length > 0) {
            this.client
              .sendMessage('me', {
                message: `Cannot parse this message:\n\n${message.message}`,
              })
              .then(() => console.info('Message sent!'))
              .catch(console.error);

            return null;
          }

          return outrage.shifts.length > 0 ? outrage : null;
        })
        .filter(Boolean)
        .reverse();

      const newUpdatedOutrages = await this.outrageService.bulkSaveOutrages(newOutrages);

      updatedOutrages = [...updatedOutrages, ...newUpdatedOutrages];
    }

    console.info('updatedOutrages', updatedOutrages);

    return updatedOutrages;
  }
}
