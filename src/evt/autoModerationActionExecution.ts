import { Context } from '..';
import config from '../config';

let sorryMessage = (id: string) => `<@${id}>
sorry, discord's automoderation feature doesn't let us allow specific invite links.
below is a copy of your message that included an allowed invite link (you can delete with ❌reaction).
sorry, this isn't able to repost images yet
`;

export default async (evt: any, ctx: Context) => {
	if (evt.action.type != 3) return;
	let split = evt.matched_content.split("/");
	let invite = split[split.length - 1];
	if (config.allowedInvites.includes(invite)) {
	  await ctx.rest.request({
	    body: { communication_disabled_until: null },
	    headers: { 'x-audit-log-reason': 'this invite link is allowed' },
	    route: {
	      method: 'PATCH',
	      path: '/guilds/:guildId/members/:userId',
	      params: { guildId: evt.guild_id, userId: evt.user_id, },
	    }
	  });
		let sentMessage = await ctx.rest.createMessage(evt.channel_id, {
		  content: sorryMessage(evt.user_id),
		  embeds: [{ description: evt.content }],
		});
		await ctx.db.level.put(`replymsg:${sentMessage.id}`, evt.user_id);
		await ctx.rest.createMessage(config.staff_channel, "^ the above message contained an allowed invite link and was reposted");
	}
}
