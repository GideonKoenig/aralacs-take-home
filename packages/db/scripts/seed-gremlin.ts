import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { initializeGremlin } from "../src/gremlin.js";
import gremlin from "gremlin";
import { envDb } from "../src/env.js";
const { process: gprocess } = gremlin;
const { statics: __ } = gprocess;

type SeedArguments = {
    peopleMin: number;
    peopleMax: number;
    accountsMin: number;
    accountsMax: number;
    friendsPercent: number;
    reset: boolean;
};

const DEFAULTS: SeedArguments = {
    peopleMin: 10,
    peopleMax: 50,
    accountsMin: 1,
    accountsMax: 5,
    friendsPercent: 10,
    reset: false,
};

async function main() {
    if (process.argv.includes("--help")) {
        console.log(
            "Usage: yarn db:seed:gremlin [--people N|--people-min A --people-max B] [--accounts-min A --accounts-max B] [--friends-percent P] [--reset]",
        );
        process.exit(0);
    }

    const args = parseArgs(process.argv.slice(2));
    const gremlin = await initializeGremlin(envDb);
    const g = gremlin.g;

    const hasAny = (await g.V().limit(1).toList()).length > 0;
    if (args.reset) {
        await g.V().drop().iterate();
    } else if (hasAny) {
        const rl = createInterface({ input: stdin, output: stdout });
        const response = await rl.question(
            "Graph already contains data. [c]lear / [a]bort / [k]eep? ",
        );
        const answer = response.trim().toLowerCase();
        rl.close();
        if (answer === "a" || answer === "abort") {
            await gremlin.close();
            process.exit(0);
        } else if (answer === "c" || answer === "clear") {
            await g.V().drop().iterate();
        }
    }

    const peopleCount = randomInt(args.peopleMin, args.peopleMax);
    const people: {
        id: number;
        name: string;
        email: string;
    }[] = [];

    for (let i = 0; i < peopleCount; i++) {
        const id = generateNumericId(i);
        const name = generateName();
        const email = generateEmail(name);
        await g
            .addV("person")
            .property(gprocess.t.id, id)
            .property("name", name)
            .property("email", email)
            .next();
        people.push({ id, name, email });
    }

    let totalAccounts = 0;
    for (const person of people) {
        const accountCount = randomInt(args.accountsMin, args.accountsMax);
        for (let i = 0; i < accountCount; i++) {
            const iban = generateIban();
            const balanceCents = generateBalanceCents();
            const created = await g
                .addV("bankaccount")
                .property("personId", person.id)
                .property("iban", iban)
                .property("balanceCents", balanceCents)
                .next();
            const accountVertexId = (created.value as { id: number }).id;
            await g
                .V(person.id)
                .addE("has_bankaccount")
                .to(__.V(accountVertexId))
                .next();
            totalAccounts++;
        }
    }

    let totalFriendships = 0;
    const n = people.length;
    const pairs: [number, number][] = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairs.push([people[i]!.id, people[j]!.id]);
        }
    }
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        const tmp = pairs[i];
        pairs[i] = pairs[j]!;
        pairs[j] = tmp!;
    }
    const possiblePairs = pairs.length;
    const percent = Math.max(0, Math.min(100, args.friendsPercent));
    const targetPairs = Math.min(
        possiblePairs,
        Math.floor((possiblePairs * percent) / 100),
    );
    const selection = pairs.slice(0, targetPairs);
    for (const [aId, bId] of selection) {
        await g.V(aId).addE("has_friend").to(__.V(bId)).next();
        await g.V(bId).addE("has_friend").to(__.V(aId)).next();
        totalFriendships += 1;
    }

    console.log(
        `Created ${people.length} people, ${totalAccounts} accounts, and ${totalFriendships} friendships`,
    );

    await gremlin.close();
}

function parseArgs(argv: string[]): SeedArguments {
    const argMap = new Map<string, string | boolean>();
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i] ?? "";
        if (!arg.startsWith("--")) continue;
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("--")) {
            argMap.set(key, next);
            i++;
        } else {
            argMap.set(key, true);
        }
    }

    const num = (k: string, fallback: number) => {
        const v = argMap.get(k);
        if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            if (Number.isFinite(n)) return n;
        }
        return fallback;
    };

    const sameNumber = (k: string | undefined) => {
        if (!k) return undefined;
        const v = argMap.get(k);
        if (typeof v === "string") {
            const n = Number(v);
            if (Number.isFinite(n)) return n;
        }
        return undefined;
    };

    const peopleExact = sameNumber("people");

    const peopleMin = peopleExact ?? num("people-min", DEFAULTS.peopleMin);
    const peopleMax = peopleExact ?? num("people-max", DEFAULTS.peopleMax);
    const accountsMin = num("accounts-min", DEFAULTS.accountsMin);
    const accountsMax = num("accounts-max", DEFAULTS.accountsMax);
    const friendsPercent = Math.max(
        0,
        Math.min(100, num("friends-percent", DEFAULTS.friendsPercent)),
    );
    const reset = argMap.has("reset")
        ? Boolean(argMap.get("reset"))
        : DEFAULTS.reset;

    if (peopleMin < 1 || peopleMax < peopleMin) {
        throw new Error("Invalid people range");
    }
    if (accountsMin < 1 || accountsMax < accountsMin) {
        throw new Error("Invalid accounts range");
    }

    return {
        peopleMin,
        peopleMax,
        accountsMin,
        accountsMax,
        friendsPercent,
        reset,
    };
}

function randomInt(min: number, max: number) {
    const r = Math.random();
    return Math.floor(r * (max - min + 1)) + min;
}

function generateNumericId(seed: number) {
    return seed;
}

function generateName() {
    const first = [
        "Alex",
        "Sam",
        "Taylor",
        "Jordan",
        "Casey",
        "Riley",
        "Jamie",
        "Avery",
        "Charlie",
        "Drew",
        "Emery",
        "Hayden",
        "Jesse",
        "Kai",
        "Logan",
        "Morgan",
        "Payton",
        "Quinn",
        "Reese",
        "Rowan",
    ];
    const last = [
        "Miller",
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Davis",
        "Rodriguez",
        "Martinez",
        "Hernandez",
        "Lopez",
        "Gonzalez",
        "Wilson",
        "Anderson",
        "Thomas",
        "Taylor",
        "Moore",
        "Jackson",
        "Martin",
    ];
    const f = first[Math.floor(Math.random() * first.length)]!;
    const l = last[Math.floor(Math.random() * last.length)]!;
    return `${f} ${l}`;
}

function generateEmail(name: string) {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.|\.$/g, "");
    const num = randomInt(10, 9999);
    const domains = ["example.com", "mail.com", "test.io", "sample.org"];
    const domain = domains[Math.floor(Math.random() * domains.length)]!;
    return `${slug}.${num}@${domain}`;
}

function generateIban() {
    const country = ["DE", "NL", "FR", "ES", "IT"][
        Math.floor(Math.random() * 5)
    ]!;
    const check = randomInt(10, 97).toString().padStart(2, "0");
    const bban = Array.from({ length: 18 }, () => randomInt(0, 9)).join("");
    return `${country}${check}${bban}`;
}

function generateBalanceCents() {
    return randomInt(0, 10_000_000);
}

main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
});
