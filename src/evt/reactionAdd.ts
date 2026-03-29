import { Context } from "..";
import config from '../config';

import roles from '../react_roles';
import { User } from "detritus-client/lib/structures";

export default async (evt: any, ctx: Context) => {
    if (evt.emoji.name == "❌") {
        let replymsg = await ctx.db.level.get(`replymsg:${evt.message_id}`);
        if (replymsg == evt.user_id) {
            await ctx.rest.deleteMessage(evt.channel_id, evt.message_id);
        }
    }

    if (evt.emoji.name == "✅" && evt.channel_id == config.recovery_requests_channel) {
        if(evt.message_author_id == ctx.socket.userId || !evt.member.roles.includes(config.staff_role_id)) {
            ctx.rest.deleteReaction(evt.channel_id, evt.message_id, evt.emoji.name, evt.user_id);
            return;
        };

        let key = `_recoveryRequestThread:${evt.message_author_id}`;
        let ids: any = await ctx.db.maybeGetString(key);
        if (!ids) return;

        ids = ids.split(":");
        let requestMsg = ids[0];
        let thread = ids[1];
        let threadMsg = ids[2];
        
        setTimeout(async () => {
            let reaction: User[] = await ctx.rest.fetchReactions(evt.channel_id, evt.message_id, "✅");
            if (reaction.length > 0) {
                if(!reaction.find((u: User) => u.id == evt.user_id)) return;
                await ctx.db.level.del(key);
                await ctx.rest.deleteChannel(thread);
                await ctx.rest.deleteMessage(config.recovery_requests_channel, threadMsg);
            }
        }, 10 * 1000 /* 10 seconds */);
    }

    const rr = roles[evt.message_id as string];
    if (!rr) return;
    
    const role = rr[evt.emoji.name];
    if (!role) return console.log(`unknown role, mid: ${evt.message_id}, emoji: ${evt.emoji.name}`);

    if (evt.member.roles.includes(role)) return console.log(`user already has role ${role}, skipping...`);
    else console.log(`add role ${role} to user, current roles: ${evt.member.roles}`);

    evt.member.roles.push(role);
    await ctx.rest.editGuildMember(evt.guild_id, evt.user_id, { roles: evt.member.roles });
}
