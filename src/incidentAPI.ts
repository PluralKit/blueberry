import { timestamp } from 'detritus-client/lib/utils/markup';
import * as CV2 from "./cv2"
import { MarkupTimestampStyles } from 'detritus-client/lib/constants';

const base_url: string = process.env.incidents_url!;
const incidents_token: string = process.env.incidents_token!;

export enum Impact {
  ImpactNone = "none",
  ImpactMinor = "minor",
  ImpactMajor = "major",
}
export enum IncidentStatus {
  StatusMaintenance = "maintenance",
  StatusInvestigating = "investigating",
  StatusIdentified = "identified",
  StatusMonitoring = "monitoring",
  StatusResolved = "resolved",
}

export interface IncidentUpdate {
  id: string;
  text: string;
  status: string;
  timestamp: Date;
}

export interface IncidentUpdatePatch {
  text: string | undefined;
  status: string | undefined;
}

export interface Incident {
  id: string;
  timestamp: Date;
  status: IncidentStatus;
  impact: Impact;
  components: string;

  name: string;
  description: string;

  last_update: Date;
  resolution_timestamp: Date;

  updates: IncidentUpdate[];
}

export interface IncidentList {
  timestamp: Date;
  incidents: Map<string, Incident>;
}

export interface IncidentPatch {
  name: string | undefined;
  description: string | undefined;
  status: IncidentStatus | undefined;
  impact: Impact | undefined;
}

export async function genIncidentsListCV2(isAdmin: boolean) {
  const incidents = await getActiveIncidents();

  var base: any[] = []
  base.push(new CV2.Container([], { accent_color: 0 }));
  base.at(0)?.components.push(new CV2.TextDisplay("## Active Incidents:\n\n"))
  base.at(0)?.components.push(new CV2.Seperator({ spacing: 2, divider: true }))

  if (incidents.size == 0) {
    base.at(0)?.components.push(new CV2.TextDisplay("there are no active incidents"))
  } else {
    let i = 0
    incidents.forEach((val, key) => {
      base.at(0)?.components.push(new CV2.Section([
        new CV2.TextDisplay(`### ${val.name} \n-# ${timestamp(val.last_update, MarkupTimestampStyles.BOTH_SHORT)} \n\n${val.description}`)
      ], {
        accessory: new CV2.Button({
          custom_id: `view_incident_${val.id}`,
          label: "View",
        })
      }))
      if (i < incidents.size - 1) base.at(0)?.components.push(new CV2.Seperator({ divider: false, spacing: 2 }))
      i++
    });
  }

  if (isAdmin) {
    base.push(new CV2.ActionRow([
      new CV2.Button({
        custom_id: "new_incident",
        label: "New",
      })
    ]))
  }
  return base
}

export async function genIncidentCV2(id: string, isAdmin: boolean) {
  const incident = await getIncident(id);

  let color = 0;
  switch (incident.impact) {
    case Impact.ImpactMinor:
      color = 15907352;
      break;
    case Impact.ImpactMajor:
      color = 15756672;
      break;
  }

  var base = new CV2.Container([], { accent_color: color });
  base.components.push(new CV2.Section([
    new CV2.TextDisplay(`## Incident: ${incident.name}\n**Status:** *${incident.status}*\n**Impact:** *${incident.impact}*`)
  ],
    {
      accessory: new CV2.Button({
        label: "View on status page",
        style: CV2.ButtonStyle.Link,
        url: "https://status.pluralkit.me/",
      })
    }))
  base.components.push(new CV2.Seperator({ divider: false }))
  base.components.push(new CV2.TextDisplay(`${incident.description}`))
  if (incident.updates.length > 0) base.components.push(new CV2.Seperator({ spacing: 2, divider: true }));

  incident.updates.forEach((val, key) => {
    var status = ""
    if (val.status) {
      status = val.status.charAt(0).toUpperCase() + val.status.slice(1)
      status += " - "
    }
    if (isAdmin) {
      base.components.push(new CV2.Section([
        new CV2.TextDisplay(`### ${status}${timestamp(val.timestamp, MarkupTimestampStyles.TIME_SHORT)} \n${val.text} \n`)],
        {
          accessory: new CV2.Button({
            custom_id: `edit_update_${id}-${val.id}`,
            style: CV2.ButtonStyle.Secondary,
            label: "Edit",
          })
        }))
    } else {
      base.components.push(new CV2.TextDisplay(`### ${status}${timestamp(val.timestamp, MarkupTimestampStyles.TIME_SHORT)} \n${val.text} \n`))
    }
    if (key < incident.updates.length - 1) base.components.push(new CV2.Seperator({ spacing: 2, divider: false }))
  })
  if (isAdmin) {
    base.components.push(new CV2.Seperator({ spacing: 2, divider: true }))
    base.components.push(new CV2.ActionRow([
      new CV2.Button({
        custom_id: `new_update_${incident.id}`,
        label: "New Update"
      }),
      new CV2.Button({
        custom_id: `edit_incident_${incident.id}`,
        label: "Edit",
        style: CV2.ButtonStyle.Secondary
      })
    ]))
  }
  return base
}

export async function genIncidentModalCV2(data?: {title: string, description: string, status: string, impact: string}) {
  var base = [
    new CV2.Label("Title", new CV2.TextInput("title", CV2.TextInputStyle.Short, {required: (!data), value: data?.title})),
    new CV2.Label("Description", new CV2.TextInput("description", CV2.TextInputStyle.Paragraph, {required: (!data), value: data?.description})),
    new CV2.Label("Status", new CV2.StringSelect("status_select", [
      { label: "Maintenance", value: "maintenance", emoji: { name: "🔧" }, default: (data?.status == "maintenance")},
      { label: "Investigating", value: "investigating", emoji: { name: "❓" }, default: (data?.status == "investigating") },
      { label: "Identified", value: "identified", emoji: { name: "🔍" }, default: (data?.status == "identified") },
      { label: "Monitoring", value: "monitoring", emoji: { name: "👁️" }, default: (data?.status == "monitoring") },
      { label: "Resolved", value: "resolved", emoji: { name: "✅" }, default: (data?.status == "resolved") },
    ], { required: (!data) })),
    new CV2.Label("Impact", new CV2.StringSelect("impact_select", [
      { label: "None", value: "none", emoji: { name: "✅" }, default: (data?.impact == "none") },
      { label: "Minor", value: "minor", emoji: { name: "‼️" }, default: (data?.impact == "minor") },
      { label: "Major", value: "major", emoji: { name: "💥" }, default: (data?.impact == "major") },
    ], { required: (!data) }))
  ];
  return base
}

export async function genUpdateModalCV2(data?: {text: string, status: string}) {
  var base = [
    new CV2.Label("Text", new CV2.TextInput("text", CV2.TextInputStyle.Paragraph, {required: (!data), value: data?.text})),
    new CV2.Label("Status", new CV2.StringSelect("status_select", [
      { label: "Maintenance", value: "maintenance", emoji: { name: "🔧" }, default: (data?.status == "maintenance") },
      { label: "Investigating", value: "investigating", emoji: { name: "❓" }, default: (data?.status == "investigating") },
      { label: "Identified", value: "identified", emoji: { name: "🔍" }, default: (data?.status == "identified") },
      { label: "Monitoring", value: "monitoring", emoji: { name: "👁️" }, default: (data?.status == "monitoring") },
      { label: "Resolved", value: "resolved", emoji: { name: "✅" }, default: (data?.status == "resolved") },
    ], { required: (!data) }))
  ];
  return base
}

/**
 * gets the currently active incidents
 *
 * @returns a map of active incidents
 */
export async function getActiveIncidents() {
  const response = await fetch(`${base_url}/api/v1/incidents/active`);
  const data = (await response.json()) as IncidentList;
  const entries = Object.entries(data.incidents).map(
    ([id, incidentData]: [string, any]) => {
      const incident: Incident = {
        ...incidentData,
        timestamp: new Date(incidentData.timestamp),
        last_update: new Date(incidentData.last_update),
        resolution_timestamp: incidentData.resolution_timestamp
          ? new Date(incidentData.resolution_timestamp)
          : null,
        updates: (incidentData.updates || []).map((update: any) => ({
          ...update,
          timestamp: new Date(update.timestamp),
        })),
      };
      return [id, incident] as [string, Incident];
    },
  );
  let incidents = new Map<string, Incident>(entries);
  return incidents;
}

/**
 * gets a specified incident by id
 *
 * @param id - the id of the incident to retrieve
 * @returns the specified incident as an Incident
 */
export async function getIncident(id: string): Promise<Incident> {
  const response = await fetch(`${base_url}/api/v1/incidents/${id}`);
  if (!response.ok) {
    const data = await response.text();
    throw new Error(`response ${response.status}: ${data}`);
  }
  const data = (await response.json()) as Incident;
  return {
    ...data,
    timestamp: new Date(data.timestamp),
    last_update: new Date(data.last_update),
    resolution_timestamp: data.resolution_timestamp
      ? new Date(data.resolution_timestamp)
      : null,
    updates: data.updates
      ? data.updates.map((update: any) => ({
        ...update,
        timestamp: new Date(update.timestamp),
      }))
      : [],
  } as Incident;
}

/**
 * gets a specified incident update by id
 *
 * @param id - the id of the incident update to retrieve
 * @returns the specified incident update as an IncidentUpdate
 */
export async function getUpdate(id: string): Promise<IncidentUpdate> {
  const response = await fetch(`${base_url}/api/v1/updates/${id}`);
  if (!response.ok) {
    const data = await response.text();
    throw new Error(`response ${response.status}: ${data}`);
  }
  const data = (await response.json()) as IncidentUpdate;
  return {
    ...data,
    timestamp: new Date(data.timestamp),
  } as IncidentUpdate;
}

/**
 * creates a new incident
 *
 * @param incident - the incident to create, in IncidentPatch format
 * @returns the id of the newly created incident
 */
export async function createIncident(incident: IncidentPatch): Promise<string> {
  const response = await fetch(`${base_url}/api/v1/admin/incidents/create`, {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${incidents_token}`,
    }),
    body: JSON.stringify(incident),
  });
  const data = await response.text();
  if (!response.ok) {
    throw new Error(`response ${response.status}: ${data}`);
  }
  return data;
}

/**
 * edits a preexisting incident by id
 *
 * @param id - the id of the incident to edit
 * @param patch - the information to edit/patch, in IncidentPatch format
 */
export async function editIncident(id: string, patch: IncidentPatch) {
  const response = await fetch(`${base_url}/api/v1/admin/incidents/${id}`, {
    method: "PATCH",
    headers: new Headers({
      Authorization: `Bearer ${incidents_token}`,
    }),
    body: JSON.stringify(patch),
  });
  const data = await response.text();
  if (!response.ok) {
    throw new Error(`response ${response.status}: ${data}`);
  }
}

/**
 * creates a new incident update
 *
 * @param update - the update to create, in IncidentUpdate format
 * @returns the id of the newly created update
 */
export async function createUpdate(
  incidentID: string,
  update: IncidentUpdatePatch,
): Promise<string> {
  const response = await fetch(
    `${base_url}/api/v1/admin/incidents/${incidentID}/update`,
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${incidents_token}`,
      }),
      body: JSON.stringify(update),
    },
  );
  const data = await response.text();
  if (!response.ok) {
    throw new Error(`response ${response.status}: ${data}`);
  }
  return data;
}

/**
 * edit a preexisting incident update
 *
 * @param updateID - id of the incident update to edit
 * @param text - the updated body text to use
 */
export async function editUpdate(updateID: string, update: IncidentUpdatePatch) {
  const response = await fetch(`${base_url}/api/v1/admin/updates/${updateID}`, {
    method: "PATCH",
    headers: new Headers({
      Authorization: `Bearer ${incidents_token}`,
    }),
    body: JSON.stringify(update),
  });
  const data = await response.text();
  if (!response.ok) {
    throw new Error(`response ${response.status}: ${data}`);
  }
}
