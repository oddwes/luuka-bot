import { Provider } from "@elizaos/core";
import { Scraper } from "agent-twitter-client";
import { Cookie } from "tough-cookie";

// Memoize cookies in memory
let memoizedCookies: Cookie[] | null = null;

async function initializeScraper(): Promise<Scraper> {
    const scraper = new Scraper();

    // Try using memoized cookies first
    if (memoizedCookies) {
        try {
            await scraper.setCookies(memoizedCookies);
            if (await scraper.isLoggedIn()) {
                console.log("Successfully authenticated with memoized cookies");
                return scraper;
            }
        } catch (error) {
            console.warn("Memoized cookies are invalid, attempting fresh login");
            memoizedCookies = null;
        }
    }

    // Verify credentials
    const username = process.env.TWITTER_USERNAME;
    const password = process.env.TWITTER_PASSWORD;
    const email = process.env.TWITTER_EMAIL;

    if (!username || !password || !email) {
        throw new Error("Missing required Twitter credentials");
    }

    // Attempt login
    await scraper.login(username, password, email);
    const isLoggedIn = await scraper.isLoggedIn();

    if (!isLoggedIn) {
        throw new Error("Failed to authenticate with Twitter");
    }

    // Memoize new cookies
    memoizedCookies = await scraper.getCookies();
    console.log("Successfully authenticated with Twitter");

    return scraper;
}

async function getLatestTweets() {
    try {
        const scraper = await initializeScraper();
        const target = "devnhair";
        const maxTweets = 5;
        const tweets: string[] = [];

        for await (const tweet of scraper.getTweets(target, maxTweets)) {
            tweets.push(tweet.text);

            if (tweets.length >= maxTweets) break;
        }

        const formattedTweets = tweets
            .join('\n');

        return `Latest tweets from @${target}:\n${formattedTweets}`;
    } catch (error) {
        return `Error fetching tweets: ${error.message}`;
    }
}

export const tweetsProvider: Provider = {
    get: async () => {
        return await getLatestTweets();
    },
};