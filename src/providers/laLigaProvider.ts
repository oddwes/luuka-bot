import { Provider } from "@elizaos/core";
import fetch from "node-fetch";

interface LaLigaEvent {
    strEvent: string;
    strTimestamp: string;
    strVenue: string;
}

async function getUpcomingLaLigaGames() {
    const response = await fetch("https://www.thesportsdb.com/api/v1/json/977294/eventsnextleague.php?id=4335");
    const data = await response.json() as { events: LaLigaEvent[] };

    const formattedEvents = data.events
        .sort((a: LaLigaEvent, b: LaLigaEvent) => {
            return new Date(a.strTimestamp).getTime() - new Date(b.strTimestamp).getTime();
        })
        .map((event: LaLigaEvent) => {
            const date = event.strTimestamp + 'UTC';
            const venue = event.strVenue;
            return `${event.strEvent} ${venue ? `at ${venue}` : ''} on ${date}`;
        });

    const output = `LaLiga Schedule:\n${formattedEvents.join('\n')}`;
    return output;
}

export const laLigaProvider: Provider = {
    get: async () => {
        return await getUpcomingLaLigaGames();
    },
};