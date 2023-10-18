# GitHub PR Reporter

This is a CLI application that generates HTML reports for pull requests of GitHub users. The reports include information on PR details and reviews done on those PRs.

## Setup

### Prerequisites

Make sure you have installed Node.js and `pnpm` package manager in your system.

 - **Node.js:** You can install Node.js from its [official website](https://nodejs.org).
 
    For Ubuntu you can install by running:
    ```bash
    sudo apt update
    sudo apt install nodejs
    ```
    
    For Windows, you can download the installer from the [official website](https://nodejs.org).

 - **pnpm:** Once you have Node.js installed, you can install `pnpm`. On your terminal run:
 
    ```bash
    npm install -g pnpm
    ```

### Getting Started

1. Extract the repository:
```bash
# extract github-report-cli to a folder
cd github-pr-reporter
```

2. Install dependencies:
```bash
pnpm install 
```

3. Generate a GitHub personal access token (PAT) following the instructions [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) and set it as an environment variable in a .env file:

```bash
echo 'GITHUB_TOKEN=your_token_here' > .env
````
Replace `your_token_here` with your actual GitHub PAT.

## Running the App
You can run the app using:
    ```bash
    pnpm start
    ```
You will be prompted to enter comma-separated GitHub usernames for which you want to generate PR reports.

## Output
The reports will be generated in the `reports/` directory with filenames as `<username>_report.html`.  