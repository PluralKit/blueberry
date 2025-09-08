const emojis = {
	title: "Emojis aren't working!",
	description: "Here are a few of the common problems that we see with PluralKit and emojis:",
	fields: [
		{
			name: "1️⃣ Custom (Discord Nitro) emoji aren't displaying in messages!",
			value: "To use Nitro emojis (in proxied messages, or in fields like descriptions), **PluralKit must be in the server the emojis are from.** This is because of a change made by Discord in 2022.\n\nPluralKit must have the \"Use External Emoji\" permission in the server you're proxying in to use emojis. If you're not sure if the permissions are right, you can use `pk;debug permissions` to find out.\n\nBecause PluralKit cannot be a Twitch subscriber, it will never be able to use emojis from Twitch integrations."
		},
		{
			name: "2️⃣ Custom (Discord Nitro) emoji aren't displaying in member names!",
			value: "Discord does not support adding Nitro emojis to webhook names, just like you can't add them to your base account name (or server nickname)."
		},
		{
			name: "3️⃣ Emoji in member names / system tags look strange!",
			value: "Some emojis (eg 🐈‍⬛ 🏳️‍⚧️ 🏴‍☠️ 🏳️‍🌈) are made of two emojis and a joiner character, which Discord doesn't process correctly in names.\n\nOther emojis, such as ☢️, won't display properly in names because they are made of a symbol character (in this example, `☢`), plus a \"variation selector,\" a special character turns the preceding character into an emoji. Discord also doesn't process these correctly in names."
		},
	],
}
const avatar = {
	title: "<:myriad:610137383744176141>  PK pfp won't load?",
	description: "Here are a few possible reasons it could be breaking:",
	fields: [
		{
			name: "1️⃣  *Is Discord lagging, or its CDN acting up again?*",
			value: "Are many previously working pfps not working? Is there a delay for it showing? Check <https://discordstatus.com/> for a current known problem, take a look at the graph. Big spike = big bad. All you can do is wait about 30~60 minutes or so."
		},
		{
			name: "2️⃣  *Was it deleted?*",
			value: "PK pfps will no longer show after a while if you/anyone else deletes the message/channel/server where you set the image.\n\n" +
				"You can double check deletion & CDN issues by clicking on a member's avatar link in `pk;list -wa` /  `pk;list -with-avatar` -- if there's a funky error, Discord no longer has the image and PluralKit can't see it.\n" +
				"(Note: CDN issues usually do not show up on discordstatus.com)"
		},
		{
			name: "3️⃣  *Resize or crop the avatar*",
			value: "Oftentimes, an icon will not load because it is too big. *We recommend a size of 1000x1000 or less.* Prioritize square crops close to the face/focal point.\n\n" +
				"You can set the proxyavatar to this smaller image with `pk;member <name> proxyavatar [link|file upload]` to have the smaller one show as the icon when talking and the bigger one be on the member card.\n" +
				"(Note: do not use the actual <>[] in the command)"
		},
	],
}
const keepproxy =
	"**How to automatically add text to proxied messages**\n" +
	"-Set the message you want as the member's first/only proxy tag (must be first on the list for this to work) (You can clear a member's proxy tags with `pk;m <name> proxy clear`)\n" +
	"-You can then set additional proxy tags to also use that member with `pk;m <name> proxy add <proxy>`\n" +
	"-Turn on KeepProxy for that member (`pk;m <name> keepproxy on`)\n" +
	"-When you manually proxy those proxy tags will be kept. When you use autoproxy your tags will be added to each message"
const banner = "We don't have a recommended size for banners but a 16:9 ratio seems to work best on desktop and a 18:9 ratio seems to work best on mobile"
const rolerestrict = {
	"title": "Is there a way to restrict PluralKit usage to a certain role? / Can I remove PluralKit access for specific users in my server?",
	"description": "PluralKit does not, and *will not*, support restricting usage by role.\n\nThis feature is supported in Tupperbox (an alternative proxying bot) - ask about it in their support server: <https://discord.gg/Z4BHccHhy3>",
	"url": "https://pluralkit.me/faq/#is-there-a-way-to-restrict-pluralkit-usage-to-a-certain-role-can-i-remove-pluralkit-access-for-specific-users-in-my-server",
	"footer": {
		"text": "https://pluralkit.me/faq",
	}
}
const simplyplural = "All syncing between PluralKit and Simply Plural is handled within the SP app - PluralKit staff most likely can not help with any issues regarding Simply Plural. Please ask in their support server instead: https://discord.gg/k5Psmjv7hy"
const recovery = {
	title: "Lost access to your PluralKit system?",
	description: "PluralKit staff can recover your system, and link it to your current Discord account, _but only if you have your system token_. The token (from the `pk;token` command) is like a \"password\" to your PluralKit system.",
	fields: [
		{
			name: "I've got the token for my system, what do I do?",
			value: "Ask in <#1319461648251097288> for a staff member to recover your system - make sure to mention you have the token, but **do not send your token in the channel!** When a staff member is able to help you, they'll ask you to DM them your token.",
		},
		{
			name: "I don't know if I have my token! Where might it be stored?",
			value: "If you are logged into the _[PK Dashboard](<https://dash.pluralkit.me>)_: go to the Settings page of the Dashboard, and scroll to the bottom - there will be a **Recovery** section with a button to show you the token.\n\nIf you sync your PK system with _Simply Plural_: in the SP app, go to Settings, then Integrations - your PluralKit token should be in the PluralKit section there."
		},
		{
			name: "I don't have my token at all, what can I do?",
			value: "We can not accept any \"proof of ownership\" of a PluralKit system _other than a token_. \n\nIf you have any export files saved (from \`pk;export\`) then you can import those on your new account. This will create a new system with the data from that export.\nIf you don't have an export file either, the only thing you can do is query the public information from your old system, and manually copy it to a new system.",
		},
	],
}
const pktotupper =
	"***PK to Tupper Import*** [Do Note Tupper's Current 500 Member Cap for folks new to Tupperbox]\n" +
	"> pk;export\n" +
	"you'll be DM'd a file & ReallyLongFileName.json\n" +
	"*Then*\n" +
	"> tul!import ReallyLongFileName.json\n" +
	"OR\n" +
	"> tul!import [attach the file like you would an image]"
const tuppertopk =
	"***Tupper to PK Import***\n" + "> tul!export\n" + "you'll be DM'd a file & ReallyLongFileName.json\n" + "*Then*\n" + "> pk;import ReallyLongFileName.json\n" + "OR\n" + "> pk;import [attach the file like you would an image]"
const smartquotes =
	'It looks like your proxy tags may have **smart quotes** in them. Smart quotes look like this: “ ”. Normal/straight quotes look like this: " ". The best solution to this is to disable "Smart Punctuation" in your phone\'s settings and reset your proxy tags to use normal quotes using `pk;member <name> proxy <new proxy tag>` (Don\'t include the <>)'
const flags =
	"Flags are optional words/phrases you can add to commands that start with `-`. They must go **before** any freeform search term (ie the time in `pk;sw move` and the search term in `pk;list`) \n" +
	"\n" +
	"You can find the list of flags at https://pluralkit.me/tips"
const slash =
	'Is discord "shaking" your screen when you try to use a pk member with proxy tags like `/text`?\n' +
	"\n" +
	"A recent change by Discord has caused these members to be unusable because Discord thinks you're trying to use a slash command. The only workaround at this time is to change the proxy tags for those members in order to continue using them. There's nothing we can do about this since it's now built into Discord. Sorry!"
const bothelp =
	"Please ask for help with the bot in <#1319461648251097288> and help with the dashboard in <#961622977458360373>"
const bugreport =
	"Hi! Thanks for reporting a bug in <#635146116144431149>. However, you are missing something that is required for us to identify the issue and properly resolve it. Make sure to follow the two following points so we can best help you:\n" +
	"\n" +
	"- please send the error code **as text**, and *not* as a screenshot; to search pluralkit's logs, we need to be able to copy paste the error code.\n" +
	`- Please **do** mention what you were doing at the time (even if it's "I sent a message"), it's very helpful in figuring out what the issue is.`
const shards =
	"PluralKit is in hundreds of thousands of servers, and that's too many servers for one single connection to Discord. So, it makes many separate connections to Discord and puts some servers in each one. Each connection to Discord is called a *shard*, and each group of connections is called a *cluster*.\n" +
	'It is possible that one shard or cluster is malfunctioning or "down". If this happens, PluralKit will be working in certain servers but not in others.'
const messagereport =
	"**Reporting proxied messges to Discord Trust and Safety**\n\n" +
	"Use the standard Discord report form (<https://dis.gd/request> - select Trust and Safety and then the reason for the report). You should provide as much information as possible - including the Discord account ID of the author of the messages, and any message links.\n" +
	"You can see what Discord account sent a proxied message by using the ❓ react, or copying a message link and running `pk;msg <link>` in DMs with PluralKit."
const emojiedit =
	"The `pk;edit` \"workaround\" for using emojis from servers without PluralKit relied on a bug in the emoji permissions checks on Discord's side, which has now been patched. It is **required** for a server to have PluralKit for you to be able to use emojis from that server in your proxied messages.\n\n" +
	"**There is nothing that the PluralKit developers can do about this.** Just like when emoji permissions started to be enforced originally (resulting in this workaround becoming known), **this is entirely the result of a Discord change.**"
const thirdparty =
	"**Unaffiliated resources**\n\n" +
	"Please avoid recommending, or asking for support for, bots/websites/apps that are not created by the PluralKit team. We can't help with them as we do not want to take the responsibility to provide support for something we are not affiliated with.\n" +
	"It is okay to talk about them in the <#912804952953479171> channel, but do not expect the staff (or anyone else) to answer questions about them. Generally, please try asking for support in the relevant server and not here.\n" +
	"\n" +
	"Similarly, do not recommend free image hosting providers outside of the PluralKit CDN. They do not appreciate the traffic generated by avatar hosting and many have blocked us in the past."
const dmproxying =
	"**Proxying in DMs:** " +
	"Unfortunately, Discord DMs do not support webhooks or adding bots, which are required for PluralKit to proxy messages. " +
	"There are some third-party bots that support this (such as [D-Proxy](<https://www.dproxy.me/>) or [/plu/ral](<https://plural.gg/>)), but they are not made by the PluralKit team so we can't provide support for them here."
const cv2 =
	"## Can't see system/member/group cards anymore?\n" +
	"PluralKit now uses Discord's \"Components V2\" for system/member/group cards - if the cards no longer show, your Discord app is too old to show the new components, and you should update it.\n" +
	"A **temporary** workaround to show the old version of the cards exists as the `-show-embed` (or `-se`) flag to `pk;system` / `pk;member` / `pk;group` - however, we will be removing the old embed-based cards in the future (and as such, *we will not add a config option to always use the old cards*).\n\n" +
	"**Please read the announcement post for more details:** <https://pluralkit.me/posts/2025-09-08-components-v2/>";

export const TAGS: Record<string, string | object> = {
	emojis,
	avatar,
	recovery,
	pktotupper,
	tuppertopk,
	keepproxy,
	smartquotes,
	banner,
	flags,
	slash,
	bothelp,
	rolerestrict,
	bugreport,
	thirdparty,
	shards,
	messagereport,
	simplyplural,
	emojiedit,
	dmproxying,
	cv2,
};

export const TAG_ALIASES: Record<string, string> = {
	emoji: 'emojis',
	emote: 'emojis',
	emotes: 'emojis',
	avatars: 'avatar',
	icon: 'avatar',
	icons: 'avatar',
	pfp: 'avatar',
	pfps: 'avatar',
	kp: 'keepproxy',
	banners: 'banner',
	bannerratio: 'banner',
	restrictpk: 'rolerestrict',
	shard: 'shards',
	clusters: 'shards',
	cluster: 'shards',
	sp: 'simplyplural',
	emoteedit: 'emojiedit',
	community: 'thirdparty',
	dmproxy: 'dmproxying',
	proxydm: 'dmproxying',
	components: 'cv2',
	componentsv2: 'cv2',
	card: 'cv2',
	cards: 'cv2',
};
