import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {get} from "lodash";
import {GitHubUser} from "./models";
import axios from "axios";
import querystring from "querystring";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const GITHUB_CLIENT_ID = "e49e59bcef0c76cb68ad";
const GITHUB_CLIENT_SECRET = "5a89aa641016eb3844013b766ddbcab2a6bf3032";

async function getGitHubUser({ code }: { code: string }): Promise<GitHubUser> {
    const githubToken = await axios
        .post(
            `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`
        )
        .then((res) => res.data)

        .catch((error) => {
            throw error;
        });

    const decoded = querystring.parse(githubToken);

    const accessToken = decoded.access_token;

    return axios
        .get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => res.data)
        .catch((error) => {
            console.error(`Error getting user from GitHub`);
            throw error;
        });
}

app.get('/api/auth/github', (req: Request, res: Response) => {
    const code = get(req,("query.code"));
    const path = get(req,("query.path"));


    if(!code || !path){
        throw Error("No code or Path")
    }

    res.send('Github Auth');
});

app.get('/test', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});