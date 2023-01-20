export default {
	emojis: {
		title: "Emojis aren't working!",
		description: "Here are a few of the common problems that we see with PluralKit and emojis:",
		fields: [
			{
				name: "Custom (Discord Nitro) emoji aren't displaying!",
				value: "To use Nitro emojis (in proxied messages, or in descriptions), **PluralKit must be in the server the emojis are from.** This is because of a change made by Discord in 2022.\n\nFor proxied messages, PluralKit must have the \"Use External Emoji\" permission in the server you're proxying in. If you're not sure if the permissions are right, you can use \`pk;debug permissions\` to find out."
			},
			{
				name: "Emoji in member names / system tags look strange!",
				value: "Some emojis (eg 🐈‍⬛ 🏳️‍⚧️ 🏴‍☠️ 🏳️‍🌈) are made of two emojis and a joiner character, which Discord doesn't process correctly in names.\n\nOther emojis, such as ☢️, won't display properly in names because they are made of a symbol character (in this example, ☢), plus a \"variation selector,\" a special character turns the preceding character into an emoji. Discord also doesn't process these correctly in names."
			},
		],
	},
  	avatar:
		"> <:myriad:610137383744176141>  PK pfp won't load?\n" +
		"\n" +
		"> 1️⃣  *Is Discord lagging, or its CDN acting up again?*\n" +
		"> Are many, previously working pfps not working? Is there a delay for it showing? Check <https://discordstatus.com/> for a current known problem, take a look at the graph. Big spike = big bad. All you can do is wait about 30~60 minutes or so.\n" +
		"\n" +
		"> 2️⃣  *Was it deleted?*\n" +
		"> PK pfps will no longer show after a while if you/anyone else deletes the message/channel/server where you set the image . \n" +
		"\n" +
		"> You can double check deletion & CDN issues by clicking on a member's avatar link in `pk;list -wa` /  `pk;list -with-avatar` -- if there's a funky error, Discord no longer has the image and PluralKit can't see it.\n" +
		"> (Note: CDN issues usually do not show up on discordstatus.com\n" +
		"\n" +
		"> 3️⃣  *Resize or crop the avatar*\n" +
		"> Oftentimes, an icon will not load because it is too big. *We recommend a size of 1000x1000 or less.* Prioritize square crops close to the face/focal point.",
  	recovery:
		"__**Possible routes to recover a lost pk system**__\n" +
		"\n" +
		"- **If you have your `pk;token` saved you can dm it to alyssa or Astrid** (the Developers, at the top of the sidebar) and ask them to link it to your current account. If you use Simply Plural, it's likely this is saved in the Integrations section. \n" +
		"- **If you have export files saved you can import them with `pk;import`**. \n" +
		"- **If your information was public you can perform public queries on it and manually copy information.** You can do public queries with your old account id to target your old system and your old member ids to target your old members. \n" +
		"\n" +
		"\n" +
		"**__For the future__**\n" +
		"\n" +
		"- **Make an alt account and use `pk;link` to attach your system to it.** If you need to switch to that account your system's already linked to it!\n" +
		"- **Run `pk;token` and save what it gives you in a safe place.** Think of this as your password to get your pk system back. (Make sure to resave it if you refresh it!)\n" +
		"- **Run frequent exports and save those files in a safe place.** Exports give you a copy of your current system that you can reimport later. Keep in mind exports do not autoupdate, so if you update your pk you should make a new one. They also do not preserve ids, creation dates, or message counts.",
  	pktotupper:
		"***PK to Tupper Import*** [Do Note Tupper's Current 500 Member Cap for folks new to Tupperbox]\n" +
		"> pk;export\n" +
		"you'll be DM'd a file & ReallyLongFileName.json\n" +
		"*Then*\n" +
		"> tul!import ReallyLongFileName.json\n" +
		"OR\n" +
		"> tul!import [attach the file like you would an image]",
	tuppertopk:
		"***Tupper to PK Import***\n" + "> tul!export\n" + "you'll be DM'd a file & ReallyLongFileName.json\n" + "*Then*\n" + "> pk;import ReallyLongFileName.json\n" + "OR\n" + "> pk;import [attach the file like you would an image]",
	keepproxy:
		"**How to automatically add text to proxied messages**\n" +
		"-Set the message you want as the member's first/only proxy tag (must be first on the list for this to work) (You can clear a member's proxy tags with `pk;m <name> proxy clear`)\n" +
		"-You can then set additional proxy tags to also use that member with `pk;m <name> proxy add <proxy>`\n" +
		"-Turn on KeepProxy for that member (`pk;m <name> keepproxy on`)\n" +
		"-When you manually proxy those proxy tags will be kept. When you use autoproxy your tags will be added to each message",
	smartquotes:
		'It looks like your proxy tags may have **smart quotes** in them. Smart quotes look like this: “ ”. Normal/straight quotes look like this: " ". The best solution to this is to disable "Smart Punctuation" in your phone\'s settings and reset your proxy tags to use normal quotes using `pk;member <name> proxy <new proxy tag>` (Don\'t include the <>)',
	banner:
		"We don't have a recommended size for banners but a 16:9 ratio seems to work best on desktop and a 18:9 ratio seems to work best on mobile",
	flags:
		"Flags are optional words/phrases you can add to commands that start with `-`. They must go **before** any freeform search term (ie the time in `pk;sw move` and the search term in `pk;list`) \n" +
		"\n" +
		"You can find the list of flags at https://pluralkit.me/tips",
  	slash:
		'Is discord "shaking" your screen when you try to use a pk member with proxy tags like `/text`?\n' +
		"\n" +
		"A recent change by Discord has caused these members to be unusable because Discord thinks you're trying to use a slash command. The only workaround at this time is to change the proxy tags for those members in order to continue using them. There's nothing we can do about this since it's now built into Discord. Sorry!",
  	bothelp:
  		"Please ask for help with the bot in <#667795132971614229> and help with the dashboard in <#961622977458360373>",
  	restrictpk: {
		"title": "Is there a way to restrict PluralKit usage to a certain role? / Can I remove PluralKit access for specific users in my server?",
		"description": "This is not a feature currently available in PluralKit. It may be added in the future.\\nIn the meantime, this feature is supported in Tupperbox (an alternative proxying bot) - ask about it in their support server: <https://discord.gg/Z4BHccHhy3>",
		"url":"https://pluralkit.me/faq/#is-there-a-way-to-restrict-pluralkit-usage-to-a-certain-role-can-i-remove-pluralkit-access-for-specific-users-in-my-server",
		"footer": {
			"text": "https://pluralkit.me/faq",
		}
	},
	bugreport:
		"Hi! Thanks for reporting a bug in <#635146116144431149>. However, you are missing something that is required for us to identify the issue and properly resolve it. Make sure to follow the two following points so we can best help you:\n" +
		"\n" +
		"- please send the error code **as text**, and *not* as a screenshot; to search pluralkit's logs, we need to be able to copy paste the error code.\n" +
		`- Please **do** mention what you were doing at the time (even if it's "I sent a message"), it's very helpful in figuring out what the issue is.`,
	community:
		"Please ask about community-made resources in <#912804952953479171> (it may be helpful to @mention the creator!)",
	shards:
		"PluralKit is in hundreds of thousands of servers, and that's too many servers for one single connection to Discord. So, it makes many separate connections to Discord and puts some servers in each one. Each connection to Discord is called a *shard*.\n" +
		'It is possible that one shard is malfunctioning or "down". If this happens, PluralKit will be working in certain servers but not in others.',
} as Record<string, string | object>;
