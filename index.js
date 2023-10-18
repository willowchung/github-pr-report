#!/usr/bin/env node
require('dotenv').config()
const axios = require('axios');
const inquirer = require('inquirer');
const fs = require('fs');
const Handlebars = require('handlebars'); 

async function fetchPRData(username) {
    const query = `{
      search(query: "is:pr archived:false draft:false author:${username}", type: ISSUE, first: 100) {
        issueCount
        edges {
          node {
            ... on PullRequest {
              number
              title
              url
              state
              createdAt
              updatedAt
              closedAt
              author {
                login
              }
              repository {
                name
              }
              reviews(first: 10, states: [APPROVED, CHANGES_REQUESTED]) {
                edges {
                  node {
                    createdAt
                    state
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`;

  const result = await axios({
    url: 'https://api.github.com/graphql',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-REQUEST-TYPE': 'GraphQL'
    },
    data: {
      query
    }
  })

  return result.data;
}

function generateHTML(data) {
  const template = `
  <html>
    <head>
      <title>Pull Requests</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: #f2f2f2;
        }
        h1 {
          background-color: #333;
          color: #fff;
          padding: 20px 0;
          margin: 0;
          text-align: center;
        }
        #pullRequests div {
          background: #fff;
          margin: 20px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border-radius: 5px;
        }
        ul {
          padding-left: 0;
          list-style-type: none;
        }
        a {
          color: blue;
        }
        h3 {
          margin-top: 20px;
          color: #333;
        }
      </style>
    </head>
    <body>
      <h1>Pull Requests for {{data.search.edges.0.node.author.login}}</h1>
      <div id="pullRequests">
        {{#each data.search.edges}}
          <div>
            <ul>
              <li><strong>PR Number:</strong> {{this.node.number}}</li>
              <li><strong>Title:</strong> {{this.node.title}}</li>
              <li><strong>URL:</strong> <a href="{{this.node.url}}">{{this.node.url}}</a></li>
              <li><strong>State:</strong> {{this.node.state}}</li>
              <li><strong>Created At:</strong> {{this.node.createdAt}}</li>
              <li><strong>Updated At:</strong> {{this.node.updatedAt}}</li>
              <li><strong>Closed At:</strong> {{#if this.node.closedAt}}{{this.node.closedAt}}{{else}}Not Closed Yet{{/if}}</li>
              <li><strong>Author:</strong> {{this.node.author.login}}</li>
              <li><strong>Repository:</strong> {{this.node.repository.name}}</li>
            </ul>
            <div>
              <h3> Reviews </h3>
              <ul>
                {{#each this.node.reviews.edges}}
                  <li>
                    <strong>Created at:</strong> {{this.node.createdAt}},
                    <strong>State:</strong> {{this.node.state}},
                    <strong>Author:</strong> {{this.node.author.login}}
                  </li>
                {{/each}}
              </ul>
            </div>
          </div>
        {{/each}}
      </div>
    </body>
  </html>
  `;

  const render = Handlebars.compile(template);
  return render(data);
}

async function run() {
  const answers = await inquirer.prompt([{ 
    type: 'input',
    name: 'usernames',
    message: 'Enter GitHub usernames (comma separated):'
  }]);

  const usernames = answers.usernames.split(',');

  for (let username of usernames) {
    username = username.trim(); // in case of spaces around commas
    if(!username || username.length === 0) {
      continue;
    }
    const data = await fetchPRData(username);
    //console.log(`Fetched data for ${username}:`, JSON.stringify(data, null, 2));

    if (data.errors && data.errors.length > 0) {
      console.log(`Error fetching data for "${username}"\n`, JSON.stringify(data.errors, null, 2));
      continue;
    }
    if (data.search?.edges === 0) {
      console.log(`No pull requests found for ${username}`);
      continue;
    }
    const htmlString = generateHTML(data);
    fs.writeFile(`reports/${username}_report.html`, htmlString, err => {
      if (err) {
        console.error(`Error writing file for ${username}`, err);
      } else {
        console.log(`Successfully wrote report to ${username}_report.html`);
      }
    });
  }
}

run();
