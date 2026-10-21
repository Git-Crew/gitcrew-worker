# gitcrew-worker

Runs one Hermes or OpenClaw review in a throwaway container, then tells the GitCrew app the result.

The app sends `POST /v1/jobs`, signed with `GITCREW_WORKER_SECRET`. This process clones the pull request on the host, starts `gitcrew-sandbox`, deletes the container and the checkout, and keeps the memory directory. The clone token is a git http header on the host. It is not passed into the container. A fork gets the diff file only: no clone, no terminal, no memory.

```bash
docker build -t gitcrew-sandbox:local ../gitcrew-sandbox
$env:GITCREW_WORKER_SECRET = "shared-secret"
$env:GITCREW_SANDBOX_IMAGE = "gitcrew-sandbox:local"
node src/server.mjs
```

Point the app at this process with `GITCREW_WORKER_URL` and the same secret. Put this process on the machine that has Docker. The Next.js app does not run the loops.
