const CLIENT_ID = "564236bf-e513-44d0-9368-b2763ba19271";
const CLIENT_SECRET = "5fae0a5a-7b59-4d80-a7e8-8b55b9ed94e5";

function getUserData(id, accessToken) {
    const url = `https://www.polaraccesslink.com/v3/users/${id}`;
    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        },
    }).then(data => data.json())
        .then(data => {
            return data;
        }).catch(err => {
            console.log(err);
            return err;
        });
}

function registerUser(accessToken, memberId) {
    const url = `https://www.polaraccesslink.com/v3/users`;
    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/xml'
        },
        body: `
        <register>
          <member-id>${memberId}</member-id>
        </register>
        `
    })
}

//

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.redirect("/auth");
});

app.get('/auth', (req, res) => { // Authorization code flow
    const url = `https://flow.polar.com/oauth2/authorization?response_type=code&client_id=${CLIENT_ID}`;
    res.redirect(url);
});

app.get('/auth/success', async (req, res) => { // Prepare for token exchange
    try {
        const code = req.query.code;
        const url = `https://polarremote.com/v2/oauth2/token?grant_type=authorization_code&code=${code}`;

        const base64Encoded = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${base64Encoded}`,
                'Accept': 'application/json'
            },
        });

        const data = await response.json();

        await registerUser(data.access_token, data.x_user_id);
        const userData = await getUserData(data.access_token);

        res.send(userData);
    } catch (err) {
        console.log(err);
        res.send("Error!");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
