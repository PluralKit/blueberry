console.log('hi');

import { Client as RestClient } from 'detritus-client-rest';
import { Socket as SocketClient } from 'detritus-client-socket/lib/gateway';

import Level from '@beenotung/level-ts';
import Redis from 'ioredis';

import config from './config';
import { Interaction } from './types';

const token: string = process.env.token!;

const rest = new RestClient(token);
const socket = new SocketClient(token, { 
    // intents: 5635,
    intents: 2102787,
	presence: { activity: { type: 2, name: "vocaloid songs" } }
});
const level = new Level<string[]>('bot.db')
// const redis = new Redis();

const ctx = { socket, rest, db: {
    level,
    maybeGetString: async (id: string): Promise<string | null> =>
        await level.get(id).catch(x => {console.log(x); return null;}) as string|null,
    get: async (id: string): Promise<string[]> => {
        if (!await level.exists(id))
            await level.put(id, []);
        return await level.get(id);
    },
    set: async (id: string, roles: string[]) => await level.put(id, roles),
}, interactions: new Map<bigint, Interaction>};

export interface Context {
    socket: SocketClient,
    rest: RestClient,
//    redis: typeof redis,
    db: typeof ctx.db,
    interactions: Map<bigint, Interaction>,
};

async function cleanupInteractions(): Promise<never> {
  while (true) {
    try {
        ctx.interactions.forEach(interaction => {
            let timestamp = new Date(interaction.timestamp);
            if (new Date().getTime() > (timestamp.getTime() + 15 * 60 * 1000))
                ctx.interactions.delete(interaction.ID);
        });
    } catch (error) {
        console.error(error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 60000)); // delay for 1 minute
  }
}
cleanupInteractions()

import evt from './evt/';

socket.on('packet', async ({ d: data, t, op }) => {
    if (op != 0) return;
    if (t == "GUILD_CREATE") console.log(`Joined guild ${data.name} (${data.id})`);

    // @ts-ignore
    else if (t in evt) await evt[t](data, ctx).catch(console.error);
    else if (!["MESSAGE_UPDATE", "MESSAGE_DELETE"].includes(t)) console.log("unhandled evt:", t);
});

socket.on('state', (state) => console.log("socket:", state))
socket.on('close', (close) => console.log("socket close:", close))

socket.connect('wss://gateway.discord.gg')
