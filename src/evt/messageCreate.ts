import { Context } from '..';
import config from '../config';
import { inspect } from 'util';

import tags from '../tags';

const isNewAccount = (createdAt: number) => {
	const now = Math.floor((new Date() as unknown as number) / 1000);
	if (createdAt > (now - config.newAccountDuration))
		return true;
}

const token: string = process.env.token!;

let allowChatAccess: boolean = true;

export default async (evt: any, ctx: Context) => {
	if (!evt.content) return;
	if (evt.author.bot) return;
	
	const content: string = evt.content.toLowerCase();

	if (content == "?ping")
	return await ctx.rest.createMessage(evt.channel_id, "meow!");
	
	if (evt.guild_id != config.guild_id) return;

	if (["?tags", "?tag list", "?taglist"].includes(content))
		return await ctx.rest.createMessage(evt.channel_id, {
			content: `available tags: ${Object.keys(tags).join(', ')}`,
			allowedMentions: { parse: [] }
		});

	let tag = tags[content.substring(1) as string];
	if (content && content[0] == "?" && tag && evt.guild_id == config.guild_id)
		return await ctx.rest.createMessage(evt.channel_id, {
				content: (typeof tag === 'string' ? tag : undefined),
				embeds: (typeof tag === 'string' ? undefined : [ tag ]),
				allowedMentions: { parse: [], repliedUser: true },
				messageReference: evt.message_reference ? {
					channelId: evt.channel_id,
					messageId: evt.message_reference.message_id,
				} : undefined,
			});

	if (content == "?rank chat access") {
		if (evt.guild_id != config.guild_id)
			return;

		if (evt.member.roles.includes(config.restrict_role_id)) {
			console.log(evt.author.id, evt.author.name, "lol");
			await ctx.rest.createReaction(evt.channel_id, evt.id, "\u274c");
			return;
		}
		if (isNewAccount(evt.member.createdAtUnix)) {
			await ctx.rest.createMessage(evt.channel_id, {
				content: `\u274c Account too new. Try again in a bit!`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			});
			return;
		}

		if (evt.member.roles.includes(config.chat_role_id)) {
			let roles = evt.member.roles.filter((role: string) => role != config.chat_role_id);
			await ctx.rest.editGuildMember(evt.guild_id, evt.author.id, { roles });
			await ctx.rest.createMessage(evt.channel_id, {
				content: `Removed <@&${config.chat_role_id}> from <@!${evt.author.id}>.`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			});
		} else {
			if (!allowChatAccess) {
				await ctx.rest.createMessage(evt.channel_id, {
					content: `\u274c This command is currently disabled, please try again later.`,
					allowedMentions: { parse: [] },
					messageReference: {
						channelId: evt.channel_id,
						messageId: evt.id,
					},
				});
				return;
			}

			evt.member.roles.push(config.chat_role_id);
			await ctx.rest.editGuildMember(evt.guild_id, evt.author.id, { roles: evt.member.roles });
			await ctx.rest.createMessage(evt.channel_id, {
				content: `Added <@&${config.chat_role_id}> to <@!${evt.author.id}>.`,
				allowedMentions: { parse: [] },
				messageReference: {
					channelId: evt.channel_id,
					messageId: evt.id,
				},
			})
		}
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
}
