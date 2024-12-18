import { cache } from '../utils/cache.mjs';
import fs from 'fs';
import 'dotenv/config';

class Node {
    constructor(shortURL, longURL, score) {
        this.shortURL = shortURL;
        this.longURL = longURL;
        this.score = score;
        this.next = null;
    }
}

class Leaderboard {
    constructor() {
        this.head = null;
        this.size = 0;
        this.maxSize = 100;
    }

    insert(shortURL, longURL, score) {
        const newNode = new Node(shortURL, longURL, score);

        if (!this.head || this.head.score < score) {
            newNode.next = this.head;
            this.head = newNode;
        } else {
            let current = this.head;
            while (current.next && current.next.score >= score) {
                current = current.next;
            }
            newNode.next = current.next;
            current.next = newNode;
        }

        if (this.size < this.maxSize) {
            this.size++;
        } else {
            this.removeLast();
        }
    }

    update(shortURL, longURL, score) {
        let current = this.head;
        let prev = null;
        while (current && current.shortURL !== shortURL) {
            prev = current;
            current = current.next;
        }

        if (!current) {
            this.insert(shortURL, longURL, score);
            return;
        }
            
        let copy = current;
        if (prev){
            prev.next = current.next;
        }
        else{
            this.head = current.next;
        }
        this.insert(copy.shortURL, copy.longURL, score);
    }

    removeLast() {
        if (!this.head) return;

        if (!this.head.next) {
            this.head = null;
        } else {
            let current = this.head;
            while (current.next && current.next.next) {
                current = current.next;
            }
            current.next = null;
        }
        this.size--;
    }

    getLeaderboard(num) {
        let current = this.head;
        let arr = [];
        while (current && num--) {
            arr.push({
                shortURL: current.shortURL,
                longURL: current.longURL,
                HitCount: current.score
            });
            current = current.next;
        }

        return arr;
    }
}

export const leaderboard = new Leaderboard();

async function writeLeaderboardToFile(filename) {
    const leaderboardData = leaderboard.getLeaderboard(100);
    await fs.promises.writeFile(filename, JSON.stringify(leaderboardData, null, 2), 'utf-8');
}

process.on(process.env.EXIT_SIGNAL, async () => {
    await writeLeaderboardToFile('leaderboard.json');
    console.log('Leaderboard saved to leaderboard.json');
    process.exit(0);
});

export const loadLeaderboardFromFile = async (filename) => {
    if (fs.existsSync(filename)) {
        const data = await fs.promises.readFile(filename, 'utf-8');
        if (!data) return;
        const leaderboardData = JSON.parse(data);
        leaderboardData.forEach(element => {
            leaderboard.insert(element.shortURL, element.longURL, element.HitCount);
        });
    }
}