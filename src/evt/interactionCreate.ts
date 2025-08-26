import { MessageFlags } from "detritus-client/lib/constants";
import { Context } from "..";
import config from "../config";
import * as incidentAPI from "../incidentAPI"
import * as CV2 from "../cv2"

const IS_COMPONENTS_V2 = (1 << 15);

enum InteractionType {
    PING = 1,
    APPLICATION_COMMAND = 2,
    MESSAGE_COMPONENT = 3,
    APPLICATION_COMMAND_AUTOCOMPLETE = 4,
    MODAL_SUBMIT = 5,
}

enum InteractionCallbackType {
    PONG = 1,
    CHANNEL_MESSAGE_WITH_SOURCE = 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
    DEFERRED_UPDATE_MESSAGE = 6,
    UPDATE_MESSAGE = 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT = 8,
    MODAL = 9,
    PREMIUM_REQUIRED = 10,
    LAUNCH_ACTIVITY = 12,
}

enum ComponentType {
    ACTION_ROW = 1,
    BUTTON,
    STRING_SELECT,
    TEXT_INPUT,
    USER_SELECT,
    ROLE_SELECT,
    MENTION_SELECT,
    CHANNEL_SELECT,
    SECTION,
    TEXT_DISPLAY,
    THUMBNAIL,
    MEDIA_GALLERY,
    FILE,
    SEPERATOR,
    CONTAINER = 17,
}

function getValues(components: any[]) {
    let map = new Map<string, string[]>();
    components.forEach(component => {
        component = component.component
        if (component.type == ComponentType.TEXT_INPUT) {
            map.set(component.custom_id, [component.value]);
        } else if (component.type == ComponentType.STRING_SELECT) {
            map.set(component.custom_id, component.values);
        }
    });
    return map
}

async function handleComponentInteraction(evt: any, ctx: Context) {
    const id: string = evt.data.custom_id
    const interaction = ctx.interactions.get(evt.message.id)
    if (!interaction) {
        console.warn("interaction not registered!")
        return
    }
    console.log(evt.data)

    if (id.startsWith("view_incident")) {
        try {
            const incidentID = id.replace("view_incident_", "")
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 6)

            let resp = await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                components: [await incidentAPI.genIncidentCV2(incidentID, (interaction.type == "incidents_admin"))],
                flags: IS_COMPONENTS_V2 | MessageFlags.EPHEMERAL,
            })

            ctx.interactions.set(resp.id, {
                ID: resp.id,
                initiator: evt.member.user.id,
                type: interaction.type,
                timestamp: resp.timestamp
            })
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: "an error occurred!",
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id == "new_incident") {
        if (!evt.member.roles.includes(config.staff_role_id)) {
            return
        }
        try {
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 9, {
                custom_id: "new_incident_modal",
                title: "New Incident",
                components: await incidentAPI.genIncidentModalCV2(),
            })
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("new_update")) {
        if (!evt.member.roles.includes(config.staff_role_id)) {
            return
        }
        const incidentID = id.replace("new_update_", "")
        try {
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 9, {
                custom_id: `new_update_modal_${incidentID}`,
                title: "New Update",
                components: await incidentAPI.genUpdateModalCV2(),
            })
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("edit_incident")) {
        const incidentID = id.replace("edit_incident_", "");
        if (!evt.member.roles.includes(config.staff_role_id)) {
            return;
        }
        try {
            let incident = await incidentAPI.getIncident(incidentID);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 9, {
                custom_id: `edit_incident_modal_${incidentID}`,
                title: "Edit Incident",
                components: await incidentAPI.genIncidentModalCV2({
                    title: incident.name,
                    description: incident.description,
                    status: incident.status,
                    impact: incident.impact
                }),
            });
        }
        catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("edit_update")) {
        const ids = id.replace("edit_update_", "").split("-");
        const incidentID = ids.at(0) || "";
        const updateID = ids.at(1) || "";
        if (!evt.member.roles.includes(config.staff_role_id)) {
            return;
        }
        try {
            let update = await incidentAPI.getUpdate(updateID);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 9, {
                custom_id: `edit_update_modal_${incidentID}-${updateID}`,
                title: "Edit Incident",
                components: await incidentAPI.genUpdateModalCV2({
                    text: update.text,
                    status: update.status
                }),
            });
        }
        catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    }
}

async function handleModalInteraction(evt: any, ctx: Context) {
    const id: string = evt.data.custom_id
    const interaction = ctx.interactions.get(evt.message.id)
    if (!interaction) {
        return
    }

    if (id == "new_incident_modal") {
        try {
            let vals = getValues(evt.data.components);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 6)

            let incident = {
                name: vals.get('title')?.at(0),
                description: vals.get('description')?.at(0),
                status: vals.get('status_select')?.at(0) as incidentAPI.IncidentStatus,
                impact: vals.get('impact_select')?.at(0) as incidentAPI.Impact
            }
            let incidentID = await incidentAPI.createIncident(incident)

            const components = await incidentAPI.genIncidentCV2(incidentID, true);
            let resp = await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                components: [components],
                flags: IS_COMPONENTS_V2 | MessageFlags.EPHEMERAL,
            });
            ctx.interactions.set(resp.id, {
                ID: resp.id,
                initiator: evt.member.user.id,
                type: interaction.type,
                timestamp: resp.timestamp
            })

            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: "created incident!",
                flags: MessageFlags.EPHEMERAL,
            });
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("new_update_modal")) {
        try {
            let incidentID = id.replace("new_update_modal_", "")
            let vals = getValues(evt.data.components);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 6)

            let update = {
                text: vals.get('text')?.at(0),
                status: vals.get('status_select')?.at(0) as incidentAPI.IncidentStatus,
            }
            await incidentAPI.createUpdate(incidentID, update)

            const updated = await incidentAPI.genIncidentCV2(incidentID, true);
            await ctx.rest.editWebhookTokenMessage(evt.application_id, evt.token, evt.message.id, {
                components: [updated],
            });
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: "created update!",
                flags: MessageFlags.EPHEMERAL,
            });
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("edit_incident_modal")) {
        try {
            let incidentID = id.replace("edit_incident_modal_", "")
            let vals = getValues(evt.data.components);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 6);
            let incident = {
                name: vals.get('title')?.at(0),
                description: vals.get('description')?.at(0),
                status: vals.get('status_select')?.at(0) as incidentAPI.IncidentStatus,
                impact: vals.get('impact_select')?.at(0) as incidentAPI.Impact,
            };
            await incidentAPI.editIncident(incidentID, incident);
            const updated = await incidentAPI.genIncidentCV2(incidentID, true);
            await ctx.rest.editWebhookTokenMessage(evt.application_id, evt.token, evt.message.id, {
                components: [updated],
            });
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: "edited incident!",
                flags: MessageFlags.EPHEMERAL,
            });
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    } else if (id.startsWith("edit_update_modal")) {
        try {
            const ids = id.replace("edit_update_modal_", "").split("-");
            const incidentID = ids.at(0) || "";
            const updateID = ids.at(1) || "";
            let vals = getValues(evt.data.components);
            await ctx.rest.createInteractionResponse(evt.id, evt.token, 6);
            let update = {
                text: vals.get('text')?.at(0),
                status: vals.get('status_select')?.at(0) as incidentAPI.IncidentStatus,
            };
            await incidentAPI.editUpdate(updateID, update);

            const updated = await incidentAPI.genIncidentCV2(incidentID, true);
            await ctx.rest.editWebhookTokenMessage(evt.application_id, evt.token, evt.message.id, {
                components: [updated],
            });
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: "edited update!",
                flags: MessageFlags.EPHEMERAL,
            });
        } catch (error: any) {
            await ctx.rest.executeWebhook(evt.application_id, evt.token, {
                content: `an error occurred:\n\`${error.message}\``,
                flags: MessageFlags.EPHEMERAL,
            })
            console.error(error);
        }
    }
}

export default async (evt: any, ctx: Context) => {
    if (evt.guild_id != config.guild_id) return;
    if (evt.application_id != ctx.socket.userId) return;

    try {
        switch (evt.type) {
        case InteractionType.MESSAGE_COMPONENT:
            await handleComponentInteraction(evt, ctx);
            break;
        case InteractionType.MODAL_SUBMIT:
            await handleModalInteraction(evt, ctx);
            break;
        }
    } catch (error) {
        console.error(error);
    }
}