import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {get} from "lodash";
import {GitHubUser} from "./models";
import axios from "axios";
import querystring from "querystring";
import jwt from "jsonwebtoken";

const cookies = require("cookie-parser");
const cors = require('cors');

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const GITHUB_CLIENT_ID = "e49e59bcef0c76cb68ad";
const GITHUB_CLIENT_SECRET = "5a89aa641016eb3844013b766ddbcab2a6bf3032";

const secret = "shhhhhhhhhhhh";
const COOKIE_NAME = "github-jwt";
const corsOptions ={
    origin:'http://localhost:4000',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.use(cookies());

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

app.get('/api/auth/github', async (req: Request, res: Response) => {
    console.log(1)
    const code = get(req,("query.code")) as string;
    const path = get(req,("query.path")) as string;


    if(!code || !path){
        throw Error("No code or Path")
    }

    const githubUser = await getGitHubUser({code});
    const token = jwt.sign(githubUser, secret);


    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        domain: "localhost",
    });

    res.redirect(`http://localhost:4000${path}`);
});

app.get("/api/me", (req: Request, res: Response) => {
    const cookie = get(req, `cookies[${COOKIE_NAME}]`);

    try {
        console.log(cookie,secret)
        const decode = jwt.verify(cookie, secret);
        return res.send({data: decode});
    } catch (e) {
        console.log(e)
        return res.send(null);
    }
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});