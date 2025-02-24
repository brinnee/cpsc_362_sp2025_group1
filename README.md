
# Polyglot (CPSC362 Group 1 Project)

An app where language learners can interact with each other, and native speakers to hone their skills. Our mission is to help you improve your language learning through a community of fellow language learners!

If you're learning a new language and you want to ask a quick, bite-sized question about something you're not sure of, **Polyglot** is for you.

## Development Setup
To start developing, clone this repo, and install the following dependencies on your system if you haven't already: 
- [Node.js](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://docs.docker.com/engine/install/)

Once Node.js and pnpm are installed, head into the project directory and run `pnpm install`. Then, you can run `./start-database.sh` to start a local PostgreSQL database, but in this version it's not needed.

To run a development server, type `pnpm run dev` and simply type http://localhost:3000 into your browser. If you make a change and save the file, the browser will automatically reload the page.
