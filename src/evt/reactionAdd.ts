import { Context } from "..";

import roles from '../react_roles';

export default async (evt: any, ctx: Context) => {
    const rr = roles[evt.message_id as string];
    if (!rr) return;
    
    const role = rr[evt.emoji.name];
    if (!role) return console.log(`unknown role, mid: ${evt.message_id}, emoji: ${evt.emoji.name}`);

    if (evt.member.roles.includes(role)) return console.log(`user already has role ${role}, skipping...`);
    else console.log(`add role ${role} to user, current roles: ${evt.member.roles}`);

    evt.member.roles.push(role);
    await ctx.rest.editGuildMember(evt.guild_id, evt.user_id, { roles: evt.member.roles });
}
