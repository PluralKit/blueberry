export interface Component {
    type: number;
    id?: number;
}

export interface PartialEmoji {
    id?: BigInt;
    name: string;
}

export class ActionRow implements Component {
    readonly type: number = 1;
    id?: number;
    components: Component[] = [];

    constructor(components: Component[], data?: {
        id?: number;
    }) {
        if(data){
            Object.assign(this, data);
        }
        this.components = components;
    }
}

export class Button implements Component {
    readonly type: number = 2;
    id?: number;
    style: ButtonStyle = ButtonStyle.Primary;
    label?: string;
    emoji?: PartialEmoji;
    custom_id?: string;
    sku_id?: BigInt;
    url?: string;
    disabled?: boolean;

    constructor(data?: {
        custom_id?: string;
        style?: ButtonStyle;
        label?: string;
        emoji?: PartialEmoji;
        url?: string;
        disabled?: boolean;
        sku_id?: BigInt;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export enum ButtonStyle {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
    Premium = 6,
}

export class StringSelect implements Component {
    readonly type: number = 3;
    id?: number;
    custom_id: string = "";
    options: SelectOption[] = [];
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
    required?: boolean;

    constructor(custom_id: string, options: SelectOption[], data?: {
        placeholder?: string;
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
        required?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
        this.options = options;
    }
}

export interface SelectOption {
    label: string;
    value: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
}

export class TextInput implements Component {
    readonly type: number = 4;
    id?: number;
    custom_id: string = "";
    style: TextInputStyle = TextInputStyle.Short;
    label?: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;

    constructor(custom_id: string, style: TextInputStyle, data?: {
        min_length?: number;
        max_length?: number;
        required?: boolean;
        value?: string;
        placeholder?: string;
        id?: number;
        label?: string;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
        this.style = style;
    }
}

export enum TextInputStyle {
    Short = 1,
    Paragraph = 2,
}

export class UserSelect implements Component {
    readonly type: number = 5;
    id?: number;
    custom_id: string = "";
    placeholder?: string;
    default_values?: SelectDefaultValue[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;

    constructor(custom_id: string, data?: {
        placeholder?: string;
        default_values?: SelectDefaultValue[];
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
    }
}

export interface SelectDefaultValue {
    id: BigInt;
    type: string;
}

export class RoleSelect implements Component {
    readonly type: number = 6;
    id?: number;
    custom_id: string = "";
    placeholder?: string;
    default_values?: SelectDefaultValue[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;

    constructor(custom_id: string, data?: {
        placeholder?: string;
        default_values?: SelectDefaultValue[];
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
    }
}

export class MentionableSelect implements Component {
    readonly type: number = 7;
    id?: number;
    custom_id: string = "";
    placeholder?: string;
    default_values?: SelectDefaultValue[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;

    constructor(custom_id: string, data?: {
        placeholder?: string;
        default_values?: SelectDefaultValue[];
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
    }
}

export class ChannelSelect implements Component {
    readonly type: number = 8;
    id?: number;
    custom_id: string = "";
    channel_types?: ChannelType[];
    placeholder?: string;
    default_values?: SelectDefaultValue[];
    min_values?: number;
    max_values?: number;
    disabled?: boolean;

    constructor(custom_id: string, data?: {
        channel_types?: ChannelType[];
        placeholder?: string;
        default_values?: SelectDefaultValue[];
        min_values?: number;
        max_values?: number;
        disabled?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.custom_id = custom_id;
    }
}

export enum ChannelType {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_ANNOUNCEMENT = 5,
    ANNOUNCEMENT_THREAD = 10,
    PUBLIC_THREAD = 11,
    PRIVATE_THREAD = 12,
    GUILD_STAGE_VOICE = 13,
    GUILD_DIRECTORY = 14,
    GUILD_FORUM = 15,
    GUILD_MEDIA = 16,
}

export class Section implements Component {
    readonly type: number = 9;
    id?: number;
    components: Component[] = [];
    accessory?: Thumbnail | Button;

    constructor(components: Component[], data?: {
        accessory?: Thumbnail | Button;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.components = components;
    }
}

export class TextDisplay implements Component {
    readonly type: number = 10;
    id?: number;
    content: string = "";

    constructor(content: string, id?: number) {
        this.content = content;
        this.id = id;
    }
}

export class Thumbnail implements Component {
    readonly type: number = 11;
    id?: number;
    media: UnfurledMedia = { url: "" };
    description?: string;
    spoiler?: boolean;

    constructor(media: UnfurledMedia, data?: {
        description?: string;
        spoiler?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.media = media;
    }
}

export interface UnfurledMedia {
    url: string;
    readonly proxy_url?: string;
    readonly height?: number;
    readonly width?: number;
    readonly content_type?: string;
    readonly attachment_id?: BigInt;
}

export class MediaGallery implements Component {
    readonly type: number = 12;
    id?: number;
    items: MediaGalleryItem[] = [];

    constructor(items: MediaGalleryItem[], id?: number) {
        this.items = items;
        this.id = id;
    }
}

export interface MediaGalleryItem {
    media: UnfurledMedia;
    description?: string;
    spoiler?: boolean;
}

export class File implements Component {
    readonly type: number = 13;
    id?: number;
    file: UnfurledMedia = { url: "" };
    spoiler?: boolean;
    readonly name: string = "";
    readonly size: number = 0;

    constructor(file: UnfurledMedia, data?: {
        spoiler?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.file = file;
    }
}

export class Seperator implements Component {
    readonly type: number = 14;
    id?: number;
    divider?: boolean;
    spacing?: number;

    constructor(data?: {
        divider?: boolean;
        spacing?: number;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class Container implements Component {
    readonly type: number = 17;
    id?: number;
    components: Component[] = [];
    accent_color?: number;
    spoiler?: boolean;

    constructor(components: Component[], data?: {
        accent_color?: number;
        spoiler?: boolean;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.components = components;
    }
}

export class Label implements Component {
    readonly type: number = 18;
    id?: number;
    label: string;
    description?: string
    component: Component;

    constructor(label: string, component: Component, data?: {
        description?: string;
        id?: number;
    }) {
        if (data) {
            Object.assign(this, data);
        }
        this.label = label;
        this.component = component;
    }
}