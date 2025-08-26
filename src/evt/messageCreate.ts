import { Context } from '..';
import config from '../config';
import { inspect } from 'util';

import { TAGS, TAG_ALIASES } from '../tags';

import * as incidentAPI from "../incidentAPI"
import * as CV2 from "../cv2"
import { MessageFlags } from 'detritus-client/lib/constants';
const IS_COMPONENTS_V2 = (1 << 15);

const incidentIDLen = 8;

const isNewAccount = (userID: string) => {
	let createdAt = Number((BigInt(userID) >> 22n) + BigInt(1420070400000)) / 1000;
	const now = Math.floor(Date.now() / 1000);
	if (createdAt > (now - config.newAccountDuration)) return true;
	return false;
}

const token: string = process.env.token!;

const pinnedMessageText = `<#${config.update_requests_channel}>: ask for limit raises or ID re-rolls here. **Please read the pinned messages**

If you are asking for a re-roll, *please mention the type of ID it is.*

Please keep your requests to **one message**, feel free to edit it afterward. (There is a slowmode of 10 minutes in the channel, to discourage in-channel replies.)
Staff may create a thread in case they need more information.

Any other messages **will be deleted with no warning**. If you are not sure which channel to use, please read <#641807196056715294>.`;

const updatePinnedMessage = async (ctx: Context) => {
	const key = "_pinnedMessageId";
	let currentMessageId = await ctx.db.maybeGetString(key);
	let newMessage = await ctx.rest.createMessage(config.update_requests_channel, pinnedMessageText);
	if (currentMessageId) ctx.rest.deleteMessage(config.update_requests_channel, currentMessageId);
	await ctx.db.level.put(key, newMessage.id);
}

const lockUnlockChannel = async (ctx: Context, guildId: string, channelId: string, lock: boolean) => {
	let flags = await ctx.rest.fetchChannel(channelId).then((x: any) => x.permission_overwrites.find((o: any) => o.id == guildId).deny);
	let operator = lock ? " | " : " & ~";
	let deny = eval(`String(BigInt(flags) ${operator}BigInt(2048))`);
	await ctx.rest.editChannelOverwrite(channelId, guildId, { deny });
}

const offtopicLockKey = "_offtopicLock";

export default async (evt: any, ctx: Context) => {
	if (!evt.content) return;
	if (evt.author.bot) return;

	const content: string = evt.content.toLowerCase();

	if (content == "?ping")
		return await ctx.rest.createMessage(evt.channel_id, "meow!");

	if (evt.guild_id != config.guild_id) return;
	if (evt.channel_id == config.update_requests_channel) await updatePinnedMessage(ctx);

	if (["?tags", "?tag list", "?taglist"].includes(content))
		return await ctx.rest.createMessage(evt.channel_id, {
			content: `available tags: ${Object.keys(TAGS).join(', ')}`,
			allowedMentions: { parse: [] }
		});

	let tagname = content.substring(1) as string;
	let tag = TAGS[TAG_ALIASES[tagname] ?? tagname];
	if (content && content[0] == "?" && tag)
		return await ctx.rest.createMessage(evt.channel_id, {
			content: (typeof tag === 'string' ? tag : undefined),
			embeds: (typeof tag === 'string' ? undefined : [tag]),
			allowedMentions: { parse: [], repliedUser: true },
			messageReference: evt.message_reference ? {
				channelId: evt.channel_id,
				messageId: evt.message_reference.message_id,
			} : undefined,
		});

	if (content == "?rank chat access") {
		if (evt.guild_id != config.guild_id)
			return;

		if (evt.member.roles.includes(config.restrict_role_id) || ![
			"471385416595931176", // #command-spam
			"466707357099884546", // #chat-and-off-topic-and-foxes (i guess)
			"847022163982548992",
			"888856810923110531",
		].includes(evt.channel_id)) {
			console.log(evt.author.id, evt.author.name, "lol");
			await ctx.rest.createReaction(evt.channel_id, evt.id, "\u274c");
			return;
		}
		if (isNewAccount(evt.author.id)) {
			await ctx.rest.createMessage(evt.channel_id, {
				content: `\u274c Account too new. Try again in a bit!`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			});
			await ctx.rest.deleteMessage(evt.channel_id, evt.id);
			return;
		}

		if (evt.member.roles.includes(config.chat_role_id)) {
			let roles = evt.member.roles.filter((role: string) => role != config.chat_role_id);
			ctx.rest.editGuildMember(evt.guild_id, evt.author.id, { roles });
			await ctx.rest.createMessage(evt.channel_id, {
				content: `Removed <@&${config.chat_role_id}> from <@!${evt.author.id}>.`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			});
		} else {
			if (await ctx.db.maybeGetString(offtopicLockKey)) {
				await ctx.rest.createMessage(evt.channel_id, {
					content: `\u274c This command is currently disabled, please try again later.`,
					allowedMentions: { parse: [] },
					messageReference: {
						channelId: evt.channel_id,
						messageId: evt.id,
					},
				});
				await ctx.rest.deleteMessage(evt.channel_id, evt.id);
				return;
			}

			evt.member.roles.push(config.chat_role_id);
			ctx.rest.editGuildMember(evt.guild_id, evt.author.id, { roles: evt.member.roles });
			await ctx.rest.createMessage(evt.channel_id, {
				content: `Added <@&${config.chat_role_id}> to <@!${evt.author.id}>.`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			})
		}
		await ctx.rest.deleteMessage(evt.channel_id, evt.id);
	}
	if (content.startsWith("?incidents")) {
		let subcommand = content.substring(10).trim();
		if (subcommand == "") {
			try {
				const resp = await ctx.rest.createMessage(evt.channel_id, { 
					components: await incidentAPI.genIncidentsListCV2(false), 
					flags: IS_COMPONENTS_V2 
				})
				ctx.interactions.set(resp.id, {
					ID: resp.id,
					initiator: evt.author.id,
					type: "incidents",
					timestamp: resp.timestamp
				})
			} catch (error) {
				console.error(error);
				return await ctx.rest.createMessage(evt.channel_id, {
					content: `An error occurred`,
					messageReference: {
						channelId: evt.channel_id,
						messageId: evt.id,
					},
				});
			}
		}else if (subcommand == "admin" && evt.member.roles.includes(config.staff_role_id)){
			try {
				const resp = await ctx.rest.createMessage(evt.channel_id, {
					components: await incidentAPI.genIncidentsListCV2(true), 
					flags: IS_COMPONENTS_V2 
				})
				ctx.interactions.set(resp.id, {
					ID: resp.id,
					initiator: evt.author.id,
					type: "incidents_admin",
					timestamp: resp.timestamp
				})
			} catch (error) {
				console.error(error);
				return await ctx.rest.createMessage(evt.channel_id, {
					content: `An error occurred`,
					messageReference: {
						channelId: evt.channel_id,
						messageId: evt.id,
					},
				});
			}
		}
	}
	
	if (content == ".lockchat" && evt.member.roles.includes(config.staff_role_id)) {
		await ctx.db.level.put(offtopicLockKey, "true");
		await ctx.rest.createMessage(evt.channel_id, "ok");
	}

	if (content == ".unlockchat" && evt.member.roles.includes(config.staff_role_id)) {
		await ctx.db.level.del(offtopicLockKey);
		await ctx.rest.createMessage(evt.channel_id, "ok");
	}

	if (content == ".lockchannels" && evt.member.roles.includes(config.staff_role_id)) {
		await ctx.rest.createReaction(evt.channel_id, evt.id, "\u23f3");
		for (let channel of config.lockdownChannels) {
			await lockUnlockChannel(ctx, evt.guild_id, channel, true);
			console.log("locked", channel);
		}
		await ctx.rest.createMessage(evt.channel_id, "ok");
	}

	if (content == ".unlockchannels" && evt.member.roles.includes(config.staff_role_id)) {
		await ctx.rest.createReaction(evt.channel_id, evt.id, "\u23f3");
		for (let channel of config.lockdownChannels) {
			await lockUnlockChannel(ctx, evt.guild_id, channel, false);
			console.log("locked", channel);
		}
		await ctx.rest.createMessage(evt.channel_id, "ok");
	}

	if (content?.startsWith(".eval ") && evt.member.roles.includes(config.admin_role_id)) {
		let res;
		try {
			res = await eval(`(async () => {${evt.content.slice(5)}})()`);
		} catch(e) {
			res = (e as any).toString();
		}

		console.log("EVAL:", res);
		let len = `${res}`.length;
		res = inspect(res).split(token).join("[[ TOKEN ]]").slice(0, 500);
		if (len > 500) res += "... (check console)";

		await ctx.rest.createMessage(evt.channel_id, res);
	}

	if (content?.startsWith("+s") && evt.member.roles.includes(config.infra_role_id)) {
		if (content == "+s h" || content == "+s help") {
			await ctx.rest.createMessage(evt.channel_id, "server-checks chatops\n\n`+s`: list silences\n`+s +<silence>`: create silence\n`+s -<silence>`: delete silence"
				+ "\n`+s override`: override @infra pings to your account (for testing and such)\n`+s clearoverride`: clear ping override");
		} else if (content.length == 2) {
			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{ headers: { authorization: `Bearer ${process.env.cf_token}` } })
				.then((x: any) => x.json());
			console.log(res);
			let silences = res.map((x: any) => `- \`${x.check ?? (x.checkPrefix+"*")}@${x.node}\``).join("\n");
			if (silences == "") silences = "no silences set";
			await ctx.rest.createMessage(evt.channel_id, silences);
		} else if (content[3] == "+") {
			// add silence
			let newsilence: any = content.slice(4).split("@");
			if (newsilence.length != 2) {
				await ctx.rest.createMessage(evt.channel_id, "format: `check@host`, optionally accepting a wildcard for hostname (`somecheck@*`) and/or at end of check name (someprefix*@somehost)")
				return
			}
			// parse text
			newsilence = [newsilence].map(x => ({ check: x[0], checkPrefix: null, node: x[1] }))
				.map(x => {
					if (x.check.endsWith("*")) {
						x.checkPrefix = x.check.slice(0, -1);
						x.check = null;
					}
					return x;
				})[0];
			console.log(newsilence);

			let curSilences = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{ headers: { authorization: `Bearer ${process.env.cf_token}` } })
				.then((x: any) => x.json());

			if (!!curSilences.find((x: any) => x.check == newsilence.check && x.checkPrefix == newsilence.checkPrefix && x.node == newsilence.node)) {
				await ctx.rest.createMessage(evt.channel_id, "check already exists");
				return;
			}

			curSilences.push(newsilence);

			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{
						method: "PUT",
						headers: { authorization: `Bearer ${process.env.cf_token}` },
						body: JSON.stringify(curSilences),
				})
				.then((x: any) => x.json());
			if (res.success) {
				await ctx.rest.createMessage(evt.channel_id, "ok");
			} else {
				await ctx.rest.createMessage(evt.channel_id, `not ok: ${JSON.stringify(res)}`);
			}
		} else if (content[3] == "-") {
			// remove silence
			let newsilence: any = content.slice(4).split("@");
			if (newsilence.length != 2) {
				await ctx.rest.createMessage(evt.channel_id, "format: `check@host`, optionally accepting a wildcard for hostname (`somecheck@*`) and/or at end of check name (someprefix*@somehost)")
				return
			}
			// parse text
			newsilence = [newsilence].map(x => ({ check: x[0], checkPrefix: null, node: x[1] }))
				.map(x => {
					if (x.check.endsWith("*")) {
						x.checkPrefix = x.check.slice(0, -1);
						x.check = null;
					}
					return x;
				})[0];
			console.log(newsilence);

			let curSilences = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{ headers: { authorization: `Bearer ${process.env.cf_token}` } })
				.then((x: any) => x.json());
			console.log("del: get", curSilences);

			let idx = curSilences.find((x: any) => x.check == newsilence.check && x.checkPrefix == newsilence.checkPrefix && x.node == newsilence.node);

			if (idx == null) {
				await ctx.rest.createMessage(evt.channel_id, "check doesn't exist");
				return;
			}

			curSilences.splice(idx, 1);
			console.log("del: send", curSilences);

			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{
						method: "PUT",
						headers: { authorization: `Bearer ${process.env.cf_token}` },
						body: JSON.stringify(curSilences),
				})
				.then((x: any) => x.json());
			if (res.success) {
				await ctx.rest.createMessage(evt.channel_id, "ok");
			} else {
				await ctx.rest.createMessage(evt.channel_id, `not ok: ${JSON.stringify(res)}`);
			}
		} else if (content == "+s clear") {
			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/silences`,
				{
						method: "PUT",
						headers: { authorization: `Bearer ${process.env.cf_token}` },
						body: JSON.stringify([]),
				})
				.then((x: any) => x.json());
			if (res.success) {
				await ctx.rest.createMessage(evt.channel_id, "ok");
			} else {
				await ctx.rest.createMessage(evt.channel_id, `not ok: ${JSON.stringify(res)}`);
			}
		} else if (content == "+s override") {
			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/notif`,
				{
						method: "PUT",
						headers: { authorization: `Bearer ${process.env.cf_token}` },
						body: `<@${evt.author.id}>`,
				})
				.then((x: any) => x.json());
			if (res.success) {
				await ctx.rest.createMessage(evt.channel_id, "ok");
			} else {
				await ctx.rest.createMessage(evt.channel_id, `not ok: ${JSON.stringify(res)}`);
			}
		} else if (content == "+s clearoverride") {
			let res = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${process.env.cf_account}/storage/kv/namespaces/4fd4893d94354dac96da55a68c5df4fc/values/notif`,
				{
						method: "PUT",
						headers: { authorization: `Bearer ${process.env.cf_token}` },
						body: "",
				})
				.then((x: any) => x.json());
			if (res.success) {
				await ctx.rest.createMessage(evt.channel_id, "ok");
			} else {
				await ctx.rest.createMessage(evt.channel_id, `not ok: ${JSON.stringify(res)}`);
			}
		}
	}
}
